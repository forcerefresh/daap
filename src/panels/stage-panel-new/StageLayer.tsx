import React from "react";
import cx from "classnames";
import { includes } from "lodash-es";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { getZoom } from "../../store/helpers/calculateZoom";
import { IPage } from "../../store/reducers/i-pages";
import { calculateObjectSize } from "../stage-panel/StagePanelUtils";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import { addTransformPropertiesToStyle } from "webslider-sdk/lib/objects/transform-properties";
import css from "./StagePanelNew.module.scss";
import { IStore } from "../../store/store";
import { withErrorBoundary } from "react-use-error-boundary";
import { connect } from "react-redux";
import StageObject from "./StageObject";
import { ILayer } from "../../store/reducers/i-layers";

type IStageLayer = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    layer: ILayer;
  };

export function StageLayer(props: IStageLayer) {
  const {
    layer,
    selectedDevice,
    forceShowLayerId,
    breakpointConfig,
    objectById,
    stageZoom,
    forceRefreshRand,
  } = props;

  const isLayerActive = forceShowLayerId && forceShowLayerId === layer.id;
  const hasLayout = false;

  const layerValues = layer.properties ?? {};
  const calculatedLayerSize = calculateObjectSize(
    layer,
    undefined,
    breakpointConfig!,
    {
      resetPosition: false,
    }
  );

  const layerStyle = { ...calculatedLayerSize };
  layerStyle.position = "absolute";

  const layerClassName = "layer-" + layer.id;
  let layerCss = "";
  if (layerValues.hasLayoutChildren) {
    const t = layerValues.layoutChildren.type;
    if (t === "row" || t === "column") {
      layerStyle.display = "flex";
      layerStyle.alignItems = layerValues.layoutChildren.align;
      layerStyle.justifyContent = layerValues.layoutChildren.justify;
      layerStyle.flexWrap = layerValues.layoutChildren.wrap;

      if (t === "row") {
        layerStyle.flexDirection = "row";
      }
      if (t === "column") {
        layerStyle.display = "flex";
        layerStyle.flexDirection = "column";
      }
    }

    if (layerValues.layoutChildren.itemsGap.type === "common") {
      layerCss += `
          .${layerClassName} > * {
            ${t === "column" ? "margin-bottom" : "margin-right"}: ${
        layerValues.layoutChildren.itemsGap.commonValue
      };
          }
        `;
    } else {
    }
  }

  const layerHolderStyle: React.CSSProperties = {};
  if (layer.transform?.hasPerspective) {
    layerHolderStyle.perspective = `${layer.transform?.transformPerspective}`;
  }

  // NOTE: when layer has layout
  layerHolderStyle.pointerEvents = "none";

  return (
    <div key={`layer-${layer.id}`} style={layerHolderStyle}>
      <style>{layerCss}</style>
      <div
        className={cx(layerClassName, "LAYER", {
          [css.layer]: isLayerActive && hasLayout,
        })}
        style={layerStyle}
      >
        {layer.objectIds.map((objectId: string) => {
          const object = objectById[objectId]; //objectByIdLocalRef

          const layoutChildren = layer.properties?.hasLayoutChildren
            ? layer.properties.layoutChildren
            : undefined;
          return (
            <StageObject
              key={objectId}
              object={object}
              layer={layer}
              layoutChildren={layoutChildren}
              objectZoom={object.scale ?? 1}
            />
          );
        })}
      </div>
    </div>
  );
}

const mapStateToProps = (state: IStore) => {
  const { pages, layers, objects, selection, document, settings } =
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

  const zoom = getZoom(stage, settings);

  const forceShowLayerId =
    selection.selectionForProperties?.type === "layer"
      ? selection.selectionForProperties?.id
      : undefined;

  return {
    pages,
    layers,
    objects,
    stageZoom: zoom,
    previewState: stage.previewState,
    layerArr,
    slide,
    objectById: objects.objectById,
    activeObjectId: selection.activeObjectId,
    activeLayerId: selection.activeLayerId,
    selectedObjectIds: selection.selectedObjectIds,
    stageTool: state.stage.stageTool.tool,
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
  };
};

const mapDispatchToProps = {};

export default withErrorBoundary(
  connect(mapStateToProps, mapDispatchToProps)(StageLayer)
);
