import React, { CSSProperties, useCallback, useContext, useRef } from "react";
import cx from "classnames";
import { cloneDeep, includes } from "lodash-es";
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

type IStageLayer = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    object: IObject;
    layoutChildren?: ILayoutChildrenValue;
    layer: ILayer;
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
    _updateObject,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _activateObject,
    _selectObjects,
    _selectForProperties,
  } = props;

  // NOTE: handleRotation is using cached version of object
  // we are using ref to access latest object
  const objectRef = useRef(object);
  objectRef.current = object;

  console.log("AAAAA");

  // console.log(object?.absoluteLayout?.common?.left);
  // console.log(object2?.absoluteLayout?.common?.left);

  const {
    activeTool,
    activateTool,
    activeObjectId: activeEditObjectId,
  } = useContext(ToolsContext);

  const handleRotation = (rotation: number) => {
    console.log(objectRef.current?.absoluteLayout?.common?.left);

    // not using object as there is a caching
    const obj = cloneDeep(objectRef.current); //(objectByIdRef.current[object.id]);
    //obj.absoluteLayout!.common!.top = "300px"; //TODO
    //console.log(rotation, "ROTATION");
    obj.rotation = rotation;
    _updateObject(obj);
  };

  const objectId = object.id;
  const isSelected = selectedObjectIds.indexOf(objectId) !== -1;
  const isAbsolutePosition = object.layout === "absolute" && !layoutChildren;

  if (activeEditObjectId === objectId) return null;

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
  };
  if (layoutChildren?.type === "inline") {
    objectHolderStyle.display = "inline-block";
  }

  objectHolderStyle.pointerEvents = "all";

  // NOTE: FOR TEXT
  const calculatedObjectSizeForObject = { ...calculatedObjectSize };
  if (object.definition.values?.autoHeight) {
    //calculatedObjectSizeForObject.height = "auto";
    //objectStyle.height = "auto";
  }

  const onObjectClick = (
    event: React.MouseEvent<HTMLDivElement>,
    objectId: string
  ) => {
    if (event.ctrlKey || event.metaKey) {
      selectedObjectIds.indexOf(objectId) === -1
        ? _addObjectsToSelection([objectId])
        : _removeObjectsFromSelection([objectId]);
      if (activeObjectId === objectId) {
        _deactivateObject(objectId);
      }

      //setSelectionStartPosition(null);
    } else {
      if (selectedObjectIds.length === 1 && selectedObjectIds[0] === objectId) {
        // NOTE: activate tool editor
        const deff = getAppObjectDefinition(objectById[objectId].type);
        if (deff?.meta.isEditable) {
          activateTool(objectById[objectId].type, objectId);
        }
      }
      _activateObject(objectId);
      _selectObjects([objectId]);
      _selectForProperties({ type: "object", id: objectId });
    }
  };
  console.log(object.rotation);

  return (
    <>
      <div className={cx(`object-bounds-${object.id}`, css.objectBounds)}></div>
      <WithRotationHandle
        key={`object-${object.id}`}
        object={object}
        stageZoom={stageZoom ?? 1}
        onRotationDone={handleRotation}
        rotation={object.rotation}
      >
        <div
          style={objectHolderStyle}
          className={cx(`object-holder-${object.id}`)}
          //className="NOT_isSelected_OR_NOT_isAbsolutePosition"
        >
          <div
            className={cx(
              css.rotationHandle,
              { [css.rotationHandleGroup]: object.objectIds },
              "rotation-handle"
            )}
          ></div>
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
                className={cx({
                  [css.notVisible]: !object.isVisible,
                  [css.layoutChildrenSelected]: isSelected,
                })}
              />
              <div
                onClick={(event) => {
                  onObjectClick(event, objectId);
                }}
                key={object.id}
                className={cx(
                  css[object.type],
                  "OVO_SELEKTUJE_ELEMENT_KOJI_NIJE_SELEKTOVAN"
                )}
                style={{
                  ...objectStyle,
                  position: "relative",
                  //left: "0px",
                  //top: "0px",
                }}
              />
            </>
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
    activeObjectId: selection.activeObjectId,
    activeLayerId: selection.activeLayerId,
    selectedObjectIds: selection.selectedObjectIds,
    stageTool: state.stage.stageTool.tool,
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
