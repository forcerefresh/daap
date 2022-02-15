import React, { useContext, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { Alert, Button, Icon, Intent, Portal } from "@blueprintjs/core";
import css from "./ActionPanel.module.scss";
import { IStore } from "../../store/store";
import {
  createNewProject,
  doClearHistory,
  initializeSlideAndLayer,
  setDevice,
  setStagePreview,
  updateEditor,
  updateProjectMeta,
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
import { IMeta } from "../../store/reducers/meta";
import { IEditor } from "../../store/reducers/editor";
import { IntegrationContext } from "../../integration";
import PublishPanel from "../publish-panel/PublishPanel";
import { ObjectStorageItem } from "../../integration/hooks/object-storage-hook/i-object-storage-hook";

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

export const getIconStyle = (type: string): React.CSSProperties => {
  if (type === "phone") {
    return { marginBottom: "-1px" };
  } else if (type === "tablet") {
    return {};
  } else if (type === "laptop") {
    return { marginBottom: "-3px", marginLeft: "3px" };
  } else if (type === "desktop") {
    return {};
  } else if (type === "tv") {
    return {};
  }
  return {};
};

type IActionPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

enum VisiblePanel {
  None = "none",
  Save = "save",
  SaveAs = "saveAs",
  Publish = "publish",
}

export const ActionPanel: React.FC<IActionPanel> = (props) => {
  const {
    _setStagePreview,
    _createNewProject,
    _updateEditor,
    _doClearHistory,
    _initializeSlideAndLayer,
    _setDevice,
    _updateProjectMeta,
    previewState,
    meta,
    editor,
    breakpointsConfiguration,
    selectedDevice,
    project,
    slides,
    layers,
    objects,
    settings,
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
    "bp3-menu", //menu
  ]);

  // api
  const globalContext = useContext(IntegrationContext);
  const { saveProject } = globalContext.useAPIHook();
  const { supportStorageObjects, listAssignedStorageObjects } =
    globalContext.useObjectStorageHook();

  const [isDiscartConfirmOpen, setIsDiscartConfirmOpen] = useState(false);
  const isChanged = editor.sliderChanged;
  const isExistingProject = editor.isExistingProject;

  const [assignedBuckets, setAssignedBuckets] = useState<ObjectStorageItem[]>(
    []
  );
  const reloadAssignedStorageObjects = () => {
    if (supportStorageObjects) {
      listAssignedStorageObjects({ projectId: meta.id! }).then((res) => {
        console.log(res);
        setAssignedBuckets(res);
      });
    }
  };
  useEffect(() => {
    reloadAssignedStorageObjects();
  }, [meta.saveRevision]);

  const publishedToAll =
    assignedBuckets.length === 0 ||
    !assignedBuckets.find(
      (bucket) => bucket.assignedProject?.revision !== meta.saveRevision
    );

  const tryToCreateNew = () => {
    //if (editor.sliderChanged) {
    setIsDiscartConfirmOpen(true);
    //} else {
    //  createNewSlider();
    //}
  };

  const createNewSlider = () => {
    _createNewProject();
    _doClearHistory();
    _initializeSlideAndLayer();
    _updateEditor({ isExistingProject: false, sliderChanged: false });
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

  /*const onClickSave = () => {
    // prepare preview thumbnail data >>>> START
    const breakpointConfig = breakpointsConfiguration.find(
      (p) => p.type === "large-1"
    );

    const previewExportData = generatePlayerData(
      { slides, layers, objects },
      { entityType: "slide", entityId: slides.normalSlides[0] },
      breakpointConfig!,
      settings
    );

    const scale = THUMB_WIDTH / breakpointConfig!.normal.slide.width!;
    const thumbHeight = scale * breakpointConfig!.normal.slide.height!;
    const thumbSize = { width: THUMB_WIDTH, height: thumbHeight, scale: scale };
    // prepare preview thumbnail data <<<< END

    const playerData = generatePlayerData(
      { slides, layers, objects },
      { entityType: "project", entityId: "current-project" },
      breakpointConfig!,
      settings
    );

    _updateProjectMeta({ inSaving: true });

    saveProject({
      id: meta.id,
      name: meta.name!,
      description: meta.description!,
      project,
      preview: {
        width: thumbSize.width,
        height: thumbSize.height,
        scale: thumbSize.scale,
        html: previewExportData.html,
      },
      playerData,
    })
      .then(({ id, name, description, slides, created, modified }) => {
        console.log({ id, name, description });
        _updateProjectMeta({
          id,
          name,
          description,
          slides,
          created,
          modified,
          inSaving: false,
        });
        _updateEditor({ sliderChanged: false, isExistingProject: true });

        AppToaster.show({
          intent: "success",
          message: "Slider is successfully saved.",
        });
      })
      .catch((e) => {
        _updateProjectMeta({ inSaving: false });
        AppToaster.show({
          intent: "danger",
          message: "Something went wrong. Slider is not saved.",
        });
      });
  };*/

  return (
    <div className={css.actionPanel}>
      <div className={css.panelHeader}>
        <div style={{ display: "flex" }}>
          SLIDER
          <span className={cx(css.sliderName)}>
            {!!meta.id ? " [ " + meta.name + " ] " : " [ Untitled ] "}
          </span>
          {/*{isChanged && <span className={css.changed}>*</span>}*/}
        </div>
      </div>

      <div className={css.actionButtons}>
        {false && (
          <Button
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
          />
        )}

        <>
          <Button
            disabled={!isExistingProject}
            intent={
              !isExistingProject ? "none" : publishedToAll ? "none" : "primary"
            }
            minimal
            small
            icon={"globe"}
            style={{ marginRight: "5px" }}
            onClick={() => {
              setShowPanel(VisiblePanel.Publish);
            }}
          >
            Publish
          </Button>
          <Button
            intent={isChanged ? "primary" : "none"}
            minimal
            small
            icon={"floppy-disk"}
            style={{ marginRight: "5px" }}
            onClick={() => {
              setShowPanel(VisiblePanel.Save);
            }}
          >
            Save
          </Button>
          <Button
            disabled={!isExistingProject}
            minimal
            small
            icon={"floppy-disk"}
            style={{ marginRight: "5px" }}
            onClick={() => {
              setShowPanel(VisiblePanel.SaveAs);
            }}
          >
            Save as...
          </Button>
        </>

        <Portal>
          {(showPanel === VisiblePanel.Save ||
            showPanel === VisiblePanel.SaveAs) && (
            <div ref={sharedRef} className={css.floatingSavePanel}>
              <SavePanel
                isSaveAs={showPanel === VisiblePanel.SaveAs}
                onRequestClose={() => setShowPanel(VisiblePanel.None)}
              />
            </div>
          )}

          {showPanel === VisiblePanel.Publish && (
            <div ref={sharedRef} className={css.floatingSavePanel}>
              <PublishPanel
                onRequestClose={() => {
                  setShowPanel(VisiblePanel.None);
                }}
                onChange={() => {
                  reloadAssignedStorageObjects();
                }}
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
        >
          Add
        </Button>
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
        confirmButtonText={
          editor.sliderChanged
            ? "Discard changes and create new Slider"
            : "Create new Slider"
        }
        canOutsideClickCancel={false}
        icon={
          <Icon
            icon="info-sign"
            size={36}
            intent={editor.sliderChanged ? Intent.WARNING : Intent.PRIMARY}
          />
        }
        intent={Intent.PRIMARY}
        isOpen={isDiscartConfirmOpen}
        onCancel={() => setIsDiscartConfirmOpen(false)}
        onConfirm={createNewSlider}
        className="bp3-dark"
      >
        {editor.sliderChanged ? (
          <p>You have unsaved changes. Press "Cancel" to go back to project.</p>
        ) : (
          <p>
            Close current slider and create new one. <br />
            It's safe to continue without save as you have not made any changes
            to current project.
          </p>
        )}
      </Alert>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  previewState: state.stage.previewState,
  meta: state.meta,
  editor: state.editor,
  breakpointsConfiguration:
    state.project.settings.breakpoints.breakpointsConfiguration,
  selectedDevice: state.stage.selectedDevice,
  project: state.project,
  slides: state.project.slides,
  layers: state.project.layers,
  objects: state.project.objects,
  settings: state.project.settings,
});

const mapDispatchToProps = {
  _setStagePreview: (previewState: Partial<IPreviewState>) =>
    setStagePreview(previewState),
  _createNewProject: () => createNewProject(),
  _doClearHistory: () => doClearHistory(),
  _initializeSlideAndLayer: initializeSlideAndLayer,
  _setDevice: setDevice,
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionPanel);
