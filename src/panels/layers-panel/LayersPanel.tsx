import React, { useEffect, useRef, useState } from "react";
import cx from "classnames";
import { Button, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
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
import css from "./LayersPanel.module.scss";
import { IPage } from "../../store/reducers/i-pages";
import { cloneDeep, delay, isEmpty } from "lodash-es";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { EmptyID } from "../../store/types";
import { ObjectRow } from "./ObjectRow";
import { DropHandle, IDropItem } from "./DropHandle";
import { LayerRow } from "./LayerRow";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import { PanelShell } from "../common/panel-shell/PanelShell";

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
    layerById,
    selectionForProperties,
    _addNewLayer,
    _addLayersToSelection,
    _removeLayersFromSelection,
    _deleteLayersThree,
    _activateLayer,
    _selectLayers,
    _activateObject,
    _selectObjects,
    _deleteObjects,
    _updateObject,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _selectForProperties,
    _moveObjects,
    _moveLayers,
    _duplicateLayers,
    _duplicateObjects,
  } = props;

  const [openLayerById, setOpenLayerById] = useState<{
    [key: string]: boolean;
  }>({});

  // when layer is added set open state to be default
  useEffect(() => {
    let updateState = false;
    const openLayerByIdClone = cloneDeep(openLayerById);
    layerArr?.forEach((layer) => {
      if (!layer) return; // TODO IMPORTANT clone slide
      if (typeof openLayerById[layer.id] === "undefined") {
        openLayerByIdClone[layer.id] = true;
        updateState = true;
      }
    });

    if (updateState) {
      setOpenLayerById(openLayerByIdClone);
    }
  }, [layerArr]);

  const [, setShowAnimationPanelForId] = useState<{
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
    if (event.shiftKey) {
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
  // logic for handling click outside
  const animationPanelRef = useRef(null);
  const handleClickOutside = () => {
    setShowAnimationPanelForId({ id: EmptyID });
  };
  useOnClickOutside(animationPanelRef, handleClickOutside, [
    "color-picker-holder",
  ]);

  const layersHolderRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottomDelayed = () => {
    delay(() => {
      layersHolderRef.current?.scrollTo({ top: 10000000 });
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

  const moreMenu = (
    <Menu>
      <MenuItem
        icon={"duplicate"}
        text="Duplicate selected Objects"
        disabled={selectedObjectIds.length === 0}
        onClick={() => {
          _duplicateObjects(selectedObjectIds);
        }}
      />
      <MenuItem
        icon={"duplicate"}
        text="Duplicate selected Layers"
        disabled={selectedLayerIds.length === 0}
        onClick={() => {
          _duplicateLayers(selectedLayerIds);
        }}
      />
      <MenuDivider />
      <MenuItem
        icon={"delete"}
        text="Delete selected Objects"
        disabled={selectedObjectIds.length === 0}
        onClick={() => {
          _deleteObjects(selectedObjectIds);
          AppToaster.show({
            intent: "warning",
            message:
              selectedObjectIds.length === 1
                ? "Object has been deleted."
                : "Multiple objects has been deleted.",
          });
        }}
      />
      <MenuItem
        icon={"delete"}
        text="Delete selected Layers"
        disabled={selectedLayerIds.length === 0}
        onClick={() => {
          const layersNames = selectedLayerIds.map(
            (layerId) => layerById[layerId].name
          );
          _deleteLayersThree(selectedLayerIds);
          AppToaster.show({
            intent: "warning",
            message:
              selectedLayerIds.length === 1
                ? "Layer '" + layersNames[0] + "' has been deleted."
                : "Multiple layers '" +
                  layersNames.join(", ") +
                  "' has been deleted.",
          });
        }}
      />
    </Menu>
  );

  return (
    <>
      <PanelShell
        title="OBJECTS"
        bodyRef={layersHolderRef}
        actions={
          <>
            {slide?.name && (
              <span className={css.slideName}>{slide.name}</span>
            )}
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
            />
            <Popover2
              content={moreMenu}
              placement="left-end"
              shouldReturnFocusOnClose={false}
              interactionKind={Popover2InteractionKind.CLICK}
              hoverCloseDelay={100}
              hoverOpenDelay={150}
            >
              <Button minimal className={css.moreBtn} small={true} icon="more" />
            </Popover2>
          </>
        }
      >
          {layerArr?.map((layer, _idx) => {
            if (!layer) return null; // TODO: IMPORTANT ko kopiranja slajda

            const disableVisibility = false;

            return (
              <div key={layer.id} className={cx(css.layer, {})}>
                {isDraggingLayers &&
                  selectedLayerIds.indexOf(layer.id) === -1 && (
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
                  activeLayerId={activeLayerId}
                  selectedLayerIds={selectedLayerIds}
                  deleteLayers={(layerIds) => {
                    const layersNames = layerIds.map(
                      (layerId) => layerById[layerId].name
                    );
                    _deleteLayersThree(layerIds);
                    AppToaster.show({
                      intent: "warning",
                      message:
                        layerIds.length === 1
                          ? "Layer '" + layersNames[0] + "' has been deleted."
                          : "Multiple layers '" +
                            layersNames.join(", ") +
                            "' has been deleted.",
                    });
                  }}
                  onLayerClick={onLayerClick}
                  selectionForProperties={selectionForProperties}
                  toggleLayer={toggleLayer}
                  moveObjects={_moveObjects}
                  onDragingChange={onDragingLayerChange}
                />
                {openLayerById[layer.id] && layer.objectIds.length > 0 ? (
                  <>
                    {layer.objectIds.map((objectId, _idx) => {
                      const object = objectById[objectId];

                      return (
                        <React.Fragment key={`object-${objectId}`}>
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
                            disableVisibility={disableVisibility}
                            activeObjectId={activeObjectId}
                            selectedObjectIds={selectedObjectIds}
                            selectionForProperties={selectionForProperties}
                            updateObject={_updateObject}
                            deleteObjects={(objectIds) => {
                              _deleteObjects(objectIds);
                              AppToaster.show({
                                intent: "warning",
                                message:
                                  objectIds.length === 1
                                    ? "Object has been deleted."
                                    : "Multiple objects has been deleted.",
                              });
                            }}
                            onObjectClick={onObjectClick}
                            onDragingChange={onDragingObjectsChange}
                            objectById={objectById}
                          />
                        </React.Fragment>
                      );
                    })}
                    {isDraggingObjects && (
                      <DropHandle
                        type={"object"}
                        key={layer.id + "_obj_drophandle_layer"}
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
                ) : (
                  <>
                    <div
                      className={css.objectCountClosed}
                      onClick={() => toggleLayer(layer.id)}
                    >
                      ... objects {layer.objectIds.length}
                    </div>
                    {isDraggingObjects && (
                      <DropHandle
                        type={"object"}
                        key={layer.id + "_obj_drophandle_layer"}
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
                )}
              </div>
            );
          })}

          {layerArr && layerArr.length > 0 && isDraggingLayers && (
            <DropHandle
              type={"layer"}
              key={layerArr?.[layerArr?.length - 1].id + "_drophandle_slide"}
              refId={slide!.id}
              where="slide"
              onDrop={(dropItem: IDropItem) => {
                _moveLayers(dropItem.id, dropItem.where, dropItem.idsToMove);
              }}
            />
          )}
      </PanelShell>
    </>
  );
};

const mapStateToProps = (state: IStore) => {
  const { pages, layers, objects, selection } = state.project;
  let layerArr: ILayer[] | null = null;
  let slide: IPage | null = null;

  if (selection.activeSlideId) {
    const layerIds = pages.pageById[selection.activeSlideId].layerIds;
    layerArr = layerIds.map((layerId: string) => layers.layerById[layerId]);
    slide = pages.pageById[selection.activeSlideId];
  }

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
    selectedDevice: state.stage.selectedDevice,
    breakpointsConfiguration: state.project.settings.breakpoints,
  };
};

const mapDispatchToProps = {
  _addNewLayer: (pageId: string) => addNewLayer(pageId),
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
    type: string,
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

export default connect(mapStateToProps, mapDispatchToProps)(LayersPanel as any);
