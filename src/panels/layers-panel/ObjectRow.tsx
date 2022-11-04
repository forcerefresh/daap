import * as React from "react";
import { IObject } from "webslider-sdk2/lib/objects/i-object";
import cx from "classnames";
import { selectForPropertiesProps } from "../../store/actions/actions";
import { Button } from "@blueprintjs/core";
import TimelineView from "./TimelineView";
import { DragSourceMonitor, useDrag, useDrop } from "react-dnd";
import { useEffect } from "react";
import css from "./LayersPanel.module.scss";
import { getEmptyImage } from "react-dnd-html5-backend";

export interface IObjectRowProps {
  object: IObject;
  onObjectClick: (
    event: React.MouseEvent<HTMLDivElement>,
    objectId: string
  ) => void;
  activeObjectId: string | null;
  selectedObjectIds: string[];
  selectionForProperties: selectForPropertiesProps | null;
  slideDuration: number;
  slideExitDuration: number;
  updateObject: (object: IObject) => void;
  deleteObjects: (objectIds: string[]) => void;
  onDragingChange: (isDragging: boolean) => void;
}

export function ObjectRow(props: IObjectRowProps) {
  const {
    object,
    activeObjectId,
    selectedObjectIds,
    selectionForProperties,
    slideDuration,
    slideExitDuration,
    onObjectClick,
    updateObject,
    deleteObjects,
    onDragingChange,
  } = props;

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "object",
      // The collect function utilizes a "monitor" instance (see the Overview for what this is)
      // to pull important pieces of state from the DnD system.
      item: {
        ids: selectedObjectIds,
      },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: (monitor: DragSourceMonitor) => {
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

  return (
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
          selectionForProperties.type === "object", // activeObjectId === objectId,
        [css.selected]:
          selectedObjectIds.length > 0 /*1*/ &&
          selectedObjectIds.indexOf(object.id) !== -1,
      })}
    >
      <div className={css.objectHolderInner}>
        <div className={css.actionButtons}>
          {/*!layoutStaticAnimationsPanel && (
          <Button
            active={object.id === showAnimationPanelForId.id}
            minimal
            onClick={(event: any) => {
              event.stopPropagation();
              setShowAnimationPanelForId({
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
              updateObject({
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
        </div>
        <div className={css.objectDescription}>
          <div className={css.objectName}>{object.name}</div>
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
              deleteObjects([object.id]);
            }}
            className={css.deleteObject}
            small={true}
            icon="delete"
          ></Button>
        </div>
      </div>
      <TimelineView
        object={object}
        slideDuration={slideDuration}
        slideExitDuration={slideExitDuration}
      ></TimelineView>
    </div>
  );
}
