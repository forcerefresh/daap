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
} from "../../store/actions/actions";
import HistoryPanel from "../history-panel/HistoryPanel";

enum VisiblePanel {
  None = "none",
  Add = "add",
  Settings = "settings",
  History = "history",
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
  } = props;
  const [showPanel, setShowPanel] = useState<VisiblePanel>(VisiblePanel.None);

  // logic for handling click outside
  const sharedRef = useRef(null);
  const handleClickOutside = () => {
    // TODO: temporary - for dev purpose
    if (showPanel !== VisiblePanel.History) {
      setShowPanel(VisiblePanel.None);
    }
  };
  useOnClickOutside(sharedRef, handleClickOutside);

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
                />
              </div>
            )}
          </Portal>
        </div>
        <Button minimal>
          <SelectToolIcon
            style={{ width: "36px", height: ICON_SIZE + "px", fill: "gray" }}
          />
        </Button>
        <div>
          <Button minimal>
            <ZoomToolIcon
              style={{ width: "36px", height: ICON_SIZE + "px", fill: "gray" }}
            />
          </Button>
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
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  zoom: state.stage.zoom,
  hasUndoItem: state.project.diff.prev.length !== 0,
  hasRedoItem: state.project.diff.next.length !== 0,
});

const mapDispatchToProps = {
  increaseStageZoom: increaseStageZoom,
  decreaseStageZoom: decreaseStageZoom,
  doUndo: () => doUndo(),
  doRedo: () => doRedo(),
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarPanel);
