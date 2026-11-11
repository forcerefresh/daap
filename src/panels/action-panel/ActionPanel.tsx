import React, {
  SyntheticEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { connect } from "react-redux";
import { Button, Portal, Switch } from "@blueprintjs/core";
import css from "./ActionPanel.module.scss";
import { IStore } from "../../store/store";
import {
  setDevice,
  setStagePreview,
  setTheme,
  updateEditor,
  updateGlobalConfiguration,
} from "../../store/actions/actions";
import { IPreviewState } from "../../store/reducers/stage";
import cx from "classnames";
import { getResponsiveIcon } from "../../utils/icons/responsive-icons-factory";
import { getIconByType } from "../../store/reducers/settings";
import SavePanel from "../save-panel/SavePanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { IEditor } from "../../store/reducers/editor";
import { IntegrationContext } from "../../integration";
import PublishPanel from "../publish-panel/PublishPanel";
import { ObjectStorageItem } from "../../integration/hooks/object-storage-hook/i-object-storage-hook";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { setupNewProject } from "../../store/actions/multi-actions";
import ChangeCheckerButton from "../../utils/components/change-checker-button/ChangeCheckerButton";
import { IAppSettings } from "../../store/reducers/globals";
import { ITheme } from "../../store/reducers/i-settings";
import { PanelHeader } from "../common/panel-header/PanelHeader";
import * as htmlToImage from "html-to-image";

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
    _setDevice,
    _setupNewProject,
    previewState,
    meta,
    editor,
    breakpointsConfiguration,
    selectedDevice,
    settings,
    _updateGlobalConfiguration,
    _setTheme,
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
    "bp5-overlay-scroll-container", // alert
    "bp5-menu", //menu
    "bp5-toast",
  ]);

  // api
  const globalContext = useContext(IntegrationContext);
  const CloseMonitorComponent = globalContext?.CloseMonitorComponent as
    | React.FC
    | any;

  const { supportStorageObjects, listAssignedStorageObjects } =
    globalContext.useObjectStorageHook();

  const isChanged = editor.sliderChanged;
  const isExistingProject = editor.isExistingProject;

  const [assignedBuckets, setAssignedBuckets] = useState<ObjectStorageItem[]>(
    [],
  );
  const reloadAssignedStorageObjects = () => {
    if (supportStorageObjects) {
      listAssignedStorageObjects({ projectId: meta.id! }).then((res) => {
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
      (bucket) => bucket.assignedProject?.revision !== meta.saveRevision,
    );

  const createNew = () => {
    _setupNewProject();
  };

  const renderBreakpointButton = (conf: BreakpointConfiguration) => {
    if (!conf.enabled) return null;

    const icon = getIconByType(conf.type);
    const size = getIconSize(icon);

    return (
      <Button
        key={conf.type}
        active={selectedDevice === conf.type}
        minimal
        outlined
        large
        icon={getResponsiveIcon(
          icon,
          size.w,
          size.h,
          "lightgray",
          conf.portrait,
        )}
        className={cx(css.responsiveButton, {})}
        onClick={() => {
          _setDevice(conf.type);
        }}
      >
        <div className={css.responsiveButtonNumber}></div>
      </Button>
    );
  };

  return (
    <div className={css.actionPanel}>
      <PanelHeader>
        <div style={{ display: "flex" }}>
          SLIDER
          <span className={cx(css.sliderName)}>
            {meta.name ? meta.name : "Untitled"}
          </span>
        </div>
        <Switch
          style={{ margin: "2px" }}
          checked={settings.theme === "dark"}
          onChange={(evt: SyntheticEvent<HTMLInputElement>) => {
            _setTheme(evt.currentTarget.checked ? "dark" : "light");
          }}
        />
      </PanelHeader>
      <div className={css.actionButtons}>
        {false && (
          <Button
            minimal
            small
            active={previewState.paused}
            icon={"pause"}
            style={{ marginRight: "20px" }}
            onClick={() => {
              _setStagePreview({
                ...previewState,
                paused: !previewState.paused,
              });
            }}
          />
        )}
        <>
          <ChangeCheckerButton
            minimal
            onAllow={() => createNew()}
            onDenied={() => {}}
            confirmButtonText={"Discard changes and Create Project"}
            className={css.addNewSlide}
            small={true}
            icon="add"
          >
            New
          </ChangeCheckerButton>
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
        <Button
          onClick={() => {
            const node = document.getElementsByClassName(
              "pan-and-zoom",
            )[0] as HTMLElement;

            htmlToImage
              .toPng(node, {})
              .then(function (dataUrl) {
                const img = new Image();
                img.src = dataUrl;
                img.style!.zIndex = "2300";
                img.style!.position = "absolute";
                img.style!.bottom = "0px";
                img.style!.left = "0px";
                document.body.appendChild(img);
              })
              .catch(function () {});
            return;
          }}
        >
          SS
        </Button>
        <div>
          {[...breakpointsConfiguration].reverse().map(renderBreakpointButton)}
        </div>
      </div>

      <CloseMonitorComponent
        onNewVersion={(props: { version: string }) => {
          _updateGlobalConfiguration({ availableVersion: props.version });
        }}
      />
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
  settings: state.project.settings,
});

const mapDispatchToProps = {
  _updateGlobalConfiguration: (config: Partial<IAppSettings>) =>
    updateGlobalConfiguration(config),
  _setStagePreview: (previewState: Partial<IPreviewState>) =>
    setStagePreview(previewState),
  _setDevice: setDevice,
  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),
  _setupNewProject: () => setupNewProject({} as any),
  _setTheme: (theme: ITheme) => setTheme(theme),
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionPanel);
