import { cloneDeep, isEmpty, isEqual, mapValues, pick } from "lodash-es";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@blueprintjs/core";

import { connect } from "react-redux";
import cx from "classnames";
import { ILayer } from "../../store/reducers/layers";
import { IStore } from "../../store/store";

import css from "./StagePanel.module.scss";
import {
  generatePlayerData,
  getObjectHtml,
  IPlayerData,
} from "../../export/export-html";

import gsap from "gsap"; // TODO: remove player from here
import SmallTimeline from "../small-timeline/SmallTimeline";
import { ISlide } from "../../store/reducers/slides";
import {
  activateObject,
  addNewObject,
  addObjectsToSelection,
  deactivateObject,
  removeObjectsFromSelection,
  selectObjects,
  selectObjectsByRect,
  setStagePreview,
  setStageTool,
  updateObject,
} from "../../store/actions/actions";
import { IPreviewState, StageTools } from "../../store/reducers/stage";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { IObject, ObjectType } from "../../objects/types";
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
import { BreakpointConfiguration } from "../../store/reducers/settings";
import {
  calculateObjectSize,
  getPositionInfo,
  getPreviewLayout,
} from "./StagePanelUtils";

interface ISize {
  width: number;
  height: number;
}

type IStagePanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const StagePanel: React.FC<IStagePanel> = (props) => {
  const {
    slides,
    layers,
    objects,
    stageZoom,
    previewState,
    //exportData,
    layerArr,
    objectById,
    activeObjectId,
    selectedObjectIds,
    activeLayerId,
    _setStagePreview,
    _updateObject,
    _selectObjects,
    _activateObject,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _selectObjectsByRect,
    _addNewObject,
    stageTool,
    stageToolObjectType,
    _resetStageTool,
    breakpointConfig,
  } = props;

  const stageSize = breakpointConfig?.normal.slide!;

  // generate data for player
  let exportData: IPlayerData | null = null;
  if (previewState.isPreview) {
    exportData = generatePlayerData(
      { slides, layers, objects },
      previewState.scope,
      //stageSize,
      breakpointConfig!
    );
  }

  const { ctrlDown, spaceDown, escapeDown } = useKeyDown();

  // preview progress
  const [progress, setProgress] = useState(0);
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
  const [selRectDelta, setSelRectDelta] = useState({ x: 0, y: 0 });

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

  // 1. keep local copy in order to apply delta from draggable object
  const objectByIdLocal = cloneDeep(objectById);
  // 2. apply only delta to selected objects only
  selectedObjectIds.forEach((objectId) => {
    if (!objectByIdLocal[objectId].isLocked) {
      objectByIdLocal[objectId].left! += selRectDelta.x;
      objectByIdLocal[objectId].top! += selRectDelta.y;
    }
  });

  const isPreview = previewState.isPreview;

  useEffect(() => {
    if (isPreview === true) {
      const el = document.querySelector(".preview-scrollable-holder");
      if (el) {
        el.scrollTop = 0;
      }
    }
  }, [isPreview]);

  // size of visible panel area
  const [viewPortSize, setViewPortSize] = useState<ISize>({
    width: 0,
    height: 0,
  });

  const rootRef = useRef(null);

  const stageXOffset = Math.round(
    (viewPortSize.width - stageSize.width * stageZoom) / 2 +
      panMove.x +
      panMoveStart.x
  );
  const stageYOffset = Math.round(
    (viewPortSize.height - stageSize.height * stageZoom) / 2 +
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
  const pageBorderStyle = {
    top: 0 + "px",
    left: -pageColumnWidth * stageZoom + "px",
    width: (breakpointConfig?.normal?.page.width || 0) * stageZoom + "px",
    height: stageSize.height * stageZoom + "px",
  };

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
      setViewPortSize({
        width: (rootRef.current as any).clientWidth,
        height: (rootRef.current as any).clientHeight,
      });
    }
  }, [rootRef]);

  const renderTimeInfo = () => {
    return (
      <SmallTimeline
        progress={progress}
        onManualProgress={(progress) => setManualProgress(progress)}
      />
    );
  };

  const onObjectClick = (
    event: React.MouseEvent<HTMLDivElement>,
    objectId: string
  ) => {
    if (event.ctrlKey) {
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
    }
  };

  function renderObjectHandles(object: IObject) {
    const objectId = object.id;
    const isSelected = selectedObjectIds.indexOf(objectId) !== -1;
    if (!isSelected) return null;

    const sizeObj = pick(object, "left", "top", "width", "height");
    const topLeftStyle: any = {
      left: sizeObj.left! * stageZoom - 4 + "px",
      top: sizeObj.top! * stageZoom - 4 + "px",
      cursor: "nwse-resize",
    };
    const topRightStyle: any = {
      left: sizeObj.left! * stageZoom - 4 + sizeObj.width! * stageZoom + "px",
      top: sizeObj.top! * stageZoom - 4 + "px",
      cursor: "nesw-resize",
    };
    const bottomLeftStyle: any = {
      left: sizeObj.left! * stageZoom - 4 + "px",
      top: sizeObj.top! * stageZoom - 4 + sizeObj.height! * stageZoom + "px",
      cursor: "nesw-resize",
    };
    const bottomRightStyle: any = {
      left: sizeObj.left! * stageZoom - 4 + sizeObj.width! * stageZoom + "px",
      top: sizeObj.top! * stageZoom - 4 + sizeObj.height! * stageZoom + "px",
      cursor: "nwse-resize",
    };

    return (
      <React.Fragment key={`handles_${object.id}`}>
        <div
          style={topLeftStyle}
          data-resize-handle-tl={object.id}
          className={cx(css.resizeHandle, "resizeHandle")}
          onMouseDown={(e: React.MouseEvent) => {
            setResizeData({ objectId: object.id, handle: "tl" });
          }}
        ></div>
        <div
          style={topRightStyle}
          data-resize-handle-tr={object.id}
          data-resize-handle="tr"
          className={cx(css.resizeHandle, "resizeHandle")}
          onMouseDown={(e: React.MouseEvent) => {
            setResizeData({ objectId: object.id, handle: "tr" });
          }}
        ></div>
        <div
          style={bottomLeftStyle}
          data-resize-handle-bl={object.id}
          className={cx(css.resizeHandle, "resizeHandle")}
          onMouseDown={(e: React.MouseEvent) => {
            setResizeData({ objectId: object.id, handle: "bl" });
          }}
        ></div>
        <div
          style={bottomRightStyle}
          data-resize-handle-br={object.id}
          className={cx(css.resizeHandle, "resizeHandle")}
          onMouseDown={(e: React.MouseEvent) => {
            setResizeData({ objectId: object.id, handle: "br" });
          }}
        ></div>
      </React.Fragment>
    );
  }
  function renderObject(object: IObject) {
    const objectId = object.id;
    const isSelected = selectedObjectIds.indexOf(objectId) !== -1;

    // *** NOTE: we are rendering different for selected and non selected object

    // 1. NON SELECTED  (NON-DRAGGABLE)

    if (!isSelected) {
      //
      const objectStyle = calculateObjectSize(object, breakpointConfig!, {
        resetPosition: false,
      });

      console.log(objectStyle);

      (objectStyle as any).position = "absolute";
      return (
        <div style={{ zIndex: 100, position: "absolute" }}>
          <div
            key={object.id + "_1"}
            dangerouslySetInnerHTML={{
              __html: getObjectHtml(object, false),
            }}
            style={objectStyle}
            className={cx({
              [css.notVisible]: !object.isVisible,
            })}
          />
          <div
            onClick={(event) => {
              onObjectClick(event, objectId);
            }}
            key={object.id}
            className={cx(css[object.type])}
            style={objectStyle}
          />
        </div>
      );
    }

    // 2. SELECTED  (DRAGGABLE)

    // reset position to 0 (position gonna be set in Draggable)
    const objectStyle2 = calculateObjectSize(object, breakpointConfig!, {
      resetPosition: true,
    });

    objectStyle2.position = "absolute";
    objectStyle2.borderWidth = 1 + "px";

    let widthAndHeightStyle = {
      width: object.width + "px",
      height: object.height + "px",
    };

    if (object.hasNoPosition) {
      widthAndHeightStyle = {
        width: objectStyle2.width as string, //page:
        height: objectStyle2.height as string, //+ "px",
      };
    }

    let widthAndHeightObject = {
      width: object.width,
      height: object.height,
    };
    if (object.hasNoPosition) {
      widthAndHeightObject = {
        width: parseInt(objectStyle2.width! as any),
        height: parseInt(objectStyle2.height! as any),
      };
    }

    if (resizeRect && resizeData?.objectId === object.id) {
      widthAndHeightStyle.width = resizeRect.w + "px";
      widthAndHeightStyle.height = resizeRect.h + "px";
      widthAndHeightObject.width = resizeRect.w;
      widthAndHeightObject.height = resizeRect.h;
    }

    return (
      <Draggable
        disabled={
          stageToolInternal !== StageTools.SELECT || object.hasNoPosition
        }
        key={objectId + "_drag"}
        position={
          resizeRect && resizeData?.objectId === object.id
            ? resizeRect
            : { x: object.left!, y: object.top! }
        }
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
        }}
        onDrag={(evt: DraggableEvent, data: DraggableData) => {
          if (stageToolInternal !== StageTools.SELECT) {
            evt.stopPropagation();
            return;
          }

          setSelectionStartPosition(null);
          setSelRectDelta((_delta) => ({
            x: _delta.x + data.deltaX, // Math.round(_delta.x + data.deltaX),
            y: _delta.y + data.deltaY, // Math.round(_delta.y + data.deltaY),
          }));
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
            // reset delta
            setSelRectDelta({ x: 0, y: 0 });
            // update objects
            selectedObjectIds.forEach((objectId) => {
              if (!objectByIdLocal[objectId].isLocked) {
                _updateObject(objectByIdLocal[objectId]);
              }
            });
          }
        }}
      >
        <div
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
              __html: getObjectHtml(
                { ...object, ...widthAndHeightObject },
                false
              ),
            }}
            style={{ ...objectStyle2, ...widthAndHeightStyle }}
            className={cx({
              [css.notVisible]: !object.isVisible,
            })}
          />
          <div
            ref={resizingSelectionRef}
            key={object.id}
            className={cx(css.selection, css[object.type])}
            style={objectStyle2}
          />

          <div className={css.selectionInfo}>
            {object.isLocked ? (
              <div className={css.lockIconHolder}>
                <Icon icon="lock" />
              </div>
            ) : null}
            <div className={css.currentPosition}>{getPositionInfo(object)}</div>
          </div>
        </div>
      </Draggable>
    );
  }

  const handleStageMouseMove = (e: any) => {
    e.persist();
    if (selectionStartPosition !== null) {
      const point = getMousePosition(e);
      if (
        stageToolInternal === StageTools.SELECT ||
        stageToolInternal === StageTools.DRAW
      ) {
        const rect = getRectFromPoints(selectionStartPosition, point);
        // console.log(rect);
        //rect.x -= stageXOffset;
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

      const obj = objectById[resizeData.objectId];
      const objectRect = {
        x: obj.left!,
        y: obj.top!,
        w: obj.width!,
        h: obj.height!,
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

  const previewLayout = getPreviewLayout(stageZoom);

  const scrollableDivStyle: React.CSSProperties = {
    position: "relative",
    left: -pageColumnWidth + "px",
    top: isPreview ? -previewLayout.header.height : 0 + "px",
    width: parseInt(pageBorderStyle.width, 10) + 14 + "px",
    height:
      parseInt(pageBorderStyle.height, 10) +
      (isPreview ? previewLayout.header.height : 0) +
      "px",
    overflowX: isPreview ? "hidden" : "visible",
    overflowY: isPreview ? "scroll" : "visible",
    border: isPreview ? "1px solid #545454" : "1px solid transparent",
  };

  const scrollableDivInnerStyle: React.CSSProperties = {
    position: "relative",
    left: pageColumnWidth * stageZoom + "px",
    height: stageSize.height * stageZoom + "px",
  };

  return (
    <div
      key={rerender}
      ref={rootRef}
      className={cx(css.stagePanel, {
        [css.panCursor]: stageToolInternal === StageTools.PAN,
        [css.drawCursor]: stageToolInternal === StageTools.DRAW,
      })}
      onWheel={console.log}
      onMouseDown={(e: React.MouseEvent) => {
        e.persist();
        const target = e.target as HTMLElement;
        if (
          target?.className?.indexOf &&
          target?.className?.indexOf("resizeHandle") !== -1
        ) {
          e.stopPropagation();
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
        handleStageMouseMove(e);
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
        if (resizeStartPosition !== null && resizeData !== null) {
          const obj = { ...objectById[resizeData?.objectId!] };
          obj.left! = resizeRect?.x!;
          obj.top! = resizeRect?.y!;
          obj.width! = resizeRect?.w!;
          obj.height! = resizeRect?.h!;

          _updateObject(obj);

          setResizeStartPosition(null);
          setResizeRect(null);
          setResizeData(null);
          // setRerender((rerender) => rerender + 1);
          return;
        }

        if (stageToolInternal === StageTools.PAN) {
          //console.log({ ...panMoveStart });

          //setPanMoveStart(() => ({ ...panMove }));
          //setPanMove(() => ({ x: 0, y: 0 }));
          setSelectionStartPosition(null);
          return;
        }

        if (selectionStartPosition != null) {
          const point = getMousePosition(e);
          let rect = getRectFromPoints(selectionStartPosition, point);
          rect.x -= stageXOffset;
          rect.y -= stageYOffset;

          if (rect.w > 1 && rect.h > 1) {
            if (stageToolInternal === StageTools.DRAW && stageToolObjectType) {
              if (activeLayerId) {
                const rect2 = multiplyRect(rect, 1 / stageZoom);
                _addNewObject(activeLayerId, stageToolObjectType, {
                  left: rect2.x,
                  top: rect2.y,
                  width: rect2.w,
                  height: rect2.h,
                });
                _resetStageTool();
              }
            } else {
              _selectObjectsByRect(multiplyRect(rect, 1 / stageZoom));
            }
          } else {
            try {
              const t1 = e.target as any;
              const t2 = t1.parentElement! as any;
              const t3 = t2.parentElement! as any;
              if (
                t1.className.indexOf("StagePanel_stagePanel_") !== -1 ||
                t2.className.indexOf("StagePanel_stagePanel_") !== -1 ||
                t3.className.indexOf("StagePanel_stagePanel_") !== -1
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
      {isPreview && renderTimeInfo()}
      <div style={stageStyle} className={cx("tmp-stage-selector", css.stage)}>
        <div className="preview-scrollable-holder" style={scrollableDivStyle}>
          {isPreview && previewLayout.header.component}
          <div style={scrollableDivInnerStyle}>
            <div style={canvasStyle} className={css.canvas}>
              {isPreview && (
                <AppPlayer
                  playerData={exportData}
                  previewState={previewState}
                  manualProgress={manualProgress}
                  onProgress={(progress: number) => {
                    setProgress(progress);
                  }}
                  requestStop={() => {
                    _setStagePreview({ previewState: "stop", scope: null });
                  }}
                />
              )}
              {!isPreview &&
                layerArr?.map((layer) => {
                  return layer.objectIds.map((objectId) => {
                    const object = objectByIdLocal[objectId];
                    return renderObject(object);
                  });
                })}
            </div>
            <div className="resizeHolder">
              {!isPreview &&
                layerArr?.map((layer) => {
                  return layer.objectIds.map((objectId) => {
                    const object = objectByIdLocal[objectId];
                    if (object.hasNoPosition) {
                      return null;
                    }

                    const sizeObj = pick(
                      object,
                      "left",
                      "top",
                      "width",
                      "height"
                    );
                    const isSelected =
                      selectedObjectIds.indexOf(objectId) !== -1;

                    //   sizeObj.left = sizeObj.top = 0;
                    const objectStyle2 = mapValues(
                      sizeObj,
                      (size) => `${size! * stageZoom}px`
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
                      <>
                        <div
                          ref={resizingSelectionRef}
                          key={`selbox_${object.id}`}
                          className={cx(css.selection, css[object.type], {
                            [css.active]:
                              selectedObjectIds.length > 0 /*1*/ &&
                              selectedObjectIds.indexOf(object.id) !== -1,
                            [css.selected]: isSelected,
                          })}
                          style={{ ...objectStyle2, pointerEvents: "none" }}
                        />
                        {renderObjectHandles(object)}
                      </>
                    );
                  });
                })}
            </div>
            {!isPreview && (
              <>
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
    layerArr = layerIds.map((layerId) => layers.layerById[layerId]);
    slide = slides.slideById[selection.activeSlideId];
  }

  const breakpointConfig: BreakpointConfiguration | undefined =
    settings.breakpointsConfiguration.breakpointsConfiguration.find(
      (breakpointConfig) => breakpointConfig.icon === "laptop"
    );

  return {
    slides,
    layers,
    objects,
    stageSize: document.documentSize,
    stageZoom: stage.zoom,
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
};

export default connect(mapStateToProps, mapDispatchToProps)(StagePanel);
