import { Button, Icon, Portal } from "@blueprintjs/core";
import React, { Component, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";

import { ReactComponent as TextToolIcon } from "../../assets/icons/text-tool.svg";
import { ReactComponent as ImageToolIcon } from "../../assets/icons/image-tool.svg";
import { ReactComponent as SelectToolIcon } from "../../assets/icons/select-tool.svg";
import css from "./ToolbarPanel.module.scss";
import AddPanel from "./add-panel/AddPanel";

enum VisiblePanel {
  Add = "add",
  None = "none",
}

export const ToolbarPanel = () => {
  const [showPanel, setShowPanel] = useState<VisiblePanel>(VisiblePanel.None);

  const togglePanel = (panel: VisiblePanel) => {
    setShowPanel(showPanel === panel ? VisiblePanel.None : VisiblePanel.Add);
  };

  return (
    <div className={css.toolbar}>
      <div className={css.buttonGroupsHolder}>
        <div>
          <Button
            minimal
            active={showPanel === VisiblePanel.Add}
            onClick={() => {
              togglePanel(VisiblePanel.Add);
            }}
          >
            <Icon icon="add" iconSize={42} color={"gray"} />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.Add && (
              <AddPanel
                onRequestClose={() => setShowPanel(VisiblePanel.None)}
              />
            )}
          </Portal>
        </div>
        <div>
          <Button minimal>
            <SelectToolIcon
              style={{ width: "36px", height: "36px", fill: "gray" }}
            />
          </Button>

          <Button minimal>
            <Icon icon="undo" iconSize={42} color={"gray"} />
          </Button>
        </div>
        <div>
          <Button minimal>
            <TextToolIcon
              style={{ width: "42px", height: "42px", fill: "gray" }}
            />
          </Button>
          <Button minimal>
            <ImageToolIcon
              style={{ width: "42px", height: "42px", fill: "gray" }}
            />
          </Button>
          <Button minimal>
            <Icon
              icon="group-objects"
              iconSize={32}
              style={{ padding: "16px" }}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarPanel);
