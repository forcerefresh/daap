import { mapValues } from "lodash-es";
import React from "react";
import { ICalculatedObjectSize } from "webslider-sdk/lib/objects/objects-register";
import {
  IAbsoluteLayout,
  IAbsoluteLayoutItem,
  IFitLayout,
  IGridLayout,
  IInsetLayout,
  ILayout as ILayoutBase,
  IObject as IObjectBase,
  ISnapLayout,
} from "webslider-sdk/lib/objects/i-object";
import { ILayer } from "../../store/reducers/i-layers";

// Runtime layout fields that exist in project data but are not in the SDK type.
// The SDK ILayout only exposes selfSize; the rest are runtime-only fields.
type ILayout = ILayoutBase & {
  layout?: string;
  absoluteLayout?: IAbsoluteLayout;
  insetLayout?: IInsetLayout;
  fitLayout?: IFitLayout;
  snapLayout?: ISnapLayout;
  gridLayout?: IGridLayout;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
};

type IObject = IObjectBase & ILayout & {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
};
import {
  BreakpointConfiguration,
  Breakpoints,
} from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import { ISize, roundNumber } from "../../utils/doom-utils/common";
import { humanizeSting } from "../../utils/utils";

export interface IBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function calculateObjectSizePerDevice(
  object: IObject,
  parentLayer: ILayer | undefined,
  breakpoints: Breakpoints,
  options?: { skipHeight: boolean }
): { [key: string]: ICalculatedObjectSize } {
  const ret: { [key: string]: ICalculatedObjectSize } = {};

  breakpoints.breakpointsConfiguration.forEach((bp) => {
    ret[bp.type] = calculateObjectSize(
      object,
      parentLayer,
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

function getParentBounds(
  parentLayout: ILayout | undefined,
  breakpointConfig: BreakpointConfiguration
): IBounds | undefined {
  let parentBounds: React.CSSProperties | undefined;
  let parentBoundsNum: IBounds | undefined;

  if (parentLayout && parentLayout.layout !== "none") {
    parentBounds = calculateObjectSize(
      parentLayout,
      undefined,
      breakpointConfig,
      { resetPosition: false }
    );

    parentBoundsNum = {
      left: parseInt(parentBounds.left as string, 10),
      top: parseInt(parentBounds.top as string, 10),
      width: parseInt(parentBounds.width as string, 10),
      height: parseInt(parentBounds.height as string, 10),
    };
  }

  return parentBoundsNum;
}

export function lineObjectBounds(object: IObject) {
  let hMin = 100000;
  let hMax = -100000;
  let vMin = 100000;
  let vMax = -100000;

  const points = [
    { x: object.x1, y: object.y1 },
    { x: object.x2, y: object.y2 },
  ];

  points.forEach((p) => {
    hMin = Math.min(hMin, p.x ?? 0);
    hMax = Math.max(hMax, p.x ?? 0);
    vMin = Math.min(vMin, p.y ?? 0);
    vMax = Math.max(vMax, p.y ?? 0);
  });

  return {
    left: hMin + "px",
    width: hMax - hMin + "px",
    top: vMin + "px",
    height: vMax - vMin + "px",
  };
}

export function calculateObjectSize(
  object: ILayout,
  _parentLayout: ILayout | undefined, // << this is layer ... ILayer | undefined,
  _breakpointConfig: BreakpointConfiguration,
  { resetPosition: _resetPosition }: { resetPosition: boolean },
  _scaleParams: { wScale: number; hScale: number } = { wScale: 1, hScale: 1 },
  _options?: { skipHeight: boolean }
): ICalculatedObjectSize {
  return {
    left: object.left + "px",
    top: object.top + "px",
    width: object.width + "px",
    height: object.height + "px",
  };
}

export function calculateObjectSize_Layout(
  object: ILayout,
  parentLayout: ILayout | undefined, // << this is layer ... ILayer | undefined,
  breakpointConfig: BreakpointConfiguration,
  { resetPosition }: { resetPosition: boolean },
  _scaleParams: { wScale: number; hScale: number } = { wScale: 1, hScale: 1 },
  options?: { skipHeight: boolean }
): React.CSSProperties {
  const parentBoundsNum = getParentBounds(parentLayout, breakpointConfig);

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

    let relativeTo = parentBoundsNum
      ? "parent"
      : object?.absoluteLayout?.relativeTo!;

    const left = unitValueToPx(
      absoluteValue.left,
      "left",
      relativeTo,
      breakpointConfig,
      false,
      parentBoundsNum
    );

    const top = unitValueToPx(
      absoluteValue.top,
      "top",
      relativeTo,
      breakpointConfig,
      false,
      parentBoundsNum
    );

    let width = unitValueToPx(
      absoluteValue.width,
      "width",
      relativeTo,
      breakpointConfig,
      false,
      parentBoundsNum
    );

    let height = unitValueToPx(
      absoluteValue.height,
      "height",
      relativeTo,
      breakpointConfig,
      false,
      parentBoundsNum
    );

    if (absoluteValue.height === "width") height = width;
    if (absoluteValue.width === "height") width = height;

    const relativeToSize = getPSGSize(
      relativeTo,
      breakpointConfig,
      parentBoundsNum
    )!;

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

    if (options?.skipHeight) delete (sizeObj as Partial<typeof sizeObj>).height;
    return mapValues(sizeObj, (size) => `${size}px`);
  }

  // INSET LAYOUT
  if (object.layout === "inset") {
    const { insetLayout } = object;

    const insetValue = getInsetLayoutSize(insetLayout!, breakpointConfig.type);

    const relativeTo = parentBoundsNum ? "parent" : insetLayout?.relativeTo!;

    const relativeToSize = getPSGSize(
      relativeTo,
      breakpointConfig,
      parentBoundsNum
    )!;

    const left = unitValueToPx(
      insetValue!.left,
      "left",
      relativeTo,
      breakpointConfig,
      false,
      parentBoundsNum
    );

    const top = unitValueToPx(
      insetValue!.top,
      "top",
      relativeTo,
      breakpointConfig,
      false,
      parentBoundsNum
    );

    const right = unitValueToPx(
      insetValue!.right,
      "width",
      relativeTo,
      breakpointConfig,
      false,
      parentBoundsNum
    );

    const bottom = unitValueToPx(
      insetValue!.bottom,
      "height",
      relativeTo,
      breakpointConfig,
      false,
      parentBoundsNum
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

    if (options?.skipHeight) delete (sizeObj as Partial<typeof sizeObj>).height;
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

    if (options?.skipHeight) delete (sizeObj as Partial<typeof sizeObj>).height;
    return mapValues(sizeObj, (size) => `${size}px`);
  }

  // FIT LAYOUT
  if (object.layout === "fit") {
    const layoutItem = getFitLayoutSize(
      object.fitLayout!,
      breakpointConfig.type
    );

    if (parentBoundsNum)
      return {
        ...mapValues(parentBoundsNum, (size) => `${size}px`),
        left: "0px",
        top: "0px",
      };
    else if (layoutItem.relativeTo === "stage") {
      const sizeObj = getPSGSize("stage", breakpointConfig);
      return mapValues(sizeObj, (size) => `${size}px`);
    } else if (layoutItem.relativeTo === "guidelines") {
      const sizeObj = getPSGSize("guidelines", breakpointConfig);
      return mapValues(sizeObj, (size) => `${size}px`);
    }

    const sizeObj = getPSGSize("page", breakpointConfig)!;

    if (options?.skipHeight) delete (sizeObj as Partial<typeof sizeObj>).height;
    return mapValues(sizeObj, (size) => `${size}px`);
  }

  // SNAP LAYOUT
  if (object.layout === "snap") {
    const snapSizeObjStr = getSnapLayoutSize(
      object.snapLayout!,
      breakpointConfig.type
    );

    let relativeTo = parentBoundsNum
      ? "parent"
      : object?.snapLayout?.relativeTo!;

    const relativeToSize = getPSGSize(
      relativeTo,
      breakpointConfig,
      parentBoundsNum
    )!;

    let sizeObj;

    let w = unitValueToPx(
      snapSizeObjStr.width,
      "width",
      relativeTo,
      breakpointConfig,
      true,
      parentBoundsNum
    );

    let h = unitValueToPx(
      snapSizeObjStr.height,
      "height", // TODO shoud be height
      relativeTo,
      breakpointConfig,
      true,
      parentBoundsNum
    );

    if (snapSizeObjStr.height === "width") h = w;
    if (snapSizeObjStr.width === "height") w = h;

    const offsetX = unitValueToPx(
      snapSizeObjStr.offsetX ?? "0px", //INFO:  backward compatibility
      "left",
      relativeTo,
      breakpointConfig,
      true,
      parentBoundsNum
    );

    const offsetY = unitValueToPx(
      snapSizeObjStr.offsetY ?? "0px", //INFO:  backward compatibility
      "top",
      relativeTo,
      breakpointConfig,
      true,
      parentBoundsNum
    );

    switch (snapSizeObjStr?.edge!) {
      case "left": {
        const top = relativeToSize.top + relativeToSize.height / 2 - h / 2;
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

    if (sizeObj && options?.skipHeight) delete (sizeObj as Partial<typeof sizeObj>).height;
    return sizeObj ? mapValues(sizeObj, (size) => `${size}px`) : {};
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
  parentLayout: ILayout | undefined,
  rect: {
    x: number;
    y: number;
    w: number;
    h: number;
  },
  relativeTo: "stage" | "page" | "guidelines" | string,
  breakpointConfig: BreakpointConfiguration
) {
  const parentBoundsNum = getParentBounds(parentLayout, breakpointConfig);

  const relativeToSize = getPSGSize(
    parentLayout?.layout !== "none" ? "parent" : relativeTo,
    breakpointConfig,
    parentBoundsNum
  )!;

  const retSize: Partial<IAbsoluteLayoutItem> = {
    left: isPercentage(prevValue.left)
      ? `${getPercent(relativeToSize.width, rect.x - relativeToSize.left)}%`
      : `${roundNumber(rect.x, 1) - relativeToSize.left}px`,
    top: isPercentage(prevValue.top)
      ? `${getPercent(relativeToSize.height, rect.y - relativeToSize.top)}%`
      : `${roundNumber(rect!.y!, 1) - relativeToSize.top}px`,
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
  parentLayout: ILayout | undefined,
  selectedDevice: DeviceType | "common" | string | any,
  breakpointConfig: BreakpointConfiguration
) {
  const parentBoundsNum = getParentBounds(parentLayout, breakpointConfig);

  const absoluteValue = getAbsoluteLayoutSize(absoluteLayout, selectedDevice);

  const left = unitValueToPx(
    absoluteValue.left,
    "left",
    parentLayout?.layout !== "none" ? "parent" : absoluteLayout?.relativeTo!,
    breakpointConfig,
    false,
    parentBoundsNum
  );

  const top = unitValueToPx(
    absoluteValue.top,
    "top",
    parentLayout?.layout !== "none" ? "parent" : absoluteLayout?.relativeTo!,
    breakpointConfig,
    false,
    parentBoundsNum
  );

  let width = unitValueToPx(
    absoluteValue.width,
    "width",
    parentLayout?.layout !== "none" ? "parent" : absoluteLayout?.relativeTo!,
    breakpointConfig,
    false,
    parentBoundsNum
  );

  let height = unitValueToPx(
    absoluteValue.height,
    "height",
    parentLayout?.layout !== "none" ? "parent" : absoluteLayout?.relativeTo!,
    breakpointConfig,
    false,
    parentBoundsNum
  );

  if (absoluteValue.height === "width") height = width;
  if (absoluteValue.width === "height") width = height;

  const relativeToSize = getPSGSize(
    parentBoundsNum ? "parent" : absoluteLayout?.relativeTo!,
    breakpointConfig,
    parentBoundsNum
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
  type: "page" | "stage" | "guidelines" | "parent" | string,
  breakpointConfig: BreakpointConfiguration,
  parentBoundsNum?: IBounds
): IBounds | undefined {
  if (type === "parent" && parentBoundsNum) {
    return { ...parentBoundsNum, left: 0, top: 0 };
  }

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
  includeLastGuidelineOffset = false,
  parentBounds?: IBounds
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
    if (relativeTo === "parent") {
      newVal = parentBounds?.[sizeProperty]!;
    } else if (relativeTo === "stage") {
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
        <span> {"" + humanizeSting(objectSnapLayout?.edge ?? "")}</span>
        <span> {"W:" + objectSnapLayout?.width ?? ""}</span>
        <span> {"H:" + objectSnapLayout?.height ?? ""}</span>
        <span> {"Offset X:" + objectSnapLayout?.offsetX ?? ""}</span>
        <span> {"Offset Y:" + objectSnapLayout?.offsetY ?? ""}</span>
      </>
    );
  }


  return null;
}

export function getStageSize(breakpointConfig: BreakpointConfiguration): ISize {
  return {
    width: breakpointConfig.normal.page.width,
    height: breakpointConfig.normal.page.height,
  };
}
