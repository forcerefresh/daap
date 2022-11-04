import { ISettings } from "../reducers/i-settings";
import { BreakpointConfiguration } from "webslider-sdk2/lib/common/i-breakpoint-configuration";
import { IStage } from "../reducers/stage";

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
        ? 0.8
        : 0.95;

    zoom = mult * adjustment;
  }
  return zoom;
}
