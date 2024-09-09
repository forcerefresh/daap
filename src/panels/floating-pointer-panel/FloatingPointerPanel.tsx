import React, { useContext } from "react";
import { connect } from "react-redux";
import cx from "classnames";
import { IStore } from "../../store/store";
import css from "./FloatingPointerPanel.module.scss";
import { ReactComponent as SelectToolIcon } from "../toolbar-panel/assets/select-tool-icon.svg";
import { StageTools } from "../../store/reducers/stage";
import { setStageTool } from "../../store/actions/actions";
import { ToolsContext } from "../../utils/tools/ToolsProvider";
import { Button } from "@blueprintjs/core";

const ICON_SIZE = 32;
const SMALL_ICON_SIZE = 12;

type IFloatingActionPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const FloatingPointerPanel: React.FC<IFloatingActionPanel> = (
  props: IFloatingActionPanel
) => {
  const { stageTool, _setStageTool } = props;
  const { deactivateTool, activeTool } = useContext(ToolsContext);

  return stageTool.tool !== StageTools.SELECT || !!activeTool ? (
    <div className={cx(css.floatingPointer, "no-custom-cursor")}>
      <div className={css.floatingPointerInner}>
        <Button
          minimal
          onClick={() => {
            if (activeTool) {
              deactivateTool();
            }
            if (stageTool.tool !== StageTools.SELECT) {
              _setStageTool(StageTools.SELECT);
            }
          }}
        >
          <SelectToolIcon width={ICON_SIZE} height={ICON_SIZE} />
        </Button>
      </div>
    </div>
  ) : null;
};

const mapStateToProps = (state: IStore) => {
  const { stage } = state;

  return { stageTool: stage.stageTool };
};

const mapDispatchToProps = {
  _setStageTool: (tool: StageTools) => setStageTool(tool),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FloatingPointerPanel);
