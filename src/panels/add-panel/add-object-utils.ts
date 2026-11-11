import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { ObjectMetaType } from "webslider-sdk/lib/objects/objects-register";
import { unitValueToPx } from "../stage-panel/StagePanelUtils";

export function getObjectSizeFromMeta(
  meta: ObjectMetaType,
  breakpointConfig: BreakpointConfiguration | undefined
) {
  if (!breakpointConfig || !meta.initialSize || !meta.initialPosition) {
    return {
      left: 100,
      top: 100,
      width: 200,
      height: 200,
    };
  }

  const width = unitValueToPx(
    meta.initialSize.width,
    "width",
    "stage",
    breakpointConfig
  );

  const height = unitValueToPx(
    meta.initialSize.height,
    "height",
    "stage",
    breakpointConfig
  );

  const left =
    meta.initialPosition.x === "center"
      ? (breakpointConfig.normal.page.width - width) / 2
      : unitValueToPx(
          meta.initialPosition.x,
          "left",
          "stage",
          breakpointConfig
        );

  const top =
    meta.initialPosition.y === "center"
      ? (breakpointConfig.normal.page.height - height) / 2
      : unitValueToPx(meta.initialPosition.y, "top", "stage", breakpointConfig);

  return {
    left,
    top,
    width,
    height,
  };
}

// left: 100, //(documentSize.width - 960) / 2,
//                   top: 100, //(documentSize.height - 540) / 2,
//                   width: 960,
//                   height: 540,
