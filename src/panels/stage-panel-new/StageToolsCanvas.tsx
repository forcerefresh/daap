import { withErrorBoundary } from "react-use-error-boundary";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";

import React, {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { connect } from "react-redux";
import { ILayer } from "../../store/reducers/i-layers";
import { IStore } from "../../store/store";

import { IPage } from "../../store/reducers/i-pages";
import {
  cancelOverrideStageTool,
  activateObject,
  addNewObject,
  addObjectsToSelection,
  deactivateObject,
  overrideStageTool,
  removeObjectsFromSelection,
  selectForProperties,
  selectForPropertiesProps,
  selectObjects,
  selectObjectsByRect,
  setStagePreview,
  setStageTool,
  setStageZoom,
  setViewPortSize,
  updateObject,
  setStagePan,
} from "../../store/actions/actions";
import { IPreviewState, StageTools } from "../../store/reducers/stage";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { getMousePosition, IRect } from "../../utils/doom-utils/common";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";

import { getZoom } from "../../store/helpers/calculateZoom";

import { populateObjectThreeIds } from "../../store/actions/actions-utils";
import {
  StageManagerContext,
  degrees_to_radians,
} from "./StageManagerProvider";
import { StageToolEnum } from "../../utils/selection-manager/types";
import { Point, Rect } from "../../webslider-sdk/object/i-tool-class";
import { getGroupMatrixFromSelectionPath } from "./stage-panel-utils";

type IStagePanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const StageToolsCanvas: React.FC<IStagePanel> = (props) => {
  const {
    stageZoom,
    objectById,
    layerById,
    selectedObjectIds,
    selectionPath,
    forceRefreshRand: _forceRefreshRand, // NOTE: check this,
  } = props;

  const [forceRerender, setForceRerender] = useState(1);

  const groupsMatrixRef = useRef(new DOMMatrix());
  const holderRef = useRef<HTMLDivElement | null>(null);

  const { stageManager } = useContext(StageManagerContext);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();

      const handle = (e.currentTarget as HTMLElement)?.getAttribute(
        "data-scale-handle",
      );

      const groupsMatrix = getGroupMatrixFromSelectionPath(
        selectionPath,
        objectById,
      );

      const object = objectById[selectedObjectIds[0]];

      stageManager.start(StageToolEnum.SCALE, {
        mousePosition: getMousePosition(e),
        contextMatrix: groupsMatrix,
        objectId: selectedObjectIds[0], //object.id,
        objectRotation: object.rotation ?? 0,
        objectScale: object.scale ?? 1,
        originalMouseEvent: e,
        handle: handle ?? "",
        boundingClientRects: [new DOMRect()], // TODO: not needed
      });
    },
    [objectById],
  );

  const initialRect = useRef<Rect>({ x: 0, y: 0, width: 1, height: 1 });
  const firstObject = objectById[selectedObjectIds[0]];
  const selectedObjectId = selectedObjectIds[0];
  const selectedObject = objectById[selectedObjectId];

  useEffect(() => {
    setTimeout(() => {
      setForceRerender(forceRerender + 1);
    }, 1);
  }, [selectedObject]);

  const style: CSSProperties = useMemo(() => {
    if (selectedObjectId) {
      // >>>>>>>>>>>>>>>>>>
      // duplicate 123
      const objectPath: string[] = [];

      populateObjectThreeIds(
        objectPath,
        selectedObjectId,
        objectById,
        layerById,
      );

      const groupsMatrix = getGroupMatrixFromSelectionPath(
        [...objectPath, selectedObjectId],
        objectById,
      );

      groupsMatrix.e = groupsMatrix.f = 0;

      const transform = groupsMatrix
        .multiply(new DOMMatrix("scale(" + stageZoom + ")"))
        .toString();

      /////

      const stageToolsCanvas = document.getElementsByClassName(
        `stage-tools-canvas`,
      )[0] as HTMLDivElement;
      const stageToolsCanvasBbox = stageToolsCanvas.getBoundingClientRect();

      const objectHolder = document.getElementsByClassName(
        `object-holder-${selectedObjectId}`,
      )[0] as HTMLDivElement;

      if (objectHolder) {
        const cstyle = getComputedStyle(objectHolder);
        const h = parseFloat(cstyle.height);
        const w = parseFloat(cstyle.width);
        const height = `${h}px`;
        const width = `${w}px`;

        // Then, align "d" to "c" using their center points.
        const bbox = objectHolder.getBoundingClientRect();
        const cy = bbox.top + bbox.height / 2;
        const cx = bbox.left + bbox.width / 2;

        const y = cy - h / 2 - stageToolsCanvasBbox.top;
        const x = cx - w / 2 - stageToolsCanvasBbox.left;
        const left = `${x}px`;
        const top = `${y}px`;

        initialRect.current = {
          width: w,
          height: h,
          x,
          y,
        };

        groupsMatrixRef.current = groupsMatrix;

        return { top, left, height, width, transform };
      } else {
        return {};
      }
    }
    return {};
  }, [
    stageZoom,
    selectedObject,
    selectedObjectIds,
    selectedObjectId,
    objectById,
    layerById,
    forceRerender,
  ]);

  // <<<<<<<<<<<<<<<<

  const [move, setMove] = useState<Point>({ x: 0, y: 0 });
  const [diff, setDiff] = useState<Point>({ x: 0, y: 0 });

  const handleRef = useRef<HTMLDivElement | null>(null);
  const initialMousePosition = useRef<Point>({ x: 0, y: 0 });
  const handlesRef = useRef<{
    tl?: HTMLElement;
    tr?: HTMLElement;
    bl?: HTMLElement;
    br?: HTMLElement;
    width?: HTMLElement;
    height?: HTMLElement;
  }>({});

  const handleMouseMove = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    const mousePosition = getMousePosition(e);

    const a2x = mousePosition.x - initialMousePosition.current.x;
    const a2y = mousePosition.y - initialMousePosition.current.y;

    const a1x = 0;
    const a1y = 0;

    var len = Math.sqrt(Math.pow(a2x - a1x, 2) + Math.pow(a2y - a1y, 2));

    var hDif = Math.sin(degrees_to_radians(firstObject.rotation ?? 0)) * len;
    var wDif = Math.cos(degrees_to_radians(firstObject.rotation ?? 0)) * len;

    setDiff({ x: wDif, y: hDif });
    setMove({ x: a2x, y: a2y });
  }, []);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    const mousePosition = getMousePosition(e);

    const x = mousePosition.x - initialMousePosition.current.x;
    const y = mousePosition.y - initialMousePosition.current.y;

    setMove({ x, y });

    (window as any).removeEventListener("mousemove", handleMouseMove);
    (window as any).removeEventListener("mouseup", handleMouseUp);
  }, []);

  useEffect(() => {
    handleRef.current?.addEventListener("mousedown", handleMouseDown);

    return () => {
      handleRef.current?.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleMouseDown, selectedObjectIds]);

  const HANDLE_SIZE = 15;
  const scaledHandleSize =
    HANDLE_SIZE / (selectedObject?.scale ?? 1) / stageZoom;

  const handleStyle: CSSProperties = {
    position: "absolute",
    left: "-" + scaledHandleSize + "px",
    top: "-" + scaledHandleSize + "px",
    width: scaledHandleSize + "px",
    height: scaledHandleSize + "px",
    background: "red",
    //border: "0.1px solid red",
    transform: `translateX(${move.x}px) translateY(${move.y}px)`,
    pointerEvents: "all",
  };

  useLayoutEffect(() => {
    if (!selectedObject) return;
    if (selectedObject.isLocked) return;

    const handleColor = "transparent"; //"48aff0"

    const scaledHandleSize =
      HANDLE_SIZE / (selectedObject?.scale ?? 1) / stageZoom;

    if (holderRef.current) {
      let el: HTMLDivElement;

      el = document.createElement("div");
      el.style.left = "-" + scaledHandleSize + "px";
      el.style.top = "-" + scaledHandleSize + "px";
      el.style.width = scaledHandleSize + "px";
      el.style.height = scaledHandleSize + "px";
      el.style.background = handleColor;
      el.style.border = "0.1px solid " + handleColor;
      el.style.position = "absolute";
      el.style.pointerEvents = "all";
      el.setAttribute("data-scale-handle", "tl");
      el.setAttribute("class", "resize-handle");
      holderRef.current.appendChild(el);
      el.addEventListener("mousedown", handleMouseDown);
      handlesRef.current.tl = el;

      el = document.createElement("div");
      el.style.right = "-" + scaledHandleSize + "px";
      el.style.top = "-" + scaledHandleSize + "px";
      el.style.width = scaledHandleSize + "px";
      el.style.height = scaledHandleSize + "px";
      el.style.background = handleColor;
      el.style.border = "0.1px solid " + handleColor;
      el.style.position = "absolute";
      el.style.pointerEvents = "all";
      el.setAttribute("data-scale-handle", "tr");
      el.setAttribute("class", "resize-handle");

      holderRef.current.appendChild(el);
      el.addEventListener("mousedown", handleMouseDown);
      handlesRef.current.tr = el;

      el = document.createElement("div");
      el.style.bottom = "-" + scaledHandleSize + "px";
      el.style.left = "-" + scaledHandleSize + "px";
      el.style.width = scaledHandleSize + "px";
      el.style.height = scaledHandleSize + "px";
      el.style.background = handleColor;
      el.style.border = "0.1px solid " + handleColor;
      el.style.position = "absolute";
      el.style.pointerEvents = "all";
      el.setAttribute("data-scale-handle", "bl");
      el.setAttribute("class", "resize-handle");
      holderRef.current.appendChild(el);
      el.addEventListener("mousedown", handleMouseDown);
      handlesRef.current.bl = el;

      el = document.createElement("div");
      el.style.bottom = "-" + scaledHandleSize + "px";
      el.style.right = "-" + scaledHandleSize + "px";
      el.style.width = scaledHandleSize + "px";
      el.style.height = scaledHandleSize + "px";
      el.style.background = handleColor;
      el.style.border = "0.1px solid" + handleColor;
      el.style.position = "absolute";
      el.style.pointerEvents = "all";
      el.setAttribute("data-scale-handle", "br");
      el.setAttribute("class", "resize-handle");
      holderRef.current.appendChild(el);
      el.addEventListener("mousedown", handleMouseDown);
      handlesRef.current.br = el;

      // width resize
      const object = objectById[selectedObjectIds[0]];
      const toolDef = getAppObjectDefinition(object.type, "latest");

      if (toolDef?.meta.supportWidthResize) {
        el = document.createElement("div");
        el.style.top = `calc(50% - ${scaledHandleSize / 1.25}px)`;
        el.style.right = "-" + scaledHandleSize / 1.5 + "px";
        el.style.width = scaledHandleSize / 1.5 + "px";
        el.style.height = scaledHandleSize * 1.5 + "px";
        el.style.background = "transparent"; // "rgba(255,0,255,0.4)"; // handleColor;
        el.style.border = "0.1px solid" + handleColor;
        el.style.position = "absolute";
        el.style.pointerEvents = "all";
        el.setAttribute("data-scale-handle", "width");
        el.setAttribute("class", "resize-handle");
        holderRef.current.appendChild(el);
        el.addEventListener("mousedown", handleMouseDown);
        handlesRef.current.width = el;
      }

      if (toolDef?.meta.supportHeightResize) {
        el = document.createElement("div");
        el.style.bottom = "-" + scaledHandleSize / 1.5 + "px";
        el.style.right = `calc(50% - ${scaledHandleSize / 1.25}px)`;
        el.style.width = scaledHandleSize * 1.5 + "px";
        el.style.height = scaledHandleSize / 1.5 + "px";
        el.style.background = "transparent"; // "rgba(255,0,255,0.4)"; // handleColor;
        el.style.border = "0.1px solid" + handleColor;
        el.style.position = "absolute";
        el.style.pointerEvents = "all";
        el.setAttribute("data-scale-handle", "height");
        el.setAttribute("class", "resize-handle");
        holderRef.current.appendChild(el);
        el.addEventListener("mousedown", handleMouseDown);
        handlesRef.current.height = el;
      }
    }

    return () => {
      if (handlesRef.current?.tl && holderRef.current) {
        handlesRef.current.tl.removeEventListener("mousedown", handleMouseDown);
        holderRef.current?.removeChild(handlesRef.current.tl);
      }
      if (handlesRef.current?.tr && holderRef.current) {
        handlesRef.current.tr.removeEventListener("mousedown", handleMouseDown);
        holderRef.current?.removeChild(handlesRef.current.tr);
      }
      if (handlesRef.current?.bl && holderRef.current) {
        handlesRef.current.bl.removeEventListener("mousedown", handleMouseDown);
        holderRef.current?.removeChild(handlesRef.current.bl);
      }
      if (handlesRef.current?.br && holderRef.current) {
        handlesRef.current.br.removeEventListener("mousedown", handleMouseDown);
        holderRef.current?.removeChild(handlesRef.current.br);
      }
      if (handlesRef.current?.width && holderRef.current) {
        handlesRef.current.width.removeEventListener(
          "mousedown",
          handleMouseDown,
        );
        holderRef.current?.removeChild(handlesRef.current.width);
      }
      if (handlesRef.current?.height && holderRef.current) {
        handlesRef.current.height.removeEventListener(
          "mousedown",
          handleMouseDown,
        );
        holderRef.current?.removeChild(handlesRef.current.height);
      }
    };
  }, [selectedObject, handleMouseDown, stageZoom]);

  return (
    <div>
      {selectedObject && (
        <div
          ref={holderRef}
          className="selection-rect"
          style={{
            position: "absolute",
            //background: "rgba(234,0,222,0.2)",
            ...style,
            left: initialRect.current.x - diff.x + "px",
            top: initialRect.current.y - diff.y + "px",
            width: initialRect.current.width + diff.x + "px",
            height: initialRect.current.height + diff.y + "px",
          }}
        ></div>
      )}
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { pages, layers, objects, selection, settings } = state.project;
  const { stage } = state;

  let layerArr: ILayer[] | null = null;
  let slide: IPage | null = null;

  if (selection.activeSlideId) {
    const layerIds = pages.pageById[selection.activeSlideId].layerIds;
    layerArr = layerIds.map((layerId: string) => layers.layerById[layerId]);
    slide = pages.pageById[selection.activeSlideId];
  }

  const breakpointConfig: BreakpointConfiguration | undefined =
    settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice,
    );

  const zoom = getZoom(stage, settings);

  const forceShowLayerId =
    selection.selectionForProperties?.type === "layer"
      ? selection.selectionForProperties?.id
      : undefined;

  // TODO: later selection
  const selectionParentId =
    selection.selectionPath && selection.selectionPath.length > 1
      ? selection.selectionPath[selection.selectionPath.length - 1]
      : undefined;

  return {
    pages,
    layers,
    objects,
    stageZoom: zoom,
    stagePan: stage.pan,
    previewState: stage.previewState,
    layerArr,
    slide,
    selectionPath: selection.selectionPath,
    objectById: objects.objectById,
    layerById: layers.layerById,
    activeObjectId: selection.activeObjectId,
    activeLayerId: selection.activeLayerId,
    selectedObjectIds: selection.selectedObjectIds,
    selectionParentId,
    stageTool: state.stage.stageTool.tool,
    activeStageTool: state.stage.activeStageTool.tool,
    stageToolObjectType: state.stage.stageTool.objectType,
    breakpointConfig,
    settings,
    viewPortSize: stage.stageViewportSize,
    forceShowLayerId,
    selectedDevice: state.stage.selectedDevice,
    breakpoints: state.project.settings.breakpoints,
    forceRefreshRand: stage.forceRefreshRand,
    enableDeveloper: state.globals.enableDeveloper,
    showGrid: state.globals.showGrid,
  };
};

