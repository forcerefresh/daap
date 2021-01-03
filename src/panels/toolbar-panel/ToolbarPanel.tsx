import { Button, Icon, Portal, Text } from "@blueprintjs/core";
import React, { useRef, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";

import { ReactComponent as TextToolIcon } from "../../assets/icons/text-tool.svg";
import { ReactComponent as ImageToolIcon } from "../../assets/icons/image-tool.svg";
import { ReactComponent as SelectToolIcon } from "../../assets/icons/select-tool.svg";
import { ReactComponent as ZoomToolIcon } from "../../assets/icons/zoom-tool.svg";

import css from "./ToolbarPanel.module.scss";
import AddPanel from "../add-panel/AddPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import SettingsPanel from "../settings-panel/SettingsPanel";
import {
  decreaseStageZoom,
  increaseStageZoom,
} from "../../store/actions/actions";

enum VisiblePanel {
  None = "none",
  Add = "add",
  Settings = "settings",
}

const ICON_SIZE = 36;
const SMALL_ICON_SIZE = 18;

type IToolbarPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const ToolbarPanel: React.FC<IToolbarPanel> = (props) => {
  const { zoom, increaseStageZoom, decreaseStageZoom } = props;
  const [showPanel, setShowPanel] = useState<VisiblePanel>(VisiblePanel.None);

  // logic for handling click outside
  const sharedRef = useRef(null);
  const handleClickOutside = () => {
    setShowPanel(VisiblePanel.None);
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
          <Button minimal>
            <Icon icon="undo" iconSize={ICON_SIZE} color={"gray"} />
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
});

const mapDispatchToProps = {
  increaseStageZoom: increaseStageZoom,
  decreaseStageZoom: decreaseStageZoom,
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarPanel);
