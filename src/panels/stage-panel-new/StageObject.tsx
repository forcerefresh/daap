import React, {
  CSSProperties,
  MouseEventHandler,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import { cloneDeep, includes, last } from "lodash-es";
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
import { WithRotationHandle } from "./WithRotationHandle";
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
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import { ILayoutChildrenValue } from "webslider-sdk/lib/inputs/i-inputs";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";
import { StageTools } from "../../store/reducers/stage";
import { IRect, getMousePosition } from "../../utils/doom-utils/common";
import {
  getUngroupObjectsCalculation,
  createTransformForPath,
  decomposeMatrix2DW3,
  getFullMatrixFromTransformArr,
  getGroupMatrixFromSelectionPath,
  getObjectTransform,
} from "./stage-panel-utils";
import RotateIcon from "../../assets/icons/rotate-icon.svg?react";
import { setGlobalProp } from "./utils";
import { Point, Rect } from "../../webslider-sdk/object/i-tool-class";
import useDeepCompareEffect from "use-deep-compare-effect";
import {
  boundsUnion,
  getObjectBoundingBox,
} from "../../store/helpers/objectBoundingBox";
import { StageManagerContext } from "./StageManagerProvider";
import { StageToolEnum } from "../../utils/selection-manager/types";
import {
  isObjectInGroup,
  populateObjectThreeIds,
} from "../../store/actions/actions-utils";
import { WithResizeHandle } from "./WithResizeHandle";
import { group } from "console";
import { getClipMaskFromSvg } from "../../utils/doom-utils/clip-path";
import { ILayer } from "../../store/reducers/i-layers";

const groupSelectionColor = "#48aff0"; /// "#48f08d";
const objectSelectionColor = "#48aff0";

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
    activeObjectId,
    selectedObjectIds,
    layerById,
    activeStageTool,
    _updateObject,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _activateObject,
    _selectObjects,
    _selectForProperties,
    objectZoom,
    selectionPath,
    parentGroup,
    clipboard,
    forceRefreshRand,
  } = props;

  const objectMeta = getAppObjectDefinition(
    object.type,
    "latest" /*object.version*/,
  )?.meta;
  const sizeType = objectMeta?.sizeType ?? "rect";

  // ++
  const groupsPath = [...selectionPath];
  groupsPath.shift();

  const [transformsArray, setTransformArray] = useState<string[]>();

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

  const { stageManager } = useContext(StageManagerContext);

  const [mouseDiff, setMouseDiff] = useState({ x: 0, y: 0 });

  const mouseInitialPos = useRef<Point | undefined>();
  const mouseDiffPos = useRef<Point | undefined>({ x: 0, y: 0 });

  // NOTE: handleRotation is using cached version of object
  // we are using ref to access latest object
  const objectRef = useRef(object);
  objectRef.current = object;

  const { activeTool, activeObjectId: activeEditObjectId } =
    useContext(ToolsContext);

  // const isRotationInProgress = useRef(false);
  // const handleRotationStart = () => {
  //   isRotationInProgress.current = true;
  // };
  // const handleRotationDone = (rotation: number) => {
  //   isRotationInProgress.current = false;

  //   // not using object as there is a caching
  //   const obj = cloneDeep(objectRef.current); //(objectByIdRef.current[object.id]);
  //   //obj.absoluteLayout!.common!.top = "300px"; //TODO
  //   obj.rotation = rotation;
  //   _updateObject(obj);
  // };

  const objectId = object.id;
  const isSelected = selectedObjectIds.indexOf(objectId) !== -1;
  const isInSelectionPath = selectionPath.indexOf(objectId) !== -1;
  //const isAbsolutePosition = object.layout === "absolute" && !layoutChildren;

  //const cssPosition = !layoutChildren ? "absolute" : "static";
  const cssPosition = "absolute";
  // *** NOTE: we are rendering different for selected and non selected object

  // 1. NON SELECTED  (NON-DRAGGABLE)

  //if (!isSelected || !isAbsolutePosition) {
  //
  const calculatedObjectSize = calculateObjectSize(
    object,
    parentLayer,
    breakpointConfig!,
    {
      resetPosition: false,
    },
  );

  //debug
  // useEffect(() => {
  //   if (object?.objectIds && object.objectIds.length > 0) {
  //     getUngroupObjectsCalculation({
  //       group: object,
  //       objects: object.objectIds.map((objectId) => objectById[objectId]),
  //       breakpointConfig: breakpointConfig!,
  //       parentLayer,
  //     });
  //   }
  // });

  useLayoutEffect(() => {
    const objectHolder = document.getElementsByClassName(
      `object-holder-${object.id}`,
    )[0] as HTMLDivElement;

    if (objectHolder) {
      objectHolder.style.transform = getObjectTransform(object);

      objectHolder.style.visibility =
        activeEditObjectId === objectId ? "hidden" : "visible";
      //return null;

      // translateX(" +
      // translateX +
      // "px) translateY(" +
      // translateY +
      // "px)";
    }
  }, [object.rotation, object.scale, object.id, object, activeEditObjectId]);

  // TODO: mode this to parent
  // if (activeEditObjectId === objectId) {
  //   return null;
  // }

  const clipMaskId = `clip-mask-${objectId}`;
  let clipMaskHtml = "";
  let maskStyle: CSSProperties = {};
  if (object.mask?.type === "svg") {
    maskStyle = {
      clipPath: `url(#${clipMaskId})`,
    };
    clipMaskHtml = getClipMaskFromSvg(
      object.mask?.svg!,
      clipMaskId,
      calculatedObjectSize.width as any, // TODO <<
      calculatedObjectSize.height as any, // TODO <<
    );
  }

  const objectStyle = {
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

  const selectedColor = object.isLocked
    ? "rgba(72, 175,240, 0.5)"
    : "rgba(72, 175,240, 1)";

  const hoverColor = "rgba(72, 175,240, 0.5)";

  const commonObjectRect: CSSProperties = {
    left: !layoutChildren ? left : "0px",
    top: !layoutChildren ? top : "0px",
    width: calculatedObjectSize.width ?? "0px",
    height: calculatedObjectSize.height ?? "0px",
  };

  const selectionStyle: CSSProperties = {
    ...commonObjectRect,
    zIndex: 200,
    left: "0px",
    top: "0px",
    position: "absolute",
    pointerEvents: "none",
    transformOrigin: "top left",
    ...((isSelected || (isInSelectionPath && !isSelected)) && !activeTool
      ? {
          boxShadow: `0 0 0 ${1 / objectZoom / stageZoom}px ${
            object.objectIds && !isSelected ? "#444444" : selectedColor
          }`,
        }
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

  objectHolderStyle.pointerEvents = "none"; // "all";

  objectHolderStyle.transformOrigin = "top left";

  if (clipboard?.entityIds?.includes(object.id)) {
    if (clipboard?.operation === "cut") objectHolderStyle.opacity = 0.5;
    // const copyBoxShadow = `,0 0 0 ${
    //   1.5 / objectZoom / stageZoom
    // }px ${"yellow"}`;
    // objectHolderStyle.boxShadow += copyBoxShadow;
    //objectHolderStyle.borderStyle = "dotted";
  }

  // NOTE: FOR TEXT
  const calculatedObjectSizeForObject = { ...calculatedObjectSize };
  if (object.properties?.autoHeight) {
    //calculatedObjectSizeForObject.height = "auto";
    //objectStyle.height = "auto";
  }

  const isOnlyThisObjectSelected =
    selectedObjectIds.length === 1 &&
    selectedObjectIds[0] === objectRef.current.id;

  // const onObjectClick = (
  //   event: React.MouseEvent<HTMLDivElement>,
  //   objectId: string
  // ) => {
  //   if (event.shiftKey) {
  //     selectedObjectIds.indexOf(objectId) === -1
  //       ? _addObjectsToSelection([objectId])
  //       : _removeObjectsFromSelection([objectId]);
  //     if (activeObjectId === objectId) {
  //       _deactivateObject(objectId);
  //     }

  //     //setSelectionStartPosition(null);
  //   } else {
  //     if (isOnlyThisObjectSelected) {
  //       // NOTE: activate tool editor
  //       const deff = getAppObjectDefinition(objectById[objectId].type);
  //       if (deff?.meta.isEditable) {
  //         // TODO>TODO>>
  //         //activateTool(objectById[objectId].type, objectId);
  //       }
  //     }
  //     _activateObject(objectId);
  //     _selectObjects([objectId]);
  //     _selectForProperties({ type: "object", id: objectId });
  //   }
  // };

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

  let allowObjectSelection =
    rootObjectSelection ||
    childObjectInGroupSelection ||
    siblingObjectSelection;

  const objectInGroup = isObjectInGroup(object, objectById);

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
      {/* NOTE: FOR DEBUGING */}
      {/* <div className={cx(`object-bounds-${object.id}`, css.objectBounds)}></div> */}
      <div
        className="clipping-mask-daap"
        dangerouslySetInnerHTML={{ __html: clipMaskHtml }}
      ></div>

      <WithResizeHandle
        key={`object-${object.id}`}
        object={object}
        stageZoom={stageZoom ?? 1}
        rotation={object.rotation ?? 0}
        scale={object.scale ?? 1}
        selectionPath={selectionPath}
        objectById={objectById}
        isSelected={isSelected}
        forceHide={!!activeTool}
      >
        <WithRotationHandle
          key={`object-${object.id}`}
          object={object}
          stageZoom={stageZoom ?? 1}
          rotation={object.rotation ?? 0}
          scale={object.scale ?? 1}
          selectionPath={selectionPath}
          objectById={objectById}
          forceHide={!!activeTool}
        >
          <div
            ref={childRef}
            style={objectHolderStyle}
            className={cx(`object-holder-${object.id}`, {
              // [css.layoutChildrenSelected]: isSelected && !activeTool,
              // [css.ancestorGroupSelected]: isInSelectionPath && !isSelected,
            })}
            onMouseEnter={() => {
              !activeTool && !isSelected && setIsHover(true);
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

                    // if (object.isLocked) {
                    //   return; // TODO: does not work as we cannot select object
                    // }

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
                    // <<

                    // setRectangleOrigin(childRef.current, "bottom right");

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
            {/* {object.type === "group" && (
              <div
                style={{
                  ...objectHolderStyle,
                  height:
                    parseFloat(objectHolderStyle.height as string) + 100 + "px",
                  width:
                    parseFloat(objectHolderStyle.width as string) + 100 + "px",
                }}
              ></div>
            )} */}
            <div
              className={cx(css.rotationHandle)}
              style={{
                // TODO: will be removed when we remove "selection" outside
                top: -(35 / objectZoom / stageZoom) + "px",
              }}
            >
              {!activeTool && ( //&& !object.isLocked && sizeType === "rect"
                <div
                  className={cx(css.circle, "rotation-handle")}
                  style={{
                    // TODO: will be removed when we remove "selection" outside
                    transform: `scale(${1 / objectZoom / stageZoom})`,
                    display: isOnlyThisObjectSelected ? "block" : "none",
                    pointerEvents: "all",
                    boxShadow: "0 0 0 " + 1 + "px white",
                    background: object.objectIds
                      ? groupSelectionColor
                      : objectSelectionColor,
                  }}
                />
              )}
            </div>
            {object.type === "group" ? (
              <>
                <style
                  dangerouslySetInnerHTML={{
                    __html:
                      ".group-object-" + object.id + "{" + groupStyle + "}",
                  }}
                ></style>
                <div
                  className={"group-object-" + object.id}
                  style={{
                    ...objectStyle,
                    ...maskStyle,
                    overflow: object.style?.overflow ?? "visible",
                  }}
                >
                  {object.objectIds?.map((objectId) => {
                    const childObject = objectById[objectId]; //objectByIdLocalRef
                    const layoutChildren = parentLayer.properties
                      ?.hasLayoutChildren
                      ? parentLayer.properties.layoutChildren
                      : undefined;
                    return (
                      <StageObject
                        key={objectId}
                        object={childObject}
                        parentGroup={object}
                        layer={parentLayer}
                        layoutChildren={layoutChildren}
                        objectZoom={objectZoom * (childObject.scale ?? 1)}
                        //stageZoom={stageZoom}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div
                  key={object.id + "_1"}
                  dangerouslySetInnerHTML={{
                    __html:
                      getObjectHtml(
                        object,
                        calculatedObjectSizeForObject,
                        false,
                        false,
                        breakpointConfig?.type,
                        // thumbnailHtmlArr,
                        // slidesCounter
                      ) ||
                      getObjectPlaceholder(
                        `Object '${object.type}' is not installed.<br/>Go to Library > Extensions (or My Extensions) to install missing extension.`,
                      ),
                  }}
                  style={{
                    ...objectStyle,
                    ...maskStyle,
                    overflow: object.style?.overflow ?? "visible",
                  }}
                  // className={cx({
                  //   [css.notVisible]: !object.isVisible,
                  //   [css.layoutChildrenSelected]: isSelected,
                  // })}
                />
              </>
            )}
            {/* {allowObjectSelection && ( */}
            <div
              onClick={(event) => {
                //event.stopPropagation();
                //onObjectClick(event, objectId);
              }}
              dangerouslySetInnerHTML={{
                __html:
                  sizeType === "line"
                    ? getObjectHtml(
                        object,
                        calculatedObjectSizeForObject,
                        false,
                        false,
                        breakpointConfig?.type,
                        // thumbnailHtmlArr,
                        // slidesCounter
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
                pointerEvents: "all",
                opacity: 0,
                //transform: "translateX(100) translateY(100)",
                //left: "0px",
                //top: "0px",
              }}
            />
            {/* )} */}
            <div
              className={cx(
                css.resizeHandleHolder,
                "resize-handle-holder-" + object.id,
              )}
              style={{
                // TODO: will be removed when we remove "selection" outside
                ...objectStyle,
                display: isOnlyThisObjectSelected ? "block" : "none",
                position: "absolute",
                top: "0px",
                left: "0px",
              }}
            ></div>
            <div className="object-selection" style={selectionStyle} />
          </div>
        </WithRotationHandle>
      </WithResizeHandle>
    </React.Fragment>
  );
}

const mapStateToProps = (state: IStore) => {
  const { pages, layers, objects, selection, document, settings, clipboard } =
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
        breakpointConfig.type === state.stage.selectedDevice,
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

  return {
    clipboard,
    pages,
    layers,
    objects,
    // stageSize: document.documentSize,
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
  // _setStagePreview: (preview: Partial<IPreviewState>) =>
  //   setStagePreview(preview),
  _updateObject: (object: IObject) => updateObject(object),
  _activateObject: (objectId: string | null) => activateObject(objectId),
  _selectObjects: (objectIds: string[]) => selectObjects(objectIds),
  _addObjectsToSelection: (objectIds: string[]) =>
    addObjectsToSelection(objectIds),
  _removeObjectsFromSelection: (objectIds: string[]) =>
    removeObjectsFromSelection(objectIds),
  _deactivateObject: (objectId: string) => deactivateObject(objectId),
  _selectObjectsByRect: (rect: IRect) => selectObjectsByRect(rect),
  // _addNewObject: (
  //   layerId: string,
  //   type: ObjectType,
  //   objectProps: Partial<IObject>
  // ) => addNewObject(layerId, type, objectProps),
  _resetStageTool: () => setStageTool(StageTools.SELECT),
  _setViewPortSize: (size: { w: number; h: number }) => setViewPortSize(size),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _setStageZoom: (zoom: number) => setStageZoom(zoom),
  //_setCustomBPSize: (size: { w: number; h: number }) => setCustomBPSize(size),
};

const StageObject = withErrorBoundary(
  connect(mapStateToProps, mapDispatchToProps)(StageObjectInternal),
);

export default StageObject;

function calculateBounds(
  objectById: any,
  changedObj: IObject,
  useChangeObject: boolean,
): Rect | undefined {
  if (changedObj?.parentId) {
    const parentObj = objectById[changedObj.parentId];
    const groupObjectIds = parentObj?.objectIds;
    if (groupObjectIds) {
      const firstObjectId = groupObjectIds[0];
      const firstObject =
        useChangeObject && changedObj.id === firstObjectId
          ? changedObj
          : objectById[firstObjectId];
      let groupBounds = getObjectBoundingBox(firstObject);
      groupObjectIds.forEach((objectId: string) => {
        const object =
          useChangeObject && changedObj.id === objectId
            ? changedObj
            : objectById[objectId];
        const bounds = getObjectBoundingBox(object);
        groupBounds = boundsUnion(groupBounds, bounds);
      });

      return groupBounds;
    }
  }
}

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

const styleStringToObject = (styleString: string) => {
  const styleObject: CSSProperties = {};
  styleString.split(";").forEach((style) => {
    const [key, value] = style.split(":");
    if (key && value) {
      const trimmedKey = key.trim();
      const camelCaseKey = trimmedKey.replace(/-([a-z])/g, (g) =>
        g[1].toUpperCase(),
      );
      (styleObject as any)[camelCaseKey] = value.trim();
    }
  });
  return styleObject;
};
