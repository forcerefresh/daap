import React, { useMemo } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import {
  addNewLayer,
  activateLayer,
  selectLayers,
  activateObject,
  updateObject,
  selectObjects,
  addObjectsToSelection,
  removeObjectsFromSelection,
  deactivateObject,
  updateLayer,
  selectForProperties,
  selectForPropertiesProps,
  moveObjects,
} from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/i-layers";
import css from "./LayersSimplified.module.scss";
import { IPage } from "../../store/reducers/i-pages";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { ObjectRow } from "./ObjectRow";
import { cloneDeep, last } from "lodash-es";
import { Button } from "@blueprintjs/core";
import withScrolling from "react-dnd-scrolling";
import { LayerButton } from "./LayerButton";
import { DndItem, useDndObjectList, toStoreOrder } from "./useDndObjectList";
import { SVG_MASK } from "../../objects/svg-mask/svg-mask";

const ScrollingComponent = withScrolling("div");

type ISlidesPanel = typeof mapDispatchToProps & ReturnType<typeof mapStateToProps>;

const LayersSimplified_AllLayers = (props: ISlidesPanel) => {
  const {
    page,
    objectById,
    activeObjectId,
    activeLayerId,
    layerById,
    breakpointConfig,
    selectedObjectIds,
    activeSlideId,
    _moveObjects,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _activateObject,
    _selectObjects,
    _selectForProperties,
    _activateLayer,
    _selectLayers,
    _updateLayer,
    _updateObject,
    _addNewLayer,
  } = props;

  const onObjectClick = (event: React.MouseEvent<HTMLDivElement>, objectId: string) => {
    if (event.shiftKey) {
      selectedObjectIds.indexOf(objectId) === -1
        ? _addObjectsToSelection([objectId])
        : _removeObjectsFromSelection([objectId]);
      if (activeObjectId === objectId) _deactivateObject(objectId);
    } else {
      _activateObject(objectId);
      _selectObjects([objectId]);
      _selectForProperties({ type: "object", id: objectId });
    }
  };

  const onObjectDblClick = (
    event: React.MouseEvent<HTMLDivElement>,
    isGroup: boolean,
    objectId: string,
  ) => {
    if (isGroup) {
      _activateObject(objectById[objectId]?.objectIds?.[0]!);
      _selectObjects(objectById[objectId]?.objectIds ?? []);
    }
  };

  const baseItems = useMemo<DndItem[]>(() => {
    const items: DndItem[] = [];
    page?.layerIds
      .slice()
      .reverse()
      .forEach((layerId) => {
        layerById[layerId].objectIds
          .slice()
          .reverse()
          .forEach((objectId) => {
            items.push({
              parentType: "layer",
              parentId: layerId,
              parentName: layerById[layerId].name,
              layerId,
              layerName: layerById[layerId].name,
              objectId: objectById[objectId].id,
            });
          });
      });
    return items;
  }, [objectById, layerById, page]);

  const { displayItems, sortedItems, hoverIndex, moveObject, reset, fromLayerId, toLayerId } =
    useDndObjectList(baseItems, selectedObjectIds);

  return (
    <div className={cx(css.layerPanel, "no-custom-cursor")}>
      <div className={css.layersHolder}>
        <ScrollingComponent className={cx(css.objectsHolder)}>
          {page?.layerIds
            .slice()
            .reverse()
            .map((layerId) => (
              <React.Fragment key={`layer-${layerId}`}>
                <LayerButton
                  layerId={layerId}
                  activeLayerId={activeLayerId}
                  layerName={layerById[layerId].name}
                  onSelect={(layerId) => {
                    _activateLayer(layerId);
                    _selectLayers([layerId]);
                    _selectForProperties({ type: "layer", id: layerId });
                  }}
                  onDrop={(layerId, item) => {
                    _moveObjects(layerId, "layer", [item.id]);
                    reset();
                  }}
                />
                {displayItems.map((item, idx) => {
                  if (item.layerId !== layerId) return null;
                  const object = objectById[item.objectId];
                  const nextItem = displayItems[idx + 1];
                  const isInvalidMask =
                    object.type === SVG_MASK &&
                    !!nextItem &&
                    nextItem.layerId === item.layerId &&
                    objectById[nextItem.objectId]?.type === SVG_MASK;
                  return (
                    <React.Fragment key={`object-${item.objectId}`}>
                      <ObjectRow
                        isHovered={hoverIndex === idx}
                        isInvalidMask={isInvalidMask}
                        moveObject={moveObject}
                        dropCancel={reset}
                        dropDone={() => {
                          const toLayer = cloneDeep(layerById[toLayerId!]);
                          toLayer.objectIds = toStoreOrder(
                            sortedItems!
                              .filter((i) => i.layerId === toLayerId)
                              .map((i) => i.objectId),
                          );
                          _updateLayer(toLayer);
                          toLayer.objectIds.forEach((objectId) => {
                            if (objectById[objectId].layerId !== toLayer.id) {
                              const clone = cloneDeep(objectById[objectId]);
                              clone.layerId = toLayer.id;
                              _updateObject(clone);
                            }
                          });

                          if (fromLayerId && fromLayerId !== toLayerId) {
                            const fromLayer = cloneDeep(layerById[fromLayerId]);
                            fromLayer.objectIds = toStoreOrder(
                              sortedItems!
                                .filter((i) => i.layerId === fromLayerId)
                                .map((i) => i.objectId),
                            );
                            _updateLayer(fromLayer);
                            fromLayer.objectIds.forEach((objectId) => {
                              if (objectById[objectId].layerId !== fromLayer.id) {
                                const clone = cloneDeep(objectById[objectId]);
                                clone.layerId = fromLayer.id;
                                _updateObject(clone);
                              }
                            });
                          }

                          reset();
                        }}
                        objectById={objectById}
                        onObjectClick={onObjectClick}
                        onObjectDblClick={onObjectDblClick}
                        breakpointConfig={breakpointConfig}
                        selectedObjectIds={selectedObjectIds}
                        object={object}
                        layer={layerById[item.layerId]}
                        rowIndex={idx}
                      />
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
        </ScrollingComponent>
        <div style={{ display: "flex", marginTop: "10px" }}>
          <Button
            className={css.smallButton}
            disabled={!activeSlideId}
            small
            onClick={() => _addNewLayer(activeSlideId!)}
            icon="add"
          >
            Add Layer
          </Button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { pages, layers, objects, selection } = state.project;
  let page: IPage | null = null;

  if (selection.activeSlideId) {
    page = pages.pageById[selection.activeSlideId];
  }

  const breakpointConfig: BreakpointConfiguration | undefined = last(
    state.project.settings.breakpoints.breakpointsConfiguration.filter((bc) => bc.enabled),
  );

  return {
    page,
    objectById: objects.objectById,
    layerById: layers.layerById,
    activeSlideId: selection.activeSlideId,
    activeLayerId: selection.activeLayerId,
    activeObjectId: selection.activeObjectId,
    selectedObjectIds: selection.selectedObjectIds,
    breakpointConfig,
  };
};

const mapDispatchToProps = {
  _addNewLayer: (pageId: string) => addNewLayer(pageId),
  _activateLayer: (layerId: string) => activateLayer(layerId),
  _selectForProperties: (payload: selectForPropertiesProps) => selectForProperties(payload),
  _selectLayers: (layerIds: string[]) => selectLayers(layerIds),
  _activateObject: (objectId: string) => activateObject(objectId),
  _selectObjects: (objectIds: string[]) => selectObjects(objectIds),
  _addObjectsToSelection: (objectIds: string[]) => addObjectsToSelection(objectIds),
  _removeObjectsFromSelection: (objectIds: string[]) => removeObjectsFromSelection(objectIds),
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
  _deactivateObject: (objectId: string) => deactivateObject(objectId),
  _moveObjects: (
    refId: string,
    where: "above" | "below" | "layer" | "slide" | "bottom",
    moveIds: string[],
  ) => moveObjects(refId, where, moveIds),
};

export default connect(mapStateToProps, mapDispatchToProps)(LayersSimplified_AllLayers);
