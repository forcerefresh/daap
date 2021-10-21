import React, { useState } from "react";
import { connect } from "react-redux";
import { Alert, Button, Icon, Intent } from "@blueprintjs/core";
import { ReactComponent as TabletPreviewIcon } from "../../assets/icons/tablet-preview.svg";
import css from "./ActionPanel.module.scss";
import { IStore } from "../../store/store";
import {
  createNewProject,
  doClearHistory,
  initializeSlideAndLayer,
  setStagePreview,
  updateEditor,
} from "../../store/actions/actions";
import { IPreviewState } from "../../store/reducers/stage";
import cx from "classnames";

type IActionPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const ActionPanel: React.FC<IActionPanel> = (props) => {
  const {
    _setStagePreview,
    _createNewProject,
    _resetChangedState,
    _doClearHistory,
    _initializeSlideAndLayer,
    previewState,
    meta,
    editor,
  } = props;

  const [isDiscartConfirmOpen, setIsDiscartConfirmOpen] = useState(false);
  const isChanged = editor.sliderChanged;

  const tryToCreateNew = () => {
    if (editor.sliderChanged) {
      setIsDiscartConfirmOpen(true);
    } else {
      createNewSlider();
    }
  };

  const createNewSlider = () => {
    _createNewProject();
    _doClearHistory();
    _initializeSlideAndLayer();
    _resetChangedState();
    if (isDiscartConfirmOpen) {
      setIsDiscartConfirmOpen(false);
    }
  };

  return (
    <div className={css.actionPanel}>
      <div className={css.panelHeader}>
        <div>
          SLIDER
          <span className={cx(css.sliderName, { [css.changed]: isChanged })}>
            {!!meta.id ? " [ " + meta.name + " ] " : " [ Untitled ] "}
          </span>
          {isChanged && <span className={css.changed}>*</span>}
        </div>
        <div>
          <Button
            minimal
            onClick={() => tryToCreateNew()}
            className={css.addNewSlide}
            small={true}
            icon="add"
          ></Button>
        </div>
      </div>

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
        <Button minimal outlined large icon="desktop" />
        <Button minimal outlined large>
          <TabletPreviewIcon
            style={{ width: "16px", height: "16px", fill: "white" }}
          />
        </Button>
        <Button minimal outlined large icon="mobile-phone" />
      </div>
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Discard changes and create new Slider"
        canOutsideClickCancel={false}
        icon={<Icon icon="info-sign" size={36} intent={Intent.WARNING} />}
        intent={Intent.PRIMARY}
        isOpen={isDiscartConfirmOpen}
        onCancel={() => setIsDiscartConfirmOpen(false)}
        onConfirm={createNewSlider}
        className="bp3-dark"
      >
        <p>You have unsaved changes. Press "Cancel" to go back to project.</p>
      </Alert>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  previewState: state.stage.previewState,
  meta: state.meta,
  editor: state.editor,
});

const mapDispatchToProps = {
  _setStagePreview: (previewState: Partial<IPreviewState>) =>
    setStagePreview(previewState),
  _createNewProject: () => createNewProject(),
  _doClearHistory: () => doClearHistory(),
  _resetChangedState: () => updateEditor({ sliderChanged: false }),
  _initializeSlideAndLayer: initializeSlideAndLayer,
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionPanel);
