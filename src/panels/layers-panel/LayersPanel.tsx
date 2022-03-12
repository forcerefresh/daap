import React, { useEffect, useRef, useState } from "react";
import cx from "classnames";
import { Button, Checkbox, Icon, Popover, Portal } from "@blueprintjs/core";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import {
  addNewLayer,
  addLayersToSelection,
  deleteLayers,
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
} from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/i-layers";
import css from "./LayersPanel.module.scss";
import { ISlide } from "../../store/reducers/i-slides";
import {
  cloneDeep,
  delay,
  drop,
  get,
  includes,
  isEmpty,
  remove,
} from "lodash-es";
import { IObject, ObjectType } from "../../objects/types";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { EmptyID } from "../../store/types";
import { getEffectDefinition } from "../../effects/effects";
import { getIconByType } from "../../store/reducers/settings";
import { getIconSize, getIconStyle } from "../action-panel/ActionPanel";
import { getResponsiveIcon } from "../../utils/icons/responsive-icons-factory";
import TimelineView from "./TimelineView";
import { ObjectRow } from "./ObjectRow";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DropHandle, IDropItem } from "./DropHandle";
import { LayerRow } from "./LayerRow";
//import { DragLayerComponent } from "./CustomDragLayer";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const LayersPanel: React.FC<ISlidesPanel> = (props) => {
  const {
    layerArr,
    slide,
    objectById,
    activeSlideId,
    activeLayerId,
    activeObjectId,
    selectedLayerIds,
    selectedObjectIds,
    //layoutStaticEffectsPanel,
    breakpointsConfiguration,
    selectionForProperties,
    _addNewLayer,
    _addLayersToSelection,
    _removeLayersFromSelection,
    _deleteLayers,
    _activateLayer,
    _selectLayers,
    _activateObject,
    _selectObjects,
    _deleteObjects,
    _updateObject,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _updateLayer,
    _selectForProperties,
    _moveObjects,
    _moveLayers,
  } = props;

  const [openLayerById, setOpenLayerById] = useState<{
    [key: string]: boolean;
  }>({});

  // when layer is added set open state to be default
  useEffect(() => {
    let updateState = false;
    const openLayerByIdClone = cloneDeep(openLayerById);
    layerArr?.forEach((layer) => {
      if (typeof openLayerById[layer.id] === "undefined") {
        openLayerByIdClone[layer.id] = true;
        updateState = true;
      }
    });

    if (updateState) {
      setOpenLayerById(openLayerByIdClone);
    }
  }, [layerArr]);

  const [showEffectPanelForId, setShowEffectPanelForId] = useState<{
    id: string;
    type?: "object" | "layer";
  }>({ id: EmptyID });

  useEffect(() => {
    if (activeLayerId && isEmpty(openLayerById)) {
      setOpenLayerById({ [activeLayerId]: true });
    }
  }, [activeLayerId]);

  const toggleLayer = (layerId: string) => {
    setOpenLayerById({
      ...openLayerById,
      [layerId]: !openLayerById[layerId],
    });
  };

  const onLayerClick = (
    event: React.MouseEvent<HTMLDivElement>,
    layerId: string
  ) => {
    console.log("SSSSSSSSSSSSSSSSSS");
    if (event.ctrlKey) {
      selectedLayerIds.indexOf(layerId) === -1
        ? _addLayersToSelection([layerId])
        : _removeLayersFromSelection([layerId]);
    } else {
      _activateLayer(layerId);
      _selectLayers([layerId]);
      _selectForProperties({ type: "layer", id: layerId });
    }
  };

  const onObjectClick = (
    event: React.MouseEvent<HTMLDivElement>,
    objectId: string
  ) => {
    if (event.ctrlKey) {
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
  // logic for handling click outside
  const effectPanelRef = useRef(null);
  const handleClickOutside = () => {
    setShowEffectPanelForId({ id: EmptyID });
  };
  useOnClickOutside(effectPanelRef, handleClickOutside, [
    "color-picker-holder",
  ]);

  /*const iconName = getIconByType("large-1");
  const size = getIconSize(iconName);
  const icon = getResponsiveIcon(iconName, size.w, size.h, "lightgray", false);*/

  const layersHolderRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottomDelayed = () => {
    delay(() => {
      layersHolderRef.current?.scrollTo({ top: 10000000 });
      console.log("scrollTo");
    }, 1);
  };

  // draging object state
  const [isDraggingObjects, setIsDraggingObjects] = useState(false);
  const onDragingObjectsChange = (isDragging: boolean) => {
    setIsDraggingObjects(isDragging);
  };

  // draging layer state
  const [isDraggingLayers, setIsDraggingLayers] = useState(false);
  const onDragingLayerChange = (isDragging: boolean) => {
    setIsDraggingLayers(isDragging);
  };

  return (
    <>
      <div className={css.layerPanel}>
        <div className={css.panelHeader}>
          <div>
            <span>LAYERS AND OBJECTS</span>
            <span className={css.slideName}>[ {slide?.name} ]</span>
          </div>
          <div>
            <Button
              minimal
              disabled={!activeSlideId}
              onClick={() => {
                _addNewLayer(activeSlideId as string);
                scrollToBottomDelayed();
              }}
              className={css.addNewLayer}
              small={true}
              icon="add"
            ></Button>
          </div>
        </div>
        <div className={css.layersHolder} ref={layersHolderRef}>
          {layerArr?.map((layer, idx) => {
            const isLastLayer = idx === layerArr.length - 1;
            return (
              <div key={layer.id} className={cx(css.layer, {})}>
                {isDraggingLayers && selectedLayerIds.indexOf(layer.id) === -1 && (
                  <DropHandle
                    type={"layer"}
                    key={layer.id + "_drophandle"}
                    refId={layer.id}
                    where="above"
                    onDrop={(dropItem: IDropItem) => {
                      _moveLayers(
                        dropItem.id,
                        dropItem.where,
                        dropItem.idsToMove
                      );
                    }}
                  />
                )}
                <LayerRow
                  layer={layer}
                  isOpen={openLayerById[layer.id]}
                  breakpointsConfiguration={breakpointsConfiguration}
                  activeLayerId={activeLayerId}
                  selectedLayerIds={selectedLayerIds}
                  updateLayer={_updateLayer}
                  deleteLayers={_deleteLayers}
                  onLayerClick={onLayerClick}
                  selectionForProperties={selectionForProperties}
                  toggleLayer={toggleLayer}
                  moveObjects={_moveObjects}
                  onDragingChange={onDragingLayerChange}
                />
                {openLayerById[layer.id] && layer.objectIds.length > 0 ? (
                  <>
                    {layer.objectIds.map((objectId, idx) => {
                      const object = objectById[objectId];
                      const isLast = idx === layer.objectIds.length - 1;

                      return (
                        <>
                          {isDraggingObjects &&
                            selectedObjectIds.indexOf(object.id) === -1 && (
                              <DropHandle
                                type={"object"}
                                key={object.id + "_drophandle"}
                                refId={object.id}
                                where="above"
                                onDrop={(dropItem: IDropItem) => {
                                  _moveObjects(
                                    dropItem.id,
                                    dropItem.where,
                                    dropItem.idsToMove
                                  );
                                }}
                              />
                            )}
                          <ObjectRow
                            key={object.id}
                            object={object}
                            activeObjectId={activeObjectId}
                            selectedObjectIds={selectedObjectIds}
                            selectionForProperties={selectionForProperties}
                            updateObject={_updateObject}
                            deleteObjects={_deleteObjects}
                            onObjectClick={onObjectClick}
                            slideDuration={slide?.duration.customValue || 1}
                            onDragingChange={onDragingObjectsChange}
                          />
                          {isDraggingObjects && isLast && (
                            <DropHandle
                              type={"object"}
                              key={object.id + "_drophandle_layer"}
                              refId={layer.id}
                              where="layer"
                              onDrop={(dropItem: IDropItem) => {
                                _moveObjects(
                                  dropItem.id,
                                  dropItem.where,
                                  dropItem.idsToMove
                                );
                              }}
                            />
                          )}
                        </>
                      );
                    })}
                  </>
                ) : (
                  <div
                    className={css.objectCountClosed}
                    onClick={() => toggleLayer(layer.id)}
                  >
                    ... objects {layer.objectIds.length}
                  </div>
                )}
                {isDraggingLayers && isLastLayer && (
                  <DropHandle
                    type={"layer"}
                    key={layer.id + "_drophandle_slide"}
                    refId={slide!.id}
                    where="slide"
                    onDrop={(dropItem: IDropItem) => {
                      _moveLayers(
                        dropItem.id,
                        dropItem.where,
                        dropItem.idsToMove
                      );
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
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

  return {
    layerArr,
    slide,
    objectById: objects.objectById,
    activeSlideId: selection.activeSlideId,
    activeLayerId: selection.activeLayerId,
    activeObjectId: selection.activeObjectId,
    selectedLayerIds: selection.selectedLayerIds,
    selectedObjectIds: selection.selectedObjectIds,
    selectionForProperties: selection.selectionForProperties,
    //layoutStaticEffectsPanel: layoutType === "default-layers",
    breakpointsConfiguration: state.project.settings.breakpoints,
  };
};

const mapDispatchToProps = {
  _addNewLayer: (slideId: string) => addNewLayer(slideId),
  _addLayersToSelection: (layerIds: string[]) => addLayersToSelection(layerIds),
  _removeLayersFromSelection: (layerIds: string[]) =>
    removeLayersFromSelection(layerIds),
  _deleteLayers: (layerIds: string[]) => deleteLayers(layerIds),
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

  _moveLayers: (
    refId: string,
    where: "above" | "below" | "layer" | "slide" | "bottom",
    moveIds: string[]
  ) => moveLayers(refId, where, moveIds),
};

export default connect(mapStateToProps, mapDispatchToProps)(LayersPanel);
