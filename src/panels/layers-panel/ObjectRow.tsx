import * as React from "react";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import cx from "classnames";
import { selectForPropertiesProps } from "../../store/actions/actions";
import { Button, Icon } from "@blueprintjs/core";
import { DragSourceMonitor, useDrag } from "react-dnd";
import { useEffect } from "react";
import css from "./LayersPanel.module.scss";
import { getEmptyImage } from "react-dnd-html5-backend";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";
import SVG from "react-inlinesvg";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { cloneDeep } from "lodash-es";

export interface IObjectRowProps {
  object: IObject;
  onObjectClick: (
    event: React.MouseEvent<HTMLDivElement>,
    objectId: string
  ) => void;
  activeObjectId: string | null;
  selectedObjectIds: string[];
  selectionForProperties: selectForPropertiesProps | null;
  disableVisibility: boolean;
  updateObject: (object: IObject) => void;
  deleteObjects: (objectIds: string[]) => void;
  onDragingChange: (isDragging: boolean) => void;
  objectById: {
    [id: string]: IObject<{}>;
  };
}

export function ObjectRow(props: IObjectRowProps) {
  const {
    object: _object,
    activeObjectId,
    selectedObjectIds,
    selectionForProperties,
    disableVisibility,
    onObjectClick,
    updateObject,
    deleteObjects,
    onDragingChange,
    objectById,
  } = props;
  const object = _object as any;

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "object",
      item: {
        ids: selectedObjectIds,
      },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: (_monitor: DragSourceMonitor) => {
        return selectedObjectIds.indexOf(object.id) !== -1;
      },
    }),
    [selectedObjectIds]
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  useEffect(() => {
    onDragingChange(isDragging);
  }, [isDragging]);

  const deff = getAppObjectDefinition(object.type, "latest");

  return (
    <div className={css.objectGroup}>
      <div
        ref={drag}
        key={object.id}
        onClick={(event) => {
          onObjectClick(event, object.id);
        }}
        className={cx(css.objectHolder, {
          [css.active]: activeObjectId === object.id,
          [css.propertiesActive]:
            selectionForProperties?.id === object.id &&
            (selectionForProperties as any)?.type === "object", // activeObjectId === objectId,
          [css.selected]:
            selectedObjectIds.length > 0 /*1*/ &&
            selectedObjectIds.indexOf(object.id) !== -1,
          [css.disableObjectVisibility]: disableVisibility,
        })}
      >
        <div className={css.objectHolderInner}>
          <div className={css.actionButtons}>
            {object.objectIds && object.objectIds.length > 0 && (
              <Button
                minimal
                onClick={(event: any) => {
                  event.stopPropagation();
                  const objectClone = cloneDeep(object);
                  objectClone.isOpen = !objectClone.isOpen;
                  updateObject(objectClone);
                }}
                className={cx(css.layerToggle)}
                small={true}
                icon={object.isOpen ? "caret-down" : "caret-right"}
              ></Button>
            )}

            <Button
              intent={disableVisibility ? "danger" : "none"}
              active={!object.isVisible}
              minimal
              onClick={(event: any) => {
                event.stopPropagation();
                updateObject({
                  ...object,
                  isVisible: !object.isVisible,
                });
              }}
              small={true}
              icon={
                object.isVisible && !disableVisibility ? "eye-open" : "eye-off"
              }
            ></Button>
            <Button
              minimal
              active={object.isLocked}
              onClick={(event: any) => {
                event.stopPropagation();
                updateObject({
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
            <div className={css.objectTypeSVGHolder}>
              {object.type === "group" ? (
                <Icon icon={"group-objects"} />
              ) : (
                <SVG src={deff?.meta?.icon || ""} />
              )}
            </div>
          </div>
          <div className={css.objectDescription}>
            <div className={css.objectName}>{object.name}</div>
          </div>
          <div>
            <Button
              minimal
              onClick={(event: any) => {
                event.stopPropagation();
                deleteObjects([object.id]);
              }}
              className={css.deleteObject}
              small={true}
              icon="delete"
            ></Button>
          </div>
        </div>
      </div>
      {object.isOpen &&
        object.objectIds &&
        object.objectIds.length > 0 &&
        object.objectIds.map((objectId: any) => {
          const childObject = objectById[objectId];
          return (
            <ObjectRow
              key={childObject.id}
              object={childObject}
              disableVisibility={disableVisibility}
              activeObjectId={activeObjectId}
              selectedObjectIds={selectedObjectIds}
              selectionForProperties={selectionForProperties}
              updateObject={updateObject}
              deleteObjects={(objectIds) => {
                deleteObjects(objectIds);
                AppToaster.show({
                  intent: "warning",
                  message:
                    objectIds.length === 1
                      ? "Object has been deleted."
                      : "Multiple objects has been deleted.",
                });
              }}
              onObjectClick={onObjectClick}
              onDragingChange={onDragingChange}
              objectById={objectById}
            />
          );
        })}
    </div>
  );
}
