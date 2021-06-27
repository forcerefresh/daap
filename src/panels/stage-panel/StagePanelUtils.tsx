import { mapValues, pick } from "lodash-es";
import React from "react";
import { CoverImageProperties, ICoverPlacementValue } from "../../inputs/types";
import { IObject } from "../../objects/types";
import { BreakpointConfiguration } from "../../store/reducers/settings";
import { ISize, roundNumber } from "../../utils/doom-utils/common";
import cx from "classnames";

import css from "./StagePanel.module.scss";

export function calculateObjectSize(
  object: IObject,
  //stageSize: { width: number; height: number },
  breakpointConfig: BreakpointConfiguration,
  { resetPosition }: { resetPosition: boolean }
): React.CSSProperties {
  const stageSize = breakpointConfig.normal.slide;

  // 1. if object has position
  if (!object.hasNoPosition) {
    const sizeObj = pick(object, "left", "top", "width", "height");
    if (resetPosition) {
      sizeObj.left = 0;
      sizeObj.top = 0;
    }
    return mapValues(sizeObj, (size) => `${size}px`);
  }

  // 2. if we use cover placement
  const coverImageProperties = object.definition
    .properties as CoverImageProperties;
  const relativeTo = coverImageProperties.placement.value.relativeTo;

  if (relativeTo === "page") {
    return {
      top: 0 + "px",
      left:
        -(
          (breakpointConfig?.normal?.page.width || stageSize.width) -
          stageSize.width
        ) /
          2 +
        "px",
      width: (breakpointConfig?.normal?.page.width || 0) + "px",
      height: stageSize.height + "px",
    };
  }

  if (relativeTo === "stage") {
    return {
      top: 0 + "px",
      left: 0 + "px",
      width: stageSize.width + "px",
      height: stageSize.height + "px",
    };
  }

  console.log(breakpointConfig?.normal?.guidelinesPadding);
  console.log(
    stageSize.height -
      ((breakpointConfig?.normal?.guidelinesPadding.top || 0) +
        (breakpointConfig?.normal?.guidelinesPadding.bottom || 0))
  );
  if (relativeTo === "guidelines") {
    console.log({
      top: (breakpointConfig?.normal?.guidelinesPadding.top || 0) + "px",
      left: (breakpointConfig?.normal?.guidelinesPadding.left || 0) + "px",

      width:
        stageSize.width -
        ((breakpointConfig?.normal?.guidelinesPadding.left || 0) +
          (breakpointConfig?.normal?.guidelinesPadding.right || 0)) +
        "px",
      height:
        stageSize.height -
        ((breakpointConfig?.normal?.guidelinesPadding.top || 0) +
          (breakpointConfig?.normal?.guidelinesPadding.bottom || 0) +
          100) +
        "px",
    });

    return {
      top: (breakpointConfig?.normal?.guidelinesPadding.top || 0) + "px",
      left: (breakpointConfig?.normal?.guidelinesPadding.left || 0) + "px",

      width:
        stageSize.width -
        ((breakpointConfig?.normal?.guidelinesPadding.left || 0) +
          (breakpointConfig?.normal?.guidelinesPadding.right || 0)) +
        "px",
      height:
        stageSize.height -
        ((breakpointConfig?.normal?.guidelinesPadding.top || 0) +
          (breakpointConfig?.normal?.guidelinesPadding.bottom || 0)) +
        "px",
    };
  }

  return {};
}

export function getPositionInfo(object: IObject) {
  if (object.hasNoPosition) {
    return (
      <>
        <b>
          {
            (
              (object.definition.properties as any).placement
                .value as ICoverPlacementValue
            ).size
          }
        </b>{" "}
        relative to{" "}
        <b>
          {" "}
          {
            (
              (object.definition.properties as any).placement
                .value as ICoverPlacementValue
            ).relativeTo
          }
        </b>
      </>
    );
  }

  return (
    <>
      <span> {"X:" + roundNumber(object.left!, 2)}</span>
      <span> {"Y:" + roundNumber(object.top!, 2)}</span>
      {/*<span> {"W:" + roundNumber(object.width!, 2)}</span>
      <span> {"H:" + roundNumber(object.height!, 2)}</span>*/}
    </>
  );
}

export function getStageSize(breakpointConfig: BreakpointConfiguration): ISize {
  return {
    width: breakpointConfig.normal.page.width,
    height: breakpointConfig.normal.slide.height,
  };
}

export function getPreviewLayout(stageZoom: number) {
  const header = {
    height: 40 * stageZoom,
    component: getPreviewHeaderMock({
      margin: 5 * stageZoom + "px",
      borderRadius: 5 * stageZoom + "px",
      height: 30 * stageZoom + "px",
    }),
  };

  const body = {
    height: 710 * stageZoom,
    component: getPreviewBodyMock({
      margin: 5 * stageZoom + "px",
      borderRadius: 5 * stageZoom + "px",
      height: 700 * stageZoom + "px",
    }),
  };

  return {
    header,
    body,
  };
}

export function getPreviewHeaderMock(style: React.CSSProperties) {
  return <div className={cx(css.layoutBox)} style={style}></div>;
}

export function getPreviewBodyMock(style: React.CSSProperties) {
  return <div className={cx(css.layoutBox)} style={style}></div>;
}
