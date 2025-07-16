/* eslint-disable */
import {
  cloneDeep,
  includes,
  isEqual,
  mapValues,
  pick,
  round,
  set,
} from "lodash-es";
import { withErrorBoundary, useErrorBoundary } from "react-use-error-boundary";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";

import React, {
  CSSProperties,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Icon } from "@blueprintjs/core";
import { connect } from "react-redux";
import cx from "classnames";
import { ILayer } from "../../store/reducers/i-layers";
import { IStore } from "../../store/store";

import css from "./StagePanelNew.module.scss";
import { generatePlayerData, getObjectHtml } from "../../export/export-html";

import SlideSmallTimeline from "../slide-small-timeline/SlideSmallTimeline";
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
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import {
  applyRectValuesToElement,
  getMousePosition,
  getPointsDiff,
  getRectFromPoints,
  IRect,
  multiplyRect,
} from "../../utils/doom-utils/common";
import { useKeyDown } from "../../utils/hooks/key-down";
import { AppPlayer } from "../../player/AppPlayer";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";

import {
  convertTimeUnitToMs,
  convertRGBColor2CSSProperties,
} from "../../utils/utils";
import ProjectSmallTimeline, {
  ProjectTimelineData,
  SlideTimelineData,
} from "../project-small-timeline/ProjectSmallTimeline";
import { IPlayerData } from "../../export/i-export-html";
import { useWindowSize } from "../../utils/hooks/window-size";
import { getZoom } from "../../store/helpers/calculateZoom";
import { ILayoutChildrenValue } from "webslider-sdk/lib/inputs/i-inputs";
import ViewportSize from "../viewport-size/ViewportSize";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import { addTransformPropertiesToStyle } from "webslider-sdk/lib/objects/transform-properties";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import { ToolsContext } from "../../utils/tools/ToolsProvider";
// import { getCursorStyle } from "../../objects/free-draw/free-draw-stage-tool";
import { calculateObjectSize } from "../stage-panel/StagePanelUtils";
import StageLayer from "./StageLayer";
import {
  getObjectIdToSelect,
  populateObjectThreeIds,
} from "../../store/actions/actions-utils";
import { getGlobalProp } from "./utils";
import {
  StageManagerContext,
  degrees_to_radians,
} from "./StageManagerProvider";
import { StageToolEnum } from "../../utils/selection-manager/types";
import { Point, Rect } from "../../webslider-sdk/object/i-tool-class";
import {
  decomposeMatrix2DW3,
  getGroupMatrixFromSelectionPath,
  screenPointToLocal,
} from "./stage-panel-utils";

type IStagePanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const StageToolsCanvas: React.FC<IStagePanel> = (props) => {
  const {
    // innerRef, // do wee need this
    pages,
    layers,
    objects,
    stageZoom,
    previewState,
    layerArr,
    objectById,
    layerById,
    activeObjectId,
    selectedObjectIds,
    selectionPath,
    selectionParentId,
    activeLayerId,
    viewPortSize,
    _setStageTool,
    _setStagePreview,
    _updateObject,
    _selectObjects,
    _activateObject,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _selectObjectsByRect,
    _addNewObject,
    _setViewPortSize,
    _selectForProperties,
    _resetStageTool,
    _overrideStageTool,
    _cancelOverrideStageTool,
    activeStageTool,
    stagePan,
    stageTool,
    stageToolObjectType,
    breakpointConfig,
    settings,
    forceShowLayerId,
    selectedDevice,
    breakpoints,
    forceRefreshRand: _forceRefreshRand, // NOTE: check this
    enableDeveloper,
    showGrid,
    _setStageZoom,
    _setStagePan,
  } = props;

  const [forceRerender, setForceRerender] = useState(1);

  // TODO check this
  // useImperativeHandle(innerRef, () => ({
  //   handleStageScaleChange(stageScale: number) {

  // if (holderRef.current && groupsMatrixRef.current) {
  //   const transform = groupsMatrixRef.current
  //     .multiply(new DOMMatrix("scale(" + stageZoom + ")"))
  //     .toString();
  //   holderRef.current.style.transform = transform;
  // }
  // },
  // }));

  const groupsMatrixRef = useRef(new DOMMatrix());
  const holderRef = useRef<HTMLDivElement | null>(null);

  const { stageManager } = useContext(StageManagerContext);

  // useLayoutEffect(() => {
  //   if (holderRef.current && groupsMatrixRef.current) {
  //     const transform = groupsMatrixRef.current
  //       .multiply(new DOMMatrix("scale(" + stageZoom + ")"))
  //       .toString();
  //     holderRef.current.style.transform = transform;
  //   }
  // }, [stageZoom]);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();

      const handle = (e.currentTarget as HTMLElement)?.getAttribute(
        "data-scale-handle"
      );

      // if (handle === "width") {
      //   return;
      // }

      const groupsMatrix = getGroupMatrixFromSelectionPath(
        selectionPath,
        objectById
      );

      const object = objectById[selectedObjectIds[0]];

      stageManager.start(StageToolEnum.SCALE, {
        //boundingClientRects: [childRef.current!.getBoundingClientRect()],
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
    [objectById]
  );

  const initialRect = useRef<Rect>({ x: 0, y: 0, width: 1, height: 1 });
  const firstObject = objectById[selectedObjectIds[0]];
  //const objectStyleYArr = selectedObjectIds.map((objectId) => {
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
        layerById
      );

      const groupsMatrix = getGroupMatrixFromSelectionPath(
        [...objectPath, selectedObjectId],
        objectById
      );

      groupsMatrix.e = groupsMatrix.f = 0;

      const transform = groupsMatrix
        .multiply(new DOMMatrix("scale(" + stageZoom + ")"))
        .toString();

      /////

      const stageToolsCanvas = document.getElementsByClassName(
        `stage-tools-canvas`
      )[0] as HTMLDivElement;
      const stageToolsCanvasBbox = stageToolsCanvas.getBoundingClientRect();

      const objectHolder = document.getElementsByClassName(
        `object-holder-${selectedObjectId}`
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

  // >>>>>>>>>>>>>>>>

  // const localMatrix = new DOMMatrix(
  //   `rotate(${object.rotation}deg) scale(${
  //     object.scale
  //   }) translateX(${parseFloat(
  //     object.absoluteLayout?.common.left!
  //   )}px) translateY(${parseFloat(object.absoluteLayout?.common.top!)}px)`
  // );

  // const pointMatrix = new DOMMatrix();

  // const objectMatrix = localMatrix.multiply(pointMatrix);

  // const objectDecMatrix = decomposeMatrix2DW3(objectMatrix);

  // const realXY = {
  //   x: objectDecMatrix.translateX,
  //   y: objectDecMatrix.translateY,
  // };

  // second aproach -------------------

  // const realXY = screenPointToLocal(
  //   {
  //     x: parseFloat(object.absoluteLayout?.common.left!),
  //     y: parseFloat(object.absoluteLayout?.common.top!),
  //   },
  //   groupsMatrix,

  //   object.rotation,
  //   object.scale
  // );
  // <<<<<<<<<<<<<<<<
  // return realXY;
  //});

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

  // const handleMouseDown = useCallback((e: MouseEvent) => {
  //   setMove({ x: 0, y: 0 });
  //   e.stopImmediatePropagation();

  //   initialMousePosition.current = getMousePosition(e);

  //   (window as any).addEventListener("mousemove", handleMouseMove);
  //   (window as any).addEventListener("mouseup", handleMouseUp);
  // }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    const mousePosition = getMousePosition(e);
    //const angle = this.getAngle(mousePosition);

    const a2x = mousePosition.x - initialMousePosition.current.x;
    const a2y = mousePosition.y - initialMousePosition.current.y;

    const a1x = 0;
    const a1y = 0;

    var len = Math.sqrt(Math.pow(a2x - a1x, 2) + Math.pow(a2y - a1y, 2));

    var hDif = Math.sin(degrees_to_radians(firstObject.rotation ?? 0)) * len;
    //line from a1 to H
    var wDif = Math.cos(degrees_to_radians(firstObject.rotation ?? 0)) * len;

    setDiff({ x: wDif, y: hDif });
    setMove({ x: a2x, y: a2y });
  }, []);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    const mousePosition = getMousePosition(e);
    //const angle = this.getAngle(mousePosition);

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

    // childRef.current = document.getElementsByClassName(
    //   `object-holder-${props.object.id}`
    // )[0] as HTMLDivElement;

    // holderRef.current = document.getElementsByClassName(
    //   `resize-handle-holder-${props.object.id}`
    // )[0] as HTMLDivElement;

    const handleColor = "transparent"; //"48aff0"

    const scaledHandleSize =
      HANDLE_SIZE / (selectedObject?.scale ?? 1) / stageZoom; //initialRotationRef.current = initialRotation;

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
      // el.removeEventListener("mousedown", handleMouseDown);
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
      // el.removeEventListener("mousedown", handleMouseDown);
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
      // el.removeEventListener("mousedown", handleMouseDown);
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
      // el.removeEventListener("mousedown", handleMouseDown);
      el.addEventListener("mousedown", handleMouseDown);
      handlesRef.current.br = el;

      // width resize
      const object = objectById[selectedObjectIds[0]];
      const toolDef = getAppObjectDefinition(object.type);

      if (toolDef?.meta.supportWidthResize) {
        el = document.createElement("div");
        el.style.top = `calc(50% - ${scaledHandleSize / 1.25}px)`;
        el.style.right = "-" + scaledHandleSize / 1.5 + "px";
        el.style.width = scaledHandleSize / 1.5 + "px";
        el.style.height = scaledHandleSize * 1.5 + "px";
        el.style.background = "transparent"; //"rgba(255,0,255,0.4)"; //handleColor;
        el.style.border = "0.1px solid" + handleColor;
        el.style.position = "absolute";
        el.style.pointerEvents = "all";
        el.setAttribute("data-scale-handle", "width");
        el.setAttribute("class", "resize-handle");
        holderRef.current.appendChild(el);
        // el.removeEventListener("mousedown", handleMouseDown);
        el.addEventListener("mousedown", handleMouseDown);
        handlesRef.current.width = el;
      }

      if (toolDef?.meta.supportHeightResize) {
        el = document.createElement("div");
        el.style.bottom = "-" + scaledHandleSize / 1.5 + "px";
        el.style.right = `calc(50% - ${scaledHandleSize / 1.25}px)`;
        el.style.width = scaledHandleSize * 1.5 + "px";
        el.style.height = scaledHandleSize / 1.5 + "px";
        el.style.background = "transparent"; //"rgba(255,0,255,0.4)"; //handleColor;
        el.style.border = "0.1px solid" + handleColor;
        el.style.position = "absolute";
        el.style.pointerEvents = "all";
        el.setAttribute("data-scale-handle", "height");
        el.setAttribute("class", "resize-handle");
        holderRef.current.appendChild(el);
        // el.removeEventListener("mousedown", handleMouseDown);
        el.addEventListener("mousedown", handleMouseDown);
        handlesRef.current.height = el;
      }
    }

    return () => {
      if (handlesRef.current?.tl && holderRef.current) {
        handlesRef.current.tl.removeEventListener("mousedown", handleMouseDown);
        holderRef.current.removeChild(handlesRef.current.tl);
      }
      if (handlesRef.current?.tr && holderRef.current) {
        handlesRef.current.tr.removeEventListener("mousedown", handleMouseDown);
        holderRef.current.removeChild(handlesRef.current.tr);
      }
      if (handlesRef.current?.bl && holderRef.current) {
        handlesRef.current.bl.removeEventListener("mousedown", handleMouseDown);
        holderRef.current.removeChild(handlesRef.current.bl);
      }
      if (handlesRef.current?.br && holderRef.current) {
        handlesRef.current.br.removeEventListener("mousedown", handleMouseDown);
        holderRef.current.removeChild(handlesRef.current.br);
      }
      if (handlesRef.current?.width && holderRef.current) {
        handlesRef.current.width.removeEventListener(
          "mousedown",
          handleMouseDown
        );
        holderRef.current.removeChild(handlesRef.current.width);
      }
      if (handlesRef.current?.height && holderRef.current) {
        handlesRef.current.height.removeEventListener(
          "mousedown",
          handleMouseDown
        );
        holderRef.current.removeChild(handlesRef.current.height);
      }
    };
    // if (childRef.current) {
    //   const objectRootEl = childRef.current as HTMLElement;

    //   rotationHandle.current = objectRootEl.querySelector(".rotation-handle");

    //   rotationHandle.current?.removeEventListener("mousedown", handleMouseDown);
    //   rotationHandle.current?.addEventListener("mousedown", handleMouseDown);

    //   return () => {
    //     rotationHandle.current?.removeEventListener(
    //       "mousedown",
    //       handleMouseDown
    //     );
    //   };

    //   // (window as any).addEventListener("blur", windowBlurHandler);
    //   // (window as any).addEventListener("mouseup", documentMouseUpHandler);
    //   // document.addEventListener("mouseout", documentMouseOutHandler);
    // }
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
        >
          {/* <div ref={handleRef} style={handleStyle}></div> */}
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { pages, layers, objects, selection, document, settings } =
    state.project;
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
        breakpointConfig.type === state.stage.selectedDevice
    );

  const zoom = getZoom(stage, settings);

  const forceShowLayerId =
    selection.selectionForProperties?.type === "layer"
      ? selection.selectionForProperties?.id
      : undefined;

  // let showGrid = false;
  // if (selection.selectionForProperties?.type === "layer") {
  //   showGrid =
  //     layers.layerById[selection.selectionForProperties?.id].layout === "grid";
  // }

  // TODO: later selection
  const selectionParentId =
    selection.selectionPath && selection.selectionPath.length > 1
      ? selection.selectionPath[selection.selectionPath.length - 1]
      : undefined;

  return {
    pages,
    layers,
    objects,
    // stageSize: document.documentSize,
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
    objectProps: Partial<IObject>
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
  connect(mapStateToProps, mapDispatchToProps)(StageToolsCanvas)
);
