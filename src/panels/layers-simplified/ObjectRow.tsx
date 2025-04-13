import { IObject } from "webslider-sdk/lib/objects/i-object";
import cx from "classnames";
import { selectForPropertiesProps } from "../../store/actions/actions";
import { ReactElement, useEffect, useState } from "react";
import css from "./ObjectRow.module.scss";
import React from "react";
import { getObjectHtml } from "../../export/export-html";
import { calculateObjectSize } from "../stage-panel/StagePanelUtils";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { Icon, Tag } from "@blueprintjs/core";
import StageObjectMinimap from "../stage-panel-new/StageObjectMinimap";
import type { Identifier, XYCoord } from "dnd-core";
import type { CSSProperties, FC } from "react";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ILayer } from "../../store/reducers/i-layers";

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const ItemTypes = {
  CARD: "card",
};

export interface IObjectRowProps {
  object: IObject;
  layer: ILayer;
  onObjectClick: (
    event: React.MouseEvent<HTMLDivElement>,
    objectId: string
  ) => void;
  onObjectDblClick: (
    event: React.MouseEvent<HTMLDivElement>,
    isGroup: boolean,
    objectId: string
  ) => void;
  //   activeObjectId: string | null;
  selectedObjectIds: string[];
  //   selectionForProperties: selectForPropertiesProps | null;
  //   slideDuration: number;
  //   slideExitDuration: number;
  //   disableVisibility: boolean;
  //   updateObject: (object: IObject) => void;
  //   deleteObjects: (objectIds: string[]) => void;
  //   onDragingChange: (isDragging: boolean) => void;
  breakpointConfig?: BreakpointConfiguration;
  objectById: any;
  rowIndex: number;
  moveObject: (dragIndex: number, hoverIndex: number) => void;
  dropDone: () => void;
  dropCancel: () => void;
}

export function ObjectRow(props: IObjectRowProps) {
  const {
    object,
    layer,
    onObjectClick,
    onObjectDblClick,
    breakpointConfig,
    // activeObjectId,
    selectedObjectIds,
    // selectionForProperties,
    // slideDuration,
    // slideExitDuration,
    // disableVisibility,
    // onObjectClick,
    // updateObject,
    // deleteObjects,
    // onDragingChange,
    objectById,
    rowIndex,
    // DND >>>
    moveObject,
    dropDone,
    dropCancel,
    // DND <<<
  } = props;

  // DND >>>>
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = rowIndex;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveObject(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    drop: (item) => {
      dropDone();
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id: object.id, index: rowIndex };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const { id: droppedId, index: originalIndex } = item;
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        dropCancel();
      }
    },
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));
  // DND <<<<

  const [objectHtml, setObjectHtml] = useState<{
    scale: number;
    html: string;
    calculatedObjectSize: React.CSSProperties;
  }>({
    scale: 1,
    html: "",
    calculatedObjectSize: {},
  });

  useEffect(() => {
    const calculatedObjectSize = calculateObjectSize(
      object,
      layer,
      breakpointConfig!,
      { resetPosition: false },
      undefined,
      { skipHeight: !!object.definition?.values?.autoHeight }
    );

    const html = getObjectHtml(
      object,
      calculatedObjectSize,
      true,
      false,
      breakpointConfig?.type,
      true
    );

    const scaleX = 76 / parseInt(calculatedObjectSize?.width as string);
    const scaleY = 61 / parseInt(calculatedObjectSize?.height as string);
    const scale = Math.min(scaleX, !isNaN(scaleY) ? scaleY : scaleX);

    setObjectHtml({ scale, html, calculatedObjectSize });
  }, [breakpointConfig, layer, object]);

  const isGroup = !!(object?.objectIds && object?.objectIds?.length > 0);

  return (
    <div
      ref={ref}
      className={cx(css.objectItem, {
        [css.selected]:
          selectedObjectIds.length > 0 &&
          selectedObjectIds.indexOf(object.id) !== -1,
      })}
      onClick={(event) => {
        onObjectClick(event, object.id);
      }}
      onDoubleClick={(event) => {
        onObjectDblClick(event, isGroup, object.id);
      }}
      style={{ opacity }}
      data-handler-id={handlerId}
    >
      <div
        style={{
          transform: `scale(${objectHtml.scale})`,
          transformOrigin: "0 0",
          width: 76 / objectHtml.scale,
          height: 61 / objectHtml.scale,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StageObjectMinimap
          isRoot={true}
          parentLayer={layer}
          object={object}
          objectById={objectById}
          breakpointConfig={breakpointConfig!}
        />
        {/* <div
          style={{
            width: objectHtml.calculatedObjectSize.width as string,
            height: objectHtml.calculatedObjectSize.height as string,
          }}
          dangerouslySetInnerHTML={{ __html: objectHtml.html }}
        ></div> */}
      </div>
      {isGroup && (
        <Tag className={css.groupObjectsCounter}>
          {object?.objectIds?.length}
        </Tag>
      )}
    </div>
  );
}
