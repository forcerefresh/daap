/* eslint-disable */
import { cloneDeep, includes, isEqual, mapValues, pick, set } from "lodash-es";
import { withErrorBoundary, useErrorBoundary } from "react-use-error-boundary";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";

import React, {
  CSSProperties,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Icon } from "@blueprintjs/core";
import { connect } from "react-redux";
import cx from "classnames";
import { ILayer } from "../../store/reducers/i-layers";
import { IStore } from "../../store/store";

import css from "./StagePanelNew.module.scss";
import { generatePlayerData, getObjectHtml } from "../../export/export-html";

import SlideSmallTimeline from "../slide-small-timeline/SlideSmallTimeline";
import { ISlide } from "../../store/reducers/i-slides";
import {
  activateObject,
  addNewObject,
  addObjectsToSelection,
  deactivateObject,
  removeObjectsFromSelection,
  selectForProperties,
  selectForPropertiesProps,
  selectObjects,
  selectObjectsByRect,
  setStagePreview,
  setStageTool,
  setStageZoom,
  setViewPortSize,
  updateObject,
} from "../../store/actions/actions";
import { IPreviewState, StageTools } from "../../store/reducers/stage";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { IObject, ObjectType } from "webslider-sdk/lib/objects/i-object";
import {
  applyRectValuesToElement,
  getMousePosition,
  getPointsDiff,
  getRectFromPoints,
  IRect,
  multiplyRect,
} from "../../utils/doom-utils/common";
import { useKeyDown } from "../../utils/hooks/key-down";
import { AppPlayer } from "../../player/AppPlayer";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";

import {
  convertTimeUnitToMs,
  convertRGBColor2CSSProperties,
} from "../../utils/utils";
import ProjectSmallTimeline, {
  ProjectTimelineData,
  SlideTimelineData,
} from "../project-small-timeline/ProjectSmallTimeline";
import { IPlayerData } from "../../export/i-export-html";
import { useWindowSize } from "../../utils/hooks/window-size";
import { getZoom } from "../../store/helpers/calculateZoom";
import { ILayoutChildrenValue } from "webslider-sdk/lib/inputs/i-inputs";
import ViewportSize from "../viewport-size/ViewportSize";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import { addTransformPropertiesToStyle } from "webslider-sdk/lib/objects/transform-properties";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import { ToolsContext } from "../../utils/tools/ToolsProvider";
import { getCursorStyle } from "../../objects/free-draw/free-draw-stage-tool";
import { calculateObjectSize } from "../stage-panel/StagePanelUtils";
import { WithRotationHandle } from "./WithRotationHandle";
import StageLayer from "./StageLayer";

type IStagePanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const StagePanelNew: React.FC<IStagePanel> = (props) => {
  const {
    slides,
    layers,
    objects,
    stageZoom,
    previewState,
    layerArr,
    objectById,
    activeObjectId,
    selectedObjectIds,
    activeLayerId,
    viewPortSize,
    _setStagePreview,
    _updateObject,
    _selectObjects,
    _activateObject,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _selectObjectsByRect,
    _addNewObject,
    _setViewPortSize,
    _selectForProperties,
    _resetStageTool,
    stageTool,
    stageToolObjectType,
    breakpointConfig,
    settings,
    forceShowLayerId,
    selectedDevice,
    breakpoints,
    forceRefreshRand: _forceRefreshRand, // NOTE: check this
    enableDeveloper,
    showGrid,
    _setStageZoom,
  } = props;

  const objectByIdRef = useRef(objectById);
  objectByIdRef.current = objectById;

  const stageZoomRef = useRef(1);
  stageZoomRef.current = stageZoom;

  const {
    activeTool,
    activateTool,
    activeObjectId: activeEditObjectId,
  } = useContext(ToolsContext);

  const stageSize = breakpointConfig?.normal.maxSliderSize!;
  const pageSize = breakpointConfig?.normal.page!;

  const onObjectClick = (
    event: React.MouseEvent<HTMLDivElement>,
    objectId: string
  ) => {
    if (event.ctrlKey || event.metaKey) {
      selectedObjectIds.indexOf(objectId) === -1
        ? _addObjectsToSelection([objectId])
        : _removeObjectsFromSelection([objectId]);
      if (activeObjectId === objectId) {
        _deactivateObject(objectId);
      }

      //setSelectionStartPosition(null);
    } else {
      if (selectedObjectIds.length === 1 && selectedObjectIds[0] === objectId) {
        // NOTE: activate tool editor
        const deff = getAppObjectDefinition(objectById[objectId].type);
        if (deff?.meta.isEditable) {
          activateTool(objectById[objectId].type, objectId);
        }
      }
      _activateObject(objectId);
      _selectObjects([objectId]);
      _selectForProperties({ type: "object", id: objectId });
    }
  };

  const stageXOffset = 100;
  //   Math.round(
  //     (viewPortSize.w - stageSize.width) /* * stageZoom*/ / 2 + 300
  // +
  //   panMove.x +
  //   panMoveStart.x
  //   );
  const stageYOffset = 100;
  //   Math.round(
  //     (viewPortSize.h - stageSize.height) /* * stageZoom*/ / 2 + 300
  // +
  //   panMove.y +
  //   panMoveStart.y
  //   );

  const stageStyle: React.CSSProperties = {
    top: 0 + stageYOffset + "px",
    left: 0 + stageXOffset + "px",
    width: stageSize.width * stageZoom + "px",
    height: stageSize.height * stageZoom + "px",
    overflowX: "visible", //isPreview ? "hidden" :
    overflowY: "visible", // isPreview ? "scroll" :
  };

  const canvasStyle: React.CSSProperties = {
    top: 0 + "px",
    left: 0 + "px",
    width: stageSize.width + "px",
    height: stageSize.height + "px",
    transform: "scale(" + stageZoom + ")",
    transformOrigin: "left top",
    // ...(isPreview
    //   ? { overflow: settings.hideOutsideContent ? "hidden" : "visibile" }
    //   : {}),
  };

  return (
    <React.Fragment key={stageZoom}>
      <div
        className={cx(css.stagePanel, {
          // [css.panCursor]: stageToolInternal === StageTools.PAN,
          //[css.drawCursor]: stageToolInternal === StageTools.DRAW,
        })}
      >
        <div style={stageStyle} className={cx("pan-and-zoom", css.stage)}>
          <div
            className={cx(css.scrollableHolder, "preview-scrollable-holder")}
          >
            <div>
              {/* <div
                className="scrollableDivInnerSlideBackground"
                style={scrollableDivInnerSlideBackgroundStyle}
              ></div> */}
              <div style={canvasStyle} className={css.canvas}>
                {layerArr?.map((layer) => (
                  <StageLayer key={layer.id} layer={layer} />
                ))}
              </div>
            </div>
            {/* {isPreview && previewLayout.body.component} */}
          </div>
        </div>
      </div>

      {/* Canvas for editing */}
      <div
        style={{ display: "none" }}
        className={cx(css.toolCanvas, "MainToolCanvas")}
      >
        <div
          className={"MainToolStage"}
          style={{ ...stageStyle, position: "absolute" }}
        ></div>
        {/* <svg className={css.previewSvg} width="100%" height="100%"> */}
        {/* <path
            fill="none"
            stroke="#d3d3d3"
            stroke-linejoin="round"
            stroke-linecap="round"
          ></path> */}
        {/* </svg> */}
      </div>
    </React.Fragment>
  );
};

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

const mapDispatchToProps = {
  _setStagePreview: (preview: Partial<IPreviewState>) =>
    setStagePreview(preview),
  _updateObject: (object: IObject) => updateObject(object),
  _activateObject: (objectId: string | null) => activateObject(objectId),
  _selectObjects: (objectIds: string[]) => selectObjects(objectIds),
  _addObjectsToSelection: (objectIds: string[]) =>
    addObjectsToSelection(objectIds),
  _removeObjectsFromSelection: (objectIds: string[]) =>
    removeObjectsFromSelection(objectIds),
  _deactivateObject: (objectId: string) => deactivateObject(objectId),
  _selectObjectsByRect: (rect: IRect) => selectObjectsByRect(rect),
  _addNewObject: (
    layerId: string,
    type: ObjectType,
    objectProps: Partial<IObject>
  ) => addNewObject(layerId, type, objectProps),
  _resetStageTool: () => setStageTool(StageTools.SELECT),
  _setViewPortSize: (size: { w: number; h: number }) => setViewPortSize(size),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _setStageZoom: (zoom: number) => setStageZoom(zoom),
  //_setCustomBPSize: (size: { w: number; h: number }) => setCustomBPSize(size),
};

export default withErrorBoundary(
  connect(mapStateToProps, mapDispatchToProps)(StagePanelNew)
);
