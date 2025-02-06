import { withErrorBoundary } from "react-use-error-boundary";

import React, { forwardRef, LegacyRef } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";

import { generatePlayerData } from "../../export/export-html";

import { AppPlayer } from "../../player/AppPlayer";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IPlayerData } from "../../export/i-export-html";
import { IPreviewState } from "../../store/reducers/stage";
import { convertRGBColor2CSSProperties } from "../utils";

type IStagePanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    previewState: IPreviewState;
    onSlideStarted?: () => void;
  };

const ExportStage: React.FC<IStagePanel> = (
  props,
  ref: LegacyRef<HTMLDivElement>
) => {
  const {
    pages,
    layers,
    objects,
    breakpointConfig,
    settings,
    selectedDevice,
    breakpoints,
    onSlideStarted,
  } = props;

  const previewState: IPreviewState = {
    isPreview: true,
    previewState: "stop", // "play"
    paused: true,
    previewSpeed: 1,
    repeat: false,
    scope: {
      entityType: "slide",
      entityId: pages.pages[0],
    },
  };

  const stageSize = breakpointConfig?.normal.maxSliderSize!;

  // generate data for player
  const exportData: IPlayerData = generatePlayerData(
    { slides: pages, layers, objects },
    previewState.scope,
    breakpointConfig!,
    breakpoints,
    settings,
    undefined,
    { isSave: false, isForThumbnail: true }
  );

  const canvasStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 1200,
    top: 0 + "px",
    left: 0 + "px",
    width: stageSize.width + "px",
    height: stageSize.height + "px",
    ...convertRGBColor2CSSProperties(settings.pageBackgroundColor),
  };

  return (
    <div style={canvasStyle} className="export-stage-div">
      <AppPlayer
        selectedDevice={selectedDevice}
        playerData={exportData}
        previewState={previewState}
        manualProgress={0}
        requestStop={() => {}}
        onSlideStarted={onSlideStarted}
      />
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { pages, layers, objects, settings } = state.project;

  const breakpointConfig: BreakpointConfiguration | undefined =
    settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice
    );

  return {
    pages,
    layers,
    objects,
    breakpointConfig,
    settings,
    selectedDevice: state.stage.selectedDevice,
    breakpoints: state.project.settings.breakpoints,
  };
};

const mapDispatchToProps = {};

export default withErrorBoundary(
  connect(mapStateToProps, mapDispatchToProps)(ExportStage)
);
