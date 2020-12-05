import { Button, Icon, Portal } from "@blueprintjs/core";
import React, { useRef, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";

import { ReactComponent as TextToolIcon } from "../../assets/icons/text-tool.svg";
import { ReactComponent as ImageToolIcon } from "../../assets/icons/image-tool.svg";
import { ReactComponent as SelectToolIcon } from "../../assets/icons/select-tool.svg";
import css from "./ToolbarPanel.module.scss";
import AddPanel from "./add-panel/AddPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import AddSettingsPanel from "./add-settings-panel/AddSettingsPanel";

enum VisiblePanel {
  None = "none",
  Add = "add",
  Settings = "settings",
}

const ICON_SIZE = 36;

export const ToolbarPanel = () => {
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
        <div>
          <Button minimal>
            <SelectToolIcon
              style={{ width: "36px", height: ICON_SIZE + "px", fill: "gray" }}
            />
          </Button>

          <Button minimal>
            <Icon icon="undo" iconSize={ICON_SIZE} color={"gray"} />
          </Button>
        </div>
        <div>
          <Button minimal>
            <TextToolIcon
              style={{ width: "42px", height: ICON_SIZE + "px", fill: "gray" }}
            />
          </Button>
          <Button minimal>
            <ImageToolIcon
              style={{ width: "42px", height: ICON_SIZE + "px", fill: "gray" }}
            />
          </Button>
          <Button minimal>
            <Icon
              icon="group-objects"
              iconSize={ICON_SIZE}
              style={{ padding: "16px" }}
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
                <AddSettingsPanel
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

const mapStateToProps = (state: IStore) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarPanel);
