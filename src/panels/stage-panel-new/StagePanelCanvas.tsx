import React from "react";
import cx from "classnames";
import { ILayer } from "../../store/reducers/i-layers";
import { IPreviewState } from "../../store/reducers/stage";
import { IPlayerData } from "../../export/i-export-html";
import { AppPlayer } from "../../player/AppPlayer";
import StageLayer from "./StageLayer";
import StageToolsCanvas from "./StageToolsCanvas";
import css from "./StagePanelNew.module.scss";

interface IStagePanelCanvas {
  stageElementRef: React.RefObject<HTMLDivElement>;
  stageStyle: React.CSSProperties;
  scrollableDivStyle: React.CSSProperties;
  canvasStyle: React.CSSProperties;
  outlineStyle: React.CSSProperties;
  toolsCanvasStyle: React.CSSProperties;
  isPreview: boolean;
  layerArr: ILayer[] | null;
  exportData: IPlayerData | null;
  selectedDevice: string;
  customBPWidth: number | undefined;
  previewState: IPreviewState;
  manualProgress: number;
  _setStagePreview: (preview: Partial<IPreviewState>) => void;
}

export function StagePanelCanvas({
  stageElementRef,
  stageStyle,
  scrollableDivStyle,
  canvasStyle,
  outlineStyle,
  toolsCanvasStyle,
  isPreview,
  layerArr,
  exportData,
  selectedDevice,
  customBPWidth,
  previewState,
  manualProgress,
  _setStagePreview,
}: IStagePanelCanvas) {
  return (
    <div
      ref={stageElementRef}
      style={stageStyle}
      className={cx("pan-and-zoom", css.stage)}
    >
      <div
        className={cx(css.scrollableHolder, "preview-scrollable-holder")}
        style={scrollableDivStyle}
      >
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

        <div style={outlineStyle}></div>

        <div className="StagePanel-SnapHolder"></div>

        <div
          style={{ ...toolsCanvasStyle, transform: "scale(" + 1 + ")" }}
          className={cx("stage-tools-canvas", css.stageToolsCanvas)}
        >
          <StageToolsCanvas />
        </div>
      </div>

      {/* Canvas for editing tools */}
      <div
        style={{ ...toolsCanvasStyle, display: "none" }}
        className={cx(css.toolCanvas, "MainToolCanvas")}
      >
        <div className="MainToolStage"></div>
      </div>
    </div>
  );
}
