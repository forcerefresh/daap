import * as React from "react";
import { useDrop } from "react-dnd";
import { IObject } from "webslider-sdk2/lib/objects/i-object";
import css from "./LayersPanel.module.scss";
import cx from "classnames";

export interface IDropItem {
  id: string;
  type: "object" | "layer" | "slide" | string;
  where: "above" | "below" | "layer" | "slide" | "bottom";
  idsToMove: string[];
}

export interface IDropHandleProps {
  type: "object" | "layer" | "slide" | string;
  refId: string;
  where: "above" | "below" | "layer" | "slide" | "bottom";
  onDrop: (dropItem: IDropItem) => void;
}

export function DropHandle(props: IDropHandleProps) {
  const { type, refId, where, onDrop } = props;

  const dropHandler = (item: any, monitor: any) => {
    onDrop({
      id: refId,
      idsToMove: item.ids,
      where,
      type: type,
    });
  };

  const [{ isOver, item }, drop] = useDrop<any, any, any>(() => ({
    accept: type,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      item: monitor.getItem(),
    }),
    drop: dropHandler,
  }));

  return (
    <div
      className={cx(css.dropObjectHandle, {
        [css.dropObjectHandleOver]: isOver,
      })}
      ref={drop}
    >
      <div className={css.dropObjectHandleLine}></div>
      <div className={css.dropObjectHandleDropZone}>
        {isOver && <>Drop {item.ids.length} items here</>}
      </div>
    </div>
  );
}
