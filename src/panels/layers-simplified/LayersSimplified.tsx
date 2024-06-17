import React from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import {
  addNewLayer,
  addLayersToSelection,
  deleteLayersThree,
  activateLayer,
  selectLayers,
  addNewObject,
  activateObject,
  removeLayersFromSelection,
  deleteObjects,
  updateObject,
  selectObjects,
  addObjectsToSelection,
  removeObjectsFromSelection,
  deactivateObject,
  updateLayer,
  selectForProperties,
  selectForPropertiesProps,
  moveObjects,
  moveLayers,
  duplicateLayers,
  duplicateObjects,
} from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/i-layers";
import css from "./LayersSimplified.module.scss";
import { ISlide } from "../../store/reducers/i-slides";
import { IObject, ObjectType } from "webslider-sdk/lib/objects/i-object";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { ObjectRow } from "./ObjectRow";
import { last } from "lodash-es";
import { Button } from "@blueprintjs/core";

//import { DragLayerComponent } from "./CustomDragLayer";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const LayersPanel: React.FC<ISlidesPanel> = (props) => {
  const {
    layerArr,
    objectById,
    activeObjectId,
    activeLayerId,
    layerById,
    breakpointConfig,
    selectedObjectIds,
    selectionPath,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _activateObject,
    _selectObjects,
    _selectForProperties,
    _activateLayer,
    _selectLayers,
  } = props;

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
    } else {
      _activateObject(objectId);
      _selectObjects([objectId]);
      _selectForProperties({ type: "object", id: objectId });
    }
  };

  const onObjectDblClick = (
    event: React.MouseEvent<HTMLDivElement>,
    isGroup: boolean,
    objectId: string
  ) => {
    if (isGroup) {
      _activateObject(objectById[objectId]?.objectIds?.[0]!);
      _selectObjects(objectById[objectId]?.objectIds ?? []);
      //_selectForProperties({ type: "object", id: objectId });
    }
  };

  let objectIds: string[] = [];

  const firstSelectedObject = objectById[selectedObjectIds[0]];
  if (firstSelectedObject) {
    if (layerById[firstSelectedObject.parentId!]) {
      objectIds = layerById[firstSelectedObject.parentId!].objectIds;
    } else if (objectById[firstSelectedObject.id].parentId) {
      objectIds =
        objectById[objectById[firstSelectedObject.id].parentId!].objectIds!;
    }
  } else if (activeLayerId) {
    objectIds = layerById[activeLayerId].objectIds!;
  }

  //console.log(selectionPath, "selectionPath");

  const [parentLayerId, ...selectionPathWithoutLayer] = selectionPath;
  //selectionPathWithoutLayer.pop();

  console.log(selectionPathWithoutLayer);
  if (!parentLayerId) return null;

  return (
    <>
      <div className={css.layerPanel}>
        <>
          <div className={css.layersHolder}>
            {/* {layerArr?.map((layer, idx) => { */}
            {/* //if (!layer) return null; // TODO: IMPORTANT koo kopiranja slajda */}

            {/* return ( */}
            <>
              <Button
                intent={"primary"}
                minimal
                small
                onClick={() => {
                  _activateLayer(parentLayerId);
                  _selectLayers([parentLayerId]);
                  _selectForProperties({ type: "layer", id: parentLayerId });
                }}
              >
                {layerById[parentLayerId]?.name}
              </Button>

              {selectionPathWithoutLayer.map((pathObjectId) => (
                <Button
                  intent={"primary"}
                  minimal
                  small
                  onClick={() => {
                    _activateObject(pathObjectId);
                    _selectObjects([pathObjectId]);
                    _selectForProperties({ type: "object", id: pathObjectId });
                  }}
                >
                  {objectById[pathObjectId]?.name}
                </Button>
              ))}
              {/* key={layer.id} */}
              <div className={cx(css.objectsHolder, {})}>
                {objectIds?.length > 0 ? (
                  <>
                    {objectIds.map((objectId, idx) => {
                      const object = objectById[objectId];

                      return (
                        <React.Fragment key={`object-${objectId}`}>
                          <ObjectRow
                            onObjectClick={onObjectClick}
                            onObjectDblClick={onObjectDblClick}
                            breakpointConfig={breakpointConfig}
                            selectedObjectIds={selectedObjectIds}
                            object={object}
                            layer={layerById[activeLayerId!]} // todo
                          />
                          {/* <div
                            className={cx(css.objectItem, {
                              [css.selected]: object.id === activeObjectId,
                            })}
                          >
                            {object.name}
                          </div> */}
                        </React.Fragment>
                      );
                    })}
                  </>
                ) : (
                  "No objects found"
                )}
              </div>
            </>
            {/* ); */}
            {/* })} */}
          </div>
        </>
      </div>
    </>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides, layers, objects, selection } = state.project;
  //const { layoutType } = state.globals;
  let layerArr: ILayer[] | null = null;
  let slide: ISlide | null = null;

  if (selection.activeSlideId) {
    const layerIds = slides.slideById[selection.activeSlideId].layerIds;
    layerArr = layerIds.map((layerId: string) => layers.layerById[layerId]);
    slide = slides.slideById[selection.activeSlideId];
  }

  const breakpointConfig: BreakpointConfiguration | undefined = last(
    state.project.settings.breakpoints.breakpointsConfiguration.filter(
      (bc) => bc.enabled
    )
  );

  return {
    layerArr,
    slide,
    objectById: objects.objectById,
    layerById: layers.layerById,
    activeSlideId: selection.activeSlideId,
    activeLayerId: selection.activeLayerId,
    activeObjectId: selection.activeObjectId,
    selectedLayerIds: selection.selectedLayerIds,
    selectedObjectIds: selection.selectedObjectIds,
    selectionForProperties: selection.selectionForProperties,
    selectionPath: selection.selectionPath,
    selectedDevice: state.stage.selectedDevice,
    //layoutStaticAnimationsPanel: layoutType === "default-layers",
    breakpointsConfiguration: state.project.settings.breakpoints,
    breakpointConfig,
  };
};

