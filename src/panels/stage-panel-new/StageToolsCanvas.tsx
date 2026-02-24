import { withErrorBoundary } from "react-use-error-boundary";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";

import React, {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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
import { StageManagerContext } from "./StageManagerProvider";
import { StageToolEnum } from "../../utils/selection-manager/types";
import { Point } from "../../webslider-sdk/object/i-tool-class";
import { getGroupMatrixFromSelectionPath } from "./stage-panel-utils";

type IStagePanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const StageToolsCanvas: React.FC<IStagePanel> = (props) => {
  const {
    stageZoom,
    appZoom,
    objectById,
    layerById,
    selectedObjectIds,
    selectionPath,
    forceRefreshRand: _forceRefreshRand, // NOTE: check this,
  } = props;

  const [forceRerender, setForceRerender] = useState(1);

  const holderRef = useRef<HTMLDivElement | null>(null);

  const { stageManager } = useContext(StageManagerContext);

  const selectedObjectId = selectedObjectIds[0];
  const selectedObject = objectById[selectedObjectId];

  // Trigger re-renders during drag so useLayoutEffect can re-sync handles
  useEffect(() => {
    const handleChange = () => setForceRerender((v) => v + 1);
    stageManager.addEventListener("change", handleChange as EventListener);
    return () => {
      stageManager.removeEventListener("change", handleChange as EventListener);
    };
  }, [stageManager]);

  // Apply selection-rect styles imperatively AFTER every DOM commit.
  // This prevents flicker: by the time useLayoutEffect runs, StageObject has
  // already committed its Redux-driven DOM updates, so getBoundingClientRect()
  // and getComputedStyle() reflect the true final state.
  useLayoutEffect(() => {
    if (!holderRef.current || !selectedObjectId) return;

    const objectHolder = document.getElementsByClassName(
      `object-holder-${selectedObjectId}`,
    )[0] as HTMLDivElement;
    const stageToolsCanvas = document.getElementsByClassName(
      `stage-tools-canvas`,
    )[0] as HTMLDivElement;

    if (!objectHolder || !stageToolsCanvas) return;

    const objectPath: string[] = [];
    populateObjectThreeIds(objectPath, selectedObjectId, objectById, layerById);

    const parentGroupsMatrix = getGroupMatrixFromSelectionPath(
      objectPath,
      objectById,
    );
    parentGroupsMatrix.e = parentGroupsMatrix.f = 0;

    const stageToolsCanvasBbox = stageToolsCanvas.getBoundingClientRect();
    const cstyle = getComputedStyle(objectHolder);
    const h = parseFloat(cstyle.height);
    const w = parseFloat(cstyle.width);

    const domTransformStr = cstyle.transform;
    const objectDomMatrix =
      domTransformStr !== "none"
        ? new DOMMatrix(domTransformStr)
        : new DOMMatrix();
    objectDomMatrix.e = objectDomMatrix.f = 0;

    // stage-tools-canvas lives inside .pan-and-zoom which already has
    // transform: scale(stageZoom). Do NOT add scale(stageZoom) here — it
    // would double the zoom. The object rotation/scale is all that's needed.
    const transform = parentGroupsMatrix.multiply(objectDomMatrix).toString();

    const bbox = objectHolder.getBoundingClientRect();
    const cy = bbox.top + bbox.height / 2;
    const cx = bbox.left + bbox.width / 2;
    // getBoundingClientRect() is in screen pixels (affected by both stageZoom
    // and appZoom). CSS left/top inside the zoom container are in stage pixels,
    // so divide by both.
    const y = (cy - stageToolsCanvasBbox.top) / stageZoom / appZoom - h / 2;
    const x = (cx - stageToolsCanvasBbox.left) / stageZoom / appZoom - w / 2;

    // Extract live scale from the DOM transform matrix (a = scaleX * cos, b = scaleX * sin)
    const liveScale =
      Math.sqrt(
        objectDomMatrix.a * objectDomMatrix.a +
          objectDomMatrix.b * objectDomMatrix.b,
      ) || 1;

    holderRef.current.style.left = `${x}px`;
    holderRef.current.style.top = `${y}px`;
    holderRef.current.style.width = `${w}px`;
    holderRef.current.style.height = `${h}px`;
    holderRef.current.style.transform = transform;
    // CSS variables consumed by child handle divs — keeps handle visual size constant
    holderRef.current.style.setProperty(
      "--hs",
      `${HANDLE_SIZE / liveScale / stageZoom / appZoom}px`,
    );
    holderRef.current.style.setProperty(
      "--hw",
      `${1 / liveScale / stageZoom / appZoom}px`,
    );
  }, [
    selectedObjectId,
    selectedObject,
    objectById,
    layerById,
    stageZoom,
    appZoom,
    forceRerender,
  ]);

  const handleScaleMouseDown = useCallback(
    (e: React.MouseEvent, handle: string) => {
      e.stopPropagation();

      const groupsMatrix = getGroupMatrixFromSelectionPath(
        selectionPath,
        objectById,
      );

      const object = objectById[selectedObjectIds[0]];
      const objectHolder = document.getElementsByClassName(
        `object-holder-${selectedObjectIds[0]}`,
      )[0] as HTMLDivElement;

      stageManager.start(StageToolEnum.SCALE, {
        mousePosition: getMousePosition(e.nativeEvent),
        contextMatrix: groupsMatrix,
        objectId: selectedObjectIds[0],
        objectRotation: object.rotation ?? 0,
        objectScale: object.scale ?? 1,
        originalMouseEvent: e.nativeEvent,
        handle,
        boundingClientRects: [
          objectHolder?.getBoundingClientRect() ?? new DOMRect(),
        ],
      });
    },
    [objectById, selectionPath, selectedObjectIds, stageManager],
  );

  const handleRotateMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      const groupsMatrix = getGroupMatrixFromSelectionPath(
        selectionPath,
        objectById,
      );

      const object = objectById[selectedObjectIds[0]];
      const objectHolder = document.getElementsByClassName(
        `object-holder-${selectedObjectIds[0]}`,
      )[0] as HTMLDivElement;

      stageManager.start(StageToolEnum.ROTATE, {
        mousePosition: getMousePosition(e.nativeEvent),
        contextMatrix: groupsMatrix,
        objectId: selectedObjectIds[0],
        objectRotation: object.rotation ?? 0,
        objectScale: object.scale ?? 1,
        originalMouseEvent: e.nativeEvent,
        handle: "",
        boundingClientRects: [
          objectHolder?.getBoundingClientRect() ?? new DOMRect(),
        ],
      });
    },
    [objectById, selectionPath, selectedObjectIds, stageManager],
  );

  const HANDLE_SIZE = 15;
  const ROTATION_HANDLE_GAP = 4;

  const objectMeta = selectedObject
    ? getAppObjectDefinition(selectedObject.type, "latest")?.meta
    : null;
  const showWidthResize = objectMeta?.supportWidthResize ?? false;
  const showHeightResize = objectMeta?.supportHeightResize ?? false;

  const handleColor = "#48aff0";
  const borderRadius = "10%";

  // --hs and --hw are CSS variables set imperatively in useLayoutEffect
  // using the live DOM scale, so handle sizes stay constant during drag.
  const cornerStyle: CSSProperties = {
    position: "absolute",
    width: "var(--hs)",
    height: "var(--hs)",
    background: handleColor,
    boxShadow: "0 0 0 var(--hw) white",
    borderRadius,
    pointerEvents: "all",
  };

  return (
    <div>
      {selectedObject && !selectedObject.isLocked && (
        <div
          ref={holderRef}
          className="selection-rect"
          style={{ position: "absolute" }}
        >
          {/* Rotation handle */}
          <div
            style={{
              position: "absolute",
              top: `calc(-2 * var(--hs) - ${ROTATION_HANDLE_GAP} * var(--hw))`,
              left: "50%",
              transform: "translateX(-50%)",
              width: "var(--hs)",
              height: "var(--hs)",
              background: handleColor,
              boxShadow: "0 0 0 var(--hw) white",
              borderRadius: "50%",
              pointerEvents: "all",
              cursor: "grab",
            }}
            onMouseDown={handleRotateMouseDown}
          />

          {/* Corner handles */}
          <div
            style={{
              ...cornerStyle,
              left: "calc(-1 * var(--hs))",
              top: "calc(-1 * var(--hs))",
            }}
            onMouseDown={(e) => handleScaleMouseDown(e, "tl")}
          />
          <div
            style={{
              ...cornerStyle,
              right: "calc(-1 * var(--hs))",
              top: "calc(-1 * var(--hs))",
            }}
            onMouseDown={(e) => handleScaleMouseDown(e, "tr")}
          />
          <div
            style={{
              ...cornerStyle,
              left: "calc(-1 * var(--hs))",
              bottom: "calc(-1 * var(--hs))",
            }}
            onMouseDown={(e) => handleScaleMouseDown(e, "bl")}
          />
          <div
            style={{
              ...cornerStyle,
              right: "calc(-1 * var(--hs))",
              bottom: "calc(-1 * var(--hs))",
            }}
            onMouseDown={(e) => handleScaleMouseDown(e, "br")}
          />

          {/* Edge handles */}
          {showWidthResize && (
            <div
              style={{
                position: "absolute",
                right: "calc(var(--hs) / -1.5)",
                top: "calc(50% - var(--hs) / 1.25)",
                width: "calc(var(--hs) / 1.5)",
                height: "calc(var(--hs) * 1.5)",
                background: handleColor,
                boxShadow: "0 0 0 var(--hw) white",
                borderTopRightRadius: "15%",
                borderBottomRightRadius: "15%",
                pointerEvents: "all",
              }}
              onMouseDown={(e) => handleScaleMouseDown(e, "width")}
            />
          )}
          {showHeightResize && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(var(--hs) / -1.5)",
                left: "calc(50% - var(--hs) / 1.25)",
                width: "calc(var(--hs) * 1.5)",
                height: "calc(var(--hs) / 1.5)",
                background: handleColor,
                boxShadow: "0 0 0 var(--hw) white",
                borderBottomLeftRadius: "15%",
                borderBottomRightRadius: "15%",
                pointerEvents: "all",
              }}
              onMouseDown={(e) => handleScaleMouseDown(e, "height")}
            />
          )}
        </div>
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
    appZoom: state.globals.appZoom,
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
