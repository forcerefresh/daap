import React from "react";
import cx from "classnames";
import css from "./BreakpointPreview.module.scss";
import { BreakpointConfiguration } from "../../../webslider-sdk/src/common/i-breakpoint-configuration";

/* width and height of preview box*/
export const PREVIEW_SIZE = 220;

export interface IBreakpointSettingsProps {
  breakpointConfiguration: BreakpointConfiguration;
  pixelMultiplier: number;
}

export const BreakpointPreview: React.FC<IBreakpointSettingsProps> = (
  props
) => {
  const { breakpointConfiguration, pixelMultiplier } = props;

  const pageW = pixelMultiplier * breakpointConfiguration.normal.page.width;
  const pageH = pixelMultiplier * breakpointConfiguration.normal.page.height;

  const slideW =
    pixelMultiplier * breakpointConfiguration.normal.maxSliderSize.width;
  const slideH =
    pixelMultiplier * breakpointConfiguration.normal.maxSliderSize.height;

  const pageStyle = {
    width: pageW + 4,
    height: pageH + 4,
    left: (PREVIEW_SIZE - pageW) / 2 - 2,
    top: (PREVIEW_SIZE - pageH) / 2 - 2,
  };

  const slideStyle = {
    width: slideW,
    height: slideH,
    left: (PREVIEW_SIZE - slideW) / 2,
    top: (PREVIEW_SIZE - slideH) / 2,
  };

  const gridW =
    slideW -
    (pixelMultiplier * breakpointConfiguration.normal.guidelinesPadding.left +
      pixelMultiplier * breakpointConfiguration.normal.guidelinesPadding.right);
  const gridH =
    slideH -
    (pixelMultiplier * breakpointConfiguration.normal.guidelinesPadding.top +
      pixelMultiplier *
        breakpointConfiguration.normal.guidelinesPadding.bottom);

  const gridStyle = {
    width: gridW - 4,
    height: gridH - 4,
    left:
      (PREVIEW_SIZE - slideW) / 2 +
      pixelMultiplier * breakpointConfiguration.normal.guidelinesPadding.left +
      2,
    top:
      (PREVIEW_SIZE - slideH) / 2 +
      pixelMultiplier * breakpointConfiguration.normal.guidelinesPadding.top +
      2,
  };

  return (
    <div className={cx(css.breakpointPreview)}>
      <div className={css.breakpointPreviewInner}>
        {/*<div className={css.label}>Preview</div>*/}
        <div className={css.breakpointPreviewInnerInner}>
          <div
            className={css.breakpointPreviewInnerPage}
            style={pageStyle}
          ></div>
          <div
            className={css.breakpointPreviewInnerSlide}
            style={slideStyle}
          ></div>
          <div
            className={css.breakpointPreviewInnerGuidelines}
            style={gridStyle}
          ></div>
        </div>
      </div>
    </div>
  );
};
