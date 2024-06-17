import React, {
  CSSProperties,
  MouseEventHandler,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import { cloneDeep, includes, last } from "lodash-es";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { ILayer, IObject } from "webslider-sdk/lib/objects/i-object";
import { getZoom } from "../../store/helpers/calculateZoom";
import { ISlide } from "../../store/reducers/i-slides";
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
  createGroupWithObjects,
  createTransformForPath,
  decomposeMatrix2DW3,
  getFullMatrixFromTransformArr,
  getGroupMatrixFromSelectionPath,
  getObjectTransform,
} from "./stage-panel-utils";
import { ReactComponent as RotateIcon } from "../../assets/icons/rotate-icon.svg";
import { setGlobalProp } from "./utils";
import { Point, Rect } from "../../webslider-sdk/object/i-tool-class";
import useDeepCompareEffect from "use-deep-compare-effect";
import {
  boundsUnion,
  getObjectBoundingBox,
} from "../../store/helpers/objectBoundingBox";
import { StageManagerContext } from "./StageManagerProvider";
import { StageToolEnum } from "../../utils/selection-manager/types";
import { populateObjectThreeIds } from "../../store/actions/actions-utils";

type IStageLayer = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    object: IObject;
    layoutChildren?: ILayoutChildrenValue;
    layer: ILayer;
    objectZoom: number;
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
  } = props;

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
    //console.log(ta);
    transformArrayRef.current = ta;
    setTransformArray(ta);
  }, [groupsPath, objectById]);

  //console.log(groupsPath);

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

  //console.log("AAAAA");

  // console.log(object?.absoluteLayout?.common?.left);
  // console.log(object2?.absoluteLayout?.common?.left);

  const {
    activeTool,
    activateTool,
    activeObjectId: activeEditObjectId,
  } = useContext(ToolsContext);

  // const isRotationInProgress = useRef(false);
  // const handleRotationStart = () => {
  //   isRotationInProgress.current = true;
  // };
  // const handleRotationDone = (rotation: number) => {
  //   isRotationInProgress.current = false;
  //   //console.log(objectRef.current?.absoluteLayout?.common?.left);

  //   // not using object as there is a caching
  //   const obj = cloneDeep(objectRef.current); //(objectByIdRef.current[object.id]);
  //   //obj.absoluteLayout!.common!.top = "300px"; //TODO
  //   //console.log(rotation, "ROTATION");
  //   obj.rotation = rotation;
  //   _updateObject(obj);
  // };

  const objectId = object.id;
  const isSelected = selectedObjectIds.indexOf(objectId) !== -1;
  const isInSelectionPath = selectionPath.indexOf(objectId) !== -1;
  const isAbsolutePosition = object.layout === "absolute" && !layoutChildren;

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
    }
  );

  useEffect(() => {
    if (object?.objectIds && object.objectIds.length > 0) {
      createGroupWithObjects({
        group: object,
        objects: object.objectIds.map((objectId) => objectById[objectId]),
        breakpointConfig: breakpointConfig!,
        parentLayer,
      });
    }
  });

  useLayoutEffect(() => {
    const objectHolder = document.getElementsByClassName(
      `object-holder-${object.id}`
    )[0] as HTMLDivElement;

    if (objectHolder) {
      objectHolder.style.transform = getObjectTransform(object);

      // translateX(" +
      // translateX +
      // "px) translateY(" +
      // translateY +
      // "px)";
    }
  }, [object.rotation, object.scale, object.id, object]);

  // TODO: mode this to parent
  if (activeEditObjectId === objectId) return null;

  const objectStyle = { ...calculatedObjectSize, left: "0px", top: "0px" };
  objectStyle.position = cssPosition;
  if (object.transformDefinition?.values?.hasPerspective) {
    objectStyle.perspective = `${object.transformDefinition?.values?.transformPerspective}`;
  }

  // object holder
  const objectHolderStyle: CSSProperties = {
    zIndex: 100,
    position: "absolute", //!layoutChildren ? "relative" : "static",
    left: !layoutChildren ? calculatedObjectSize.left : "0px",
    top: !layoutChildren ? calculatedObjectSize.top : "0px",
    width: calculatedObjectSize.width ?? "0px",
    height: calculatedObjectSize.height ?? "0px",
    ...(isSelected
      ? {
          boxShadow: `0 0 0 ${1 / objectZoom}px #48aff0`,
        }
      : {}),
  };
  if (layoutChildren?.type === "inline") {
    objectHolderStyle.display = "inline-block";
  }

  objectHolderStyle.pointerEvents = "none"; // "all";

  // NOTE: FOR TEXT
  const calculatedObjectSizeForObject = { ...calculatedObjectSize };
  if (object.definition.values?.autoHeight) {
    //calculatedObjectSizeForObject.height = "auto";
    //objectStyle.height = "auto";
  }

  const isOnlyThisObjectSelected =
    selectedObjectIds.length === 1 &&
    selectedObjectIds[0] === objectRef.current.id;

  const onObjectClick = (
    event: React.MouseEvent<HTMLDivElement>,
    objectId: string
  ) => {
    if (event.shiftKey) {
      selectedObjectIds.indexOf(objectId) === -1
        ? _addObjectsToSelection([objectId])
        : _removeObjectsFromSelection([objectId]);
      if (activeObjectId === objectId) {
        _deactivateObject(objectId);
      }

      //setSelectionStartPosition(null);
    } else {
      if (isOnlyThisObjectSelected) {
        // NOTE: activate tool editor
        const deff = getAppObjectDefinition(objectById[objectId].type);
        if (deff?.meta.isEditable) {
          // TODO>TODO>>
          console.log("UNComment");
          //activateTool(objectById[objectId].type, objectId);
        }
      }
      _activateObject(objectId);
      _selectObjects([objectId]);
      _selectForProperties({ type: "object", id: objectId });
    }
  };

  //console.log(object.rotation);

  const rootObjectSelection =
    selectedObjectIds.length === 0 && !!layerById[object.parentId!];

  const childObjectInGroupSelection =
    selectedObjectIds.length === 1 &&
    objectById[selectedObjectIds[0]].objectIds &&
    objectById[selectedObjectIds[0]].objectIds!.length > 0 &&
    objectById[selectedObjectIds[0]].objectIds?.includes(object.id);

  let siblingObjectSelection = false;
  if (selectedObjectIds.length > 0) {
    const parentId = objectById[selectedObjectIds[0]].parentId;
    if (layerById[object.parentId!]) {
      siblingObjectSelection = true;
    } else if (objectById[parentId!]?.objectIds?.includes(object.id)) {
      siblingObjectSelection = true;
    }
  }

  //console.log(siblingObjectSelection, "siblingObjectSelection");
  let allowObjectSelection =
    rootObjectSelection ||
    childObjectInGroupSelection ||
    siblingObjectSelection;

  console.log(allowObjectSelection + " :" + object.name);
  // TODO temporary
  ///allowObjectSelection = !object.objectIds;

  console.log("SELECTED ------------");
  console.log(isSelected + " : " + object.name);
  return (
    <>
      {/* NOTE: FOR DEBUGING */}
      {/* <div className={cx(`object-bounds-${object.id}`, css.objectBounds)}></div> */}
      <WithRotationHandle
        key={`object-${object.id}`}
        object={object}
        stageZoom={stageZoom ?? 1}
        // onRotationDone={handleRotationDone}
        // onRotationStart={handleRotationStart}
        rotation={object.rotation}
        scale={object.scale}
        translateX={mouseDiff.x}
        translateY={mouseDiff.y}
        selectionPath={selectionPath}
        objectById={objectById}
        //visible={isOnlyThisObjectSelected}
      >
        <div
          ref={childRef}
          style={objectHolderStyle}
          className={cx(`object-holder-${object.id}`, {
            [css.layoutChildrenSelected]: isSelected,
            [css.ancestorGroupSelected]: isInSelectionPath && !isSelected,
          })}
          onMouseDown={(e) => {
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
              layerById
            );

            const groupsMatrix = getGroupMatrixFromSelectionPath(
              [...objectPath, object.id],
              objectById
            );
            // <<

            //console.log(groupsMatrix, "groupsMatrix");

            // const groupId = last(groupsPath ?? [])

            stageManager.start(StageToolEnum.MOVE, {
              boundingClientRects: [childRef.current!.getBoundingClientRect()],
              mousePosition: getMousePosition(e),
              contextMatrix: groupsMatrix,
              objectRotation: object.rotation,
              objectScale: object.scale,
              objectId: props.object.id,
              originalMouseEvent: e.nativeEvent,
            });

            // TODO remove following code

            return;

            return;

            // if (isRotationInProgress.current) return;

            // setGlobalProp("mouseDownObjectId", object.id);
            // //console.log("obje mouse down");
            // if (isSelected) {
            //   //object.type === "group" &&
            //   // var x = e.offsetX != null ? e.offsetX : e.originalEvent.layerX;
            //   // var y = e.offsetY != null ? e.offsetY : e.originalEvent.layerY;
            //   mouseInitialPos.current = getMousePosition(e);
            //   // console.log(e.clientX);
            //   // console.log(mouseInitialPos.current);
            // }
          }}
          onMouseMove={(e) => {
            return;

            // if (isRotationInProgress.current) return;
            // if (!mouseInitialPos.current) return;

            // if (isSelected) {
            //   //object.type === "group" &&
            //   const mousePoint = getMousePosition(e);

            //   const diff = {
            //     x: mousePoint.x - mouseInitialPos.current?.x,
            //     y: mousePoint.y - mouseInitialPos.current?.y,
            //   };

            //   const groupsMatrix = getFullMatrixFromTransformArr(
            //     transformArrayRef.current
            //   );

            //   const computedDiff = mouseToReal(diff, 0, groupsMatrix);

            //   mouseDiffPos.current = computedDiff;
            //   setMouseDiff(computedDiff);
            // }
          }}
          onMouseUp={(e) => {
            return;

            // if (!mouseInitialPos.current) return;

            // const obj = cloneDeep(objectRef.current); //(objectByIdRef.current[object.id]);
            // const top = parseFloat(obj.absoluteLayout!.common.top);
            // const left = parseFloat(obj.absoluteLayout!.common.left);

            // const mousePoint = getMousePosition(e);

            // const diff = {
            //   x: mousePoint.x - mouseInitialPos.current?.x,
            //   y: mousePoint.y - mouseInitialPos.current?.y,
            // };

            // const groupsMatrix = getFullMatrixFromTransformArr(
            //   transformArrayRef.current
            // );

            // const computedDiff = mouseToReal(
            //   diff,
            //   object.rotation,
            //   groupsMatrix
            // );

            // obj.absoluteLayout!.common.top = `${top + computedDiff.y}px`;
            // obj.absoluteLayout!.common.left = `${left + computedDiff.x}px`;
            // _updateObject(obj);

            // // parent project id update(TODO: this should be recursive)
            // // if (obj.parentId) {
            // //   const boundsBefore = calculateBounds(objectById, obj, false);
            // //   const boundsAfter = calculateBounds(objectById, obj, true);
            // //   console.log("BOUNDS");
            // //   console.log(boundsBefore);
            // //   console.log(boundsAfter);

            // //   const parentObjClone = cloneDeep(objectById[obj.parentId]);
            // //   parentObjClone.absoluteLayout!.common.left =
            // //     boundsAfter?.x + "px";
            // //   parentObjClone.absoluteLayout!.common.top = boundsAfter?.y + "px";
            // //   parentObjClone.absoluteLayout!.common.width =
            // //     boundsAfter?.width + "px";
            // //   parentObjClone.absoluteLayout!.common.height =
            // //     boundsAfter?.height + "px";

            // //   _updateObject(parentObjClone);
            // // }

            // // << parent object update
            // mouseInitialPos.current = undefined;
            // setMouseDiff({ x: 0, y: 0 });
          }}
          //className="NOT_isSelected_OR_NOT_isAbsolutePosition"
        >
          <div
            className={cx(css.rotationHandle, {
              [css.rotationHandleGroup]: object.objectIds,
            })}
            style={{
              // height: 15 + 20 / objectZoom + "px",
              // //height: 35 / objectZoom + "px",
              top: -(35 / objectZoom) + "px",
            }}
          >
            {
              <div
                className={cx(css.circle, "rotation-handle")}
                style={{
                  // width: 20 / objectZoom + "px",
                  // height: 20 / objectZoom + "px",
                  // borderRadius: 10 / objectZoom + "px",
                  transform: `scale(${1 / objectZoom})`,
                  display: isOnlyThisObjectSelected ? "block" : "none",
                  pointerEvents: "all",
                }}
              />
            }
            {/* <div
              className={cx(css.line)}
              style={{
                width: 1 / objectZoom + "px",
                height: 15 / objectZoom + "px",
              }}
            /> */}
          </div>
          {object.type === "group" ? (
            object.objectIds?.map((objectId) => {
              const object = objectById[objectId]; //objectByIdLocalRef
              const layoutChildren = parentLayer.definition.values
                .hasLayoutChildren
                ? parentLayer.definition.values.layoutChildren
                : undefined;
              return (
                <StageObject
                  key={objectId}
                  object={object}
                  layer={parentLayer}
                  layoutChildren={layoutChildren}
                  objectZoom={objectZoom * object.scale}
                  //stageZoom={stageZoom}
                />
              );
            })
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
                      breakpointConfig?.type
                      // thumbnailHtmlArr,
                      // slidesCounter
                    ) ||
                    getObjectPlaceholder(
                      `Object '${object.type}' is not installed.<br/>Go to Library > Extensions (or My Extensions) to install missing extension.`
                    ),
                }}
                style={objectStyle}
                // className={cx({
                //   [css.notVisible]: !object.isVisible,
                //   [css.layoutChildrenSelected]: isSelected,
                // })}
              />
            </>
          )}
          {allowObjectSelection && (
            <div
              onClick={(event) => {
                //event.stopPropagation();
                //onObjectClick(event, objectId);
              }}
              key={object.id}
              className={cx(
                css[object.type],
                "OVO_SELEKTUJE_ELEMENT_KOJI_NIJE_SELEKTOVAN"
              )}
              style={{
                ...objectStyle,
                position: "relative",
                pointerEvents: "all",
                //transform: "translateX(100) translateY(100)",
                //left: "0px",
                //top: "0px",
              }}
            />
          )}
        </div>
      </WithRotationHandle>
    </>
  );
}

const mapStateToProps = (state: IStore) => {
  const { slides, layers, objects, selection, document, settings } =
    state.project;
  const { stage } = state;

  let layerArr: ILayer[] | null = null;
  let slide: ISlide | null = null;

  if (selection.activeSlideId) {
    const layerIds = slides.slideById[selection.activeSlideId].layerIds;
    layerArr = layerIds.map((layerId: string) => layers.layerById[layerId]);
    slide = slides.slideById[selection.activeSlideId];
  }

  const breakpointConfig: BreakpointConfiguration | undefined =
    settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice
    );

  const zoom = getZoom(stage, settings);

  ////console.log(zoom);
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
    slides,
    layers,
    objects,
    stageSize: document.documentSize,
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
  connect(mapStateToProps, mapDispatchToProps)(StageObjectInternal)
);

export default StageObject;

function calculateBounds(
  objectById: any,
  changedObj: IObject,
  useChangeObject: boolean
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
      console.log("BOUNDS");
      console.log(groupBounds);
      return groupBounds;
    }
  }
}
