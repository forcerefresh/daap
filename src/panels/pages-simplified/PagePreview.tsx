import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { generatePlayerData } from "../../export/export-html";
import { AppPlayer } from "../../player/AppPlayer";
import { IPage } from "../../store/reducers/i-pages";
import { IStore } from "../../store/store";
import { connect } from "react-redux";
import React, { useMemo } from "react";
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
    // previewState,
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
    //stageSize,
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
        requestStop={() => {
          // _setStagePreview({ previewState: "stop", scope: null });
        }}
      />
    </div>
  );
}

const mapStateToProps = (state: IStore) => {
  const { pages, layers, objects, selection, settings, clipboard } =
    state.project;
  const { stage } = state;

  let layerArr: ILayer[] | null = null;
  let slide: IPage | null = null;

  if (selection.activeSlideId) {
    const layerIds = pages.pageById[selection.activeSlideId].layerIds;
    layerArr = layerIds.map((layerId: string) => layers.layerById[layerId]);
    slide = pages.pageById[selection.activeSlideId];
  }

  const breakpointConfig: BreakpointConfiguration | undefined =
    settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice
    );

  // const zoom = getZoom2(
  //   stage.zoomFit,
  //   stage.stageViewportSize,
  //   breakpointConfig
  // );

  const zoom = stage.zoom; //getZoom(stage, settings);

  const forceShowLayerId =
    selection.selectionForProperties?.type === "layer"
      ? selection.selectionForProperties?.id
      : undefined;

  // let showGrid = false;
  // if (selection.selectionForProperties?.type === "layer") {
  //   showGrid =
  //     layers.layerById[selection.selectionForProperties?.id].layout === "grid";
  // }

  // TODO: later selection
  const selectionParentId =
    selection.selectionPath && selection.selectionPath.length > 1
      ? selection.selectionPath[selection.selectionPath.length - 1]
      : undefined;

  return {
    pages,
    layers,
    objects,
    // stageSize: document.documentSize,
    stageZoom: zoom,
    stagePan: stage.pan,
    previewState: stage.previewState,
    layerArr,
    slide,
    objectById: objects.objectById,
    activeObjectId: selection.activeObjectId,
    activeLayerId: selection.activeLayerId,
    selectedObjectIds: selection.selectedObjectIds,
    selectionParentId,
    stageTool: state.stage.stageTool.tool,
    activeStageTool: state.stage.activeStageTool.tool,
    stageToolObjectType: state.stage.stageTool.objectType,
    breakpointConfig,
    settings,
    viewPortSize: stage.stageViewportSize,
    forceShowLayerId,
    selectedDevice: state.stage.selectedDevice,
    breakpoints: state.project.settings.breakpoints,
    forceRefreshRand: stage.forceRefreshRand,
    enableDeveloper: state.globals.enableDeveloper,
    showGrid: state.globals.showGrid,
    clipboard,
    zoomFit: stage.zoomFit,
  };
};

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PagePreviewInternal);
