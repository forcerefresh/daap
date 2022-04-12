import { cloneDeep, mapValues, pick } from "lodash-es";
import React from "react";
import {
  IAbsoluteLayouts,
  ILayout,
  IObject,
  ISnapLayouts,
  ObjectType,
} from "../../objects/types";
import {
  BreakpointConfiguration,
  DeviceType,
} from "../../store/reducers/i-settings";
import { ISize, roundNumber } from "../../utils/doom-utils/common";
import cx from "classnames";

import css from "./StagePanel.module.scss";
import { Header1 } from "./preview/Header1/Header1";
import { RGBColor } from "react-color";
import { Body1 } from "./preview/Body1/Body1";

export function calculateObjectSize(
  object: ILayout,
  //stageSize: { width: number; height: number },
  breakpointConfig: BreakpointConfiguration,
  { resetPosition }: { resetPosition: boolean }
): React.CSSProperties {
  const stageSize = breakpointConfig.normal.slide;

  if (object.layout === "none") {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  // 1. if object has position
  if (object.layout === "absolute") {
    const { absoluteLayout } = object;

    let absoluteValue =
      absoluteLayout?.type === "common"
        ? absoluteLayout!.common
        : absoluteLayout?.perDevice.find(
            (item) => item.deviceType === breakpointConfig.type
          );

    if (!absoluteValue) {
      absoluteValue = absoluteLayout!.common;
    }

    const sizeObj = pick(absoluteValue, "left", "top", "width", "height")!;

    if (resetPosition) {
      sizeObj.left = 0;
      sizeObj.top = 0;
    }

    return mapValues(sizeObj, (size) => `${size}px`);
  }

  // 2. if we use GRID
  if (object.layout === "grid") {
    const { gridLayouts } = object;

    const wPerCell = stageSize.width / breakpointConfig.normal.grid.horizontal;
    const hPerCell = stageSize.height / breakpointConfig.normal.grid.vertical;

    let gridValue =
      gridLayouts?.type === "common"
        ? gridLayouts!.common
        : gridLayouts?.perDevice.find(
            (item) => item.deviceType === breakpointConfig.type
          );

    if (!gridValue) {
      gridValue = gridLayouts!.common;
    }

    const sizeObj = {
      left: wPerCell * gridValue!.left,
      top: hPerCell * gridValue!.top,
      width: wPerCell * gridValue!.right,
      height: hPerCell * gridValue!.bottom,
    };
    if (resetPosition) {
      sizeObj.left = 0;
      sizeObj.top = 0;
    }
    return mapValues(sizeObj, (size) => `${size}px`);
  }

  if (object.layout === "fit_page") {
    const sizeObj = getPSGSize("page", breakpointConfig);

    return mapValues(sizeObj, (size) => `${size}px`);
  }

  if (object.layout === "fit_stage") {
    const sizeObj = getPSGSize("stage", breakpointConfig);
    return mapValues(sizeObj, (size) => `${size}px`);
  }

  if (object.layout === "fit_guidelines") {
    const sizeObj = getPSGSize("guidelines", breakpointConfig);
    return mapValues(sizeObj, (size) => `${size}px`);
  }

  // const gap = object.snapLayout!.gap;

  if (object.layout === "snap") {
    const snapSizeObj = getSnapLayoutSize(
      object.snapLayout!,
      breakpointConfig.type
    );
    const gap = snapSizeObj.gap;

    const relativeToSize = getPSGSize(
      object.snapLayout?.relativeTo!,
      breakpointConfig
    )!;

    let sizeObj;
    switch (object.snapLayout?.edge!) {
      case "left": {
        const top =
          relativeToSize.top +
          relativeToSize.height / 2 -
          snapSizeObj.height / 2;

        sizeObj = {
          top,
          left: relativeToSize.left + gap,
          width: snapSizeObj.width,
          height: snapSizeObj.height,
        };
        break;
      }
      case "top": {
        const left =
          relativeToSize.left +
          relativeToSize.width / 2 -
          snapSizeObj.width / 2;

        sizeObj = {
          top: relativeToSize.top + gap,
          left,
          width: snapSizeObj.width,
          height: snapSizeObj.height,
        };
        break;
      }
      case "right": {
        const left =
          relativeToSize.left + relativeToSize.width - snapSizeObj.width - gap;
        const top =
          relativeToSize.top +
          relativeToSize.height / 2 -
          snapSizeObj.height / 2;

        sizeObj = {
          top,
          left,
          width: snapSizeObj.width,
          height: snapSizeObj.height,
        };
        break;
      }

      case "bottom": {
        const left =
          relativeToSize.left +
          relativeToSize.width / 2 -
          snapSizeObj.width / 2;
        const top =
          relativeToSize.top + relativeToSize.height - snapSizeObj.height - gap;

        sizeObj = {
          top,
          left,
          width: snapSizeObj.width,
          height: snapSizeObj.height,
        };
        break;
      }
      case "top-left": {
        sizeObj = {
          top: relativeToSize.top + gap,
          left: relativeToSize.left + gap,
          width: snapSizeObj.width,
          height: snapSizeObj.height,
        };
        break;
      }
      case "top-right": {
        const left =
          relativeToSize.left + relativeToSize.width - snapSizeObj.width - gap;

        sizeObj = {
          top: relativeToSize.top + gap,
          left,
          width: snapSizeObj.width,
          height: snapSizeObj.height,
        };
        break;
      }

      case "bottom-left": {
        const top =
          relativeToSize.top + relativeToSize.height - snapSizeObj.height;

        sizeObj = {
          top: top - gap,
          left: relativeToSize.left + gap,
          width: snapSizeObj.width,
          height: snapSizeObj.height,
        };
        break;
      }
      case "bottom-right": {
        const top =
          relativeToSize.top + relativeToSize.height - snapSizeObj.height - gap;
        const left =
          relativeToSize.left + relativeToSize.width - snapSizeObj.width - gap;

        sizeObj = {
          top: top,
          left: left,
          width: snapSizeObj.width,
          height: snapSizeObj.height,
        };
        break;
      }
      case "center": {
        const left =
          relativeToSize.left +
          relativeToSize.width / 2 -
          snapSizeObj.width / 2;

        const top =
          relativeToSize.top +
          relativeToSize.height / 2 -
          snapSizeObj.height / 2;

        sizeObj = {
          top,
          left,
          width: snapSizeObj.width,
          height: snapSizeObj.height,
        };
        break;
      }
    }

    return mapValues(sizeObj, (size) => `${size}px`);
  }

  return {};
}

export function getAbsoluteLayoutSize(
  absoluteLayout: IAbsoluteLayouts,
  selectedDevice: DeviceType | "common" | string | any
) {
  let absoluteValue =
    absoluteLayout?.type === "common"
      ? absoluteLayout!.common
      : absoluteLayout?.perDevice.find(
          (item) => item.deviceType === selectedDevice
        );

  if (!absoluteValue) {
    absoluteValue = absoluteLayout!.common;
  }

  return absoluteValue;
}

export function getSnapLayoutSize(
  snapLayout: ISnapLayouts,
  selectedDevice: DeviceType | "common" | string | any
) {
  let snapValue =
    snapLayout?.type === "common"
      ? snapLayout!.common
      : snapLayout?.perDevice.find(
          (item) => item.deviceType === selectedDevice
        );

  if (!snapValue) {
    snapValue = snapLayout!.common;
  }

  return snapValue;
}

function getPSGSize(
  type: "page" | "stage" | "guidelines" | string,
  breakpointConfig: BreakpointConfiguration
) {
  const stageSize = breakpointConfig.normal.slide;

  switch (type) {
    case "page": {
      return {
        top: 0,
        left:
          -(
            (breakpointConfig?.normal?.page.width || stageSize.width) -
            stageSize.width
          ) / 2,
        width: breakpointConfig?.normal?.page.width || 0,
        height: stageSize.height,
      };
    }
    case "stage": {
      return {
        top: 0,
        left: 0,
        width: stageSize.width,
        height: stageSize.height,
      };
    }
    case "guidelines": {
      return {
        top: breakpointConfig?.normal?.guidelinesPadding.top || 0,
        left: breakpointConfig?.normal?.guidelinesPadding.left || 0,

        width:
          stageSize.width -
          ((breakpointConfig?.normal?.guidelinesPadding.left || 0) +
            (breakpointConfig?.normal?.guidelinesPadding.right || 0)),
        height:
          stageSize.height -
          ((breakpointConfig?.normal?.guidelinesPadding.top || 0) +
            (breakpointConfig?.normal?.guidelinesPadding.bottom || 0)),
      };
    }
  }
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

export function getPositionInfo(object: IObject) {
  if (object.layout === "absolute") {
    return (
      <>
        <span> Absolute | </span>
        <span>
          {"X:" + roundNumber(object.absoluteLayout!.common.left!, 2)}
        </span>
        <span>
          {" "}
          {"Y:" + roundNumber(object.absoluteLayout!.common.top!, 2)}
        </span>
        {/*<span> {"W:" + roundNumber(object.width!, 2)}</span>
      <span> {"H:" + roundNumber(object.height!, 2)}</span>*/}
      </>
    );
  }

  if (object.layout === "grid") {
    return (
      <>
        <span> Grid | TODO!!!</span>
        {/*  <span> {"left:" + object.gridLayout!.left!}</span>
        <span> {"right:" + object.gridLayout!.right!}</span>*/}
      </>
    );
  }

  if (object.layout === "fit_page") {
    return (
      <>
        <span> Fit Page </span>
      </>
    );
  }

  if (object.layout === "fit_stage") {
    return (
      <>
        <span> Fit Stage</span>
      </>
    );
  }

  if (object.layout === "fit_guidelines") {
    return (
      <>
        <span> Fit Guidebox</span>
      </>
    );
  }

  if (object.layout === "snap") {
    return (
      <>
        <span> Snap</span>
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
