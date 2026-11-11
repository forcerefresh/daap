import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";

export function getNewMediaObjectBounds({
  media,
  breakpointConfig,
}: {
  media: SaaSMediaData;
  breakpointConfig?: BreakpointConfiguration;
}) {
  const margin = 50;
  const bothMargins = margin * 2;

  const ratio = (media.width ?? 1) / (media.height ?? 1);

  let width = breakpointConfig?.normal.page.width! - bothMargins;
  let height = breakpointConfig?.normal.page.height! - bothMargins;
  let left = 0;
  let top = 0;

  if (ratio > 1) {
    height = height / ratio;
    left = margin;
    top =
      (breakpointConfig?.normal.page.height! - bothMargins - height) / 2 +
      margin;
  } else {
    width = width * ratio;
    top = margin;

    left =
      (breakpointConfig?.normal.page.width! - bothMargins - width) / 2 + margin;
  }

  return { left, top, width, height };
}
