/* eslint-disable */
import {
  cloneDeep,
  includes,
  isEqual,
  mapValues,
  pick,
  round,
  set,
} from "lodash-es";
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
  cancelOverrideStageTool,
  activateObject,
  addNewObject,
  addObjectsToSelection,
  deactivateObject,
  overrideStageTool,
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
  setStagePan,
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
import StageLayer from "./StageLayer";
import { getObjectIdToSelect } from "../../store/actions/actions-utils";
import { getGlobalProp } from "./utils";
import { StageManagerContext } from "./StageManagerProvider";
import { StageToolEnum } from "../../utils/selection-manager/types";
import { Point } from "../../webslider-sdk/object/i-tool-class";
import StageToolsCanvas from "./StageToolsCanvas";

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
    selectionParentId,
    activeLayerId,
    viewPortSize,
    _setStageTool,
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
    _overrideStageTool,
    _cancelOverrideStageTool,
    activeStageTool,
    stagePan,
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
    _setStagePan,
  } = props;

  const stageToolCanvasRef = useRef();
  const { stageManager } = useContext(StageManagerContext);

  const { spaceDown } = useKeyDown();

  const [isLocalPan, setLocalPan] = useState(false);
  useEffect(() => {
    if (stageManager.hasCurrentToolActive()) {
      return;
    }

    if (spaceDown) {
      _overrideStageTool(StageTools.PAN);
    } else {
      if (activeStageTool !== stageTool) {
        _cancelOverrideStageTool(StageTools.PAN);
      }
    }
  }, [spaceDown]);
  // const objectByIdRef = useRef(objectById);
  // objectByIdRef.current = objectById;

  // const stageZoomRef = useRef(1);
  // stageZoomRef.current = stageZoom;
  const rootRef = useRef<HTMLDivElement | null>(null);

  const {
    activeTool,
    activateTool,
    activeObjectId: activeEditObjectId,
  } = useContext(ToolsContext);

  const stageSize = breakpointConfig?.normal.maxSliderSize!;
  // const pageSize = breakpointConfig?.normal.page!;

  // const onObjectClick = (
  //   event: React.MouseEvent<HTMLDivElement>,
  //   objectId: string
  // ) => {
  //   if (event.shiftKey) {
  //     selectedObjectIds.indexOf(objectId) === -1
  //       ? _addObjectsToSelection([objectId])
  //       : _removeObjectsFromSelection([objectId]);
  //     if (activeObjectId === objectId) {
  //       _deactivateObject(objectId);
  //     }

  //     //setSelectionStartPosition(null);
  //   } else {
  //     if (selectedObjectIds.length === 1 && selectedObjectIds[0] === objectId) {
  //       // NOTE: activate tool editor
  //       const deff = getAppObjectDefinition(objectById[objectId].type);
  //       if (deff?.meta.isEditable) {
  //         activateTool(objectById[objectId].type, objectId);
  //       }
  //     }

  //     const objectToSelectId = getObjectIdToSelect({
  //       targetId: objectId,
  //       activeObjectId,
  //       selectedObjectIds,
  //       objectById,
  //     });
  //     if (objectToSelectId) {
  //       _activateObject(objectToSelectId);
  //       _selectObjects([objectToSelectId]);
  //       _selectForProperties({ type: "object", id: objectToSelectId });
  //     }
  //   }
  // };

  const { height: windowHeight, width: windowWidth } = useWindowSize();
  useEffect(() => {
    if (rootRef.current) {
      _setViewPortSize({
        w: (rootRef.current as any).clientWidth,
        h: (rootRef.current as any).clientHeight,
      });
    }
  }, [rootRef, windowWidth, windowHeight]);

  // use form PAN tool
  // const [panMove, setPanMove] = useState({
  //   x: 0,
  //   y: 0,
  // });
  // const [panMoveStart, setPanMoveStart] = useState({
  //   x: 0,
  //   y: 0,
  // });

  const stageXOffset = Math.round(
    (viewPortSize.w - stageSize.width * stageZoom) / 2 +
      stagePan.x +
      stagePan.currentX //+
    //panMoveStart.x
  );
  const stageYOffset = Math.round(
    (viewPortSize.h - stageSize.height * stageZoom) / 2 +
      stagePan.y +
      stagePan.currentY //+
    //panMoveStart.y
  );

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

  // const [selectionStartPosition, setSelectionStartPosition] = useState<{
  //   x: number;
  //   y: number;
  // } | null>(null);

  // const [dragStartPosition, setDragStartPosition] = useState({ x: -1, y: -1 });
  // const [dragDelta, setDragDelta] = useState<{
  //   x: number;
  //   y: number;
  // } | null>({ x: 0, y: 0 });

  // const handleStageMouseMove = (e: any) => {
  //   e.persist();
  //   if (selectionStartPosition !== null) {
  //     const point = getMousePosition(e);
  //     // if (
  //     //   stageToolInternal === StageTools.SELECT // || stageToolInternal === StageTools.DRAW
  //     // ) {
  //     const rect = getRectFromPoints(selectionStartPosition, point);
  //     rect.x -= rootRef?.current?.offsetLeft || 0;
  //     //rect.y -= stageYOffset;
  //     applyRectValuesToElement(selectionBoxRef?.current, rect);
  //     if (selectionBoxRef?.current?.style) {
  //       selectionBoxRef.current.style.display = "block";
  //     }
  //     // } else if (stageToolInternal === StageTools.PAN) {
  //     //   const panMoveNew = getPointsDiff(selectionStartPosition, point);
  //     //   setPanMove({ ...panMove, ...panMoveNew });
  //     // }
  //   }
  // };

  const handleMouseWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const delta = e.deltaY * -0.01;
    let newStageZoom = stageZoom + delta;

    newStageZoom = Math.min(newStageZoom, 10);
    newStageZoom = Math.max(newStageZoom, 0.1);

    const ratio = 1 - newStageZoom / stageZoom;

    const newScale = round(newStageZoom, 2);
    stageToolCanvasRef.current.handleStageScaleChange(newScale);

    _setStageZoom(newScale);

    // x: stagePan.x + x,
    // y: stagePan.y + y,

    // _setStagePan({ x: e.clientX, y: e.clientY });

    //  stagePan.y;

    // x: pos.x + (e.clientX - pos.x) * ratio,
    // y: pos.y + (e.clientY - pos.y) * ratio,
  };

  // >>>>>> STYLE FORM // TODO: CHECK THIS
  const pageColumnWidth =
    ((breakpointConfig?.normal?.page.width || stageSize.width) -
      stageSize.width) /
    2;

  const pageColumnHeight =
    ((breakpointConfig?.normal?.page.height || stageSize.height) -
      stageSize.height) /
    2;

  // const scrollableDivInnerSlideBackgroundStyle: React.CSSProperties = {
  //   position: "absolute",
  //   top: -pageColumnHeight * stageZoom + "px",
  //   left: -pageColumnWidth * stageZoom + "px",
  //   height: breakpointConfig?.normal?.page.height! * stageZoom + "px",
  //   width: breakpointConfig?.normal?.page.width! * stageZoom + "px",
  //   ...convertRGBColor2CSSProperties(settings.sliderBackgroundColor),
  // };

  const pageBorderStyle = {
    top: -pageColumnHeight * stageZoom + "px",
    left: -pageColumnWidth * stageZoom + "px",
    width: (breakpointConfig?.normal?.page.width || 0) * stageZoom + "px",
    height: (breakpointConfig?.normal?.page.height || 0) * stageZoom + "px",
  };

  const scrollableDivStyle: React.CSSProperties = {
    position: "relative",
    left: -pageColumnWidth * stageZoom + "px",
    top: -pageColumnHeight * stageZoom + "px",
    // top: isPreview
    //   ? -previewLayout.header.height - pageColumnHeight * stageZoom
    //   : -pageColumnHeight * stageZoom + "px",
    width: parseInt(pageBorderStyle.width, 10) + "px",
    // width: parseInt(pageBorderStyle.width, 10) + (isPreview ? 14 : 0) + "px",
    height: parseInt(pageBorderStyle.height, 10) + "px",
    overflowX: "visible",
    overflowY: "visible",
    border: "1px solid transparent",

    //   height:
    //   parseInt(pageBorderStyle.height, 10) +
    //   (isPreview ? previewLayout.header.height : 0) +
    //   "px",
    // overflowX: isPreview ? "hidden" : "visible",
    // overflowY: isPreview ? "scroll" : "visible",
    // border: isPreview ? "1px solid #545454" : "1px solid transparent",
    // ...(isPreview
    //   ? convertRGBColor2CSSProperties(settings.pageBackgroundColor)
    //   : {}),
  };
  // <<<<

  return (
    <React.Fragment>
      <div
        ref={rootRef}
        className={cx(css.stagePanel, {
          [css.panCursor]: activeStageTool === StageTools.PAN,
          //[css.drawCursor]: stageToolInternal === StageTools.DRAW,
        })}
        onWheel={(e) => {
          if (stageManager.hasCurrentToolActive()) {
            return;
          }
          handleMouseWheel(e);
        }}
        onMouseDown={(e) => {
          e.persist();

          console.log("ASDASDASDS");
          if (activeStageTool === StageTools.PAN) {
            stageManager.start(StageToolEnum.PAN, {
              boundingClientRects: [], // Not needed
              mousePosition: getMousePosition(e),
              contextMatrix: new DOMMatrix(), // Not needed
              objectRotation: 0, // Not needed
              objectScale: 1, // Not needed
              objectId: "", // Not needed
              originalMouseEvent: e.nativeEvent,
            });
            return;
          }

          console.log("MOUSE UP 111");
          //setSelectionStartPosition(null);
          // select parent
          if (selectionParentId) {
            _activateObject(selectionParentId);
            _selectObjects([selectionParentId]);
            _selectForProperties({ type: "object", id: selectionParentId });
          } else {
            console.log("uncomment 2");
            _activateObject(null);
            _selectObjects([]);
          }

          // const objectId = getGlobalProp("mouseDownObjectId");
          // console.log("stage mouse down" + objectId);
        }}
        //   setDragStartPosition(getMousePosition(e));

        //   //setSelectionStartPosition(getMousePosition(e));
        // }}
        // onMouseMove={(e) => {
        // if (previewState.isPreview) return;
        // //handleStageMouseMove(e);
        // const data = getMousePosition(e);
        // const diff = {
        //   x: data.x - dragStartPosition.x,
        //   y: data.y - dragStartPosition.y,
        // };
        // //console.log(diff);
        // setDragDelta(diff);
        // }}
        // onMouseUp={() => {
        // console.log("MOUSE UP 111");
        // //setSelectionStartPosition(null);
        // // select parent
        // if (selectionParentId) {
        //   _activateObject(selectionParentId);
        //   _selectObjects([selectionParentId]);
        //   _selectForProperties({ type: "object", id: selectionParentId });
        // } else {
        //   console.log("uncomment 2");
        //   _selectObjects([]);
        //   _activateObject(null);
        // }
        // }}
        // onClick={(e) => {
        //if (getGlobalProp("rotationInProgress")) return;
        //   console.log(window.DAAP);
        //   if (window.DAAP?.rotationInProgress) {
        //     window.DAAP = window.DAAP
        //       ? { ...window.DAAP, rotationInProgress: false }
        //       : { rotationInProgress: false };
        //     return;
        //   }
        // select parent
        // if (selectionParentId) {
        //   _activateObject(selectionParentId);
        //   _selectObjects([selectionParentId]);
        //   _selectForProperties({ type: "object", id: selectionParentId });
        // } else {
        //   console.log("uncomment 2");
        //   //_selectObjects([]);
        //   //_activateObject(null);
        // }
        //alert("a");
        // }}
      >
        <div style={stageStyle} className={cx("pan-and-zoom", css.stage)}>
          <div
            className={cx(css.scrollableHolder, "preview-scrollable-holder")}
            style={scrollableDivStyle}
          >
            {/* <div> */}
            {/* <div
                className="scrollableDivInnerSlideBackground"
                style={scrollableDivInnerSlideBackgroundStyle}
              ></div> */}
            {/* class not set */}
            <div style={canvasStyle} className={css.canvas}>
              {layerArr?.map((layer) => (
                <StageLayer key={layer.id} layer={layer} />
              ))}
            </div>
            {/* class not set */}
            <div
              style={{ ...canvasStyle, transform: "scale(" + 1 + ")" }}
              className={cx("stage-tools-canvas", css.stageToolsCanvas)}
            >
              <StageToolsCanvas innerRef={stageToolCanvasRef} />
            </div>
          </div>
          {/* {isPreview && previewLayout.body.component} */}
          {/* </div> */}
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

  // TODO: later selection
  const selectionParentId =
    selection.selectionPath && selection.selectionPath.length > 1
      ? selection.selectionPath[selection.selectionPath.length - 1]
      : undefined;

  return {
    slides,
    layers,
    objects,
    stageSize: document.documentSize,
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
  _setStageTool: (tool: StageTools) => setStageTool(tool),
  _overrideStageTool: (tool: StageTools) => overrideStageTool(tool),
  _cancelOverrideStageTool: (tool: StageTools) => cancelOverrideStageTool(),
  _setViewPortSize: (size: { w: number; h: number }) => setViewPortSize(size),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _setStageZoom: (zoom: number) => setStageZoom(zoom),
  _setStagePan: (p: Point) => setStagePan(p),
  //_setCustomBPSize: (size: { w: number; h: number }) => setCustomBPSize(size),
};

export default withErrorBoundary(
  connect(mapStateToProps, mapDispatchToProps)(StagePanelNew)
);