const mapDispatchToProps = {
  _setStagePreview: (preview: Partial<IPreviewState>) =>
    setStagePreview(preview),
  _updateObject: (object: IObject) => updateObject(object),
  _activateObject: (objectId: string | null) => activateObject(objectId),
  _selectObjects: (objectIds: string[]) => selectObjects(objectIds),
  _addObjectsToSelection: (objectIds: string[]) =>
    addObjectsToSelection(objectIds),
  _removeObjectsFromSelection: (objectIds: string[]) =>
    removeObjectsFromSelection(objectIds),
  _deactivateObject: (objectId: string) => deactivateObject(objectId),
  _selectObjectsByRect: (rect: IRect) => selectObjectsByRect(rect),
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>,
  ) => addNewObject(layerId, type, objectProps),
  _resetStageTool: () => setStageTool(StageTools.SELECT),
  _setStageTool: (tool: StageTools) => setStageTool(tool),
  _overrideStageTool: (tool: StageTools) => overrideStageTool(tool),
  _cancelOverrideStageTool: (tool: StageTools) => cancelOverrideStageTool(),
  _setViewPortSize: (size: { w: number; h: number }) => setViewPortSize(size),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _setStageZoom: (zoom: number) => setStageZoom(zoom),
  _setStagePan: (p: Point) => setStagePan(p),
  //_setCustomBPSize: (size: { w: number; h: number }) => setCustomBPSize(size),
};

export default withErrorBoundary(
  connect(mapStateToProps, mapDispatchToProps)(StageToolsCanvas),
);
