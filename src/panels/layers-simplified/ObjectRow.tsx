import { IObject } from "webslider-sdk/lib/objects/i-object";
import cx from "classnames";
import { useEffect, useState } from "react";
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
import { DragItem, ItemTypes } from "./types";
import { SVG_MASK } from "../../objects/svg-mask/svg-mask";
import MaskIcon from "./assets/mask-icon.svg?react";

const ITEM_WIDTH = 86;
const ITEM_PADDING = 2;
const OBJECT_HEIGHT = 65;
const OBJECT_CONTENT_HEIGHT = OBJECT_HEIGHT - ITEM_PADDING * 2 - 2; // subtract padding + border
const MASK_HEIGHT = 35;
const MASK_CONTENT_HEIGHT = MASK_HEIGHT - ITEM_PADDING * 2 - 2;

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
  selectedObjectIds: string[];
  breakpointConfig?: BreakpointConfiguration;
  objectById: any;
  rowIndex: number;
  moveObject: (dragIndex: number, hoverIndex: number, draggingIds: string[]) => number;
  dropDone: () => void;
  dropCancel: () => void;
  isHovered?: boolean;
  isInvalidMask?: boolean;
}

export function ObjectRow(props: IObjectRowProps) {
  const {
    object,
    layer,
    onObjectClick,
    onObjectDblClick,
    breakpointConfig,
    selectedObjectIds,
    objectById,
    rowIndex,
    moveObject,
    dropDone,
    dropCancel,
    isInvalidMask,
  } = props;

  const ref = useRef<HTMLDivElement>(null);

  // Keep a ref so the useDrag item factory always sees the latest selectedObjectIds.
  const selectedObjectIdsRef = useRef(selectedObjectIds);
  selectedObjectIdsRef.current = selectedObjectIds;

  // Tracks whether onMouseDown already fired the click handler so onClick skips it.
  const mouseDownFiredClick = useRef(false);

  const [{ handlerId, isOver }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null; isOver: boolean }
  >({
    accept: ItemTypes.OBJECT,
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

      // Move the item (or the whole group) and track the new primary index.
      const newIndex = moveObject(dragIndex, hoverIndex, item.draggingIds);
      item.index = newIndex;
    },
    drop: () => {
      dropDone();
    },
  });

  const [, drag] = useDrag({
    type: ItemTypes.OBJECT,
    item: () => {
      const ids = selectedObjectIdsRef.current;
      const isSelected = ids.includes(object.id);
      return {
        id: object.id,
        index: rowIndex,
        draggingIds: isSelected ? [...ids] : [object.id],
      };
    },
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
      { skipHeight: !!(object as any).definition?.values?.autoHeight }
    );

    const html = getObjectHtml(
      object,
      calculatedObjectSize,
      true,
      false,
      breakpointConfig?.type,
      true
    );

    const contentH = object.type === SVG_MASK ? MASK_CONTENT_HEIGHT : OBJECT_CONTENT_HEIGHT;
    const scaleX = ITEM_WIDTH / parseInt(calculatedObjectSize?.width as string);
    const scaleY = contentH / parseInt(calculatedObjectSize?.height as string);
    const scale = Math.min(scaleX, !isNaN(scaleY) ? scaleY : scaleX);

    setObjectHtml({ scale, html, calculatedObjectSize });
  }, [breakpointConfig, layer, object]);

  const isGroup = !!(object?.objectIds && object?.objectIds?.length > 0);
  const isSvgMask = object.type === SVG_MASK;
  const itemHeight = isSvgMask ? MASK_HEIGHT : OBJECT_HEIGHT;
  const contentHeight = isSvgMask ? MASK_CONTENT_HEIGHT : OBJECT_CONTENT_HEIGHT;

  return (
    <div
      ref={ref}
      className={cx(
        css.objectItem,
        {
          [css.selected]:
            selectedObjectIds.length > 0 &&
            selectedObjectIds.indexOf(object.id) !== -1,
        },
        "layers-simplified-object-item-" + object.id
      )}
      onMouseDown={(event) => {
        if (!event.shiftKey && selectedObjectIds.indexOf(object.id) === -1) {
          mouseDownFiredClick.current = true;
          onObjectClick(event, object.id);
        } else {
          mouseDownFiredClick.current = false;
        }
      }}
      onClick={(event) => {
        if (event.shiftKey) {
          onObjectClick(event, object.id);
        } else if (!mouseDownFiredClick.current) {
          // Item was already selected on mousedown — narrow selection to just this one.
          onObjectClick(event, object.id);
        }
        mouseDownFiredClick.current = false;
      }}
      onDoubleClick={(event) => {
        onObjectDblClick(event, isGroup, object.id);
      }}
      style={{
        ...(isOver ? { border: "1px dashed green" } : {}),
        height: itemHeight,
      }}
      data-handler-id={handlerId}
    >
      {isSvgMask ? (
        <div style={{ display: "flex", height: "100%", alignItems: "center" }}>
          <div
            className={css.maskSvgPreview}
            dangerouslySetInnerHTML={{
              __html: object.properties?.mask?.inlineSvgPreview ?? "",
            }}
          />
          <div className={css.maskIconWrapper}>
            <MaskIcon style={{ width: 20, height: 20, color: isInvalidMask ? "red" : undefined }} />
          </div>
        </div>
      ) : (
        <div
          style={{
            transform: `scale(${objectHtml.scale})`,
            transformOrigin: "0 0",
            width: ITEM_WIDTH / objectHtml.scale,
            height: contentHeight / objectHtml.scale,
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
        </div>
      )}
      {isGroup && (
        <Tag className={css.groupObjectsCounter}>
          {object?.objectIds?.length}
        </Tag>
      )}
      {object.isLocked && (
        <Icon icon="lock" size={12} className={css.lockIcon} />
      )}
    </div>
  );
}
