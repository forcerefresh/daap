import { BreakpointConfiguration, ISettings } from "../reducers/settings";
import { IStage } from "../reducers/stage";

export function getZoom(stage: IStage, settings: ISettings): number {
  const breakpointConfig: BreakpointConfiguration | undefined =
    settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig) => breakpointConfig.type === stage.selectedDevice
    );

  let zoom = stage.zoom;

  // Calculate zoom when zoomFit is true
  if (stage.zoomFit) {
    const stageSize = breakpointConfig?.normal.slide!;
    const pageSize = breakpointConfig?.normal.page!;

    const mult = Math.min(
      stage.stageViewportSize.w / pageSize.width,
      stage.stageViewportSize.h / stageSize.height
    );
    const adjustment =
      stage.stageViewportSize.w / pageSize.width >
      stage.stageViewportSize.h / stageSize.height
        ? 0.8
        : 0.95;

    zoom = mult * adjustment;
  }
  return zoom;
}
