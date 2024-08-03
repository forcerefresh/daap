import { ILayer, IObject } from "webslider-sdk/lib/objects/i-object";
import cx from "classnames";
import { selectForPropertiesProps } from "../../store/actions/actions";
import { ReactElement, useEffect, useState } from "react";
import css from "./ObjectRow.module.scss";
import React from "react";
import { getObjectHtml } from "../../export/export-html";
import { calculateObjectSize } from "../stage-panel/StagePanelUtils";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { Icon, Tag } from "@blueprintjs/core";
import { ReactComponent as ObjectsGroup } from "./assets/objects-group.svg";
import StageObjectMinimap from "../stage-panel-new/StageObjectMinimap";

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
  } = props;

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

    //console.log(calculatedObjectSize);
    const scaleX = 76 / parseInt(calculatedObjectSize?.width as string);
    const scaleY = 61 / parseInt(calculatedObjectSize?.height as string);
    const scale = Math.min(scaleX, !isNaN(scaleY) ? scaleY : scaleX);

    setObjectHtml({ scale, html, calculatedObjectSize });
  }, [breakpointConfig, layer, object]);

  //   console.log({
  //     transform: `scale(${objectHtml.scale})`,
  //     transformOrigin: "0 0",
  //   });

  const isGroup = !!(object?.objectIds && object?.objectIds?.length > 0);

  return (
    <div
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
