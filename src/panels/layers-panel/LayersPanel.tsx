import React, { useEffect, useRef, useState } from "react";
import cx from "classnames";
import { Button, Portal } from "@blueprintjs/core";
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
} from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/layers";
import css from "./LayersPanel.module.scss";
import { ISlide } from "../../store/reducers/slides";
import { get, isEmpty } from "lodash-es";
import { IObject, ObjectType } from "../../objects/types";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { EmptyID } from "../../store/types";
import EffectPanel from "../effect-panel/EffectPanel";

function calculateTimelineRect(
  slideDuration: number,
  objectDelay: number,
  objectDuration: number,
  holderWidth: number = 1,
  isOut = false
) {
  let left: number;
  if (isOut) {
    left =
      ((slideDuration - objectDelay - objectDuration) / slideDuration) *
      holderWidth;
  } else {
    left = (objectDelay / slideDuration) * holderWidth;
  }

  const width = (objectDuration / slideDuration) * holderWidth;

  return { left, width };
}

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
    layoutStaticEffectsPanel,
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
  } = props;

  const [openLayerById, setOpenLayerById] = useState<{
    [key: string]: boolean;
  }>({});

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
    if (event.ctrlKey) {
      selectedLayerIds.indexOf(layerId) === -1
        ? _addLayersToSelection([layerId])
        : _removeLayersFromSelection([layerId]);
    } else {
      _activateLayer(layerId);
      _selectLayers([layerId]);
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
    }
  };
  // logic for handling click outside
  const effectPanelRef = useRef(null);
  const handleClickOutside = () => {
    setShowEffectPanelForId({ id: EmptyID });
  };
  useOnClickOutside(effectPanelRef, handleClickOutside);

  // render panels in Portal
  const renderPanels = () => {
    return (
      <Portal className="bp3-dark">
        {showEffectPanelForId.id !== EmptyID && (
          <div ref={effectPanelRef} className={css.floatingEffectPanel}>
            <EffectPanel
              id={showEffectPanelForId.id}
              objectType={showEffectPanelForId.type}
            />
          </div>
        )}
      </Portal>
    );
  };

  return (
    <>
      <div className={css.layerPanel}>
        <div className={css.panelHeader}>
          <div>
            OBJECTS PANEL
            <span className={css.slideName}>
              {slide && " [ " + slide.name + " ] "}
            </span>
          </div>
          <div>
            <Button
              minimal
              disabled={!activeSlideId}
              onClick={() => _addNewLayer(activeSlideId as string)}
              className={css.addNewLayer}
              small={true}
              icon="add"
            ></Button>
          </div>
        </div>
        <div className={css.layersHolder}>
          {layerArr?.map((layer) => {
            return (
              <div
                key={layer.id}
                className={cx(css.layer, {
                  [css.selected]:
                    selectedLayerIds.length > 0 /*1*/ &&
                    selectedLayerIds.indexOf(layer.id) !== -1,
                })}
              >
                <div
                  key={layer?.id}
                  onClick={(event) => onLayerClick(event, layer.id)}
                  className={cx(css.layerInner, {
                    [css.active]: activeLayerId === layer.id,
                  })}
                >
                  <div>
                    {
                      /* TODO */
                      <Button
                        active={layer.id === showEffectPanelForId.id}
                        minimal
                        onClick={(event: any) => {
                          event.stopPropagation();
                          setShowEffectPanelForId({
                            id: layer.id,
                            type: "layer",
                          });
                        }}
                        small={true}
                        icon="walk"
                      ></Button>
                    }
                    <Button
                      minimal
                      onClick={(event: any) => {
                        event.stopPropagation();
                        toggleLayer(layer.id);
                      }}
                      className={cx(css.layerToggle, {
                        [css.layerOpen]: openLayerById[layer.id],
                      })}
                      small={true}
                      icon="chevron-right"
                    ></Button>
                    <div className={css.layerName}>{layer.name}</div>

                    <div className={css.objectCount}>
                      (objects: {layer.objectIds.length})
                    </div>
                  </div>
                  <div>
                    <Button
                      minimal
                      onClick={(event: any) => {
                        event.stopPropagation();
                        _deleteLayers([layer.id]);
                      }}
                      className={css.deleteLayer}
                      small={true}
                      icon="delete"
                    ></Button>
                  </div>
                </div>
                {openLayerById[layer.id] && (
                  <>
                    {layer.objectIds.map((objectId) => {
                      const object = objectById[objectId];

                      const sizeIn = calculateTimelineRect(
                        slide?.duration.customValue || 1,
                        object?.transitions?.in?.delay || 1,
                        object?.transitions?.in?.duration || 1,
                        340
                      );
                      const timelineInStyle = {
                        left: sizeIn.left + "px",
                        width: sizeIn.width + "px",
                      };

                      const sizeOut = calculateTimelineRect(
                        slide?.duration.customValue || 1,
                        object?.transitions?.out?.delay || 1,
                        object?.transitions?.out?.duration || 1,
                        340,
                        true
                      );
                      const timelineOutStyle = {
                        left: sizeOut.left + "px",
                        width: sizeOut.width + "px",
                      };

                      // TODO: OUTEFFECT
                      return (
                        <div
                          key={objectId}
                          onClick={(event) => {
                            onObjectClick(event, objectId);
                          }}
                          className={cx(css.objectHolder, {
                            [css.active]: activeObjectId === objectId,
                            [css.selected]:
                              selectedObjectIds.length > 0 /*1*/ &&
                              selectedObjectIds.indexOf(objectId) !== -1,
                          })}
                        >
                          <div className={css.objectHolderInner}>
                            <div className={css.actionButtons}>
                              {!layoutStaticEffectsPanel && (
                                <Button
                                  active={object.id === showEffectPanelForId.id}
                                  minimal
                                  onClick={(event: any) => {
                                    event.stopPropagation();
                                    setShowEffectPanelForId({
                                      id: objectId,
                                      type: "object",
                                    });
                                  }}
                                  small={true}
                                  icon="walk"
                                ></Button>
                              )}
                              <Button
                                active={object.isVisible}
                                minimal
                                onClick={(event: any) => {
                                  event.stopPropagation();
                                  _updateObject({
                                    ...object,
                                    isVisible: !object.isVisible,
                                  });
                                }}
                                small={true}
                                icon={object.isVisible ? "eye-open" : "eye-off"}
                              ></Button>
                              <Button
                                minimal
                                active={object.isLocked}
                                onClick={(event: any) => {
                                  event.stopPropagation();
                                  _updateObject({
                                    ...object,
                                    isLocked: !object.isLocked,
                                  });
                                }}
                                small={true}
                                icon={object.isLocked ? "lock" : "unlock"}
                                className={cx({
                                  [css.locked]: object.isLocked,
                                })}
                              ></Button>
                            </div>
                            <div className={css.objectDescription}>
                              <div>{objectById[objectId].type} </div>
                              <div>
                                delay:{" "}
                                <span className={css.inlineValue}>
                                  {get(object, "transitions.in.delay")}ms
                                </span>
                                , in:{" "}
                                <span className={css.inlineValue}>
                                  {get(object, "transitions.in.duration")}ms
                                </span>
                              </div>
                              {get(object, "transitions.out.duration") && (
                                <div>
                                  out:
                                  <span className={css.inlineValue}>
                                    {get(object, "transitions.out.duration")}ms
                                  </span>
                                  , gap:{" "}
                                  <span className={css.inlineValue}>
                                    {get(object, "transitions.in.delay")}ms
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <Button
                                minimal
                                onClick={(event: any) => {
                                  event.stopPropagation();
                                  _deleteObjects([objectId]);
                                }}
                                className={css.deleteObject}
                                small={true}
                                icon="delete"
                              ></Button>
                            </div>
                          </div>
                          <div
                            className={cx(css.timelineHolder, {
                              [css.hideMe]:
                                object.transitions.in?.effect.id === "none" &&
                                object.transitions.out?.effect.id === "none",
                            })}
                          >
                            {object.transitions.in?.effect.id !== "none" && (
                              <div
                                className={css.timeline}
                                style={timelineInStyle}
                              />
                            )}
                            {object.transitions.out?.effect.id !== "none" && (
                              <div
                                className={css.timeline}
                                style={timelineOutStyle}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {renderPanels()}
    </>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides, layers, objects, selection } = state.project;
  const { layoutType } = state.globals;
  let layerArr: ILayer[] | null = null;
  let slide: ISlide | null = null;

  if (selection.activeSlideId) {
    const layerIds = slides.slideById[selection.activeSlideId].layerIds;
    layerArr = layerIds.map((layerId) => layers.layerById[layerId]);
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
    layoutStaticEffectsPanel: layoutType === "default-layers",
  };
};

const mapDispatchToProps = {
  _addNewLayer: (slideId: string) => addNewLayer(slideId),
  _addLayersToSelection: (layerIds: string[]) => addLayersToSelection(layerIds),
  _removeLayersFromSelection: (layerIds: string[]) =>
    removeLayersFromSelection(layerIds),
  _deleteLayers: (layerIds: string[]) => deleteLayers(layerIds),
  _activateLayer: (layerId: string) => activateLayer(layerId),
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
  _deactivateObject: (objectId: string) => deactivateObject(objectId),
};

export default connect(mapStateToProps, mapDispatchToProps)(LayersPanel);
