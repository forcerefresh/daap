import { cloneDeep, isEmpty, isEqual, mapValues, pick } from "lodash-es";
import React, { useEffect, useMemo, useRef, useState } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { Icon } from "@blueprintjs/core";

import { connect } from "react-redux";
import cx from "classnames";
import { ILayer } from "../../store/reducers/layers";
import { IStore } from "../../store/store";

import css from "./StagePanel.module.scss";
import { generateExport, getObjectHtml } from "../../export/export-html";

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
import { useControlPress } from "../../utils/hooks/key-press";

interface ISize {
  width: number;
  height: number;
}

type IStagePanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const StagePanel: React.FC<IStagePanel> = (props) => {
  const {
    stageSize,
    stageZoom,
    previewState,
    exportData,
    layerArr,
    objectById,
    activeObjectId,
    slide,
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
  } = props;

  const ctrlDown = useControlPress();
  console.log(ctrlDown);

  const stageToolInternal = useMemo(() => {
    setTimeout(() => {
      document.dispatchEvent(new MouseEvent("mousemove"));
    });
    if (ctrlDown) return StageTools.PAN;
    else return stageTool;
  }, [stageTool, ctrlDown]);

  // ref for updating selection box
  const selectionBoxRef = useRef<HTMLDivElement | null>(null);

  // in order to recognize click on draggable element we are capturing position on start (mouseDown)
  // and on end (mouseup) we are checking if position is the same
  // this means we have "click" event
  const [dragStartPosition, setDragStartPosition] = useState({ x: -1, y: -1 });
  const [selectionStartPosition, setSelectionStartPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [delta, setDelta] = useState({ x: 0, y: 0 });

  // use form PAN tool
  const [panMove, setPanMove] = useState({
    x: 0,
    y: 0,
  });
  const [panMoveStart, setPanMoveStart] = useState({
    x: 0,
    y: 0,
  });

  // 1. keep local copy in order to apply delta from draggable object
  const objectByIdLocal = cloneDeep(objectById);
  // 2. apply only delta to selected objects only
  selectedObjectIds.forEach((objectId) => {
    if (!objectByIdLocal[objectId].isLocked) {
      objectByIdLocal[objectId].left! += delta.x;
      objectByIdLocal[objectId].top! += delta.y;
    }
  });

  const isPreview = previewState.isPreview;

  // size of visible panel area
  const [viewPortSize, setViewPortSize] = useState<ISize>({
    width: 0,
    height: 0,
  });

  const rootRef = useRef(null);

  const stageXOffset =
    (viewPortSize.width - stageSize.width * stageZoom) / 2 +
    panMove.x +
    panMoveStart.x;
  const stageYOffset =
    (viewPortSize.height - stageSize.height * stageZoom) / 2 +
    panMove.y +
    panMoveStart.y;
  const stageStyle = {
    top: 0 + stageYOffset + "px",
    left: 0 + stageXOffset + "px",
    width: stageSize.width * stageZoom + "px",
    height: stageSize.height * stageZoom + "px",
  };

  const canvasStyle: React.CSSProperties = {
    top: 0 + "px",
    left: 0 + "px",
    width: stageSize.width + "px",
    height: stageSize.height + "px",
    transform: "scale(" + stageZoom + ")",
    transformOrigin: "left top",
  };

  useEffect(() => {
    if (rootRef.current) {
      setViewPortSize({
        width: (rootRef.current as any).clientWidth,
        height: (rootRef.current as any).clientHeight,
      });
    }
  }, [rootRef]);

  // TODO: remove player from here
  const transitionsDataArr = exportData?.transitionsDataArr || [];
  const [tl /*setTl*/] = useState(gsap.timeline());

  // restart timeline when something is changed
  useDeepCompareEffect(() => {
    if (!isEmpty(transitionsDataArr)) {
      tl.clear();

      // TODO: hack to get timeline duration to be set to slide duration
      tl.from(".fake-non-existing-selektor", {
        duration: (slide?.duration?.customValue || 1) / 1000,
      });

      tl.repeat(-1);
      tl.timeScale(previewState.previewSpeed);

      transitionsDataArr.forEach((data) => {
        const effIn = data.transitions.in;
        if (effIn) {
          (tl as any)[effIn.effect.id](
            "." + data.objectClass,
            {
              ...effIn.effect.values,
              duration: effIn.duration / 1000,
            },
            effIn.delay / 1000
          );
        }
      });

      tl.restart();

      /*tl.eventCallback("onComplete", () => {
        _setStagePreview({ isPreview: false });
      });*/

      return () => {
        tl.clear();
      };
    }
  }, [transitionsDataArr]);

  // play/pause switch
  useEffect(() => {
    switch (previewState.previewState) {
      case "play":
        tl.paused(false);
        break;
      case "pause":
        tl.paused(true);
        break;
    }
  }, [previewState.previewState]);

  // change preview speed
  useEffect(() => {
    tl.timeScale(previewState.previewSpeed);
  }, [previewState.previewSpeed]);

  // when we turn off repeat it stops playing on end and reset position to start
  useEffect(() => {
    tl.eventCallback("onRepeat", () => {
      if (!previewState.repeat) {
        tl.progress(0);
        tl.pause();
        _setStagePreview({ previewState: "stop" });
      }
    });
  }, [previewState.repeat]);

  const renderTimeInfo = () => {
    return <SmallTimeline tl={tl} />;
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

  function renderObject(object: IObject) {
    const objectId = object.id;
    const sizeObj = pick(object, "left", "top", "width", "height");
    const isSelected = selectedObjectIds.indexOf(objectId) !== -1;

    // *** NOTE: we are rendering different for selected and non selected object

    // 1. NON SELECTED  (NON-DRAGGABLE)

    if (!isSelected) {
      const objectStyle = mapValues(sizeObj, (size) => `${size}px`);
      (objectStyle as any).position = "absolute";
      return (
        <div style={{ zIndex: 100, position: "absolute" }}>
          <div
            key={object.id + "_1"}
            dangerouslySetInnerHTML={{
              __html: getObjectHtml(object),
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

    // reset position to 0 (gonna be set in Draggable)
    sizeObj.left = sizeObj.top = 0;
    const objectStyle2 = mapValues(sizeObj, (size) => `${size}px`);
    (objectStyle2 as any).position = "absolute";
    (objectStyle2 as any).borderWidth = 1 / stageZoom + "px";

    const currentPosition = "X:" + object.left! + " Y:" + object.top! + "";

    return (
      <Draggable
        disabled={stageToolInternal !== StageTools.SELECT}
        key={objectId + "_drag"}
        position={{ x: object.left!, y: object.top! }}
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
          setDelta((_delta) => ({
            x: Math.round(_delta.x + data.deltaX),
            y: Math.round(_delta.y + data.deltaY),
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
            setDelta({ x: 0, y: 0 });
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
          //onMouseUp={(e) => e.stopPropagation()}
          style={{ zIndex: 500 + objectCounter, position: "absolute" }}
          className={cx({
            [css.notVisibleHolder]: !object.isVisible,
          })}
        >
          <div
            key={object.id + "_1"}
            dangerouslySetInnerHTML={{
              __html: getObjectHtml(object),
            }}
            style={objectStyle2}
            className={cx({
              [css.notVisible]: !object.isVisible,
            })}
          />
          <div
            key={object.id}
            className={cx(css.selection, css[object.type], {
              [css.active]:
                selectedObjectIds.length > 0 /*1*/ &&
                selectedObjectIds.indexOf(object.id) !== -1,
              [css.selected]: isSelected,
            })}
            style={objectStyle2}
          />

          <div className={css.selectionInfo}>
            {object.isLocked ? (
              <div className={css.lockIconHolder}>
                <Icon icon="lock" />
              </div>
            ) : null}
            <div className={css.currentPosition}>{currentPosition}</div>
          </div>
        </div>
      </Draggable>
    );
  }

  let objectCounter = 0;
  return (
    <div
      ref={rootRef}
      className={cx(css.stagePanel, {
        [css.panCursor]: stageToolInternal === StageTools.PAN,
        [css.drawCursor]: stageToolInternal === StageTools.DRAW,
      })}
      onMouseDown={(e: React.MouseEvent) => {
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
        e.persist();
        if (selectionStartPosition != null) {
          const point = getMousePosition(e);
          if (
            stageToolInternal === StageTools.SELECT ||
            stageToolInternal === StageTools.DRAW
          ) {
            const rect = getRectFromPoints(selectionStartPosition, point);
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
        }
      }}
      onMouseUp={(e) => {
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
      <div style={stageStyle} className={css.stage}>
        <div style={canvasStyle} className={css.canvas}>
          {isPreview && (
            <div
              style={{ position: "relative" }}
              dangerouslySetInnerHTML={{ __html: exportData?.html as string }}
            ></div>
          )}
          {!isPreview &&
            layerArr?.map((layer) => {
              return layer.objectIds.map((objectId) => {
                const object = objectByIdLocal[objectId];
                objectCounter++;
                return renderObject(object);
              });
            })}
        </div>
      </div>
      stageSize: {stageSize.width} x {stageSize.height}, {stageZoom} <br />
      viewPortSize: {viewPortSize.width}x {viewPortSize.height}
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides, layers, objects, selection, document } = state.project;
  const { stage } = state;

  let layerArr: ILayer[] | null = null;
  let slide: ISlide | null = null;

  if (selection.activeSlideId) {
    const layerIds = slides.slideById[selection.activeSlideId].layerIds;
    layerArr = layerIds.map((layerId) => layers.layerById[layerId]);
    slide = slides.slideById[selection.activeSlideId];
  }

  return {
    stageSize: document.documentSize,
    stageZoom: stage.zoom,
    previewState: stage.previewState,

    // generate data for player
    exportData: stage.previewState.isPreview
      ? generateExport(slides, layers, objects)
      : null,

    layerArr,
    slide,
    objectById: objects.objectById,
    activeObjectId: selection.activeObjectId,
    activeLayerId: selection.activeLayerId,
    selectedObjectIds: selection.selectedObjectIds,
    stageTool: state.stage.stageTool.tool,
    stageToolObjectType: state.stage.stageTool.objectType,
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
