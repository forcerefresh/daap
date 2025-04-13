import { IObject } from "webslider-sdk/lib/objects/i-object";
import cx from "classnames";
import { selectForPropertiesProps } from "../../store/actions/actions";
import { ReactElement, useEffect, useState } from "react";
import css from "./SimplifiedPageRow.module.scss";
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
import { IPage } from "../../store/reducers/i-pages";
import PagePreview from "./PagePreview";

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const ItemTypes = {
  CARD: "card",
};

export interface ISimplifiedPageRowProps {
  page: IPage;
  onPageClick: (
    event: React.MouseEvent<HTMLDivElement>,
    objectId: string
  ) => void;

  selectedPageIds: string[];
  breakpointConfig?: BreakpointConfiguration;
  pageById: any;
  rowIndex: number;
  movePage: (dragIndex: number, hoverIndex: number) => void;
  dropDone: () => void;
  dropCancel: () => void;
  forceUpdatePreviewIdx: number;
}

export function SimplifiedPageRow(props: ISimplifiedPageRowProps) {
  const {
    page,
    onPageClick,
    forceUpdatePreviewIdx,
    breakpointConfig,
    // activeObjectId,
    selectedPageIds,
    // selectionForProperties,
    // slideDuration,
    // slideExitDuration,
    // disableVisibility,
    // onObjectClick,
    // updateObject,
    // deleteObjects,
    // onDragingChange,
    pageById,
    rowIndex,
    // DND >>>
    movePage,
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
      movePage(dragIndex, hoverIndex);

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
      return { id: page.id, index: rowIndex };
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

  return (
    <div
      ref={ref}
      className={cx(css.objectItem, {
        [css.selected]:
          selectedPageIds.length > 0 && selectedPageIds.indexOf(page.id) !== -1,
      })}
      onClick={(event) => {
        onPageClick(event, page.id);
      }}
      style={{ opacity }}
      data-handler-id={handlerId}
    >
      <PagePreview page={page} key={page.id + "-" + forceUpdatePreviewIdx} />

      {/* <img
        className={css.pageImage}
        src={
          "http://localhost:3000/api/v1/media/ec3bc320-2c02-4169-9e6f-cd33f62474ae.jpeg"
        }
      /> */}
    </div>
  );
}
