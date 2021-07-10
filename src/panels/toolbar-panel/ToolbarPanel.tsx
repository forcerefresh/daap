import { Button, Icon, Portal, Text } from "@blueprintjs/core";
import React, { useRef, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";

import { ReactComponent as SelectToolIcon } from "../../assets/icons/select-tool.svg";
import { ReactComponent as ZoomToolIcon } from "../../assets/icons/zoom-tool.svg";
import { ReactComponent as HistoryToolIcon } from "../../assets/icons/history-tool.svg";

import AddPanel from "../add-panel/AddPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import SettingsPanel from "../settings-panel/SettingsPanel";

import css from "./ToolbarPanel.module.scss";
import {
  decreaseStageZoom,
  increaseStageZoom,
  doUndo,
  doRedo,
  setStageTool,
} from "../../store/actions/actions";
import HistoryPanel from "../history-panel/HistoryPanel";
import { StageTools } from "../../store/reducers/stage";
import FontPreviewPanel from "../font-preview-panel/FontPreviewPanel";
import MediaLibraryPanel from "../media-library/MediaLibraryPanel";
import AlignPanel from "../align-panel/AlignPanel";
import ProjectsLibraryPanel from "../projects-library-panel/ProjectsLibraryPanel";
import SavePanel from "../save-panel/SavePanel";

enum VisiblePanel {
  None = "none",
  Add = "add",
  Settings = "settings",
  History = "history",
  FontPreview = "font-preview",
  MediaLibrary = "media-library",
  AlignAndDistribute = "align-and-distribute",
  ProjectsLibrary = "projects-library",
  Save = "save",
}

const ICON_SIZE = 36;
const SMALL_ICON_SIZE = 18;

type IToolbarPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const ToolbarPanel: React.FC<IToolbarPanel> = (props) => {
  const {
    zoom,
    increaseStageZoom,
    decreaseStageZoom,
    doUndo,
    doRedo,
    hasUndoItem,
    hasRedoItem,
    stageTool,
    _setStageTool,
  } = props;
  const [showPanel, setShowPanel] = useState<VisiblePanel>(VisiblePanel.None);

  // logic for handling click outside
  const sharedRef = useRef(null);
  const handleClickOutside = () => {
    setShowPanel(VisiblePanel.None);
  };
  useOnClickOutside(sharedRef, handleClickOutside, [
    "image-preview-popover",
    "color-picker-holder",
  ]);

  return (
    <div className={css.toolbar}>
      <div className={css.buttonGroupsHolder}>
        <div>
          <Button
            minimal
            active={showPanel === VisiblePanel.Add}
            onClick={() => {
              setShowPanel(VisiblePanel.Add);
            }}
          >
            <Icon icon="add" iconSize={ICON_SIZE} color={"gray"} />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.Add && (
              <div ref={sharedRef}>
                <AddPanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                  onRequestFontPreview={() =>
                    setShowPanel(VisiblePanel.FontPreview)
                  }
                />
              </div>
            )}
            {showPanel === VisiblePanel.FontPreview && (
              <div ref={sharedRef}>
                <FontPreviewPanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                />
              </div>
            )}
          </Portal>
        </div>
        <div>
          <Button
            small
            minimal
            onClick={() => _setStageTool(StageTools.SELECT)}
            active={stageTool === StageTools.SELECT}
          >
            <SelectToolIcon
              style={{
                width: SMALL_ICON_SIZE + "px",
                height: SMALL_ICON_SIZE + "px",
                fill: "gray",
              }}
            />
          </Button>
          <Button
            minimal
            small
            onClick={() => _setStageTool(StageTools.PAN)}
            active={stageTool === StageTools.PAN}
          >
            <Icon icon="hand" iconSize={SMALL_ICON_SIZE} color={"gray"} />
          </Button>
        </div>
        <div>
          <Text>{zoom * 100} %</Text>
          <div>
            <Button minimal small onClick={() => increaseStageZoom()}>
              <Icon icon="zoom-in" iconSize={SMALL_ICON_SIZE} color={"gray"} />
            </Button>
            <Button minimal small onClick={() => decreaseStageZoom()}>
              <Icon icon="zoom-out" iconSize={SMALL_ICON_SIZE} color={"gray"} />
            </Button>
          </div>
          <Button
            minimal
            active={showPanel === VisiblePanel.History}
            onClick={() => {
              setShowPanel(VisiblePanel.History);
            }}
          >
            <HistoryToolIcon
              style={{ width: "36px", height: ICON_SIZE + "px", fill: "gray" }}
            />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.History && (
              <div ref={sharedRef}>
                <HistoryPanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                />
              </div>
            )}
          </Portal>
        </div>
        <div>
          <Button
            disabled={!hasUndoItem}
            minimal
            small
            onClick={() => doUndo()}
          >
            <Icon
              icon="undo"
              iconSize={SMALL_ICON_SIZE}
              color={hasUndoItem ? "gray" : "#555"}
            />
          </Button>
          <Button
            disabled={!hasRedoItem}
            minimal
            small
            onClick={() => doRedo()}
          >
            <Icon
              icon="redo"
              iconSize={SMALL_ICON_SIZE}
              color={hasRedoItem ? "gray" : "#555"}
            />
          </Button>
        </div>
        <div>
          <Button
            minimal
            active={showPanel === VisiblePanel.AlignAndDistribute}
            onClick={() => {
              setShowPanel(VisiblePanel.AlignAndDistribute);
            }}
          >
            <Icon icon="alignment-left" iconSize={ICON_SIZE} color={"gray"} />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.AlignAndDistribute && (
              <div ref={sharedRef}>
                <AlignPanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                />
              </div>
            )}
          </Portal>
        </div>
        <div>
          <Button
            minimal
            active={showPanel === VisiblePanel.MediaLibrary}
            onClick={() => {
              setShowPanel(VisiblePanel.MediaLibrary);
            }}
          >
            <Icon icon="media" iconSize={ICON_SIZE} color={"gray"} />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.MediaLibrary && (
              <div ref={sharedRef}>
                <MediaLibraryPanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                />
              </div>
            )}
          </Portal>
        </div>
        <div>
          <Button
            minimal
            active={showPanel === VisiblePanel.Settings}
            onClick={() => {
              setShowPanel(VisiblePanel.Settings);
            }}
          >
            <Icon icon="cog" iconSize={ICON_SIZE} color={"gray"} />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.Settings && (
              <div ref={sharedRef}>
                <SettingsPanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                />
              </div>
            )}
          </Portal>
        </div>

        <div>
          <Button
            minimal
            active={showPanel === VisiblePanel.Save}
            onClick={() => {
              setShowPanel(VisiblePanel.Save);
            }}
          >
            <Icon icon="floppy-disk" iconSize={ICON_SIZE} color={"gray"} />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.Save && (
              <div ref={sharedRef}>
                <SavePanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                />
              </div>
            )}
          </Portal>
        </div>

        <div>
          <Button
            minimal
            active={showPanel === VisiblePanel.ProjectsLibrary}
            onClick={() => {
              setShowPanel(VisiblePanel.ProjectsLibrary);
            }}
          >
            <Icon icon="projects" iconSize={ICON_SIZE} color={"gray"} />
          </Button>

          <Portal>
            {showPanel === VisiblePanel.ProjectsLibrary && (
              <div ref={sharedRef}>
                <ProjectsLibraryPanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                />
              </div>
            )}
          </Portal>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  zoom: state.stage.zoom,
  hasUndoItem: state.project.diff.prev.length !== 0,
  hasRedoItem: state.project.diff.next.length !== 0,
  stageTool: state.stage.stageTool.tool,
});

const mapDispatchToProps = {
  increaseStageZoom: increaseStageZoom,
  decreaseStageZoom: decreaseStageZoom,
  doUndo: () => doUndo(),
  doRedo: () => doRedo(),
  _setStageTool: (tool: StageTools) => setStageTool(tool),
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarPanel);