const mapDispatchToProps = {
  _addNewLayer: (slideId: string) => addNewLayer(slideId),
  _addLayersToSelection: (layerIds: string[]) => addLayersToSelection(layerIds),
  _removeLayersFromSelection: (layerIds: string[]) =>
    removeLayersFromSelection(layerIds),
  _deleteLayersThree: (layerIds: string[]): any => deleteLayersThree(layerIds),
  _activateLayer: (layerId: string) => activateLayer(layerId),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _selectLayers: (layerIds: string[]) => selectLayers(layerIds),
  _addNewObject: (
    layerId: string,
    type: ObjectType,
    objectProps: Partial<IObject>
  ) => addNewObject(layerId, type, objectProps),
  _activateObject: (objectId: string) => activateObject(objectId),
  _selectObjects: (objectIds: string[]) => selectObjects(objectIds),
  _addObjectsToSelection: (objectIds: string[]) =>
    addObjectsToSelection(objectIds),
  _removeObjectsFromSelection: (objectIds: string[]) =>
    removeObjectsFromSelection(objectIds),
  _deleteObjects: (objectIds: string[]) => deleteObjects(objectIds),
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
  _deactivateObject: (objectId: string) => deactivateObject(objectId),
  _moveObjects: (
    refId: string,
    where: "above" | "below" | "layer" | "slide" | "bottom",
    moveIds: string[]
  ) => moveObjects(refId, where, moveIds),

  _duplicateLayers: (ids: string[]): any => duplicateLayers(ids),
  _duplicateObjects: (ids: string[]): any => duplicateObjects(ids),
  _moveLayers: (
    refId: string,
    where: "above" | "below" | "layer" | "slide" | "bottom",
    moveIds: string[]
  ) => moveLayers(refId, where, moveIds),
};

export default connect(mapStateToProps, mapDispatchToProps)(LayersPanel);
