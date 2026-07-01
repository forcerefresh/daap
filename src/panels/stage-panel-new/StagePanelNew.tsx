import { withErrorBoundary } from "react-use-error-boundary";

import React, {
  CSSProperties,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ContextMenu as ContextMenuBP } from "@blueprintjs/core";
import { connect } from "react-redux";
import cx from "classnames";
import { ILayer } from "../../store/reducers/i-layers";
import { IStore } from "../../store/store";

import css from "./StagePanelNew.module.scss";
import { generatePlayerData } from "../../export/export-html";

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
  clearClipboard,
} from "../../store/actions/actions";
import { IPreviewState, StageTools } from "../../store/reducers/stage";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { getMousePosition, IRect } from "../../utils/doom-utils/common";
import { useKeyDown } from "../../utils/hooks/key-down";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";

import { convertRGBColor2CSSProperties } from "../../utils/utils";
import { IPlayerData } from "../../export/i-export-html";
import { useWindowSize } from "../../utils/hooks/window-size";
import { ToolsContext } from "../../utils/tools/ToolsProvider";
import { StageManagerContext } from "./StageManagerProvider";
import { StageToolEnum } from "../../utils/selection-manager/types";
import { Point } from "../../webslider-sdk/object/i-tool-class";
import { IClipboard } from "../../store/reducers/i-clipboard";
import { useZoomPan } from "./zoom-pan/useZoomPan";
import ContextMenu from "../context-menu/ContextMenu";
import { useStageHotkeys } from "./hooks/useStageHotkeys";
import { useZoomFit } from "./hooks/useZoomFit";
import { StagePanelCanvas } from "./StagePanelCanvas";

type StagePanelNewOwnProps = {};

type IStagePanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  StagePanelNewOwnProps;

