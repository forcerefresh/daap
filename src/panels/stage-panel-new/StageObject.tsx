import React, {
  CSSProperties,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

// ---------- module-level shift-key tracker (single listener, no per-instance overhead) ----------
const _shiftListeners = new Set<(pressed: boolean) => void>();
let _isShiftDown = false;
if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Shift" && !_isShiftDown) {
      _isShiftDown = true;
      _shiftListeners.forEach((fn) => fn(true));
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "Shift") {
      _isShiftDown = false;
      _shiftListeners.forEach((fn) => fn(false));
    }
  });
}
function useShiftKey(): boolean {
  const [pressed, setPressed] = useState(_isShiftDown);
  useEffect(() => {
    _shiftListeners.add(setPressed);
    return () => { _shiftListeners.delete(setPressed); };
  }, []);
  return pressed;
}
// ---------------------------------------------------------------------------------------------
import cx from "classnames";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { getZoom } from "../../store/helpers/calculateZoom";
import { IPage } from "../../store/reducers/i-pages";
import { calculateObjectSize } from "../stage-panel/StagePanelUtils";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import { addTransformPropertiesToStyle } from "webslider-sdk/lib/objects/transform-properties";
import css from "./StagePanelNew.module.scss";
import { IStore } from "../../store/store";
import { withErrorBoundary } from "react-use-error-boundary";
import { connect } from "react-redux";
import { ToolsContext } from "../../utils/tools/ToolsProvider";
import {
  activateObject,
  addObjectsToSelection,
  deactivateObject,
  removeObjectsFromSelection,
  selectForProperties,
  selectForPropertiesProps,
  selectObjects,
  selectObjectsByRect,
  setStageTool,
  setStageZoom,
  setViewPortSize,
  updateObject,
} from "../../store/actions/actions";
import { getObjectHtml } from "../../export/export-html";
import { ILayoutChildrenValue } from "webslider-sdk/lib/inputs/i-inputs";
import { StageGroupObject } from "./StageGroupObject";
import { StageLeafObject } from "./StageLeafObject";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";
import { StageTools } from "../../store/reducers/stage";
import { IRect, getMousePosition } from "../../utils/doom-utils/common";
import {
  createTransformForPath,
  getGroupMatrixFromSelectionPath,
  getObjectTransform,
} from "./stage-panel-utils";
import useDeepCompareEffect from "use-deep-compare-effect";
import { StageManagerContext } from "./StageManagerProvider";
import { StageToolEnum } from "../../utils/selection-manager/types";
import {
  isAncestorOfGroup,
  isDescendantOfGroup,
  isObjectInGroup,
  computeGroupChildrenBounds,
  populateObjectThreeIds,
} from "../../store/actions/actions-utils";
import { ILayer } from "../../store/reducers/i-layers";
import {
  SVG_MASK,
  updateSvgMaskClipTransform,
} from "../../objects/svg-mask/svg-mask";

type IStageLayer = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    object: IObject;
    layoutChildren?: ILayoutChildrenValue;
    layer: ILayer;
    objectZoom: number;
    parentGroup?: IObject; // TODO: not in use
  };

