import { withErrorBoundary } from "react-use-error-boundary";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";

import { ToolsContext } from "../../utils/tools/ToolsProvider";

import React, {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
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
import {
  applyRectValuesToElement,
  getRectFromPoints,
  getMousePosition,
  IRect,
} from "../../utils/doom-utils/common";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";

import { getZoom } from "../../store/helpers/calculateZoom";

import {
  populateObjectThreeIds,
  computeGroupChildrenBounds,
} from "../../store/actions/actions-utils";
import { StageManagerContext } from "./StageManagerProvider";
import { StageToolEnum } from "../../utils/selection-manager/types";
import { Point } from "../../webslider-sdk/object/i-tool-class";
import { getGroupMatrixFromSelectionPath } from "./stage-panel-utils";
import { resolveTransformCapabilities } from "../../utils/stage/transformCapabilities";

type IStagePanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const HANDLE_SIZE = 15;
const ROTATION_HANDLE_GAP = 4;

const StageToolsCanvas: React.FC<IStagePanel> = (props) => {
  const {
    stageZoom,
    appZoom,
    objectById,
    layerById,
    selectedObjectIds,
    selectionPath,
    forceRefreshRand: _forceRefreshRand,
  } = props;

  const { activeStageTool, previewState, _selectObjectsByRect } = props;

  const holderRef = useRef<HTMLDivElement | null>(null);
  // Refs for secondary selected objects (outline only, no handles).
  const secondaryRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  // ── Rectangle selection ─────────────────────────────────────────────────────
  const selectionBoxRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Always-current refs so event handlers don't capture stale values.
  const stageZoomRef = useRef(stageZoom);
  stageZoomRef.current = stageZoom;
  const appZoomRef = useRef(appZoom);
  appZoomRef.current = appZoom;
  const activeStageToolRef = useRef(activeStageTool);
  activeStageToolRef.current = activeStageTool;
  const isPreviewRef = useRef(previewState.isPreview);
  isPreviewRef.current = previewState.isPreview;

  const { activeTool } = useContext(ToolsContext);

  useEffect(() => {
    const toStageCoords = (clientX: number, clientY: number) => {
      const el = document.getElementsByClassName("stage-tools-canvas")[0];
      const bbox = el?.getBoundingClientRect() ?? new DOMRect();
      return {
        x: (clientX - bbox.left) / stageZoomRef.current / appZoomRef.current,
        y: (clientY - bbox.top) / stageZoomRef.current / appZoomRef.current,
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (isPreviewRef.current) return;
      if (activeStageToolRef.current === StageTools.PAN) return;
      const target = e.target as Element;
      // Only act on empty-stage clicks (objects and handles stop React propagation,
      // but native listeners still fire — so we filter by target class).
      if (!target.closest?.(".StagePanel")) return;
      if (
        target.classList.contains("OVO_SELEKTUJE_ELEMENT_KOJI_NIJE_SELEKTOVAN")
      )
        return;
      if (target.closest?.(".selection-rect")) return;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !selectionBoxRef.current) return;
      const start = toStageCoords(
        dragStartRef.current.x,
        dragStartRef.current.y,
      );
      const current = toStageCoords(e.clientX, e.clientY);
      applyRectValuesToElement(
        selectionBoxRef.current,
        getRectFromPoints(start, current),
      );
      selectionBoxRef.current.style.display = "block";
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const start = dragStartRef.current;
      dragStartRef.current = null;
      if (selectionBoxRef.current) {
        selectionBoxRef.current.style.display = "none";
      }
      const startCoords = toStageCoords(start.x, start.y);
      const endCoords = toStageCoords(e.clientX, e.clientY);
      const rect = getRectFromPoints(startCoords, endCoords);
      if (rect.w > 1 && rect.h > 1) {
        _selectObjectsByRect(rect);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [_selectObjectsByRect]);
  // ────────────────────────────────────────────────────────────────────────────

  const { stageManager, afterDomUpdateRef } = useContext(StageManagerContext);

  const selectedObjectId = selectedObjectIds[0];
  const selectedObject = objectById[selectedObjectId];

  // Position one overlay div to match its object-holder in the DOM.
  // Defined inline so it always closes over the latest stageZoom/appZoom/objectById/layerById.
  const positionOverlay = (objectId: string, overlayEl: HTMLDivElement) => {
    const objectHolder = document.getElementsByClassName(
      `object-holder-${objectId}`,
    )[0] as HTMLDivElement;
    const stageToolsCanvas = document.getElementsByClassName(
      "stage-tools-canvas",
    )[0] as HTMLDivElement;
    if (!objectHolder || !stageToolsCanvas) return;

    const objectPath: string[] = [];
    populateObjectThreeIds(objectPath, objectId, objectById, layerById);

    const parentGroupsMatrix = getGroupMatrixFromSelectionPath(
      objectPath,
      objectById,
    );
    parentGroupsMatrix.e = parentGroupsMatrix.f = 0;

    const stageToolsCanvasBbox = stageToolsCanvas.getBoundingClientRect();
    const computedStyle = getComputedStyle(objectHolder);
    const storedW = parseFloat(computedStyle.width);
    const storedH = parseFloat(computedStyle.height);

    const domTransformStr = computedStyle.transform;
    const objectDomMatrix =
      domTransformStr !== "none"
        ? new DOMMatrix(domTransformStr)
        : new DOMMatrix();
    objectDomMatrix.e = objectDomMatrix.f = 0;

    const combinedMatrix = parentGroupsMatrix.multiply(objectDomMatrix);

    // For groups, recursively compute the actual children union bounds so the
    // selection handles cover children at any depth that overflow stored bounds.
    let w = storedW;
    let h = storedH;
    let localOffsetX = 0;
    let localOffsetY = 0;
    const object = objectById[objectId];
    if (object?.type === "group") {
      const bounds = computeGroupChildrenBounds(objectId, objectById);
      if (bounds) {
        localOffsetX = bounds.x;
        localOffsetY = bounds.y;
        w = bounds.w;
        h = bounds.h;
      }
    }

    const bbox = objectHolder.getBoundingClientRect();
    const cy = bbox.top + bbox.height / 2;
    const cx = bbox.left + bbox.width / 2;

    // Base center in stage-canvas coords (center of the stored group div).
    let centerX = (cx - stageToolsCanvasBbox.left) / stageZoom / appZoom;
    let centerY = (cy - stageToolsCanvasBbox.top) / stageZoom / appZoom;

    // If children bounds differ from stored bounds, shift center accordingly.
    // The delta is in group-local coords; transform it through combinedMatrix
    // (rotation+scale only, translation zeroed) to get the delta in stage coords.
    const dX = (localOffsetX + w / 2) - storedW / 2;
    const dY = (localOffsetY + h / 2) - storedH / 2;
    if (dX !== 0 || dY !== 0) {
      const delta = combinedMatrix.transformPoint({ x: dX, y: dY });
      centerX += delta.x;
      centerY += delta.y;
    }

    const combinedScale =
      Math.sqrt(
        combinedMatrix.a * combinedMatrix.a +
          combinedMatrix.b * combinedMatrix.b,
      ) || 1;

    overlayEl.style.left = `${centerX - w / 2}px`;
    overlayEl.style.top = `${centerY - h / 2}px`;
    overlayEl.style.width = `${w}px`;
    overlayEl.style.height = `${h}px`;
    overlayEl.style.transform = combinedMatrix.toString();
    overlayEl.style.setProperty(
      "--hs",
      `${HANDLE_SIZE / combinedScale / stageZoom / appZoom}px`,
    );
    overlayEl.style.setProperty(
      "--hw",
      `${1 / combinedScale / stageZoom / appZoom}px`,
    );
  };

  const positionAll = () => {
    if (holderRef.current && selectedObjectId) {
      positionOverlay(selectedObjectId, holderRef.current);
    }
    for (const [id, el] of secondaryRefs.current.entries()) {
      if (el) positionOverlay(id, el);
    }
  };

  // Updated every render so StageManagerProvider always calls the latest closure.
  const positionAllRef = useRef(positionAll);
  positionAllRef.current = positionAll;
  // Register a stable wrapper in the Set once; the wrapper always delegates to
  // the latest positionAll via positionAllRef so no re-subscription is needed.
  useEffect(() => {
    const fn = () => positionAllRef.current();
    afterDomUpdateRef.current.add(fn);
    return () => { afterDomUpdateRef.current.delete(fn); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // After Redux-driven updates (selection change, zoom, object props): wait 1ms
  // for StageObject.useLayoutEffect to apply its imperative transform first.
  useLayoutEffect(() => {
    // positionAllRef.current();
    const timerId = setTimeout(() => positionAllRef.current(), 1);
    return () => clearTimeout(timerId);
  }, [selectedObjectIds, objectById, layerById, stageZoom, appZoom]);

  // Remove stale secondary refs when the selection changes.
  useEffect(() => {
    const currentIds = new Set(selectedObjectIds.slice(1));
    for (const id of secondaryRefs.current.keys()) {
      if (!currentIds.has(id)) secondaryRefs.current.delete(id);
    }
  }, [selectedObjectIds]);

  const handleScaleMouseDown = useCallback(
    (e: React.MouseEvent, handle: string) => {
      e.stopPropagation();

      const groupsMatrix = getGroupMatrixFromSelectionPath(
        selectionPath,
        objectById,
      );

      const object = objectById[selectedObjectIds[0]];

      stageManager.start(StageToolEnum.SCALE, {
        mousePosition: getMousePosition(e.nativeEvent),
        contextMatrix: groupsMatrix,
        objectId: selectedObjectIds[0],
        objectRotation: object.rotation ?? 0,
        objectScale: object.scale ?? 1,
        originalMouseEvent: e.nativeEvent,
        handle,
        boundingClientRects: [
          holderRef.current?.getBoundingClientRect() ?? new DOMRect(),
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

      stageManager.start(StageToolEnum.ROTATE, {
        mousePosition: getMousePosition(e.nativeEvent),
        contextMatrix: groupsMatrix,
        objectId: selectedObjectIds[0],
        objectRotation: object.rotation ?? 0,
        objectScale: object.scale ?? 1,
        originalMouseEvent: e.nativeEvent,
        handle: "",
        boundingClientRects: [
          holderRef.current?.getBoundingClientRect() ?? new DOMRect(),
        ],
      });
    },
    [objectById, selectionPath, selectedObjectIds, stageManager],
  );

  const handlePointsRepositionMouseDown = useCallback(
    (e: React.MouseEvent, handle: "point0" | "point1") => {
      e.stopPropagation();

      const groupsMatrix = getGroupMatrixFromSelectionPath(
        selectionPath,
        objectById,
      );

      const object = objectById[selectedObjectIds[0]];

      stageManager.start(StageToolEnum.POINTS_REPOSITION, {
        mousePosition: getMousePosition(e.nativeEvent),
        contextMatrix: groupsMatrix,
        objectId: selectedObjectIds[0],
        objectRotation: object.rotation ?? 0,
        objectScale: object.scale ?? 1,
        originalMouseEvent: e.nativeEvent,
        handle,
        boundingClientRects: [],
      });
    },
    [objectById, selectionPath, selectedObjectIds, stageManager],
  );

  const objectMeta = selectedObject
    ? getAppObjectDefinition(selectedObject.type, "latest")?.meta
    : null;
  const capabilities = resolveTransformCapabilities(objectMeta);
  const showWidthResize = capabilities.resize && (objectMeta?.supportWidthResize ?? false);
  const showHeightResize = capabilities.resize && (objectMeta?.supportHeightResize ?? false);

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
      {/* Rectangle selection box — hidden by default, shown during drag */}
      <div
        ref={selectionBoxRef}
        style={{
          display: "none",
          position: "absolute",
          border: `${1 / stageZoom / appZoom}px dotted #48aff0`,
          pointerEvents: "none",
          zIndex: 500,
        }}
      />

      {!activeTool && selectedObject && (
        <div
          ref={holderRef}
          className="selection-rect"
          style={{ position: "absolute", overflow: "visible" }}
        >
          {/* Selection outline */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              boxShadow: `0 0 0 var(--hw) ${
                selectedObject.isLocked ? "rgba(72,175,240,0.5)" : handleColor
              }`,
              pointerEvents: "none",
            }}
          />

          {!selectedObject.isLocked && selectedObjectIds.length === 1 && (
            <>
              {/* Rotation handle */}
              {capabilities.rotate && (
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
              )}

              {/* Corner handles */}
              {capabilities.scale && (
                <>
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
                </>
              )}

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

              {/* Endpoint handles for pointsReposition objects (e.g. lines) */}
              {capabilities.pointsReposition && (
                <>
                  <div
                    data-reposition-point={`point0-${selectedObject.id}`}
                    data-base-left={selectedObject.x1 ?? 0}
                    data-base-top={selectedObject.y1 ?? 0}
                    style={{
                      position: "absolute",
                      left: selectedObject.x1 ?? 0,
                      top: selectedObject.y1 ?? 0,
                      transform: "translate(-50%, -50%)",
                      width: "var(--hs)",
                      height: "var(--hs)",
                      background: handleColor,
                      boxShadow: "0 0 0 var(--hw) white",
                      borderRadius: "50%",
                      pointerEvents: "all",
                      cursor: "crosshair",
                    }}
                    onMouseDown={(e) =>
                      handlePointsRepositionMouseDown(e, "point0")
                    }
                  />
                  <div
                    data-reposition-point={`point1-${selectedObject.id}`}
                    data-base-left={selectedObject.x2 ?? 0}
                    data-base-top={selectedObject.y2 ?? 0}
                    style={{
                      position: "absolute",
                      left: selectedObject.x2 ?? 0,
                      top: selectedObject.y2 ?? 0,
                      transform: "translate(-50%, -50%)",
                      width: "var(--hs)",
                      height: "var(--hs)",
                      background: handleColor,
                      boxShadow: "0 0 0 var(--hw) white",
                      borderRadius: "50%",
                      pointerEvents: "all",
                      cursor: "crosshair",
                    }}
                    onMouseDown={(e) =>
                      handlePointsRepositionMouseDown(e, "point1")
                    }
                  />
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Secondary selected objects: outline only, no handles */}
      {!activeTool &&
        selectedObjectIds.slice(1).map((objId) => {
          const obj = objectById[objId];
          if (!obj) return null;
          return (
            <div
              key={objId}
              ref={(el) => {
                secondaryRefs.current.set(objId, el);
              }}
              style={{ position: "absolute" }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  boxShadow: `0 0 0 var(--hw) ${
                    obj.isLocked ? "rgba(72,175,240,0.5)" : handleColor
                  }`,
                  pointerEvents: "none",
                }}
              />
            </div>
          );
        })}
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
