import React from "react";
import { connect } from "react-redux";
import { Button } from "@blueprintjs/core";
import { ReactComponent as TabletPreviewIcon } from "../../assets/icons/tablet-preview.svg";
import css from "./ActionPanel.module.scss";
import { IStore } from "../../store/store";
import { setStagePreview } from "../../store/actions/actions";
import { IPreviewState } from "../../store/reducers/stage";

type IActionPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const ActionPanel: React.FC<IActionPanel> = (props) => {
  const { _setStagePreview, previewState } = props;

  return (
    <div className={css.actionPanel}>
      <div className={css.previewButtons}>
        <Button
          intent={previewState.isPreview ? "danger" : "success"}
          large
          icon={previewState.isPreview ? "stop" : "play"}
          onClick={() => {
            const isPreview = !previewState.isPreview;
            _setStagePreview({
              isPreview: isPreview,
              previewState: isPreview ? "play" : "stop",
              scope: {
                entityType: "project",
                entityId: "current-project",
              },
            });
          }}
        />
        <Button
          minimal
          outlined
          large
          active={previewState.paused}
          icon={"pause"}
          onClick={() => {
            const isPreview = !previewState.isPreview;
            _setStagePreview({ ...previewState, paused: !previewState.paused });
          }}
        />

        <Button
          minimal
          outlined
          large
          active={previewState.scrollbar}
          onClick={() => {
            _setStagePreview({
              ...previewState,
              scrollbar: !previewState.scrollbar,
            });
          }}
        >
          SCROLL
        </Button>
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
  previewState: state.stage.previewState,
});

const mapDispatchToProps = {
  _setStagePreview: (previewState: Partial<IPreviewState>) =>
    setStagePreview(previewState),
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionPanel);
