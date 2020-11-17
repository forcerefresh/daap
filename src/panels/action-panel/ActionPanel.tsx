import React from "react";
import { connect } from "react-redux";
import { Button } from "@blueprintjs/core";
import { ReactComponent as TabletPreviewIcon } from "../../assets/icons/tablet-preview.svg";
import css from "./ActionPanel.module.scss";
import { IStore } from "../../store/store";
import { setStagePreview } from "../../store/actions/actions";

type IActionPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const ActionPanel: React.FC<IActionPanel> = (props) => {
  const { _setStagePreview, isPreview } = props;

  return (
    <div className={css.actionPanel}>
      <div className={css.previewButtons}>
        <Button
          intent={isPreview ? "danger" : "success"}
          large
          icon={isPreview ? "stop" : "play"}
          onClick={() => {
            _setStagePreview(!isPreview);
          }}
        />
        <Button minimal outlined large icon="desktop" />
        <Button minimal outlined large>
          <TabletPreviewIcon
            style={{ width: "16px", height: "16px", fill: "white" }}
          />
        </Button>
        <Button minimal outlined large icon="mobile-phone" />
      </div>
      <Button intent="primary" large style={{ width: "100%" }}>
        SAVE
      </Button>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  isPreview: state.stage.isPreview,
});

const mapDispatchToProps = {
  _setStagePreview: (isPreview: boolean) => setStagePreview(isPreview),
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionPanel);
