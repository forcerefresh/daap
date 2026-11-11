import React, { useMemo } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import {
  activateObject,
  updateObject,
  selectObjects,
  addObjectsToSelection,
  removeObjectsFromSelection,
  deactivateObject,
  selectForProperties,
  selectForPropertiesProps,
  forceRefresh,
} from "../../store/actions/actions";

import css from "./LayersSimplified.module.scss";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { ObjectRow } from "./ObjectRow";
import { cloneDeep, last } from "lodash-es";
import { Button } from "@blueprintjs/core";
import withScrolling from "react-dnd-scrolling";
import { DndItem, useDndObjectList, toStoreOrder } from "./useDndObjectList";

const ScrollingComponent = withScrolling("div");

type ISlidesPanel = typeof mapDispatchToProps & ReturnType<typeof mapStateToProps>;

const LayersSimplified_GroupObjects = (props: ISlidesPanel) => {
  const {
    objectById,
    activeObjectId,
    layerById,
    breakpointConfig,
    selectedObjectIds,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _activateObject,
    _selectObjects,
    _selectForProperties,
    _updateObject,
    _forceRefresh,
  } = props;

  const firstObjectInGroup = selectedObjectIds?.[0];
  const groupId = objectById[firstObjectInGroup].parentId!;
  const group = objectById[groupId];

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
    _event: React.MouseEvent<HTMLDivElement>,
    isGroup: boolean,
    objectId: string,
  ) => {
    if (isGroup) {
      _activateObject(objectById[objectId]?.objectIds?.[0]!);
      _selectObjects(objectById[objectId]?.objectIds ?? []);
    }
  };

  const baseItems = useMemo<DndItem[]>(() => {
    return (group.objectIds ?? [])
      .slice()
      .reverse()
      .map((objectId) => ({
        parentType: "layer" as const,
        parentId: group.id,
        parentName: objectById[group.id].name,
        layerId: group.layerId,
        layerName: layerById[group.layerId].name,
        objectId: objectById[objectId].id,
      }));
  }, [group.objectIds, objectById, layerById]);

  const { displayItems, sortedItems, hoverIndex, moveObject, reset } = useDndObjectList(
    baseItems,
    selectedObjectIds,
  );

  return (
    <div className={cx(css.layerPanel, "no-custom-cursor")}>
      <div className={css.layersHolder}>
        <div style={{ display: "flex" }}>
          <Button
            intent={"primary"}
            icon={"arrow-left"}
            minimal
            small
            onClick={() => {
              _activateObject(group.id);
              _selectObjects([group.id]);
              _selectForProperties({ type: "object", id: group.id });
            }}
          >
            {group.name}
          </Button>
        </div>
        <ScrollingComponent className={cx(css.objectsHolder)}>
          <React.Fragment key={`group-${group.id}`}>
            {displayItems.map((item, idx) => {
              const object = objectById[item.objectId];
              return (
                <React.Fragment key={`object-${item.objectId}`}>
                  <ObjectRow
                    isHovered={hoverIndex === idx}
                    moveObject={moveObject}
                    dropCancel={reset}
                    dropDone={() => {
                      const groupClone = cloneDeep(group);
                      groupClone.objectIds = toStoreOrder(
                        sortedItems!
                          .filter((i) => i.parentId === group.id)
                          .map((i) => i.objectId),
                      );
                      _updateObject(groupClone);
                      reset();
                      _forceRefresh();
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
        </ScrollingComponent>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { layers, objects, selection } = state.project;

  const breakpointConfig: BreakpointConfiguration | undefined = last(
    state.project.settings.breakpoints.breakpointsConfiguration.filter((bc) => bc.enabled),
  );

  return {
    objectById: objects.objectById,
    layerById: layers.layerById,
    activeObjectId: selection.activeObjectId,
    selectedObjectIds: selection.selectedObjectIds,
    breakpointConfig,
  };
};

const mapDispatchToProps = {
  _activateObject: (objectId: string) => activateObject(objectId),
  _selectObjects: (objectIds: string[]) => selectObjects(objectIds),
  _addObjectsToSelection: (objectIds: string[]) => addObjectsToSelection(objectIds),
  _removeObjectsFromSelection: (objectIds: string[]) => removeObjectsFromSelection(objectIds),
  _updateObject: (object: IObject) => updateObject(object),
  _deactivateObject: (objectId: string) => deactivateObject(objectId),
  _selectForProperties: (payload: selectForPropertiesProps) => selectForProperties(payload),
  _forceRefresh: () => forceRefresh(),
};

export default connect(mapStateToProps, mapDispatchToProps)(LayersSimplified_GroupObjects);