export function StageObjectInternal(props: IStageLayer) {
  const {
    object,
    layer: parentLayer,
    layoutChildren,
    breakpointConfig,
    objectById,
    stageZoom,
    selectedObjectIds,
    layerById,
    activeStageTool,
    objectZoom,
    selectionPath,
    clipboard,
    forceRefreshRand,
    currentScope,
  } = props;

  const isShiftPressed = useShiftKey();

  const objectMeta = getAppObjectDefinition(object.type, "latest")?.meta;
  const sizeType = objectMeta?.sizeType ?? "rect";

  // A group is "focused" when it's the single selected object and not yet entered.
  // Works at any depth: layer scope (root group) or group scope (nested sub-group).
  const focusedGroupId =
    selectedObjectIds.length === 1 &&
    objectById[selectedObjectIds[0]]?.type === "group" &&
    (
      (currentScope.type === "layer" && !!layerById[objectById[selectedObjectIds[0]]?.parentId!]) ||
      (currentScope.type === "group" && objectById[selectedObjectIds[0]]?.parentId === currentScope.groupId)
    )
      ? selectedObjectIds[0]
      : null;

  // When a group is focused (selected but not yet entered), suppress only that group's own
  // transparent overlay so clicks pass through to its children directly.
  // Siblings must remain clickable — we do NOT block them here.
  const isOutsideFocusedGroup =
    focusedGroupId !== null &&
    object.id === focusedGroupId;

  // Entered the group: object is outside the active group scope — dim + disable pointer events.
  // Ancestors of the active group are excluded so their opacity does not stack with descendants.
  const isOutsideActiveGroup =
    currentScope.type === "group" &&
    object.id !== currentScope.groupId &&
    !isDescendantOfGroup(object.id, currentScope.groupId, objectById) &&
    !isAncestorOfGroup(object.id, currentScope.groupId, objectById);

  // ++
  const groupsPath = [...selectionPath];
  groupsPath.shift();

  const [_transformsArray, setTransformArray] = useState<string[]>();

  const transformArrayRef = useRef<string[]>([]);
  transformArrayRef.current = createTransformForPath(groupsPath, objectById, {
    inverseRotation: false,
  });

  useDeepCompareEffect(() => {
    const ta = createTransformForPath(groupsPath, objectById, {
      inverseRotation: false,
    });
    transformArrayRef.current = ta;
    setTransformArray(ta);
  }, [groupsPath, objectById]);

  // ++++

  const childRef = useRef<HTMLDivElement | null>(null);

  const { stageManager, afterDomUpdateRef } = useContext(StageManagerContext);

  const [_mouseDiff, _setMouseDiff] = useState({ x: 0, y: 0 });

  // NOTE: handleRotation is using cached version of object
  // we are using ref to access latest object
  const objectRef = useRef(object);
  objectRef.current = object;

  const { activeTool, activeObjectId: activeEditObjectId } =
    useContext(ToolsContext);

  const objectId = object.id;
  const isSelected = selectedObjectIds.indexOf(objectId) !== -1;
  const isInSelectionPath = selectionPath.indexOf(objectId) !== -1;
  const cssPosition = "absolute";

  const calculatedObjectSize = calculateObjectSize(
    object,
    parentLayer,
    breakpointConfig!,
    {
      resetPosition: false,
    },
  );

  useLayoutEffect(() => {
    const objectHolder = document.getElementsByClassName(
      `object-holder-${object.id}`,
    )[0] as HTMLDivElement;

    if (objectHolder) {
      const newTransform = getObjectTransform(object);
      objectHolder.style.transform = newTransform;

      objectHolder.style.visibility =
        activeEditObjectId === objectId ? "hidden" : "visible";
    }
  }, [object.rotation, object.scale, object.id, object, activeEditObjectId]);

  const clipMaskHtml = "";
  let maskStyle: CSSProperties = {};

  // Layer order is reversed — the mask sits one position after the target.
  // If the next sibling in the layer is an SVG Mask object, apply its
  // clipPath to this object using the id injected by getSvgMaskHtml.
  //
  // StageGroupObject passes the top-level parentLayer down to each child,
  // so grouped objects won't appear in parentLayer.objectIds. In that case,
  // look up the sibling through the group object's own objectIds instead.
  const parentGroupObj =
    object.parentId && !layerById[object.parentId]
      ? objectById[object.parentId]
      : null;
  const containerObjectIds =
    parentGroupObj?.objectIds ?? parentLayer.objectIds;
  const objectIndex = containerObjectIds.indexOf(objectId);
  const nextSiblingId = containerObjectIds[objectIndex + 1];
  const nextSibling = objectById[nextSiblingId];
  if (nextSibling?.type === SVG_MASK) {
    maskStyle = {
      clipPath: `url(#svg-mask-${nextSiblingId})`,
    };
  }

  // When this object is the clip target, keep a ref to the latest update logic
  // and subscribe it to afterDomUpdateRef so drag events trigger a re-sync.
  const clipSyncRef = useRef<() => void>(() => {});
  clipSyncRef.current = () => {
    if (!nextSiblingId || nextSibling?.type !== SVG_MASK) return;
    const maskEl = (
      document.querySelector(`.object-holder-${nextSiblingId}`) ??
      document.querySelector(`.object-wrapper-${nextSiblingId}`)
    ) as HTMLElement | null;
    if (maskEl) {
      updateSvgMaskClipTransform(nextSiblingId, {
        left: maskEl.style.left,
        top: maskEl.style.top,
        width: maskEl.style.width,
        height: maskEl.style.height,
      });
    }
  };

  useEffect(() => {
    if (nextSibling?.type !== SVG_MASK || !nextSiblingId) return;
    const fn = () => clipSyncRef.current();
    afterDomUpdateRef.current.add(fn);
    return () => { afterDomUpdateRef.current.delete(fn); };
  // Re-subscribe only when the mask relationship changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextSibling?.type, nextSiblingId]);

  // When this object IS the SVG mask, keep the <clipPath> transform in sync
  // while the mask itself is being dragged / resized / scaled.
  const maskClipSyncRef = useRef<() => void>(() => {});
  maskClipSyncRef.current = () => {
    if (object.type !== SVG_MASK) return;
    const maskHolderEl = document.getElementsByClassName(
      `object-holder-${object.id}`,
    )[0] as HTMLElement | null;
    if (maskHolderEl) {
      updateSvgMaskClipTransform(object.id, {
        left: maskHolderEl.style.left,
        top: maskHolderEl.style.top,
        width: maskHolderEl.style.width,
        height: maskHolderEl.style.height,
      });
    }
  };

  useEffect(() => {
    if (object.type !== SVG_MASK) return;
    const fn = () => maskClipSyncRef.current();
    afterDomUpdateRef.current.add(fn);
    return () => { afterDomUpdateRef.current.delete(fn); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object.type]);

  // Re-sync clipPath transform after every commit of the SVG mask.
  // dangerouslySetInnerHTML may replace the <clipPath> element with a new
  // stale one (objectBoundingBox default) when an unrelated store change
  // causes a style-string change (e.g. delete/group other objects).
  // Reading from the DOM here is safe — React has already committed.
  useLayoutEffect(() => {
    if (object.type !== SVG_MASK) return;
    const maskHolderEl = document.getElementsByClassName(
      `object-holder-${object.id}`,
    )[0] as HTMLElement | null;
    if (!maskHolderEl) return;
    updateSvgMaskClipTransform(object.id, {
      left: maskHolderEl.style.left,
      top: maskHolderEl.style.top,
      width: maskHolderEl.style.width,
      height: maskHolderEl.style.height,
    });
  }); // no deps — run after every commit of this component

  const objectStyle: React.CSSProperties = {
    ...calculatedObjectSize,
    left: "0px",
    top: "0px",
  };

  objectStyle.position = cssPosition;
  if (
    object.transform?.perspective &&
    object.transform?.perspective !== "0px"
  ) {
    objectStyle.perspective = `${object.transform?.perspective}`;
  }

  // NOTO: We are explicitly moving div, ad when x,y is not change it does not rerender.
  //  We add Math.random() / 100 to force rerender
  const left =
    parseFloat(calculatedObjectSize.left as string) +
    Math.random() / 100 +
    "px";
  const top =
    parseFloat(calculatedObjectSize.top as string) + Math.random() / 100 + "px";

  const hoverColor = "rgba(72, 175,240, 0.5)";

  const commonObjectRect: CSSProperties = {
    left: !layoutChildren ? left : "0px",
    top: !layoutChildren ? top : "0px",
    width: calculatedObjectSize.width ?? "0px",
    height: calculatedObjectSize.height ?? "0px",
  };

  // For groups, compute the actual union bounding box recursively from all leaf
  // descendants so the outline covers children at any depth that overflow the
  // group's stored left/top/width/height.
  const groupChildrenBounds =
    object.type === "group" ? computeGroupChildrenBounds(object.id, objectById) : null;

  // Selection outline for group-parent (in-path) and hover cases only.
  // The selected-object outline is rendered by StageToolsCanvas.
  const selectionStyle: CSSProperties = {
    ...commonObjectRect,
    zIndex: 200,
    left: groupChildrenBounds ? `${groupChildrenBounds.x}px` : "0px",
    top: groupChildrenBounds ? `${groupChildrenBounds.y}px` : "0px",
    width: groupChildrenBounds ? `${groupChildrenBounds.w}px` : commonObjectRect.width,
    height: groupChildrenBounds ? `${groupChildrenBounds.h}px` : commonObjectRect.height,
    position: "absolute",
    pointerEvents: "none",
    transformOrigin: "top left",
    ...(isInSelectionPath && !isSelected && !activeTool
      ? { boxShadow: `0 0 0 ${1 / objectZoom / stageZoom}px #444444` }
      : {}),
  };

  const [isHover, setIsHover] = useState(false);

  if (isHover && !activeTool && !isSelected) {
    selectionStyle.boxShadow = `0 0 0 ${
      1 / objectZoom / stageZoom
    }px ${hoverColor}`;
  }

  // object holder
  const objectHolderStyle: CSSProperties = {
    zIndex: 100,
    position: "absolute", //!layoutChildren ? "relative" : "static",
    ...commonObjectRect,
  };

  if (layoutChildren?.type === "inline") {
    objectHolderStyle.display = "inline-block";
  }

  objectHolderStyle.pointerEvents = "none";

  objectHolderStyle.transformOrigin = "top left";
  objectHolderStyle.transform = getObjectTransform(object);

  if (isOutsideActiveGroup) {
    objectHolderStyle.opacity = 0.35;
  }

  if (clipboard?.entityIds?.includes(object.id)) {
    if (clipboard?.operation === "cut") objectHolderStyle.opacity = 0.5;
  }

  const calculatedObjectSizeForObject = { ...calculatedObjectSize };
  if (object.properties?.autoHeight) {
  }

  const rootObjectSelection =
    selectedObjectIds.length === 0 && !!layerById[object.parentId!];

  const childObjectInGroupSelection =
    selectedObjectIds.length === 1 &&
    objectById[selectedObjectIds[0]]?.objectIds &&
    objectById[selectedObjectIds[0]]?.objectIds!.length > 0 &&
    objectById[selectedObjectIds[0]]?.objectIds?.includes(object.id);

  let siblingObjectSelection = false;
  if (selectedObjectIds.length > 0) {
    const parentId = objectById[selectedObjectIds[0]]?.parentId;
    if (layerById[object.parentId!]) {
      siblingObjectSelection = true;
    } else if (objectById[parentId!]?.objectIds?.includes(object.id)) {
      siblingObjectSelection = true;
    }
  }

  // The group you are currently "inside" should never be selectable via a click from within.
  const isCurrentScopeGroup =
    currentScope.type === "group" && object.id === currentScope.groupId;

  let allowObjectSelection =
    !isOutsideActiveGroup &&
    !(isOutsideFocusedGroup && !isShiftPressed) &&
    !isCurrentScopeGroup &&
    !object.isLocked &&
    (rootObjectSelection || childObjectInGroupSelection || siblingObjectSelection);

  isObjectInGroup(object, objectById);

  let groupStyle = "";
  if (object.type === "group") {
    groupStyle = addCommonPropertiesToStyle(
      groupStyle,
      object,
      breakpointConfig?.type,
    );
    groupStyle = addTransformPropertiesToStyle(
      groupStyle,
      object,
      breakpointConfig?.type,
    );
  }

  return (
    <React.Fragment key={forceRefreshRand}>
      {isOutsideActiveGroup && (
        <style dangerouslySetInnerHTML={{
          __html: `.object-holder-${object.id}, .object-holder-${object.id} * { pointer-events: none !important; }`
        }} />
      )}
      <div
        className="clipping-mask-daap"
        dangerouslySetInnerHTML={{ __html: clipMaskHtml }}
      ></div>

      <div
            ref={childRef}
            style={objectHolderStyle}
            className={cx(`object-holder-${object.id}`)}
            onMouseEnter={() => {
              !activeTool && !isSelected && !isOutsideActiveGroup && !(isOutsideFocusedGroup && !isShiftPressed) && !object.isLocked && setIsHover(true);
            }}
            onMouseLeave={() => {
              if (isHover) setIsHover(false);
            }}
            onMouseDown={
              allowObjectSelection
                ? (e) => {
                    if (e.buttons !== 1) return;

                    if (activeStageTool === StageTools.PAN) {
                      return;
                    }

                    e.stopPropagation();

                    // TODO: Remove this as we have this logic in provider
                    const objectPath: string[] = [];
                    populateObjectThreeIds(
                      objectPath,
                      object.id,
                      objectById,
                      layerById,
                    );

                    const groupsMatrix = getGroupMatrixFromSelectionPath(
                      [...objectPath, object.id],
                      objectById,
                    );

                    stageManager.start(StageToolEnum.MOVE, {
                      boundingClientRects: [
                        childRef.current!.getBoundingClientRect(),
                      ],
                      mousePosition: getMousePosition(e),
                      contextMatrix: groupsMatrix,
                      objectRotation: object.rotation ?? 0,
                      objectScale: object.scale ?? 1,
                      objectId: props.object.id,
                      originalMouseEvent: e.nativeEvent,
                      isLocked: object.isLocked,
                      handle: "", // TODO: not needed
                    });
                  }
                : undefined
            }
          >
            {object.type === "group" ? (
              <StageGroupObject
                object={object}
                objectStyle={objectStyle}
                maskStyle={maskStyle}
                groupStyle={groupStyle}
                objectById={objectById}
                parentLayer={parentLayer}
                objectZoom={objectZoom}
                breakpointConfig={breakpointConfig}
              />
            ) : (
              <StageLeafObject
                object={object}
                objectStyle={objectStyle}
                maskStyle={maskStyle}
                calculatedObjectSizeForObject={calculatedObjectSizeForObject}
                breakpointConfig={breakpointConfig}
              />
            )}
            <div
              onClick={(_event) => {}}
              dangerouslySetInnerHTML={{
                __html:
                  sizeType === "line"
                    ? getObjectHtml(
                        object,
                        calculatedObjectSizeForObject,
                        false,
                        false,
                        breakpointConfig?.type,
                      )
                    : "",
              }}
              key={object.id}
              className={cx(
                css[object.type],
                "OVO_SELEKTUJE_ELEMENT_KOJI_NIJE_SELEKTOVAN",
              )}
              style={{
                ...objectStyle,
                position: "relative",
                pointerEvents: (isOutsideFocusedGroup && !isShiftPressed) || object.isLocked ? "none" : "all",
                opacity: 0,
              }}
            />
            <div className="object-selection" style={selectionStyle} />
          </div>
    </React.Fragment>
  );
}

const mapStateToProps = (state: IStore) => {
  const { pages, layers, objects, selection, settings, clipboard } =
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
      (bp: BreakpointConfiguration) =>
        bp.type === state.stage.selectedDevice,
    );

  const zoom = getZoom(stage, settings);

  const forceShowLayerId =
    selection.selectionForProperties?.type === "layer"
      ? selection.selectionForProperties?.id
      : undefined;

  return {
    clipboard,
    pages,
    layers,
    objects,
    stageZoom: zoom,
    previewState: stage.previewState,
    layerArr,
    slide,
    objectById: objects.objectById,
    layerById: layers.layerById,
    activeObjectId: selection.activeObjectId,
    activeLayerId: selection.activeLayerId,
    selectedObjectIds: selection.selectedObjectIds,
    selectionPath: selection.selectionPath,
    currentScope: selection.currentScope ?? { type: "layer" },
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
  _updateObject: (object: IObject) => updateObject(object),
  _activateObject: (objectId: string | null) => activateObject(objectId),
  _selectObjects: (objectIds: string[]) => selectObjects(objectIds),
  _addObjectsToSelection: (objectIds: string[]) =>
    addObjectsToSelection(objectIds),
  _removeObjectsFromSelection: (objectIds: string[]) =>
    removeObjectsFromSelection(objectIds),
  _deactivateObject: (objectId: string) => deactivateObject(objectId),
  _selectObjectsByRect: (rect: IRect) => selectObjectsByRect(rect),
  _resetStageTool: () => setStageTool(StageTools.SELECT),
  _setViewPortSize: (size: { w: number; h: number }) => setViewPortSize(size),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _setStageZoom: (zoom: number) => setStageZoom(zoom),
};

const StageObject = withErrorBoundary(
  connect(mapStateToProps, mapDispatchToProps)(StageObjectInternal) as React.ComponentType<any>,
);

export default StageObject;

export function setRectangleOrigin(elem: HTMLDivElement, newOrigin: string) {
  const compStyle = window.getComputedStyle(elem);

  const prevML = parseInt(compStyle.left);
  const prevMT = parseInt(compStyle.top);

  const r1 = elem.getBoundingClientRect();
  elem.style.transformOrigin = newOrigin;
  const r2 = elem.getBoundingClientRect();

  elem.style.left = prevML + (r1.x - r2.x) + "px";
  elem.style.top = prevMT + (r1.y - r2.y) + "px";
}

