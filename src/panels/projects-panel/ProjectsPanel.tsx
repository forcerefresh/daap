import React, { useContext } from "react";
import { Button } from "@blueprintjs/core";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import {
  doClearHistory,
  openProject,
  setDevice,
  updateColorsState,
  updateEditor,
  updateProjectMeta,
} from "../../store/actions/actions";
import { IntegrationContext } from "../../integration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { IMeta } from "../../store/reducers/meta";
import { ISettings } from "../../store/reducers/i-settings";
import { setupNewProject } from "../../store/actions/multi-actions";
import { IEditor } from "../../store/reducers/editor";
import { getMissingExtensionsFromProject } from "../../utils/extensions/extensions-utils";
import ChangeCheckerButton from "../../utils/components/change-checker-button/ChangeCheckerButton";
import { preloadFonts } from "../../utils/project/project-utils";
import {
  LibraryPanel,
  LibraryRowCtx,
} from "../common/library-panel/LibraryPanel";
import { IColors } from "../../store/reducers/i-colors";
import axios from "axios";
import { useLayoutHook } from "../layouts-panel/useLayoutHook";
import css from "./ProjectsPanel.module.scss";

interface IProjectsPanelProps {
  onRequestClose: () => void;
}

export type IProjectsMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IProjectsPanelProps;

const ProjectsPanel: React.FC<IProjectsMergedProps> = (props) => {
  const {
    meta,
    onRequestClose,
    _updateProjectMeta,
    _openProject,
    _doClearHistory,
    _resetChangedState,
    _setDevice,
    _setupNewProject,
    _updateColorsState,
    _updateEditor,
    publishSettings,
  } = props;

  const globalContext = useContext(IntegrationContext);
  const { getProject, getProjects, deleteProject } =
    globalContext.useProjectHook();
  const { getLayout, updateLayout, saveLayout } = useLayoutHook();

  const fetchFn = (page: number, search: string) => getProjects(page, search);

  const onPublishProject = async (id: string, projects: any[]) => {
    const project = await getProject(id);

    let layout: any;
    try {
      layout = await getLayout(id);
    } catch (ex) {}

    project.parentId = localStorage?.getItem("aiGenEditLayout_ParentLayoutId");

    if (layout) {
      await updateLayout(id, project);
    } else {
      await saveLayout(project);
    }

    localStorage.removeItem("aiGenEditLayout_ParentLayoutId");
    localStorage.removeItem("aiGenEditLayout_SavedProjectId");

    axios
      .post(`/api/v1/publish/${id}`, props)
      .then(() => {
        AppToaster.show({
          intent: "success",
          message: "Document is successfully published.",
        });
      })
      .catch(() => {
        AppToaster.show({
          intent: "danger",
          message: "Something went wrong. Document is not saved.",
        });
      });
  };

  const onOpenProject = (id: string) => {
    getProject(id).then((responseProject: any) => {
      const projectMeta: IMeta = {
        id: responseProject.id,
        name: responseProject.name,
        description: responseProject.description,
        modified: responseProject.modified,
        created: responseProject.created,
        saveRevision: responseProject.saveRevision,
      };
      _updateProjectMeta(projectMeta);

      const project: { settings: ISettings; diff: any; fonts: any[]; colors: any } =
        responseProject.project;

      delete project.diff;

      _setDevice(
        [...project.settings.breakpoints.breakpointsConfiguration]
          .reverse()
          .find((bc) => bc.enabled)?.type || "device-independent"
      );

      _openProject(project);

      const missingExtensions = getMissingExtensionsFromProject(
        responseProject.extensions
      );
      _updateEditor({ missingExtensions });
      if (missingExtensions.length > 0) {
        AppToaster.show({
          intent: "warning",
          message:
            "Missing Extension found! Go to Library > Extensions to install missing extensions.",
        });
      }

      _doClearHistory();
      _resetChangedState();
      preloadFonts(responseProject?.fonts ?? []);
      onRequestClose();
      _updateColorsState(project.colors);
    });
  };

  const renderRow = (project: any, { onDelete, classes }: LibraryRowCtx) => (
    <>
      <div className={classes.thumb}>
        <div
          className={classes.thumbHolder}
          style={{
            width: project.preview.width + "px",
            height: project.preview.height + "px",
          }}
        >
          <div
            className={classes.thumbHolderInner}
            style={{
              backgroundRepeat: "no-repeat",
              backgroundImage: `url('${project.preview.base64}')`,
              height: "100%",
            }}
          />
        </div>
      </div>
      <div className={classes.name}>
        {project.name}
        <br />
        <span className={classes.description}>{project.description}</span>
      </div>
      <div className={classes.slides}>{project.slides}</div>
      <div className={classes.created}>
        {new Date(project.created).toLocaleDateString()}
        <br />
        {new Date(project.created).toLocaleTimeString()}
      </div>
      <div className={classes.modified}>
        {new Date(project.modified).toLocaleDateString()}
        <br />
        {new Date(project.modified).toLocaleTimeString()}
      </div>
      <div className={classes.action} style={{ position: "relative" }}>
        <ChangeCheckerButton
          intent="primary"
          onAllow={() => onOpenProject(project.id)}
          onDenied={() => {}}
          confirmButtonText="Discard changes and Open project"
        >
          Open
        </ChangeCheckerButton>

        {publishSettings?.enabled && project.saveRevision === project.publishRevision ? (
          <div className={css.publishedMessage}>Published</div>
        ) : null}

        {publishSettings?.enabled ? (
          <Button intent="none" onClick={() => onPublishProject(project.id, [])}>
            {project.publishRevision === -1 ? "Publish" : "Republish"}
          </Button>
        ) : null}

        {localStorage?.getItem("aiGenEditLayout_SavedProjectId") === project.id && (
          <div>Will link to parent</div>
        )}

        <Button
          intent="danger"
          icon="trash"
          className={classes.delete}
          minimal
          onClick={() => onDelete(project.id)}
        />
        <div className={css.idHolder}>{project.id}</div>
      </div>
    </>
  );

  return (
    <LibraryPanel
      title="DOCUMENTS"
      fetchFn={fetchFn}
      searchPlaceholder="Find project..."
      columns={[
        { key: "thumb", label: "Preview" },
        { key: "name", label: "Name & Description" },
        { key: "slides", label: "Pages" },
        { key: "created", label: "Created" },
        { key: "modified", label: "Modified" },
        { key: "action", label: "Action" },
      ]}
      renderRow={renderRow}
      onDelete={async (id, removeItem) => {
        const { id: deletedId } = await deleteProject(id);
        removeItem(String(deletedId));
        AppToaster.show({ intent: "success", message: "Slider is successfully deleted." });
        if (meta.id === id) {
          _setupNewProject();
        }
      }}
      deleteMessage={(project) => (
        <>
          Are you sure you want to delete <b>{project?.name}</b> slider?
        </>
      )}
    />
  );
};

const mapStateToProps = (state: IStore) => ({
  meta: state.meta,
  publishSettings: state.globals.publishSettings,
});

const mapDispatchToProps = {
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _openProject: (project: any) => openProject(project),
  _doClearHistory: () => doClearHistory(),
  _resetChangedState: () =>
    updateEditor({ sliderChanged: false, isExistingProject: true }),
  _setDevice: setDevice,
  _setupNewProject: () => setupNewProject(),
  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),
  _updateColorsState: (colorsState: Partial<IColors>) =>
    updateColorsState(colorsState),
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsPanel);
