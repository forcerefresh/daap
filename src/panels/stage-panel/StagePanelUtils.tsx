import { mapValues, pick, size } from "lodash-es";
import React from "react";
import cx from "classnames";
import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";
import {
  IAbsoluteLayout,
  IAbsoluteLayoutItem,
  IFitLayout,
  IInsetLayout,
  ILayout,
  IObject,
  ISnapLayout,
} from "webslider-sdk/lib/objects/i-object";
import {
  BreakpointConfiguration,
  Breakpoints,
} from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { ISize, roundNumber } from "../../utils/doom-utils/common";
import { Header1 } from "./preview/Header1/Header1";
import { Body1 } from "./preview/Body1/Body1";
import { humanizeSting } from "../../utils/utils";

import css from "./StagePanel.module.scss";

export function calculateObjectSizePerDevice(
  object: IObject,
  breakpoints: Breakpoints,
  options?: { skipHeight: boolean }
): { [key: string]: React.CSSProperties } {
  const ret: { [key: string]: React.CSSProperties } = {};

  breakpoints.breakpointsConfiguration.forEach((bp) => {
    ret[bp.type] = calculateObjectSize(
      object,
      bp,
      { resetPosition: false },
      undefined,
      options
    );
  });

  return ret;
}

export function getRelativeTo(
  object: ILayout,
  breakpointConfig: BreakpointConfiguration
) {
  if (object.layout === "absolute") {
    return object?.absoluteLayout?.relativeTo!;
  } else if (object.layout === "inset") {
    return object?.insetLayout?.relativeTo!;
  } else if (object.layout === "grid") {
    return "stage";
  } else if (object.layout === "fit") {
    const layoutItem = getFitLayoutSize(
      object.fitLayout!,
      breakpointConfig.type
    );
    return layoutItem.relativeTo;
  } else if (object.layout === "snap") {
    return object?.snapLayout?.relativeTo!;
  }
  return "page";
}

