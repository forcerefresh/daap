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
import { Icon, useHotkeys } from "@blueprintjs/core";
import { connect } from "react-redux";
import cx from "classnames";
import { ILayer } from "../../store/reducers/i-layers";
import { IStore } from "../../store/store";

import css from "./StagePanelNew.module.scss";
import { generatePlayerData, getObjectHtml } from "../../export/export-html";

import SlideSmallTimeline from "../slide-small-timeline/SlideSmallTimeline";
import { IPage } from "../../store/reducers/i-pages";
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
  ungroupObject,
  groupObjects,
  duplicateObjects,
  deleteObjects,
  copyToClipboard,
  cutToClipboard,
  pasteObjectsFromClipboard,
  setZoomFit,
  forceRefresh,
} from "../../store/actions/actions";
import { IPreviewState, StageTools } from "../../store/reducers/stage";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { IObject } from "webslider-sdk/lib/objects/i-object";
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
import {
  getInitialStageTransform,
  getZoom,
  getZoom2,
} from "../../store/helpers/calculateZoom";
import { ILayoutChildrenValue } from "webslider-sdk/lib/inputs/i-inputs";
import ViewportSize from "../viewport-size/ViewportSize";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import { addTransformPropertiesToStyle } from "webslider-sdk/lib/objects/transform-properties";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import { ToolsContext } from "../../utils/tools/ToolsProvider";
// import { getCursorStyle } from "../../objects/free-draw/free-draw-stage-tool";
import { calculateObjectSize } from "../stage-panel/StagePanelUtils";
import StageLayer from "./StageLayer";
import { getObjectIdToSelect } from "../../store/actions/actions-utils";
import { getGlobalProp } from "./utils";
import { StageManagerContext } from "./StageManagerProvider";
import { StageToolEnum } from "../../utils/selection-manager/types";
import { Point } from "../../webslider-sdk/object/i-tool-class";
import StageToolsCanvas from "./StageToolsCanvas";
import { IClipboard } from "../../store/reducers/i-clipboard";
import { useZoomPan } from "./zoom-pan/useZoomPan";

type IStagePanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const StagePanelNew: React.FC<IStagePanel> = (props) => {
  const {
    pages,
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
    showSimplifiedLayerPanel,
    showSimplifiedPagesPanel,
    forceRefreshRand: _forceRefreshRand, // NOTE: check this
    _forceRefresh,
    enableDeveloper,
    showGrid,
    zoomFit,
    _setStageZoom,
    _setStagePan,
    _ungroupObject,
    _groupObjects,
    _duplicateObjects,
    _deleteObjects,
    _cutToClipboard,
    _copyToClipboard,
    _setZoomFit,
    clipboard,
    _pasteObjectsFromClipboard,
  } = props;

  const { spaceDown } = useKeyDown();

  const { setRefs, canvasTransform, setTransform, handleScaleChange } =
    useZoomPan({ spaceDown });

  useEffect(() => {
    console.log("++++++++++++++++");
    console.log(viewPortSize);
    console.log(breakpointConfig);

    const newTransform = getInitialStageTransform(
      viewPortSize,
      breakpointConfig,
      showSimplifiedLayerPanel,
      showSimplifiedPagesPanel
    );

    if (newTransform.scale > 0) {
      setTransform(newTransform);
      setZoomFit(false);
    }
  }, [viewPortSize, breakpointConfig]);

  const [customBPWidth, setCustomBPWidth] = useState<number | undefined>();
  const [manualProgress, setManualProgress] = useState(0);

  const isPreview = previewState.isPreview;

  const groupingAllowed = selectedObjectIds.length > 1;
  const ungroupingAllowed =
    selectedObjectIds.length === 1 &&
    objectById[selectedObjectIds[0]]?.type === "group";

  const hotkeys = useMemo(
    () => [
      {
        combo: "cmd + G",
        global: true,
        label: "Group or Ungroup objects",
        onKeyDown: (e: Event) => {
          e.preventDefault();
          if (groupingAllowed) {
            _groupObjects(selectedObjectIds);
          } else if (ungroupingAllowed) {
            _ungroupObject(selectedObjectIds[0]);
          }
        },
      },
      {
        combo: "cmd + D",
        global: true,
        label: "Duplicate objects",
        onKeyDown: (e: Event) => {
          e.preventDefault();
          _duplicateObjects(selectedObjectIds);
        },
      },
      {
        combo: "del",
        global: true,
        label: "Delete objects",
        onKeyDown: (e: Event) => {
          console.log(e.target);
          if ((e.target as Element).closest("input")) {
            return;
          }
          e.preventDefault();
          console.log(selectedObjectIds);

          _deleteObjects(selectedObjectIds);
        },
      },
      {
        combo: "cmd + X",
        global: true,
        label: "Cut",
        onKeyDown: () => {
          _cutToClipboard({
            entityIds: selectedObjectIds,
            entityType: "object",
          });
        },
      },
      {
        combo: "cmd + C",
        global: true,
        label: "Copy",
        onKeyDown: () => {
          _copyToClipboard({
            entityIds: selectedObjectIds,
            entityType: "object",
          });
        },
      },
      {
        combo: "cmd + V",
        global: true,
        label: "Paste",
        onKeyDown: () => {
          if (!!clipboard.entityIds && activeLayerId) {
            _pasteObjectsFromClipboard(activeLayerId);
          }
        },
      },
      {
        combo: "backspace",
        global: true,
        label: "Delete",
        onKeyDown: (e) => {
          console.log(e.target);
          if (
            (e.target as Element).closest("input") ||
            (e.target as Element).closest(".MainToolCanvas")
          ) {
            return;
          }
          if (selectedObjectIds.length > 0) {
            _deleteObjects(selectedObjectIds);
          }
        },
      },
    ],
    [
      _deleteObjects,
      _ungroupObject,
      selectedObjectIds,
      _duplicateObjects,
      _copyToClipboard,
      _cutToClipboard,
      _duplicateObjects,
      clipboard,
      activeLayerId,
    ]
  );
  const {} = useHotkeys(hotkeys);

  // const stageToolCanvasRef = useRef(); // TODO check this
  const { stageManager } = useContext(StageManagerContext);

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

  useEffect(() => {
    if (stageZoom !== canvasTransform.scale && canvasTransform.scale > 0) {
      _setStageZoom(canvasTransform.scale);
      _setZoomFit(false);
    }

    _setStagePan({
      x: canvasTransform.translateX,
      y: canvasTransform.translateY,
    });
  }, [canvasTransform]);

  useEffect(() => {
    if (stageZoom !== canvasTransform.scale) {
      handleScaleChange(stageZoom);
      // setTransform({ scale: stageZoom });
    }
  }, [stageZoom]);

  useEffect(() => {
    if (zoomFit) {
      setTransform(
        getInitialStageTransform(
          viewPortSize,
          breakpointConfig,
          showSimplifiedLayerPanel,
          showSimplifiedPagesPanel
        )
      );
      setZoomFit(false);
    }
  }, [zoomFit, viewPortSize, breakpointConfig]);

  const stagePanelElementRef = useRef<HTMLDivElement | null>(null);
  const stageElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRefs(stagePanelElementRef, stageElementRef);
  }, [stagePanelElementRef, stageElementRef]);
  const { activeTool } = useContext(ToolsContext);

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

  // -------- PLAYER >>
  // generate data for player
  let exportData: IPlayerData | null = null;
  let projectTimelineData: ProjectTimelineData | null = null;
  if (previewState.isPreview) {
    exportData = generatePlayerData(
      { slides: pages, layers, objects },
      previewState.scope,
      //stageSize,
      breakpointConfig!,
      breakpoints,
      settings,
      undefined,
      { isSave: false }
    );

    //let totalDuration = 0;
    // const slideTimelineDataArr: SlideTimelineData[] = exportData.slides.map(
    //   (slideData) => {
    //     return {
    //       duration: convertTimeUnitToMs(
    //         slideData.slide.duration.customValue || "0ms"
    //       ),
    //       transitionDuration: slideData.slide.transitionEnabled
    //         ? slideData.slide.transitionDurationTime
    //         : 0,
    //       transitionOverlap: slideData.slide.transitionEnabled
    //         ? slideData.slide.transitionOverlapTime
    //         : 0,
    //     };
    //   }
    // );

    // projectTimelineData = { slides: slideTimelineDataArr };
  }

  // -------- PLAYER <<
  const { height: windowHeight, width: windowWidth } = useWindowSize();
  useEffect(() => {
    if (stagePanelElementRef.current) {
      _setViewPortSize({
        w: (stagePanelElementRef.current as any).clientWidth,
        h: (stagePanelElementRef.current as any).clientHeight,
      });
    }
  }, [stagePanelElementRef, windowWidth, windowHeight]);

  // use form PAN tool
  // const [panMove, setPanMove] = useState({
  //   x: 0,
  //   y: 0,
  // });
  // const [panMoveStart, setPanMoveStart] = useState({
  //   x: 0,
  //   y: 0,
  // });

  // const stageXOffset = useMemo(
  //   () =>
  //     Math.round(
  //       (viewPortSize.w - stageSize.width * stageZoom) / 2 +
  //         stagePan.x +
  //         stagePan.currentX //+
  //       //panMoveStart.x
  //     ),
  //   [stageSize, viewPortSize]
  // );
  // const stageYOffset = useMemo(
  //   () =>
  //     Math.round(
  //       (viewPortSize.h - stageSize.height * stageZoom) / 2 +
  //         stagePan.y +
  //         stagePan.currentY //+
  //       //panMoveStart.y
  //     ),
  //   [stageSize, viewPortSize]
  // );

  const stageStyle: React.CSSProperties = {
    // top: 0 + stageYOffset + "px",
    // left: 0 + stageXOffset + "px",
    // width: stageSize.width * stageZoom + "px",
    // height: stageSize.height * stageZoom + "px",
    // transform: "scale(" + stageZoom + ")",
    // transformOrigin: "left top",

    overflowX: "visible", //isPreview ? "hidden" :
    overflowY: "visible", // isPreview ? "scroll" :
  };

  const canvasStyle: React.CSSProperties = {
    top: 0 + "px",
    left: 0 + "px",
    width: stageSize.width + "px",
    height: stageSize.height + "px",
    ...convertRGBColor2CSSProperties(settings.pageBackgroundColor),

    // transform: "scale(" + stageZoom + ")",
    // transformOrigin: "left top",
    // ...(isPreview
    //   ? { overflow: settings.hideOutsideContent ? "hidden" : "visibile" }
    //   : {}),
  };
  // const toolsCanvasStyle = { ...canvasStyle };

  if (showGrid) {
    // const gridStrokeWidth = Math.max(0.5 / stageZoom);
    const gridStrokeWidth = `calc(0.5px/var(--scale))`;

    // const gridColor = "rgba(125, 125, 125, 0.1)";
    // const gridLineWeight = `calc(2px/var(--scale))`;

    // canvasStyle.willChange = "background";

    // canvasStyle.backgroundImage = `linear-gradient(${gridColor} ${gridLineWeight}, transparent ${gridLineWeight}), linear-gradient(90deg, ${gridColor} ${gridLineWeight}, transparent ${gridLineWeight}), linear-gradient(rgba(150, 150, 150, .3) ${gridLineWeight}, transparent ${gridLineWeight}), linear-gradient(90deg, rgba(150, 150, 150, .3) ${gridLineWeight}, transparent ${gridLineWeight})`;
    // canvasStyle.backgroundSize =
    //   "100px 100px, 100px 100px, 20px 20px, 20px 20px";
    // canvasStyle.backgroundPosition =
    //   "-2px -2px, -2px -2px, -1px -1px, -1px -1px";

    //   canvasStyle.backgroundImage = `
    // linear-gradient(rgba(125, 125, 125, 0.1 ) ${gridStrokeWidth}, transparent ${gridStrokeWidth}),
    // linear-gradient(90deg, rgba(125, 125, 125, 0.1) ${gridStrokeWidth}, transparent ${gridStrokeWidth}),
    // linear-gradient(rgba(125, 125, 125, 0.15) ${gridStrokeWidth}, transparent ${gridStrokeWidth}),
    // linear-gradient(90deg, rgba(125, 125, 125, 0.15) ${gridStrokeWidth}, transparent ${gridStrokeWidth})
    // `;

    //   if (stageZoom < 1) {
    //     canvasStyle.backgroundSize =
    //       "100px 100px, 100px 100px, 50px 50px, 50px 50px";
    //   } else if (stageZoom > 5) {
    //     canvasStyle.backgroundSize = "10px 10px, 10px 10px, 1px 1px, 1px 1px";
    //   } else {
    //     canvasStyle.backgroundSize =
    //       "100px 100px, 100px 100px, 10px 10px, 10px 10px";
    //   }
  }
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
    // stageToolCanvasRef.current.handleStageScaleChange(newScale);

    _setStageZoom(newScale);
    if (zoomFit) _setZoomFit(false);

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

  // const pageBorderStyle = {
  //   top: -pageColumnHeight * stageZoom + "px",
  //   left: -pageColumnWidth * stageZoom + "px",
  //   width: (breakpointConfig?.normal?.page.width || 0) * stageZoom + "px",
  //   height: (breakpointConfig?.normal?.page.height || 0) * stageZoom + "px",
  // };

  const scrollableDivStyle: React.CSSProperties = {
    position: "relative",
    // left: -pageColumnWidth * stageZoom - 55 + "px",
    // top: -pageColumnHeight * stageZoom + "px",
    // top: isPreview
    //   ? -previewLayout.header.height - pageColumnHeight * stageZoom
    //   : -pageColumnHeight * stageZoom + "px",

    // width: parseInt(pageBorderStyle.width, 10) + (isPreview ? 14 : 0) + "px",
    // width: parseInt(pageBorderStyle.width, 10) + "px",
    // height: parseInt(pageBorderStyle.height, 10) + "px",

    width: (breakpointConfig?.normal?.page.width || 0) + "px",
    height: (breakpointConfig?.normal?.page.height || 0) + "px",
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

  const toolsCanvasStyle = {
    // left: -pageColumnWidth * stageZoom - 55 + "px",
    // top: -pageColumnHeight * stageZoom + "px",
  };
  // <<<<

  return (
    <React.Fragment>
      <div
        ref={stagePanelElementRef}
        className={cx("StagePanel", css.stagePanel, {
          [css.panCursor]: activeStageTool === StageTools.PAN,
          //[css.drawCursor]: stageToolInternal === StageTools.DRAW,
        })}
        // style={{ background: "green" }}
        onWheelCapture={(e) => {
          // if (stageManager.hasCurrentToolActive()) {
          //   return;
          // }
          // handleMouseWheel(e);
        }}
        onMouseDown={(e) => {
          if (e.buttons !== 1) {
            return;
          }

          if (activeTool) {
            return;
          }

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
              handle: "", // TODO
            });
            return;
          }

          console.log("MOUSE UP 111");
          //setSelectionStartPosition(null);
          // select parent
          if (selectionParentId) {
            if (activeObjectId !== selectionParentId) {
              _activateObject(selectionParentId);
              _selectObjects([selectionParentId]);
              _selectForProperties({ type: "object", id: selectionParentId });
            }
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
        <div
          ref={stageElementRef}
          style={stageStyle}
          className={cx("pan-and-zoom", css.stage)}
        >
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
              {isPreview && (
                <AppPlayer
                  selectedDevice={selectedDevice}
                  customBPWidth={customBPWidth}
                  playerData={exportData}
                  previewState={previewState}
                  manualProgress={manualProgress}
                  requestStop={() => {
                    _setStagePreview({ previewState: "stop", scope: null });
                  }}
                />
              )}

              {!isPreview &&
                layerArr?.map((layer) => (
                  <StageLayer key={layer.id} layer={layer} />
                ))}
            </div>
            {/* class not set */}
            <div
              style={{ ...toolsCanvasStyle, transform: "scale(" + 1 + ")" }}
              className={cx("stage-tools-canvas", css.stageToolsCanvas)}
            >
              <StageToolsCanvas />
              {/* //innerRef={stageToolCanvasRef} */}
            </div>
          </div>

          {/* -- */}
          {/* Canvas for editing */}
          <div
            style={{ ...toolsCanvasStyle, display: "none" }}
            className={cx(css.toolCanvas, "MainToolCanvas")}
            // onMouseDown={(e) => e.stopPropagation()}
          >
            <div
              className={"MainToolStage"}
              // style={{ ...stageStyle, position: "absolute" }}
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
          {/* -- */}

          {/* {isPreview && previewLayout.body.component} */}
          {/* </div> */}
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state: IStore) => {
  const { pages, layers, objects, selection, document, settings, clipboard } =
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
    showSimplifiedLayerPanel: stage.showSimplifiedLayerPanel,
    showSimplifiedPagesPanel: stage.showSimplifiedPagesPanel,
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
    type: string,
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
  _ungroupObject: (groupId: string) => ungroupObject(groupId),
  _groupObjects: (objectIds: string[]) => groupObjects(objectIds),
  _duplicateObjects: (ids: string[]): any => duplicateObjects(ids),
  _deleteObjects: (ids: string[]): any => deleteObjects(ids),
  _cutToClipboard: (
    payload: Pick<IClipboard, "entityType" | "entityIds">
  ): any => cutToClipboard(payload),
  _copyToClipboard: (
    payload: Pick<IClipboard, "entityType" | "entityIds">
  ): any => copyToClipboard(payload),

  _pasteObjectsFromClipboard: (toLayerId: string): any =>
    pasteObjectsFromClipboard(toLayerId),

  _setZoomFit: (fit: boolean) => setZoomFit(fit),
  _forceRefresh: () => forceRefresh(),
  //_setCustomBPSize: (size: { w: number; h: number }) => setCustomBPSize(size),
};

export default withErrorBoundary(
  connect(mapStateToProps, mapDispatchToProps)(StagePanelNew)
);
