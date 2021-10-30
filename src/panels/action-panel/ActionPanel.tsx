import React, { useRef, useState } from "react";
import { connect } from "react-redux";
import { Alert, Button, Icon, Intent, Portal } from "@blueprintjs/core";
import { ReactComponent as TabletPreviewIcon } from "../../assets/icons/tablet-preview.svg";
import css from "./ActionPanel.module.scss";
import { IStore } from "../../store/store";
import {
  createNewProject,
  doClearHistory,
  initializeSlideAndLayer,
  setDevice,
  setStagePreview,
  updateEditor,
} from "../../store/actions/actions";
import { IPreviewState } from "../../store/reducers/stage";
import cx from "classnames";
import { getResponsiveIcon } from "../../utils/icons/responsive-icons-factory";
import {
  BreakpointConfiguration,
  getIconByType,
} from "../../store/reducers/settings";
import SavePanel from "../save-panel/SavePanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";

export const getIconSize = (type: string): { w: string; h: string } => {
  if (type === "phone") {
    return { w: "20px", h: "20px" };
  } else if (type === "tablet") {
    return { w: "22px", h: "22px" };
  } else if (type === "laptop") {
    return { w: "24px", h: "24px" };
  } else if (type === "desktop") {
    return { w: "24px", h: "24px" };
  } else if (type === "tv") {
    return { w: "24px", h: "24px" };
  }
  return { w: "24px", h: "24px" };
};
type IActionPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

enum VisiblePanel {
  None = "none",
  Save = "save",
}

export const ActionPanel: React.FC<IActionPanel> = (props) => {
  const {
    _setStagePreview,
    _createNewProject,
    _resetChangedState,
    _doClearHistory,
    _initializeSlideAndLayer,
    _setDevice,
    previewState,
    meta,
    editor,
    breakpointsConfiguration,
    selectedDevice,
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
    "bp3-overlay-scroll-container", // alert
  ]);

  const [isDiscartConfirmOpen, setIsDiscartConfirmOpen] = useState(false);
  const isChanged = editor.sliderChanged;
  const isExistingProject = editor.isExistingProject;

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

  const renderBreakpointButton = (conf: BreakpointConfiguration) => {
    const icon = getIconByType(conf.type);
    const size = getIconSize(icon);
    console.log(selectedDevice);

    console.log(conf.type);
    return (
      <Button
        active={selectedDevice === conf.type}
        minimal
        outlined
        large
        icon={getResponsiveIcon(
          icon,
          size.w,
          size.h,
          "lightgray",
          conf.portrait
        )}
        className={css.responsiveButton}
        onClick={() => {
          _setDevice(conf.type);
        }}
      >
        <div className={css.responsiveButtonNumber}></div>
      </Button>
    );
  };

  const onClickSave = () => {};

  return (
    <div className={css.actionPanel}>
      <div className={css.panelHeader}>
        <div>
          SLIDER
          <span className={cx(css.sliderName)}>
            {!!meta.id ? " [ " + meta.name + " ] " : " [ Untitled ] "}
          </span>
          {/*{isChanged && <span className={css.changed}>*</span>}*/}
        </div>
        <div>
          {/*<Button
            minimal
            small
            active={previewState.paused}
            icon={"pause"}
            style={{ marginRight: "20px" }}
            onClick={() => {
              const isPreview = !previewState.isPreview;
              _setStagePreview({
                ...previewState,
                paused: !previewState.paused,
              });
            }}
          />*/}

          {isExistingProject && (
            <Button
              intent={isChanged ? "danger" : "none"}
              minimal
              small
              icon={"floppy-disk"}
              style={{ marginRight: "5px" }}
              onClick={() => {
                onClickSave();
              }}
            ></Button>
          )}

          <Button
            minimal
            small
            icon={"floppy-disk"}
            style={{ marginRight: "5px" }}
            onClick={() => {
              setShowPanel(VisiblePanel.Save);
            }}
          >
            as ...
          </Button>

          <Portal>
            {showPanel === VisiblePanel.Save && (
              <div ref={sharedRef} className={css.floatingSavePanel}>
                <SavePanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                />
              </div>
            )}
          </Portal>

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
          className={css.previewPlayStop}
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
        <div>
          {[...breakpointsConfiguration].reverse().map(renderBreakpointButton)}
        </div>
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
  breakpointsConfiguration:
    state.project.settings.breakpointsConfiguration.breakpointsConfiguration,
  selectedDevice: state.stage.selectedDevice,
});

const mapDispatchToProps = {
  _setStagePreview: (previewState: Partial<IPreviewState>) =>
    setStagePreview(previewState),
  _createNewProject: () => createNewProject(),
  _doClearHistory: () => doClearHistory(),
  _resetChangedState: () => updateEditor({ sliderChanged: false }),
  _initializeSlideAndLayer: initializeSlideAndLayer,
  _setDevice: setDevice,
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionPanel);
