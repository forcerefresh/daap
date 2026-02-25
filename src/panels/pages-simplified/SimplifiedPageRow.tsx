import cx from "classnames";
import css from "./SimplifiedPageRow.module.scss";
import React from "react";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import type { Identifier, XYCoord } from "dnd-core";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
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
  onPageClick: (event: React.MouseEvent<HTMLDivElement>, objectId: string) => void;
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
    selectedPageIds,
    rowIndex,
    movePage,
    dropDone,
    dropCancel,
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId, isOver }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null; isOver: boolean }
  >({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = rowIndex;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      movePage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    drop: () => {
      dropDone();
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => ({ id: page.id, index: rowIndex }),
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_item, monitor) => {
      if (!monitor.didDrop()) {
        dropCancel();
      }
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={cx(css.objectItem, {
        [css.selected]: selectedPageIds.length > 0 && selectedPageIds.indexOf(page.id) !== -1,
      })}
      onClick={(event) => onPageClick(event, page.id)}
      style={isOver ? { border: "1px dashed green" } : { opacity: isDragging ? 0 : 1 }}
      data-handler-id={handlerId}
    >
      <PagePreview page={page} key={page.id + "-" + forceUpdatePreviewIdx} />
    </div>
  );
}
