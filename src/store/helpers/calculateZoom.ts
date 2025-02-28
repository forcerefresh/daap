import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IStage } from "../reducers/stage";
import { ISettings } from "../reducers/i-settings";

export function getInitialStageTransform(
  // zoomFit: boolean,
  viewportSize: { w: number; h: number },
  breakpointConfig: BreakpointConfiguration | undefined,
  showLayerSimplifiedPanel = true,
  showPagesSimplifiedPanel = true,
  appZoom = 1
) {
  // const breakpointConfig: BreakpointConfiguration | undefined =
  //   settings.breakpoints.breakpointsConfiguration.find(
  //     (breakpointConfig) => breakpointConfig.type === stage.selectedDevice
  //   );

  let rightAdjustment = 0;
  rightAdjustment += showLayerSimplifiedPanel ? 113 : 0;
  rightAdjustment += showPagesSimplifiedPanel ? 170 : 0;

  const vWidth = viewportSize.w - rightAdjustment;
  const vHeight = viewportSize.h;

  const pageSize = breakpointConfig?.normal.page!;

  const multiplier = Math.min(
    vWidth / pageSize.width,
    vHeight / pageSize.height
  );

  // const adjustment = 0.1;
  const adjustmentMultiplier = 0.9;
  // stage.stageViewportSize.w / pageSize.width >
  // stage.stageViewportSize.h / pageSize.height
  //   ? 0.8 // 0.8
  //   : 0.95; //0.95

  const scale = multiplier * adjustmentMultiplier;

  const translateX = (vWidth - pageSize.width * scale) / 2;
  const translateY = (vHeight - pageSize.height * scale) / 2;

  return {
    scale,
    translateX,
    translateY,
  };
}

export function getZoom2(
  zoomFit: boolean,
  viewportSize: { w: number; h: number },
  breakpointConfig: BreakpointConfiguration | undefined
): number {
  // const breakpointConfig: BreakpointConfiguration | undefined =
  //   settings.breakpoints.breakpointsConfiguration.find(
  //     (breakpointConfig) => breakpointConfig.type === stage.selectedDevice
  //   );

  let zoom = 1; //stage.zoom;

  // Calculate zoom when zoomFit is true
  if (zoomFit) {
    // const stageSize = breakpointConfig?.normal.maxSliderSize!;
    const pageSize = breakpointConfig?.normal.page!;

    const multiplier = Math.min(
      viewportSize.w / pageSize.width,
      viewportSize.h / pageSize.height
    );
    const adjustment =
      viewportSize.w / pageSize.width > viewportSize.h / pageSize.height
        ? 0.8 // 0.8
        : 0.95; //0.95

    zoom = multiplier * adjustment;
  }
  return zoom;
}

export function getZoom(stage: IStage, settings: ISettings): number {
  const breakpointConfig: BreakpointConfiguration | undefined =
    settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig) => breakpointConfig.type === stage.selectedDevice
    );

  let zoom = stage.zoom;

  // Calculate zoom when zoomFit is true
  if (stage.zoomFit) {
    const stageSize = breakpointConfig?.normal.maxSliderSize!;
    const pageSize = breakpointConfig?.normal.page!;

    const mult = Math.min(
      stage.stageViewportSize.w / pageSize.width,
      stage.stageViewportSize.h / pageSize.height
    );
    const adjustment =
      stage.stageViewportSize.w / pageSize.width >
      stage.stageViewportSize.h / pageSize.height
        ? 0.8 // 0.8
        : 0.95; //0.95

    zoom = mult * adjustment;
  }
  return zoom;
}
