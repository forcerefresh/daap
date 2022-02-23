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
} from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/i-layers";
import css from "./LayersPanel.module.scss";
import { ISlide } from "../../store/reducers/i-slides";
import { cloneDeep, delay, get, includes, isEmpty, remove } from "lodash-es";
import { IObject, ObjectType } from "../../objects/types";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { EmptyID } from "../../store/types";
import { getEffectDefinition } from "../../effects/effects";
import { getIconByType } from "../../store/reducers/settings";
import { getIconSize, getIconStyle } from "../action-panel/ActionPanel";
import { getResponsiveIcon } from "../../utils/icons/responsive-icons-factory";
import TimelineView from "./TimelineView";

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

  const renderSelectedDevices = (layer: ILayer) => {
    const resVis = layer.responsiveVisibility;
    if (resVis.showAll) {
      return <span className={css.layerResponseVisibilityAll}>ALL</span>;
    } else if (resVis.displayOn.length === 0) {
      return <span className={css.layerResponseVisibilityNone}>NONE</span>;
    } else {
      return breakpointsConfiguration.breakpointsConfiguration.map(
        (bpConfig: any) => {
          if (!includes(resVis.displayOn, bpConfig.type)) {
            return null;
          }
          const iconName = getIconByType(bpConfig.type);
          const size = getIconSize(iconName);
          const iconStyle = getIconStyle(iconName);

          const icon = getResponsiveIcon(
            iconName,
            size.w,
            size.h,
            "lightgray",
            bpConfig.portrait,
            { verticalAlign: "text-bottom", ...iconStyle }
          );

          return icon;
        }
      );
    }
  };

  const renderDeviceOptions = (layer: ILayer) => {
    return breakpointsConfiguration.breakpointsConfiguration.map(
      (bpConfig: any) => {
        const iconName = getIconByType(bpConfig.type);
        const size = getIconSize(iconName);

        const icon = getResponsiveIcon(
          iconName,
          size.w,
          size.h,
          "lightgray",
          bpConfig.portrait
        );

        return (
          <Checkbox
            disabled={layer.responsiveVisibility.showAll}
            checked={
              layer.responsiveVisibility.showAll ||
              includes(layer.responsiveVisibility.displayOn, bpConfig.type)
            }
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              let newLayer = cloneDeep(layer);
              remove(
                newLayer.responsiveVisibility.displayOn,
                (type) => type === bpConfig.type
              );

              if (event.target.checked) {
                newLayer.responsiveVisibility.displayOn.push(bpConfig.type);
              }

              newLayer.responsiveVisibility.showAll = false;
              _updateLayer(newLayer);
            }}
          >
            <span
              style={{
                marginRight: "5px",
                verticalAlign: "middle",
              }}
            >
              {icon}
            </span>
            {bpConfig.name}
          </Checkbox>
        );
      }
    );
  };

  const layersHolderRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottomDelayed = () => {
    delay(() => {
      layersHolderRef.current?.scrollTo({ top: 10000000 });
      console.log("scrollTo");
    }, 1);
  };

  return (
    <>
      <div className={css.layerPanel}>
        <div className={css.panelHeader}>
          <div>
            LAYERS AND OBJECTS
            <span className={css.slideName}>
              {slide && " [ " + slide.name + " ] "}
            </span>
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
                    [css.propertiesActive]:
                      selectionForProperties?.id === layer.id &&
                      selectionForProperties.type === "layer", //activeLayerId === layer.id,
                  })}
                >
                  <div>
                    <Button
                      minimal
                      onClick={(event: any) => {
                        event.stopPropagation();
                        toggleLayer(layer.id);
                      }}
                      className={cx(css.layerToggle, {
                        /*[css.layerOpen]: openLayerById[layer.id],*/
                      })}
                      small={true}
                      icon={
                        openLayerById[layer.id] ? "folder-open" : "folder-close"
                      }
                    ></Button>

                    {/*<Button
                      minimal
                      onClick={(event: any) => {
                        event.stopPropagation();
                        setShowEffectPanelForId({
                          id: layer.id,
                          type: "layer",
                        });
                      }}
                      className={css.slideEffect}
                      small={true}
                      icon="walk"
                    ></Button>*/}

                    {/*layer.definition.values.hasLayoutChildren && (
                      <Icon icon="page-layout" className={css.layoutIcon} />
                    )*/}
                    {/*<Button
                      minimal
                      onClick={(event: any) => {
                        event.stopPropagation();
                        _forceActivateLayer(layer.id);
                        _selectLayers([layer.id]);
                      }}
                      className={css.slideProperties}
                      small={true}
                      icon="properties"
                    ></Button>*/}
                    <div className={css.layerName}>{layer.name}</div>

                    <div className={css.layerResponseVisibility}>
                      <Popover
                        position="bottom"
                        usePortal={true}
                        minimal
                        popoverClassName={css.devicePopup}
                      >
                        <div className={css.devicesHolder}>
                          {renderSelectedDevices(layer)}{" "}
                          <Icon
                            icon="caret-down"
                            style={{ marginBottom: "2px" }}
                          />
                        </div>
                        <div className={css.devicePopup}>
                          <div
                            style={{
                              textAlign: "left",
                              marginBottom: "15px",
                              color: "gray",
                            }}
                          >
                            {layer.name}
                          </div>

                          <Checkbox
                            checked={layer.responsiveVisibility.showAll}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const newLayer = cloneDeep(layer);
                              newLayer.responsiveVisibility.showAll =
                                event.target.checked;
                              _updateLayer(newLayer);
                            }}
                          >
                            <span
                              style={{
                                marginRight: "5px",
                                verticalAlign: "middle",
                              }}
                            >
                              {null}
                            </span>
                            ALL
                          </Checkbox>
                          <hr />
                          {renderDeviceOptions(layer)}
                        </div>
                      </Popover>
                    </div>
                    {/*<div className={css.objectCount}>
                      Objects: {layer.objectIds.length}
                    </div>*/}
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
                {openLayerById[layer.id] && layer.objectIds.length > 0 ? (
                  <>
                    {layer.objectIds.map((objectId) => {
                      const object = objectById[objectId];

                      return (
                        <div
                          key={objectId}
                          onClick={(event) => {
                            onObjectClick(event, objectId);
                          }}
                          className={cx(css.objectHolder, {
                            [css.active]: activeObjectId === objectId,
                            [css.propertiesActive]:
                              selectionForProperties?.id === objectId &&
                              selectionForProperties.type === "object", // activeObjectId === objectId,
                            [css.selected]:
                              selectedObjectIds.length > 0 /*1*/ &&
                              selectedObjectIds.indexOf(objectId) !== -1,
                          })}
                        >
                          <div className={css.objectHolderInner}>
                            <div className={css.actionButtons}>
                              {/*!layoutStaticEffectsPanel && (
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
                                )*/}
                              <Button
                                active={!object.isVisible}
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
                              <div>{objectById[objectId].name} </div>
                              {/*<div>
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
                              )} */}
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
                          <TimelineView
                            object={object}
                            slideDuration={slide?.duration.customValue || 1}
                          ></TimelineView>
                        </div>
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
};

export default connect(mapStateToProps, mapDispatchToProps)(LayersPanel);