export function calculateObjectSize(
  object: ILayout,
  //stageSize: { width: number; height: number },
  breakpointConfig: BreakpointConfiguration,
  { resetPosition }: { resetPosition: boolean },
  scaleParams: { wScale: number; hScale: number } = { wScale: 1, hScale: 1 },
  options?: { skipHeight: boolean }
): React.CSSProperties {
  // Note: _maxSliderSize is calculated only in Player runtime
  const stageSize =
    breakpointConfig.normal._maxSliderSize ||
    breakpointConfig.normal.maxSliderSize;

  if (object.layout === "none") {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  // ABSOLUTE LAYOUT
  if (object.layout === "absolute") {
    const { absoluteLayout } = object;

    const absoluteValue = getAbsoluteLayoutSize(
      absoluteLayout!,
      breakpointConfig.type
    );

    const left = unitValueToPx(
      absoluteValue.left,
      "left",
      object?.absoluteLayout?.relativeTo!,
      breakpointConfig
    );

    const top = unitValueToPx(
      absoluteValue.top,
      "top",
      object.absoluteLayout?.relativeTo!,
      breakpointConfig
    );

    const width = unitValueToPx(
      absoluteValue.width,
      "width",
      object.absoluteLayout?.relativeTo!,
      breakpointConfig
    );

    const height = unitValueToPx(
      absoluteValue.height,
      "height",
      object.absoluteLayout?.relativeTo!,
      breakpointConfig
    );

    const relativeToSize = getPSGSize(
      object.absoluteLayout?.relativeTo!,
      breakpointConfig
    )!;

    //const width = relativeToSize.width - (left + right);
    //const height = relativeToSize.height - (top + bottom);

    const sizeObj = {
      left: relativeToSize.left + left,
      top: relativeToSize.top + top,
      width,
      height,
    };

    if (resetPosition) {
      sizeObj.left = 0;
      sizeObj.top = 0;
    }

    if (options?.skipHeight) delete (sizeObj as any).height;
    return mapValues(sizeObj, (size) => `${size}px`);
  }

  // INSET LAYOUT
  if (object.layout === "inset") {
    const { insetLayout } = object;

    const insetValue = getInsetLayoutSize(insetLayout!, breakpointConfig.type);

    //const sizeObj = pick(insetValue, "left", "top", "width", "height")!;
    const relativeToSize = getPSGSize(
      object.insetLayout?.relativeTo!,
      breakpointConfig
    )!;

    const left = unitValueToPx(
      insetValue!.left,
      "left",
      object.insetLayout?.relativeTo!,
      breakpointConfig
    );

    const top = unitValueToPx(
      insetValue!.top,
      "top",
      object.insetLayout?.relativeTo!,
      breakpointConfig
    );

    const right = unitValueToPx(
      insetValue!.right,
      "width",
      object.insetLayout?.relativeTo!,
      breakpointConfig
    );

    const bottom = unitValueToPx(
      insetValue!.bottom,
      "height",
      object.insetLayout?.relativeTo!,
      breakpointConfig
    );

    const width = relativeToSize.width - (left + right);
    const height = relativeToSize.height - (top + bottom);

    const sizeObj = {
      left: relativeToSize.left + left,
      top: relativeToSize.top + top,
      width,
      height,
    };

    if (resetPosition) {
      sizeObj.left = 0;
      sizeObj.top = 0;
    }

    if (options?.skipHeight) delete (sizeObj as any).height;
    return mapValues(sizeObj, (size) => `${size}px`);
  }

  // GRID LAYOUT
  if (object.layout === "grid") {
    const { gridLayout } = object;

    const wPerCell = stageSize.width / breakpointConfig.normal.grid.horizontal;
    const hPerCell = stageSize.height / breakpointConfig.normal.grid.vertical;

    let gridValue =
      gridLayout?.type === "common"
        ? gridLayout!.common
        : gridLayout?.perDevice.find(
            (item) => item.deviceType === breakpointConfig.type
          );

    if (!gridValue) {
      gridValue = gridLayout!.common;
    }

    const sizeObj = {
      left: wPerCell * gridValue!.left,
      top: hPerCell * gridValue!.top,
      width: wPerCell * gridValue!.width,
      height: hPerCell * gridValue!.height,
    };
    if (resetPosition) {
      sizeObj.left = 0;
      sizeObj.top = 0;
    }

    if (options?.skipHeight) delete (sizeObj as any).height;
    return mapValues(sizeObj, (size) => `${size}px`);
  }

  // FIT LAYOUT
  if (object.layout === "fit") {
    const layoutItem = getFitLayoutSize(
      object.fitLayout!,
      breakpointConfig.type
    );

    if (layoutItem.relativeTo === "stage") {
      const sizeObj = getPSGSize("stage", breakpointConfig);
      return mapValues(sizeObj, (size) => `${size}px`);
    } else if (layoutItem.relativeTo === "guidelines") {
      const sizeObj = getPSGSize("guidelines", breakpointConfig);
      return mapValues(sizeObj, (size) => `${size}px`);
    }

    const sizeObj = getPSGSize("page", breakpointConfig);

    if (options?.skipHeight) delete (sizeObj as any).height;
    return mapValues(sizeObj, (size) => `${size}px`);
  }

  // SNAP LAYOUT
  if (object.layout === "snap") {
    const snapSizeObjStr = getSnapLayoutSize(
      object.snapLayout!,
      breakpointConfig.type
    );

    // const snapSizeObj = {
    //   height: parseFloat(snapSizeObjStr.height),
    //   width: parseFloat(snapSizeObjStr.width),
    //   //gap: snapSizeObjStr.gap,
    //   offsetX: parseFloat(snapSizeObjStr.offsetX),
    //   offsetY: parseFloat(snapSizeObjStr.offsetY),
    // };

    // const  offsetX = parseFloat(snapSizeObjStr.offsetX),
    // const  offsetY = parseFloat(snapSizeObjStr.offsetY),

    //const gap = snapSizeObj.gap;

    const relativeToSize = getPSGSize(
      object.snapLayout?.relativeTo!,
      breakpointConfig
    )!;

    let sizeObj;

    const w = unitValueToPx(
      snapSizeObjStr.width,
      "width",
      object.snapLayout?.relativeTo!,
      breakpointConfig,
      true
    );

    const h = unitValueToPx(
      snapSizeObjStr.height,
      "height", // TODO shoud be height
      object.snapLayout?.relativeTo!,
      breakpointConfig,
      true
    );

    const offsetX = unitValueToPx(
      snapSizeObjStr.offsetX ?? "0px", //INFO:  backward compatibility
      "left",
      object.snapLayout?.relativeTo!,
      breakpointConfig,
      true
    );

    const offsetY = unitValueToPx(
      snapSizeObjStr.offsetY ?? "0px", //INFO:  backward compatibility
      "top",
      object.snapLayout?.relativeTo!,
      breakpointConfig,
      true
    );

    switch (object.snapLayout?.edge!) {
      case "left": {
        const top = relativeToSize.top + relativeToSize.height / 2 - h / 2;
        // (relativeToSize.top + relativeToSize.height) / 2;
        sizeObj = {
          top,
          left: relativeToSize.left + offsetX,
          width: w,
          height: h,
        };
        break;
      }
      case "top": {
        const left = relativeToSize.left + relativeToSize.width / 2 - w / 2;

        sizeObj = {
          top: relativeToSize.top + offsetY,
          left,
          width: w,
          height: h,
        };
        break;
      }
      case "right": {
        const left = relativeToSize.left + relativeToSize.width - w - offsetX;
        const top = relativeToSize.top + relativeToSize.height / 2 - h / 2;

        sizeObj = {
          top,
          left,
          width: w,
          height: h,
        };
        break;
      }

      case "bottom": {
        const left = relativeToSize.left + relativeToSize.width / 2 - w / 2;
        const top = relativeToSize.top + relativeToSize.height - h - offsetY;

        sizeObj = {
          top,
          left,
          width: w,
          height: h,
        };
        break;
      }
      case "top-left": {
        sizeObj = {
          top: relativeToSize.top + offsetY,
          left: relativeToSize.left + offsetX,
          width: w,
          height: h,
        };
        break;
      }
      case "top-right": {
        const left = relativeToSize.left + relativeToSize.width - w - offsetX;

        sizeObj = {
          top: relativeToSize.top + offsetY,
          left,
          width: w,
          height: h,
        };
        break;
      }

      case "bottom-left": {
        const top = relativeToSize.top + relativeToSize.height - h;

        sizeObj = {
          top: top - offsetY,
          left: relativeToSize.left + offsetX,
          width: w,
          height: h,
        };
        break;
      }
      case "bottom-right": {
        const top = relativeToSize.top + relativeToSize.height - h - offsetY;
        const left = relativeToSize.left + relativeToSize.width - w - offsetX;

        sizeObj = {
          top: top,
          left: left,
          width: w,
          height: h,
        };
        break;
      }
      case "center": {
        const left = relativeToSize.left + relativeToSize.width / 2 - w / 2;
        const top = relativeToSize.top + relativeToSize.height / 2 - h / 2;

        sizeObj = {
          top,
          left,
          width: w,
          height: h,
        };
        break;
      }
    }

    if (options?.skipHeight) delete (sizeObj as any).height;
    return mapValues(sizeObj, (size) => `${size}px`);
  }

  return {};
}

export function getFitLayoutSize(
  fitLayout: IFitLayout,
  selectedDevice: DeviceType | "common" | string | any
) {
  let fitValue =
    fitLayout?.type === "common"
      ? fitLayout!.common
      : fitLayout?.perDevice.find((item) => item.deviceType === selectedDevice);

  if (!fitValue) {
    fitValue = fitLayout!.common;
  }

  return fitValue;
}

export function getInsetLayoutSize(
  insetLayout: IInsetLayout,
  selectedDevice: DeviceType | "common" | string | any
) {
  let insetValue =
    insetLayout?.type === "common"
      ? insetLayout!.common
      : insetLayout?.perDevice.find(
          (item) => item.deviceType === selectedDevice
        );

  if (!insetValue) {
    insetValue = insetLayout!.common;
  }

  return insetValue;
}

/**
 * Convert pixels to unit size ("px" or "%") for Absolute position.
 */
export function getAbsoluteLayoutSizeInSameUnit(
  prevValue: IAbsoluteLayoutItem,
  rect: {
    x: number;
    y: number;
    w: number;
    h: number;
  },
  relativeTo: "stage" | "page" | "guidelines" | string,
  breakpointConfig: BreakpointConfiguration
) {
  const relativeToSize = getPSGSize(relativeTo, breakpointConfig)!;

  const retSize: Partial<IAbsoluteLayoutItem> = {
    left: isPercentage(prevValue.left)
      ? `${getPercent(relativeToSize.width, rect.x - relativeToSize.left)}%`
      : `${roundNumber(rect.x, 1)}px`,
    top: isPercentage(prevValue.top)
      ? `${getPercent(relativeToSize.height, rect.y - relativeToSize.top)}%`
      : `${roundNumber(rect!.y!, 1)}px`,
    width: isPercentage(prevValue.width)
      ? `${getPercent(relativeToSize.width, rect.w)}%`
      : `${roundNumber(rect.w, 1)}px`,
    height: isPercentage(prevValue.height)
      ? `${getPercent(relativeToSize.height, rect.h)}%`
      : `${roundNumber(rect.h, 1)}px`,
  };
  return retSize;
}

function getPercent(refVal: number, value: number, roundDec = 1) {
  return roundNumber((value / refVal) * 100, roundDec);
}

function isPercentage(value: string) {
  return value.indexOf("%") !== -1;
}
/**
 * Convert Absolute position ("px" or "%") to pixels.
 */
export function getAbsoluteLayoutSizeInPx(
  absoluteLayout: IAbsoluteLayout,
  selectedDevice: DeviceType | "common" | string | any,
  breakpointConfig: BreakpointConfiguration
) {
  const absoluteValue = getAbsoluteLayoutSize(absoluteLayout, selectedDevice);

  const left = unitValueToPx(
    absoluteValue.left,
    "left",
    absoluteLayout?.relativeTo!,
    breakpointConfig
  );
  const top = unitValueToPx(
    absoluteValue.top,
    "top",
    absoluteLayout?.relativeTo!,
    breakpointConfig
  );

  const width = unitValueToPx(
    absoluteValue.width,
    "width",
    absoluteLayout?.relativeTo!,
    breakpointConfig
  );
  const height = unitValueToPx(
    absoluteValue.height,
    "height",
    absoluteLayout?.relativeTo!,
    breakpointConfig
  );

  const relativeToSize = getPSGSize(
    absoluteLayout?.relativeTo!,
    breakpointConfig
  )!;

  const sizeObj = {
    left: relativeToSize.left + left,
    top: relativeToSize.top + top,
    width,
    height,
  };

  return sizeObj;
}
export function getAbsoluteLayoutSize(
  absoluteLayout: IAbsoluteLayout,
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
  snapLayout: ISnapLayout,
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
  const stageSize =
    breakpointConfig.normal._maxSliderSize ||
    breakpointConfig.normal.maxSliderSize;

  const pageSize =
    breakpointConfig.normal._page || breakpointConfig.normal.page;

  switch (type) {
    case "page": {
      return {
        top: -((pageSize.height || stageSize.height) - stageSize.height) / 2,
        left: -((pageSize.width || stageSize.width) - stageSize.width) / 2,
        width: pageSize.width || 0,
        height: pageSize.height || 0,
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

export function unitValueToPx(
  value: string,
  propertyName: "width" | "height" | "left" | "top",
  relativeTo: string,
  breakpointConfig: BreakpointConfiguration,
  includeLastGuidelineOffset = false
) {
  const sizeProperty =
    propertyName === "width" || propertyName === "left" ? "width" : "height";

  if (value.indexOf("px") !== -1) {
    return parseFloat(value);
  } else if (value.indexOf("%") !== -1) {
    let newVal =
      breakpointConfig.normal._page?.[sizeProperty] ||
      breakpointConfig.normal.page?.[sizeProperty];

    // IMPORTANT: max slider size nemoze da bude veci od setovanog
    if (relativeTo === "stage") {
      newVal =
        breakpointConfig.normal._maxSliderSize?.[sizeProperty] ||
        breakpointConfig.normal.maxSliderSize?.[sizeProperty];
    } else if (relativeTo === "guidelines") {
      newVal =
        breakpointConfig.normal._maxSliderSize?.[sizeProperty] ||
        breakpointConfig.normal.maxSliderSize?.[sizeProperty];

      if (includeLastGuidelineOffset) {
        newVal -= breakpointConfig?.normal?.guidelinesPadding.right || 0;
      } else if (propertyName === "left") {
        newVal -=
          (breakpointConfig?.normal?.guidelinesPadding.left || 0) +
          (breakpointConfig?.normal?.guidelinesPadding.right || 0);
      }
      if (includeLastGuidelineOffset) {
        newVal -= breakpointConfig?.normal?.guidelinesPadding.bottom || 0;
      } else if (propertyName === "top") {
        newVal -=
          (breakpointConfig?.normal?.guidelinesPadding.top || 0) +
          (breakpointConfig?.normal?.guidelinesPadding.bottom || 0);
      }
    }
    return roundNumber((newVal * parseFloat(value)) / 100, 1);
  }
  return parseFloat(value);
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



  if (relativeTo === "guidelines") {
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

export function getPositionInfo(object: IObject, device: DeviceType) {
  if (object.layout === "absolute") {
    const objectAbsoluteLayout =
      object.absoluteLayout?.type === "common"
        ? object.absoluteLayout.common
        : object.absoluteLayout?.perDevice.find((d) => d.deviceType === device);
    return (
      <>
        <span> Absolute | </span>
        <span> {"X:" + objectAbsoluteLayout?.left}</span>
        <span> {"Y:" + objectAbsoluteLayout?.top}</span>
        <span> {"W:" + objectAbsoluteLayout?.width}</span>
        <span> {"H:" + objectAbsoluteLayout?.height}</span>
        {/*<span> {"W:" + roundNumber(object.width!, 2)}</span>
      <span> {"H:" + roundNumber(object.height!, 2)}</span>*/}
      </>
    );
  }

  if (object.layout === "grid") {
    const objectGridLayout =
      object.gridLayout?.type === "common"
        ? object.gridLayout.common
        : object.gridLayout?.perDevice.find((d) => d.deviceType === device);

    return (
      <>
        <span> Grid | </span>
        <span> {"L:" + objectGridLayout?.left ?? ""}</span>
        <span> {"T:" + objectGridLayout?.top ?? ""}</span>
        <span> {"W:" + objectGridLayout?.width ?? ""}</span>
        <span> {"H:" + objectGridLayout?.height ?? ""}</span>
      </>
    );
  }

  if (object.layout === "fit") {
    return (
      <>
        <span> Fit | Page </span>
      </>
    );
  }

  if (object.layout === "snap") {
    const objectSnapLayout =
      object.snapLayout?.type === "common"
        ? object.snapLayout.common
        : object.snapLayout?.perDevice?.find((d) => d.deviceType === device);

    return (
      <>
        <span> Snap | </span>
        <span> {"" + humanizeSting(object?.snapLayout?.edge ?? "")}</span>
        <span> {"W:" + objectSnapLayout?.width ?? ""}</span>
        <span> {"H:" + objectSnapLayout?.height ?? ""}</span>
        <span> {"Offset X:" + objectSnapLayout?.offsetX ?? ""}</span>
        <span> {"Offset Y:" + objectSnapLayout?.offsetY ?? ""}</span>
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
    height: breakpointConfig.normal.page.height,
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