const StagePanelNew: React.FC<IStagePanel> = (props) => {
  const {
    appZoom,
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
    _setStagePreview,
    _selectObjects,
    _activateObject,
    _setViewPortSize,
    _selectForProperties,
    _overrideStageTool,
    _cancelOverrideStageTool,
    activeStageTool,
    stageTool,
    breakpointConfig,
    settings,
    selectedDevice,
    breakpoints,
    forceRefreshRand: _forceRefreshRand, // NOTE: check this
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
    _clearClipboard,
    outlineColor,
    showSimplifiedLayerPanel,
    showSimplifiedPagesPanel,
  } = props;

  const { spaceDown } = useKeyDown();

  const { setRefs, canvasTransform, setTransform, handleScaleChange } =
    useZoomPan({ spaceDown });

  useZoomFit({
    viewPortSize,
    breakpointConfig,
    showSimplifiedLayerPanel,
    showSimplifiedPagesPanel,
    appZoom,
    zoomFit,
    stageZoom,
    canvasTransform,
    setTransform,
    handleScaleChange,
    _setStageZoom,
    _setStagePan,
    _setZoomFit,
  });

  const [customBPWidth, setCustomBPWidth] = useState<number | undefined>();
  const [manualProgress, setManualProgress] = useState(0);

  const isPreview = previewState.isPreview;

  useStageHotkeys({
    selectedObjectIds,
    objectById,
    activeLayerId,
    clipboard,
    _groupObjects,
    _ungroupObject,
    _duplicateObjects,
    _deleteObjects,
    _cutToClipboard,
    _copyToClipboard,
    _pasteObjectsFromClipboard,
    _clearClipboard,
  });

  const { stageManager } = useContext(StageManagerContext);

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

  // -------- PLAYER >>
  let exportData: IPlayerData | null = null;
  if (previewState.isPreview) {
    exportData = generatePlayerData(
      { slides: pages, layers, objects },
      previewState.scope,
      breakpointConfig!,
      breakpoints,
      settings,
      undefined,
      { isSave: false },
    );
  }
  // -------- PLAYER <<

  const { height: windowHeight, width: windowWidth } = useWindowSize();

  const stagePanelElementRef = useRef<HTMLDivElement | null>(null);
  const stageElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (stagePanelElementRef.current) {
      _setViewPortSize({
        w: stagePanelElementRef.current.clientWidth,
        h: stagePanelElementRef.current.clientHeight,
      });
    }
  }, [stagePanelElementRef, windowWidth, windowHeight]);

  useEffect(() => {
    setRefs(stagePanelElementRef, stageElementRef);
  }, [stagePanelElementRef, stageElementRef]);

  const { activeTool } = useContext(ToolsContext);

  const stageSize = breakpointConfig?.normal.maxSliderSize!;
  const margins = breakpointConfig?.normal.margins ?? {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  };

  const stageStyle: React.CSSProperties = {
    overflowX: "visible",
    overflowY: "visible",
  };

  const canvasStyle: React.CSSProperties = {
    top: 0 + "px",
    left: 0 + "px",
    width: stageSize.width + "px",
    height: stageSize.height + "px",
    ...convertRGBColor2CSSProperties(settings.pageBackgroundColor),
  };

  const outlineStyle: CSSProperties = {
    position: "absolute",
    zIndex: 10000,
    top: -1 + "px",
    left: -1 + "px",
    width: stageSize.width + 2 + "px",
    height: stageSize.height + 2 + "px",
    border:
      "1px solid " +
      convertRGBColor2CSSProperties(outlineColor).backgroundColor,
    pointerEvents: "none",
  };

  const showMarginsDiv =
    margins.top || margins.bottom || margins.left || margins.right;

  const marginBorderStyle: CSSProperties = {
    top: margins.top * stageZoom + "px",
    left: margins.left * stageZoom + "px",
    width:
      (stageSize.width - (margins.right + margins.left)) * stageZoom + "px",
    height:
      (stageSize.height - (margins.top + margins.bottom)) * stageZoom + "px",
    borderWidth: 1,
  };

  const scrollableDivStyle: React.CSSProperties = {
    position: "relative",
    width: (breakpointConfig?.normal?.page.width || 0) + "px",
    height: (breakpointConfig?.normal?.page.height || 0) + "px",
    overflowX: "visible",
    overflowY: "visible",
  };

  const toolsCanvasStyle = {};

  if (showGrid) {
    const gridStrokeWidth = `calc(0.5px/var(--scale))`;
  }

  return (
    <React.Fragment>
      <ContextMenuBP
        onContextMenu={(e) => {
          if (e.ctrlKey) {
            e.stopPropagation();
            e.preventDefault();
            return;
          }
        }}
        content={<ContextMenu />}
      >
        <div
          ref={stagePanelElementRef}
          className={cx("StagePanel", css.stagePanel, {
            [css.panCursor]: activeStageTool === StageTools.PAN,
          })}
          onWheelCapture={(e) => {}}
          onMouseDown={(e) => {
            if (e.buttons !== 1) {
              return;
            }

            if (activeTool) {
              return;
            }

            e.persist();

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

            // select parent
            if (selectionParentId) {
              if (activeObjectId !== selectionParentId) {
                _activateObject(selectionParentId);
                _selectObjects([selectionParentId]);
                _selectForProperties({ type: "object", id: selectionParentId });
              }
            } else {
              _activateObject(null);
              _selectObjects([]);
            }
          }}
        >
          <StagePanelCanvas
            stageElementRef={stageElementRef}
            stageStyle={stageStyle}
            scrollableDivStyle={scrollableDivStyle}
            canvasStyle={canvasStyle}
            outlineStyle={outlineStyle}
            toolsCanvasStyle={toolsCanvasStyle}
            isPreview={isPreview}
            layerArr={layerArr}
            exportData={exportData}
            selectedDevice={selectedDevice}
            customBPWidth={customBPWidth}
            previewState={previewState}
            manualProgress={manualProgress}
            _setStagePreview={_setStagePreview}
          />

          {showMarginsDiv ? (
            <div
              style={marginBorderStyle}
              className={cx(css.borderBase, css.marginBorder)}
            ></div>
          ) : null}
        </div>
      </ContextMenuBP>
    </React.Fragment>
  );
};

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
      (bp: BreakpointConfiguration) =>
        bp.type === state.stage.selectedDevice,
    );

  const zoom = stage.zoom;

  const forceShowLayerId =
    selection.selectionForProperties?.type === "layer"
      ? selection.selectionForProperties?.id
      : undefined;

  // TODO: later selection
  const selectionParentId =
    selection.selectionPath && selection.selectionPath.length > 1
      ? selection.selectionPath[selection.selectionPath.length - 1]
      : undefined;

  return {
    appZoom: state.globals.appZoom,
    outlineColor: state.globals.outlineColor,
    pages,
    layers,
    objects,
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
    objectProps: Partial<IObject>,
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
  _duplicateObjects: (ids: string[]) => duplicateObjects(ids),
  _deleteObjects: (ids: string[]) => deleteObjects(ids),
  _cutToClipboard: (
    payload: Pick<IClipboard, "entityType" | "entityIds">,
  ) => cutToClipboard(payload),
  _copyToClipboard: (
    payload: Pick<IClipboard, "entityType" | "entityIds">,
  ) => copyToClipboard(payload),

  _pasteObjectsFromClipboard: (toLayerId: string) =>
    pasteObjectsFromClipboard(toLayerId),

  _clearClipboard: () => clearClipboard(),
  _setZoomFit: (fit: boolean) => setZoomFit(fit),
  _forceRefresh: () => forceRefresh(),
};

export default withErrorBoundary(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(StagePanelNew) as unknown as React.ComponentType<StagePanelNewOwnProps>,
);
