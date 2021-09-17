import { cloneDeep, mapValues, pick } from "lodash-es";
import React from "react";
import {
  CoverImageProperties,
  GridImageProperties,
  ICoverPlacementValue,
} from "../../inputs/types";
import { IObject } from "../../objects/types";
import { BreakpointConfiguration } from "../../store/reducers/settings";
import { ISize, roundNumber } from "../../utils/doom-utils/common";
import cx from "classnames";

import css from "./StagePanel.module.scss";
import { Header1 } from "./preview/Header1/Header1";
import { RGBColor } from "react-color";
import { Body1 } from "./preview/Body1/Body1";

export function calculateObjectSize(
  object: IObject,
  //stageSize: { width: number; height: number },
  breakpointConfig: BreakpointConfiguration,
  { resetPosition }: { resetPosition: boolean }
): React.CSSProperties {
  const stageSize = breakpointConfig.normal.slide;

  // 1. if object has position
  if (object.layout === "absolute") {
    const sizeObj = cloneDeep(object.absoluteLayout)!;

    if (resetPosition) {
      sizeObj.left = 0;
      sizeObj.top = 0;
    }
    return mapValues(sizeObj, (size) => `${size}px`);
  }

  // 2. if we use GRID
  if (object.layout === "grid") {
    const { gridLayout } = object;

    const wPerCell = stageSize.width / breakpointConfig.normal.grid.horizontal;
    const hPerCell = stageSize.height / breakpointConfig.normal.grid.vertical;
    const sizeObj = {
      left: wPerCell * gridLayout!.left,
      top: hPerCell * gridLayout!.top,
      width: wPerCell * gridLayout!.right,
      height: hPerCell * gridLayout!.bottom,
    };
    if (resetPosition) {
      sizeObj.left = 0;
      sizeObj.top = 0;
    }
    return mapValues(sizeObj, (size) => `${size}px`);
  }

  if (object.layout === "fit_page") {
    const sizeObj = {
      top: 0,
      left:
        -(
          (breakpointConfig?.normal?.page.width || stageSize.width) -
          stageSize.width
        ) / 2,
      width: breakpointConfig?.normal?.page.width || 0,
      height: stageSize.height,
    };
    return mapValues(sizeObj, (size) => `${size}px`);
  }
  /*
  // 3. if we use COVER placement
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
*/
  return {};
}

export function getPositionInfo(object: IObject) {
  if (object.layout === "absolute") {
    return (
      <>
        <span> Absolute | </span>
        <span>{"X:" + roundNumber(object.absoluteLayout!.left!, 2)}</span>
        <span> {"Y:" + roundNumber(object.absoluteLayout!.top!, 2)}</span>
        {/*<span> {"W:" + roundNumber(object.width!, 2)}</span>
      <span> {"H:" + roundNumber(object.height!, 2)}</span>*/}
      </>
    );
  }

  if (object.layout === "grid") {
    return (
      <>
        <span> Grid | </span>
        <span> {"left:" + object.gridLayout!.left!}</span>
        <span> {"right:" + object.gridLayout!.right!}</span>
      </>
    );
  }

  if (object.layout === "fit_page") {
    return (
      <>
        <span> Fit page </span>
      </>
    );
  }

  /*
  if (object.layout === "cover") {
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
  */

  return null;
}

export function getStageSize(breakpointConfig: BreakpointConfiguration): ISize {
  return {
    width: breakpointConfig.normal.page.width,
    height: breakpointConfig.normal.slide.height,
  };
}

export function getPreviewLayout(
  stageZoom: number,
  left: number,
  width: number,
  {
    itemsColor,
    transparentHeader,
  }: { itemsColor: RGBColor; transparentHeader: boolean }
) {
  const header = {
    height: transparentHeader ? 0 : 40 * stageZoom,
    component: getPreviewHeaderMock(
      {
        left: left * stageZoom + "px",
        width: width * stageZoom + "px",
        margin: 5 * stageZoom + "px",
        borderRadius: 5 * stageZoom + "px",
        height: 30 * stageZoom + "px",
      },
      itemsColor,
      transparentHeader
    ),
  };

  const body = {
    height: 710 * stageZoom,
    component: getPreviewBodyMock(
      {
        left: left * stageZoom + "px",
        width: width * stageZoom + "px",
        margin: 5 * stageZoom + "px",
        borderRadius: 5 * stageZoom + "px",
        height: 800 * stageZoom + "px",
      },
      itemsColor
    ),
  };

  return {
    header,
    body,
  };
}

export function getPreviewHeaderMock(
  style: React.CSSProperties,
  itemsColor: RGBColor,
  transparentHeader: boolean
) {
  return (
    <div
      className={cx(transparentHeader ? css.headerLayoutBox : css.layoutBox)}
      style={style}
    >
      <Header1 itemsColor={itemsColor} />
    </div>
  );
}

export function getPreviewBodyMock(
  style: React.CSSProperties,
  itemsColor: RGBColor
) {
  return (
    <div className={cx(css.layoutBox)} style={style}>
      <Body1 itemsColor={itemsColor} />
    </div>
  );
}
