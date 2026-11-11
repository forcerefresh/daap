import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { generatePlayerData } from "../../export/export-html";
import { AppPlayer } from "../../player/AppPlayer";
import { IPage } from "../../store/reducers/i-pages";
import { IStore } from "../../store/store";
import { connect } from "react-redux";
import { useMemo } from "react";
import { IPreviewState } from "../../store/reducers/stage";

interface IPagePreview {
  page: IPage;
  width?: number;
}

type IPagePreviewMerged = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IPagePreview;

export function PagePreviewInternal(props: IPagePreviewMerged) {
  const {
    width = 140,
    page,
    pages,
    layers,
    objects,
    breakpointConfig,
    breakpoints,
    settings,
    selectedDevice,
  } = props;

  const pageW = breakpointConfig?.normal?.page.width!;
  const pageH = breakpointConfig?.normal?.page.height!;

  const pageWH = Math.max(pageW, pageH);

  const scale = width / pageWH;

  const exportData = generatePlayerData(
    { slides: pages, layers, objects },
    { entityType: "slide", entityId: page.id },
    breakpointConfig!,
    breakpoints,
    settings,
    undefined,
    { isSave: false, isForThumbnail: true }
  );

  const previewState = useMemo(
    () =>
      ({
        previewState: "pause",
        isPreview: true,
      } as IPreviewState),
    []
  );

  return (
    <div
      style={{
        transform: "scale(" + scale + ")",
        transformOrigin: "top left",
      }}
    >
      <AppPlayer
        selectedDevice={selectedDevice}
        playerData={exportData}
        previewState={previewState}
        manualProgress={0}
        requestStop={() => {}}
      />
    </div>
  );
}

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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PagePreviewInternal);
