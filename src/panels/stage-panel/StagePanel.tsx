import { cloneDeep, includes, isEqual, mapValues, pick } from "lodash-es";
import { withErrorBoundary, useErrorBoundary } from "react-use-error-boundary";
import React, {
  CSSProperties,
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

import css from "./StagePanel.module.scss";
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
  calculateObjectSize,
  getAbsoluteLayoutSize,
  getAbsoluteLayoutSizeInPx,
  getAbsoluteLayoutSizeInSameUnit,
  getPositionInfo,
  getPreviewLayout,
} from "./StagePanelUtils";
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

type IStagePanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const StagePanel: React.FC<IStagePanel> = (props) => {
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
  } = props;
  //logger.app.debug("StagePanel render");

  const [customBPWidth, setCustomBPWidth] = useState<number | undefined>();

  const [error, resetError] = useErrorBoundary((error, errorInfo) => {
    logger.app.warn(error, errorInfo);
  });

  if (error) return null;

  const stageSize = breakpointConfig?.normal.maxSliderSize!;
  const pageSize = breakpointConfig?.normal.page!;

  // generate data for player
  let exportData: IPlayerData | null = null;
  let projectTimelineData: ProjectTimelineData | null = null;
  if (previewState.isPreview) {
    exportData = generatePlayerData(
      { slides, layers, objects },
      previewState.scope,
      //stageSize,
      breakpointConfig!,
      breakpoints,
      settings,
      undefined,
      { isSave: false }
    );

    //let totalDuration = 0;
    const slideTimelineDataArr: SlideTimelineData[] = exportData.slides.map(
      (slideData) => {
        return {
          duration: convertTimeUnitToMs(
            slideData.slide.duration.customValue || "0ms"
          ),
          transitionDuration: slideData.slide.transitionEnabled
            ? slideData.slide.transitionDurationTime
            : 0,
          transitionOverlap: slideData.slide.transitionEnabled
            ? slideData.slide.transitionOverlapTime
            : 0,
        };
      }
    );

    projectTimelineData = { slides: slideTimelineDataArr };
  }

  const { ctrlDown, spaceDown, escapeDown } = useKeyDown();

  const { height: windowHeight, width: windowWidth } = useWindowSize();

  // manual preview progress
  const [manualProgress, setManualProgress] = useState(0);

  const [resizeData, setResizeData] = useState<{
    objectId: string;
    handle: string;
  } | null>(null);

  // in order to recognize click on draggable element we are capturing position on start (mouseDown)
  // and on end (mouseup) we are checking if position is the same
  // this means we have "click" event
  const [dragStartPosition, setDragStartPosition] = useState({ x: -1, y: -1 });
  const [selectionStartPosition, setSelectionStartPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selRectDelta, setSelRectDelta] = useState<{
    x: number;
    y: number;
  } | null>({ x: 0, y: 0 });

  // clear all on escape
  useEffect(() => {
    if (escapeDown === true) {
      if (resizeData || selectionStartPosition) {
        setSelectionStartPosition(null);
        setResizeData(null);
        setResizeStartPosition(null);
        setResizeRect(null);
        setRerender((rerender) => rerender + 1);
      }
    }
  }, [escapeDown]);

  // TODO: fix this
  const stageToolInternal = useMemo(() => {
    setTimeout(() => {
      document.dispatchEvent(new MouseEvent("mousemove"));
    });

    // TODO: fix this
    if (spaceDown && !resizeData && !selectionStartPosition)
      return StageTools.PAN;
    else return stageTool;
  }, [stageTool, spaceDown]);

  // ref for updating selection box
  const selectionBoxRef = useRef<HTMLDivElement | null>(null);

  // ref for resizing object
  const resizingObjectRef = useRef<HTMLDivElement | null>(null);
  const resizingSelectionRef = useRef<HTMLDivElement | null>(null);

  // ref for dragable (solve errors findNode)
  const draggableNodeRef = useRef<HTMLDivElement | null>(null);

  // use form PAN tool
  const [panMove, setPanMove] = useState({
    x: 0,
    y: 0,
  });
  const [panMoveStart, setPanMoveStart] = useState({
    x: 0,
    y: 0,
  });

  // NOT: rerender is pased to "key" of root element in order ro force rerender
  const [rerender, setRerender] = useState(1);

  // Resize state
  const [resizeStartPosition, setResizeStartPosition] = useState<{
    x: number;
    y: number;
    corner: string;
  } | null>(null);
  const [resizeRect, setResizeRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const [objectByIdForDrag, setObjectByIdForDrag] = useState<{
    [id: string]: IObject<{}>;
  } | null>(null);

  const updateObjectPositionOnDrag = (
    objectId: string,
    diff: { x: number; y: number },
    update = false
  ) => {
    if (!objectByIdForDrag) return;

    if (!objectByIdForDrag[objectId].isLocked) {
      const absSizeObjInPx = getAbsoluteLayoutSizeInPx(
        objectByIdForDrag[objectId].absoluteLayout!,
        selectedDevice,
        breakpointConfig!
      );

      const absSizeObj = getAbsoluteLayoutSize(
        objectByIdLocal.current[objectId].absoluteLayout!,
        selectedDevice
      );

      const newAbsSizeObj = getAbsoluteLayoutSizeInSameUnit(
        absSizeObj,
        {
          x: absSizeObjInPx.left + diff.x,
          y: absSizeObjInPx.top + diff.y,
          w: 1,
          h: 1,
        }, // NOTE: we are not using w and h
        objectByIdLocal.current[objectId].absoluteLayout!.relativeTo,
        breakpointConfig!
      );

      absSizeObj.left = newAbsSizeObj.left!;
      absSizeObj.top = newAbsSizeObj.top!;
      //absSizeObj.width = roundNumber(absSizeObj.width!, 1);
      //absSizeObj.height = roundNumber(absSizeObj.height!, 1);
      if (update) _updateObject(cloneDeep(objectByIdLocal.current[objectId]));
    }
  };

  // 1. keep local copy in order to apply delta from draggable object
  const objectByIdLocal = useRef<typeof objectById>({});
  objectByIdLocal.current = cloneDeep(objectById);

  //2. apply only delta to selected objects only
  if (selRectDelta) {
    selectedObjectIds.forEach((objectId) => {
      if (!objectByIdLocal.current[objectId].isLocked) {
        updateObjectPositionOnDrag(
          objectId,
          { x: selRectDelta.x, y: selRectDelta.y },
          false
        );
        // const absoluteLayout = objectByIdLocal.current[objectId].absoluteLayout!;
        // const absSizeObj = getAbsoluteLayoutSizeInPx(
        //   absoluteLayout,
        //   selectedDevice,
        //   breakpointConfig!
        // );
        // absSizeObj.left! += selRectDelta.x;
        // absSizeObj.top! += selRectDelta.y;
      }
    });
  }
  const isPreview = previewState.isPreview;

  useEffect(() => {
    if (isPreview === true) {
      const el = document.querySelector(".preview-scrollable-holder");
      if (el) {
        el.scrollTop = 0;
      }
    }
  }, [isPreview]);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const stageXOffset = Math.round(
    (viewPortSize.w - stageSize.width * stageZoom) / 2 +
      panMove.x +
      panMoveStart.x
  );
  const stageYOffset = Math.round(
    (viewPortSize.h - stageSize.height * stageZoom) / 2 +
      panMove.y +
      panMoveStart.y
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
  };

  const guidelinesBorderStyle: React.CSSProperties = {
    top:
      (breakpointConfig?.normal?.guidelinesPadding?.top || 0) * stageZoom +
      "px",
    left:
      (breakpointConfig?.normal?.guidelinesPadding?.left || 0) * stageZoom +
      "px",
    width:
      (stageSize.width -
        (breakpointConfig?.normal?.guidelinesPadding?.right || 0) -
        (breakpointConfig?.normal?.guidelinesPadding?.left || 0)) *
        stageZoom +
      "px",
    height:
      (stageSize.height -
        (breakpointConfig?.normal?.guidelinesPadding?.bottom || 0) -
        (breakpointConfig?.normal?.guidelinesPadding?.top || 0)) *
        stageZoom +
      "px",
  };
  const stageBorderStyle = {
    top: 0 + "px",
    left: 0 + "px",
    width: stageSize.width * stageZoom + "px",
    height: stageSize.height * stageZoom + "px",
  };
  const pageColumnWidth =
    ((breakpointConfig?.normal?.page.width || stageSize.width) -
      stageSize.width) /
    2;

  const pageColumnHeight =
    ((breakpointConfig?.normal?.page.height || stageSize.height) -
      stageSize.height) /
    2;

  const pageBorderStyle = {
    top: -pageColumnHeight * stageZoom + "px",
    left: -pageColumnWidth * stageZoom + "px",
    width: (breakpointConfig?.normal?.page.width || 0) * stageZoom + "px",
    height: (breakpointConfig?.normal?.page.height || 0) * stageZoom + "px",
  };
  // grid
  const numOfGridHFields = breakpointConfig?.normal?.grid?.horizontal || 0;
  const totalHeight = stageSize.height; // could be page|stage|guidelines
  const oneHFieldHeight = totalHeight / numOfGridHFields;
  const horizontalGridLines: { top: number; width: number }[] = [];
  for (let i = 1; i < numOfGridHFields; i++) {
    horizontalGridLines.push({
      top: oneHFieldHeight * i * stageZoom,
      width: stageSize.width * stageZoom,
    });
  }
  const totalWidth = stageSize.width; // could be page|stage|guidelines
  const oneVFieldWidth = totalWidth / numOfGridHFields;
  const verticalGridLines: { left: number; height: number }[] = [];
  for (let i = 1; i < numOfGridHFields; i++) {
    verticalGridLines.push({
      left: oneVFieldWidth * i * stageZoom,
      height: stageSize.height * stageZoom,
    });
  }

  useEffect(() => {
    function resetAll(force = false) {
      if (force || resizeData || selectionStartPosition) {
        setSelectionStartPosition(null);
        setResizeData(null);
        setResizeStartPosition(null);
        setResizeRect(null);
        setRerender((rerender) => rerender + 1);
      }
    }

    function windowBlurHandler() {
      resetAll();
    }

    function documentMouseUpHandler() {
      resetAll();
    }

    // NOTE: if mouse pointer go outside of window
    function documentMouseOutHandler(e: any) {
      if (e.toElement == null) {
        resetAll();
      }
    }

    //function documentMouseMoveHandler(e: any) {
    //  handleStageMouseMove(e);
    //}

    (window as any).addEventListener("blur", windowBlurHandler);
    (window as any).addEventListener("mouseup", documentMouseUpHandler);
    document.addEventListener("mouseout", documentMouseOutHandler);
    //(window as any).addEventListener("mousemove", documentMouseMoveHandler);

    return () => {
      (window as any).removeEventListener("blur", windowBlurHandler);
      (window as any).removeEventListener("mouseup", documentMouseUpHandler);
      document.removeEventListener("mouseout", documentMouseOutHandler);
      //(window as any).removeEventListener(
      //  "mousemove",
      //  documentMouseMoveHandler
      //);
    };
  }, [resizeData, selectionStartPosition]);

  useEffect(() => {
    if (rootRef.current) {
      _setViewPortSize({
        w: (rootRef.current as any).clientWidth,
        h: (rootRef.current as any).clientHeight,
      });
    }
  }, [rootRef, windowWidth, windowHeight]);

  // TODO: vieport size dev is in progress
  const renderViewportSize = () => {
    return (
      <ViewportSize
        onChange={(size) => {
          // _setCustomBPSize({
          //   w: size.width,
          // });
          setCustomBPWidth(size.width);
        }}
      />
    );
  };

  const renderSlideTimelineInfo = () => {
    return (
      <SlideSmallTimeline
        onManualProgress={(progress) => setManualProgress(progress)}
      />
    );
  };

  const renderProjectTimelineInfo = () => {
    return (
      <ProjectSmallTimeline
        projectTimelineData={projectTimelineData}
        onManualProgress={(progress) => setManualProgress(progress)}
      />
    );
  };

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

      setSelectionStartPosition(null);
    } else {
      _activateObject(objectId);
      _selectObjects([objectId]);
      _selectForProperties({ type: "object", id: objectId });
    }
  };

  function renderObjectHandles(
    object: IObject,
    layoutChildren?: ILayoutChildrenValue
  ) {
    //object = objectById[object.id];
    const isAbsolutePosition = object.layout === "absolute" && !layoutChildren;
    if (!isAbsolutePosition) {
      return null;
    }

    const objectId = object.id;
    const isSelected = selectedObjectIds.indexOf(objectId) !== -1;
    if (!isSelected) return null;

    const sizeObj = getAbsoluteLayoutSizeInPx(
      object.absoluteLayout!,
      selectedDevice,
      breakpointConfig!
    );

    const topLeftStyle: any = {
      left: sizeObj.left * stageZoom - 4 + "px",
      top: sizeObj.top * stageZoom - 4 + "px",
      cursor: "nwse-resize",
    };
    const topRightStyle: any = {
      left: sizeObj.left * stageZoom - 4 + sizeObj.width! * stageZoom + "px",
      top: sizeObj.top * stageZoom - 4 + "px",
      cursor: "nesw-resize",
    };
    const bottomLeftStyle: any = {
      left: sizeObj.left * stageZoom - 4 + "px",
      top: sizeObj.top * stageZoom - 4 + sizeObj.height! * stageZoom + "px",
      cursor: "nesw-resize",
    };

    const bottomRightStyle: any = {
      left: sizeObj.left * stageZoom - 4 + sizeObj.width! * stageZoom + "px",
      top: sizeObj.top * stageZoom - 4 + sizeObj.height! * stageZoom + "px",
      cursor: "nwse-resize",
    };

    return (
      <div
        className={"RESIZE_HANDLES_HOLDER"}
        key={`handles_${object.id}${_forceRefreshRand}`}
      >
        <div
          style={topLeftStyle}
          data-resize-handle-tl={object.id}
          className={cx(css.resizeHandle, "resizeHandle")}
          onMouseDown={(e: React.MouseEvent) => {
            e.stopPropagation();
            setResizeStartPosition({ ...getMousePosition(e), corner: "tl" });
            setResizeData({ objectId: object.id, handle: "tl" });
          }}
        ></div>
        <div
          style={topRightStyle}
          data-resize-handle-tr={object.id}
          data-resize-handle="tr"
          className={cx(css.resizeHandle, "resizeHandle")}
          onMouseDown={(e: React.MouseEvent) => {
            e.stopPropagation();
            setResizeStartPosition({ ...getMousePosition(e), corner: "tr" });
            setResizeData({ objectId: object.id, handle: "tr" });
          }}
        ></div>
        <div
          style={bottomLeftStyle}
          data-resize-handle-bl={object.id}
          className={cx(css.resizeHandle, "resizeHandle")}
          onMouseDown={(e: React.MouseEvent) => {
            e.stopPropagation();
            setResizeStartPosition({ ...getMousePosition(e), corner: "bl" });
            setResizeData({ objectId: object.id, handle: "bl" });
          }}
        ></div>
        <div
          style={bottomRightStyle}
          data-resize-handle-br={object.id}
          className={cx(css.resizeHandle, "resizeHandle")}
          onMouseDown={(e: React.MouseEvent) => {
            e.stopPropagation();
            setResizeStartPosition({ ...getMousePosition(e), corner: "br" });
            setResizeData({ objectId: object.id, handle: "br" });
          }}
        ></div>
      </div>
    );
  }
  function renderLayer(layer: ILayer) {
    const disableVisibility =
      !layer.responsiveVisibility.showAll &&
      !includes(layer.responsiveVisibility.displayOn, selectedDevice);

    if (disableVisibility) {
      return null;
    }

    const isLayerActive = forceShowLayerId && forceShowLayerId === layer.id;
    const hasLayout = layer.layout !== "none";

    const layerValues = layer.definition.values;
    const calculatedLayerSize = calculateObjectSize(layer, breakpointConfig!, {
      resetPosition: false,
    });

    const layerStyle = { ...calculatedLayerSize };
    layerStyle.position = "absolute";
    //layerStyle.width = parseInt(layerStyle.width as string) * stageZoom + "px";
    //layerStyle.border = "1px solid red";

    if (layerValues.hasLayoutChildren) {
      const t = layerValues.layoutChildren.type;
      if (t === "row" || t === "column") {
        layerStyle.display = "flex";
        layerStyle.alignItems = layerValues.layoutChildren.align;
        layerStyle.justifyContent = layerValues.layoutChildren.justify;

        if (t === "row") {
          layerStyle.flexDirection = "row";
        }
        if (t === "column") {
          layerStyle.display = "flex";
          layerStyle.flexDirection = "column";
        }
      }
    }

    const layerClassName = "layer-" + layer.id;
    const t = layerValues.layoutChildren.type;
    let layerCss = "";
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
            ${t === "column" ? "margin-bottom" : "margin-right"}: ${eachValue};
        }
        `;
        }
      );
    }

    layerCss += `.${layerClassName} {
     ${addCommonPropertiesToStyle("", layer)}
     ${addTransformPropertiesToStyle("", layer)}
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
            const object = objectByIdLocal.current[objectId];
            const layoutChildren = layer.definition.values.hasLayoutChildren
              ? layer.definition.values.layoutChildren
              : undefined;
            return renderObject(object, layoutChildren);
          })}
        </div>
      </div>
    );
  }

  function renderObject(
    object: IObject,
    layoutChildren?: ILayoutChildrenValue
  ) {
    const objectId = object.id;
    const isSelected = selectedObjectIds.indexOf(objectId) !== -1;
    const isAbsolutePosition = object.layout === "absolute" && !layoutChildren;

    // thumbnail arr
    // const slidesArr = getNormalSlideArr(slides);
    // const slidesCounter = slidesArr.length;
    // const thumbnailHtmlArr = getThumbnailHtmlArr(slidesArr, layers, objects);

    const cssPosition = !layoutChildren ? "absolute" : "static";

    // *** NOTE: we are rendering different for selected and non selected object

    // 1. NON SELECTED  (NON-DRAGGABLE)

    if (!isSelected || !isAbsolutePosition) {
      //
      const calculatedObjectSize = calculateObjectSize(
        object,
        breakpointConfig!,
        {
          resetPosition: false,
        }
      );

      const objectStyle = { ...calculatedObjectSize, left: "0px", top: "0px" };
      objectStyle.position = cssPosition;
      if (object.transformDefinition?.values?.hasPerspective) {
        objectStyle.perspective = `${object.transformDefinition?.values?.transformPerspective}`;
      }

      // object holder
      const objectHolderStyle: CSSProperties = {
        zIndex: 100,
        position: "relative", //!layoutChildren ? "relative" : "static",
        left: !layoutChildren ? calculatedObjectSize.left : "0px",
        top: !layoutChildren ? calculatedObjectSize.top : "0px",
      };
      if (layoutChildren?.type === "inline") {
        objectHolderStyle.display = "inline-block";
      }

      objectHolderStyle.pointerEvents = "all";

      return (
        <div
          key={`object-${object.id}`}
          style={objectHolderStyle}
          className="NOT_isSelected_OR_NOT_isAbsolutePosition"
        >
          <div
            key={object.id + "_1"}
            dangerouslySetInnerHTML={{
              __html:
                getObjectHtml(
                  object,
                  calculatedObjectSize,
                  false,
                  false
                  // thumbnailHtmlArr,
                  // slidesCounter
                ) ||
                getObjectPlaceholder(
                  `Object '${object.type}' is not installed.<br/>Go to Library > Extensions (or My Extensions) to install missing extension.`
                ),
            }}
            style={objectStyle}
            className={cx({
              [css.notVisible]: !object.isVisible,
              [css.layoutChildrenSelected]: isSelected,
            })}
          />
          {!isSelected && (
            <div
              onClick={(event) => {
                onObjectClick(event, objectId);
              }}
              key={object.id}
              className={cx(
                css[object.type],
                "OVO_SELEKTUJE_ELEMENT_KOJI_NIJE_SELEKTOVAN"
              )}
              style={{
                ...objectStyle,
                position: "absolute",
                //left: "0px",
                //top: "0px",
              }}
            />
          )}

          {isSelected && (
            <>
              <div
                ref={resizingSelectionRef}
                key={object.id}
                className={cx(css.selection, css[object.type])}
                style={{
                  ...objectStyle,
                  position: "absolute",
                  borderWidth: 1 + "px",
                  left: "0px",
                  top: "0px",
                }}
              />

              <div className={css.selectionInfo}>
                {object.isLocked ? (
                  <div className={css.lockIconHolder}>
                    <Icon icon="lock" />
                  </div>
                ) : null}
                <div className={css.currentPosition}>
                  {getPositionInfo(object, selectedDevice)}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    // 2. SELECTED  (DRAGGABLE)

    // reset position to 0 (position gonna be set in Draggable)
    const calculatedObjectSize = calculateObjectSize(
      object,
      breakpointConfig!,
      {
        resetPosition: false,
      }
    );

    const objectStyle2 = { ...calculatedObjectSize };
    objectStyle2.position = cssPosition;
    objectStyle2.borderWidth = 1 + "px";

    if (object.transformDefinition?.values?.hasPerspective) {
      objectStyle2.perspective = `${object.transformDefinition?.values?.transformPerspective}`;
    }

    let widthAndHeightStyle = {
      width: calculatedObjectSize.width,
      height: calculatedObjectSize.height,
    };

    let widthAndHeightObject = {
      width: parseInt(calculatedObjectSize.width! as any),
      height: parseInt(calculatedObjectSize.height! as any),
    };

    /* let widthAndHeightStyle = {
      width: object.width + "px",
      height: object.height + "px",
    };

    if (object.isCoverPlacement || object.isGridPlacement) {
      widthAndHeightStyle = {
        width: objectStyle2.width as string, //page:
        height: objectStyle2.height as string, //+ "px",
      };
    }

    let widthAndHeightObject = {
      width: object.width,
      height: object.height,
    };
    if (object.isCoverPlacement || object.isGridPlacement) {
      widthAndHeightObject = {
        width: parseInt(objectStyle2.width! as any),
        height: parseInt(objectStyle2.height! as any),
      };
    }*/

    if (resizeRect && resizeData?.objectId === object.id) {
      widthAndHeightStyle.width = resizeRect.w + "px";
      widthAndHeightStyle.height = resizeRect.h + "px";
      widthAndHeightObject.width = resizeRect.w;
      widthAndHeightObject.height = resizeRect.h;
    }

    const objDraggablePos: { x: number; y: number } = { x: 0, y: 0 };

    // AKO RESUJZIJEMO OBJEKAT
    if (resizeRect && resizeData?.objectId === object.id) {
      objDraggablePos.x = resizeRect.x;
      objDraggablePos.y = resizeRect.y;
    } else {
      objDraggablePos.x = parseInt(calculatedObjectSize.left!.toString(), 10);
      objDraggablePos.y = parseInt(calculatedObjectSize.top!.toString(), 10);
    }

    // object holder
    const objectHolderStyle: CSSProperties = {
      position: "relative",
      pointerEvents: "all",
    };

    return (
      <div
        key={`draggable-object-holder${object.id}`}
        style={objectHolderStyle}
        className="draggable-object-holder"
      >
        <Draggable
          nodeRef={draggableNodeRef}
          disabled={
            stageToolInternal !== StageTools.SELECT || !isAbsolutePosition
          }
          key={objectId + "_drag"}
          position={objDraggablePos}
          // workaround to prevent move when object is locked
          grid={object.isLocked ? [10000000, 10000000] : [1, 1]}
          scale={1 * stageZoom}
          bounds={{}}
          onStart={(evt: DraggableEvent, data: DraggableData) => {
            if (stageToolInternal !== StageTools.SELECT) {
              evt.stopPropagation();
              return;
            }

            setDragStartPosition({ x: data.x, y: data.y });
            setSelectionStartPosition(null);

            setObjectByIdForDrag(cloneDeep(objectById));
          }}
          onDrag={(evt: DraggableEvent, data: DraggableData) => {
            if (stageToolInternal !== StageTools.SELECT) {
              evt.stopPropagation();
              return;
            }

            setSelectionStartPosition(null);
            // setSelRectDelta((_delta) => ({
            //   x: _delta.x + data.deltaX, // Math.round(_delta.x + data.deltaX),
            //   y: _delta.y + data.deltaY, // Math.round(_delta.y + data.deltaY),
            // }));

            const diff = {
              x: data.x - dragStartPosition.x,
              y: data.y - dragStartPosition.y,
            };

            setSelRectDelta(diff);

            // selectedObjectIds.forEach((objectId) => {
            //   updateObjectPositionOnDrag(objectId, diff, false);
            // });

            //object.left! = object.left! + data.deltaX;
            //object.top! = object.top! + data.deltaY;
          }}
          onStop={(evt: DraggableEvent, data: DraggableData) => {
            if (stageToolInternal !== StageTools.SELECT) {
              evt.stopPropagation();
              return;
            }

            // check if start end position are the same (mean object is on the same place)
            // this means we have "mouse click" event
            if (isEqual(dragStartPosition, { x: data.x, y: data.y })) {
              onObjectClick(evt as any, objectId);
            } else {
              const diff = {
                x: data.x - dragStartPosition.x,
                y: data.y - dragStartPosition.y,
              };

              // reset delta
              setSelRectDelta(null);
              // update objects
              selectedObjectIds.forEach((objectId) => {
                updateObjectPositionOnDrag(objectId, diff, true);
              });
            }

            setObjectByIdForDrag(null);
          }}
        >
          <div
            ref={draggableNodeRef}
            data-draggable-object-id={object.id}
            //onMouseUp={(e) => e.stopPropagation()}
            style={{ zIndex: 100, position: "absolute" }}
            className={cx({
              [css.notVisibleHolder]: !object.isVisible,
            })}
          >
            <div
              ref={resizingObjectRef}
              key={object.id + "_1"}
              dangerouslySetInnerHTML={{
                __html:
                  getObjectHtml(
                    { ...object, ...widthAndHeightObject },
                    { ...calculatedObjectSize },
                    false,
                    false
                    // thumbnailHtmlArr,
                    // slidesCounter
                  ) ||
                  getObjectPlaceholder(
                    `Object '${object.type}' is not installed.<br/>Go to Library > Extensions (or My Extensions) to install missing extension.`
                  ),
              }}
              style={{
                ...objectStyle2,
                ...widthAndHeightStyle,
                left: "0px",
                top: "0px",
              }}
              className={cx({
                [css.notVisible]: !object.isVisible,
              })}
            />
            <div
              ref={resizingSelectionRef}
              key={`${object.id}${_forceRefreshRand}`}
              className={cx(css.selection, css[object.type])}
              style={{ ...objectStyle2, left: "0px", top: "0px" }}
            />

            <div className={css.selectionInfo}>
              {object.isLocked ? (
                <div className={css.lockIconHolder}>
                  <Icon icon="lock" />
                </div>
              ) : null}
              <div className={css.currentPosition}>
                {getPositionInfo(object, selectedDevice)}
              </div>
            </div>
          </div>
        </Draggable>
      </div>
    );
  }

  const handleStageMouseMove = (e: any) => {
    e.persist();
    if (selectionStartPosition !== null) {
      const point = getMousePosition(e);
      if (
        stageToolInternal === StageTools.SELECT // || stageToolInternal === StageTools.DRAW
      ) {
        const rect = getRectFromPoints(selectionStartPosition, point);
        rect.x -= rootRef?.current?.offsetLeft || 0;
        //rect.y -= stageYOffset;
        applyRectValuesToElement(selectionBoxRef?.current, rect);
        if (selectionBoxRef?.current?.style) {
          selectionBoxRef.current.style.display = "block";
        }
      } else if (stageToolInternal === StageTools.PAN) {
        const panMoveNew = getPointsDiff(selectionStartPosition, point);
        setPanMove({ ...panMove, ...panMoveNew });
      }
    } else if (resizeStartPosition !== null && resizeData) {
      const point = getMousePosition(e);
      const movePoint = getPointsDiff(resizeStartPosition, point);

      const obj = objectByIdLocal.current[resizeData.objectId];
      const absSizeObj = getAbsoluteLayoutSizeInPx(
        obj.absoluteLayout!,
        selectedDevice,
        breakpointConfig!
      );
      const objectRect = {
        x: absSizeObj.left!,
        y: absSizeObj.top!,
        w: absSizeObj.width!,
        h: absSizeObj.height!,
      };
      switch (resizeData.handle) {
        case "tl": {
          movePoint.x =
            Math.min(movePoint.x, objectRect.w * stageZoom) / stageZoom;
          movePoint.y =
            Math.min(movePoint.y, objectRect.h * stageZoom) / stageZoom;

          objectRect.x += movePoint.x!;
          objectRect.y += movePoint.y!;
          objectRect.w -= movePoint.x!;
          objectRect.h -= movePoint.y!;
          break;
        }
        case "bl": {
          movePoint.x =
            Math.min(movePoint.x, objectRect.w * stageZoom) / stageZoom;
          movePoint.y =
            Math.max(movePoint.y, -objectRect.h * stageZoom) / stageZoom;

          objectRect.x += movePoint.x!;
          //objectRect.y += movePoint.y!;
          objectRect.w -= movePoint.x!;
          objectRect.h += movePoint.y!;
          break;
        }
        case "br": {
          movePoint.x =
            Math.max(movePoint.x, -objectRect.w * stageZoom) / stageZoom;
          movePoint.y =
            Math.max(movePoint.y, -objectRect.h * stageZoom) / stageZoom;
          //objectRect.x += movePoint.x!;
          //objectRect.y += movePoint.y!;
          objectRect.w += movePoint.x!;
          objectRect.h += movePoint.y!;
          break;
        }
        case "tr": {
          movePoint.x =
            Math.max(movePoint.x, -objectRect.w * stageZoom) / stageZoom;
          movePoint.y =
            Math.min(movePoint.y, objectRect.h * stageZoom) / stageZoom;
          //objectRect.x += movePoint.x!;
          objectRect.y += movePoint.y!;
          objectRect.w += movePoint.x!;
          objectRect.h -= movePoint.y!;
          break;
        }
      }

      // br handle
      const brHandle = document.querySelector(
        "[data-resize-handle-br='" + obj.id + "']"
      ) as HTMLDivElement;
      brHandle.style.left =
        objectRect.x! * stageZoom - 4 + objectRect.w! * stageZoom + "px";
      brHandle.style.top =
        objectRect.y! * stageZoom - 4 + objectRect.h! * stageZoom + "px";

      // bl handle
      const blHandle = document.querySelector(
        "[data-resize-handle-bl='" + obj.id + "']"
      ) as HTMLDivElement;
      blHandle.style.left = objectRect.x! * stageZoom - 4 + "px";
      blHandle.style.top =
        objectRect.y! * stageZoom - 4 + objectRect.h! * stageZoom + "px";

      // tl handle
      const tlHandle = document.querySelector(
        "[data-resize-handle-tl='" + obj.id + "']"
      ) as HTMLDivElement;
      tlHandle.style.left = objectRect.x! * stageZoom - 4 + "px";
      tlHandle.style.top = objectRect.y! * stageZoom - 4 + "px";

      // tr handle
      const trHandle = document.querySelector(
        "[data-resize-handle-tr='" + obj.id + "']"
      ) as HTMLDivElement;
      trHandle.style.left =
        objectRect.x! * stageZoom - 4 + objectRect.w! * stageZoom + "px";
      trHandle.style.top = objectRect.y! * stageZoom - 4 + "px";

      // position
      setResizeRect(objectRect);

      // w and h
      const el = document.querySelector(
        "[data-draggable-object-id='" + obj.id + "']"
      ) as HTMLDivElement;
      applyRectValuesToElement(
        el.childNodes[0] as any /*resizingObjectRef?.current*/,
        {
          ...pick(objectRect, "w", "h"),
          x: 0,
          y: 0,
        }
      );
      applyRectValuesToElement(
        el.childNodes[1] as any /*resizingSelectionRef?.current*/,
        {
          ...pick(objectRect, "w", "h"),
          x: 0,
          y: 0,
        }
      );
    }
  };

  const previewLayout = getPreviewLayout(
    stageZoom,
    pageColumnWidth,
    stageSize.width,
    {
      itemsColor: settings.layoutBoxBackgroundColor,
      transparentHeader: settings.transparentHeader,
    }
  );

  const scrollableDivStyle: React.CSSProperties = {
    position: "relative",
    left: -pageColumnWidth * stageZoom + "px",
    top: isPreview
      ? -previewLayout.header.height - pageColumnHeight * stageZoom
      : -pageColumnHeight * stageZoom + "px",
    width: parseInt(pageBorderStyle.width, 10) + (isPreview ? 14 : 0) + "px",
    height:
      parseInt(pageBorderStyle.height, 10) +
      (isPreview ? previewLayout.header.height : 0) +
      "px",
    overflowX: isPreview ? "hidden" : "visible",
    overflowY: isPreview ? "scroll" : "visible",
    border: isPreview ? "1px solid #545454" : "1px solid transparent",
    ...(isPreview
      ? convertRGBColor2CSSProperties(settings.pageBackgroundColor)
      : {}),
  };

  const scrollableDivInnerStyle: React.CSSProperties = {
    position: "relative",
    top: pageColumnHeight * stageZoom + "px",
    left: pageColumnWidth * stageZoom + "px",
    height: pageSize.height * stageZoom + "px",
  };

  const scrollableDivInnerSlideBackgroundStyle: React.CSSProperties = {
    position: "absolute",
    top: -pageColumnHeight * stageZoom + "px",
    left: -pageColumnWidth * stageZoom + "px",
    height: breakpointConfig?.normal?.page.height! * stageZoom + "px",
    width: breakpointConfig?.normal?.page.width! * stageZoom + "px",
    ...convertRGBColor2CSSProperties(settings.sliderBackgroundColor),
  };

  const renderResizerWithLayer = (layer: ILayer) => {
    const isLayerActive = forceShowLayerId && forceShowLayerId === layer.id;
    const hasLayout = layer.layout !== "none";

    const layerValues = layer.definition.values;
    const calculatedLayerSize = calculateObjectSize(layer, breakpointConfig!, {
      resetPosition: false,
    });

    const layerStyle = {
      ...calculatedLayerSize,
      left: parseInt(calculatedLayerSize.left as string) * stageZoom + "px",
      top: parseInt(calculatedLayerSize.top as string) * stageZoom + "px",
    };
    layerStyle.position = "absolute";

    //layerStyle.width = parseInt(layerStyle.width as string) * stageZoom + "px";
    //layerStyle.height = parseInt(layerStyle.height as string) * stageZoom + "px";

    layerStyle.width = "auto";
    layerStyle.height = "auto";

    //layerStyle.pointerEvents = "none";
    return (
      <div
        key={`layer-resizer-${layer.id}`}
        className={cx(
          css.layerMoveForResizerWTF,
          { [css.layerMoveForResizerWTFActive]: isLayerActive && hasLayout },
          "LAYER_MOVE_FOR_RESIZER"
        )}
        style={layerStyle}
      >
        {renderResizer(layer)}
      </div>
    );
  };

  const renderResizer = (layer: ILayer) => {
    const disableVisibility =
      !layer.responsiveVisibility.showAll &&
      !includes(layer.responsiveVisibility.displayOn, selectedDevice);

    if (disableVisibility) {
      return null;
    }

    return layer.objectIds.map((objectId) => {
      const layoutChildren = layer.definition.values.hasLayoutChildren
        ? layer.definition.values.layoutChildren
        : undefined;
      const object = objectByIdLocal.current[objectId];

      const calculatedObjectSize = calculateObjectSize(
        object,
        breakpointConfig!,
        {
          resetPosition: false,
        }
      );
      const sizeObj = pick(
        calculatedObjectSize,
        "left",
        "top",
        "width",
        "height"
      );

      const isSelected = selectedObjectIds.indexOf(objectId) !== -1;

      //   sizeObj.left = sizeObj.top = 0;
      const objectStyle2 = mapValues(
        sizeObj,
        (size) => `${parseInt(size!.toString()!, 10) * stageZoom}px`
      );
      (objectStyle2 as any).position = "absolute";
      (objectStyle2 as any).borderWidth = 1 + "px";

      if (resizeRect && resizeData?.objectId === object.id) {
        objectStyle2.left = resizeRect.x * stageZoom + "px";
        objectStyle2.top = resizeRect.y * stageZoom + "px";
        objectStyle2.width = resizeRect.w * stageZoom + "px";
        objectStyle2.height = resizeRect.h * stageZoom + "px";
      }

      return (
        <React.Fragment key={`object-resizer-${objectId}`}>
          {!layoutChildren && (
            <div
              ref={resizingSelectionRef}
              key={`selbox_${object.id}`}
              className={cx(css.selection, css[object.type], {
                [css.active]:
                  selectedObjectIds.length > 0 /*1*/ &&
                  selectedObjectIds.indexOf(object.id) !== -1,
                [css.selected]: isSelected,
              })}
              style={{ ...objectStyle2, pointerEvents: "none" }} // TODO 123,
            />
          )}
          {renderObjectHandles(object, layoutChildren)}
        </React.Fragment>
      );
    });
  };

  return (
    <div
      key={rerender}
      ref={rootRef}
      className={cx(css.stagePanel, {
        [css.panCursor]: stageToolInternal === StageTools.PAN,
        //[css.drawCursor]: stageToolInternal === StageTools.DRAW,
      })}
      onMouseDown={(e: React.MouseEvent) => {
        if (previewState.isPreview) return;
        e.persist();
        const target = e.target as HTMLElement;
        if (
          target?.className?.indexOf &&
          target?.className?.indexOf("resizeHandle") !== -1
        ) {
          e.stopPropagation();
          //debugger;
          setResizeStartPosition({ ...getMousePosition(e), corner: "tl" });
          return;
        }

        if (stageToolInternal === StageTools.PAN) {
          setPanMoveStart({
            x: panMoveStart.x + panMove.x,
            y: panMoveStart.y + panMove.y,
          });
          setPanMove({ x: 0, y: 0 });
        }

        //e.persist();
        //_activateObject(null);
        //_selectObjects([]);
        setSelectionStartPosition(getMousePosition(e));
      }}
      onMouseMove={(e) => {
        if (previewState.isPreview) return;
        handleStageMouseMove(e);
      }}
      onMouseUp={(e) => {
        if (previewState.isPreview) return;
        e.stopPropagation();
        if (resizeStartPosition !== null && resizeData !== null) {
          const obj = cloneDeep(objectByIdLocal.current[resizeData?.objectId!]);

          const absSizeObj = getAbsoluteLayoutSize(
            obj.absoluteLayout!,
            selectedDevice
          );

          const newAbsSizeObj = getAbsoluteLayoutSizeInSameUnit(
            absSizeObj,
            resizeRect!,
            obj.absoluteLayout!.relativeTo,
            breakpointConfig!
          );
          Object.assign(absSizeObj, newAbsSizeObj);
          // absSizeObj.left = roundNumber(resizeRect!.x!, 1) + "px";
          // absSizeObj.top = roundNumber(resizeRect!.y!, 1) + "px";
          // absSizeObj.width = roundNumber(resizeRect!.w!, 1) + "px";
          // absSizeObj.height = roundNumber(resizeRect!.h!, 1) + "px";

          _updateObject(obj);

          setResizeStartPosition(null);
          setResizeRect(null);
          setResizeData(null);
          // setRerender((rerender) => rerender + 1);
          return;
        }

        if (stageToolInternal === StageTools.PAN) {
          //setPanMoveStart(() => ({ ...panMove }));
          //setPanMove(() => ({ x: 0, y: 0 }));
          setSelectionStartPosition(null);
          return;
        }

        if (selectionStartPosition != null) {
          const point = getMousePosition(e);
          let rect = getRectFromPoints(selectionStartPosition, point);
          rect.x -= stageXOffset + (rootRef?.current?.offsetLeft || 0);
          rect.y -= stageYOffset;

          if (rect.w > 1 && rect.h > 1) {
            // if (stageToolInternal === StageTools.DRAW && stageToolObjectType) {
            //   if (activeLayerId) {
            //     const rect2 = multiplyRect(rect, 1 / stageZoom);
            //     _addNewObject(activeLayerId, stageToolObjectType, {
            //       layout: "absolute",
            //       absoluteLayout: {
            //         type: "common",
            //         perDevice: [],
            //         relativeTo: "stage",
            //         common: {
            //           deviceType: "common",
            //           left: rect2.x + "px",
            //           top: rect2.y + "px",
            //           width: rect2.w + "px",
            //           height: rect2.h + "px",
            //         },
            //       },
            //     });
            //     _resetStageTool();
            //   }
            // } else {
            _selectObjectsByRect(multiplyRect(rect, 1 / stageZoom));
            //}
          } else {
            try {
              const t1 = e.target as any;
              const t2 = t1.parentElement! as any;
              const t3 = t2.parentElement! as any;
              const t4 = t3.parentElement! as any;

              if (
                t1.className.indexOf("StagePanel_stage_") !== -1 ||
                t2.className.indexOf("StagePanel_stage_") !== -1 ||
                t3.className.indexOf("StagePanel_stage_") !== -1 ||
                t4.className.indexOf("StagePanel_stage_") !== -1 ||
                t1.className.indexOf("StagePanel_stagePanel_") !== -1 // <<< t1 === stagePanel
              ) {
                // deselect objects
                _selectObjects([]);
              }
            } catch (ex) {}
          }
        }

        setSelectionStartPosition(null);

        if (selectionBoxRef?.current?.style) {
          selectionBoxRef.current.style.display = "none";
        }
      }}
    >
      {!isPreview && (
        <div ref={selectionBoxRef} className={css.selectionBox}></div>
      )}
      {isPreview &&
        previewState.scope?.entityType === "slide" &&
        renderSlideTimelineInfo()}
      {isPreview && enableDeveloper && renderViewportSize()}
      {isPreview &&
        previewState.scope?.entityType === "project" &&
        renderProjectTimelineInfo()}
      <div style={stageStyle} className={cx("tmp-stage-selector", css.stage)}>
        <div className="preview-scrollable-holder" style={scrollableDivStyle}>
          {isPreview && previewLayout.header.component}
          <div style={scrollableDivInnerStyle}>
            <div
              className="scrollableDivInnerSlideBackground"
              style={scrollableDivInnerSlideBackgroundStyle}
            ></div>

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
              {!isPreview && layerArr?.map(renderLayer)}
            </div>

            {!isPreview && (
              <>
                {horizontalGridLines.map((item, hlIdx) => (
                  <div
                    key={`hor-lines-${hlIdx}`}
                    style={{ top: item.top + "px", width: item.width + "px" }}
                    className={cx(css.gridHorizontalLine)}
                  ></div>
                ))}
                {verticalGridLines.map((item, hlIdx) => (
                  <div
                    key={`ver-lines-${hlIdx}`}
                    style={{
                      left: item.left + "px",
                      height: item.height + "px",
                      top: "0px",
                    }}
                    className={cx(css.gridVerticalLine)}
                  ></div>
                ))}

                <div
                  style={pageBorderStyle}
                  className={cx(css.borderBase, css.pageBorder)}
                ></div>
                <div
                  style={stageBorderStyle}
                  className={cx(css.borderBase, css.stageBorder)}
                ></div>

                <div
                  style={guidelinesBorderStyle}
                  className={cx(css.borderBase, css.guidelinesBorder)}
                ></div>
              </>
            )}
            <div className="resizeHolder">
              {!isPreview && layerArr?.map(renderResizerWithLayer)}
            </div>
          </div>
          {isPreview && previewLayout.body.component}
        </div>
      </div>
    </div>
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

  const forceShowLayerId =
    selection.selectionForProperties?.type === "layer"
      ? selection.selectionForProperties?.id
      : undefined;

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
  //_setCustomBPSize: (size: { w: number; h: number }) => setCustomBPSize(size),
};

export default withErrorBoundary(
  connect(mapStateToProps, mapDispatchToProps)(StagePanel)
);
