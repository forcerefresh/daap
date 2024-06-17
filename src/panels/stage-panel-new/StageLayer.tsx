import React from "react";
import cx from "classnames";
import { includes } from "lodash-es";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { ILayer } from "webslider-sdk/lib/objects/i-object";
import { getZoom } from "../../store/helpers/calculateZoom";
import { ISlide } from "../../store/reducers/i-slides";
import { calculateObjectSize } from "../stage-panel/StagePanelUtils";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import { addTransformPropertiesToStyle } from "webslider-sdk/lib/objects/transform-properties";
import css from "./StagePanelNew.module.scss";
import { IStore } from "../../store/store";
import { withErrorBoundary } from "react-use-error-boundary";
import { connect } from "react-redux";
import StageObject from "./StageObject";

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
  } = props;

  //console.log("RERENDER LAYER");
  const disableVisibility =
    !layer.responsiveVisibility.showAll &&
    !includes(layer.responsiveVisibility.displayOn, selectedDevice);

  if (disableVisibility) {
    return null;
  }

  const isLayerActive = forceShowLayerId && forceShowLayerId === layer.id;
  const hasLayout = layer.layout !== "none";

  const layerValues = layer.definition.values;
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
  //layerStyle.width = parseInt(layerStyle.width as string) * stageZoom + "px";
  //layerStyle.border = "1px solid red";

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
      layerValues.layoutChildren.itemsGap.eachValues.forEach(
        (eachValue, idx) => {
          layerCss += `.${layerClassName} > *:nth-child(${idx + 1}) {
                ${
                  t === "column" ? "margin-bottom" : "margin-right"
                }: ${eachValue};
            }
            `;
        }
      );
    }
  }

  layerCss += `.${layerClassName} {
         ${addCommonPropertiesToStyle("", layer, breakpointConfig?.type)}
         ${addTransformPropertiesToStyle("", layer, breakpointConfig?.type)}
         z-index: 100;
        }`;

  const layerHolderStyle: React.CSSProperties = {};
  if (layer.transformDefinition?.values?.hasPerspective) {
    layerHolderStyle.perspective = `${layer.transformDefinition?.values?.transformPerspective}`;
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
        {layer.objectIds.map((objectId) => {
          const object = objectById[objectId]; //objectByIdLocalRef
          //console.log(object?.absoluteLayout?.common?.left);

          const layoutChildren = layer.definition.values.hasLayoutChildren
            ? layer.definition.values.layoutChildren
            : undefined;
          return (
            <StageObject
              key={objectId}
              object={object}
              layer={layer}
              layoutChildren={layoutChildren}
              objectZoom={object.scale}
              // stageZoom={stageZoom}
            />
          );
        })}
      </div>
    </div>
  );
}

const mapStateToProps = (state: IStore) => {
  const { slides, layers, objects, selection, document, settings } =
    state.project;
  const { stage } = state;

  let layerArr: ILayer[] | null = null;
  let slide: ISlide | null = null;

  if (selection.activeSlideId) {
    const layerIds = slides.slideById[selection.activeSlideId].layerIds;
    layerArr = layerIds.map((layerId: string) => layers.layerById[layerId]);
    slide = slides.slideById[selection.activeSlideId];
  }

  const breakpointConfig: BreakpointConfiguration | undefined =
    settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice
    );

  const zoom = getZoom(stage, settings);

  ////console.log(zoom);
  const forceShowLayerId =
    selection.selectionForProperties?.type === "layer"
      ? selection.selectionForProperties?.id
      : undefined;

  // let showGrid = false;
  // if (selection.selectionForProperties?.type === "layer") {
  //   showGrid =
  //     layers.layerById[selection.selectionForProperties?.id].layout === "grid";
  // }

  return {
    slides,
    layers,
    objects,
    stageSize: document.documentSize,
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
