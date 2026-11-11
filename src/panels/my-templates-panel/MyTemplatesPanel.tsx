import React, { useContext } from "react";
import { Button } from "@blueprintjs/core";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import {
  activateSlide,
  doClearHistory,
  openProject,
  selectForProperties,
  selectForPropertiesProps,
  selectSlides,
  setDevice,
  updateEditor,
  updateProjectMeta,
} from "../../store/actions/actions";
import { IntegrationContext } from "../../integration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { IMeta } from "../../store/reducers/meta";
import { ISettings } from "../../store/reducers/i-settings";
import { getMissingExtensionsFromProject } from "../../utils/extensions/extensions-utils";
import ChangeCheckerButton from "../../utils/components/change-checker-button/ChangeCheckerButton";
import { IPages } from "../../store/reducers/i-pages";
import { preloadFonts } from "../../utils/project/project-utils";
import {
  LibraryPanel,
  LibraryRowCtx,
} from "../common/library-panel/LibraryPanel";

interface ITemplatesPanelProps {
  onRequestClose: () => void;
}

export type ITemplatesMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ITemplatesPanelProps;

const MyTemplatesPanel: React.FC<ITemplatesMergedProps> = (props) => {
  const {
    onRequestClose,
    _resetChangedState,
    _updateProjectMeta,
    _openProject,
    _doClearHistory,
    _activateSlide,
    _selectSlides,
    _selectForProperties,
    _setDevice,
    _updateEditor,
  } = props;

  const globalContext = useContext(IntegrationContext);
  const { getTemplate, getTemplates, deleteTemplate } =
    globalContext.useTemplateHook();

  const fetchFn = (page: number, search: string) =>
    getTemplates(page, search);

  const onLoadTemplate = (id: string) => {
    getTemplate(id).then((response: any) => {
      const meta: IMeta = {
        id: undefined,
        name: response.name,
        description: response.description,
        saveRevision: 0,
      };
      _updateProjectMeta(meta);

      const project: { settings: ISettings; pages: IPages } = response.project;

      _openProject(project);

      _setDevice(
        [...project.settings.breakpoints.breakpointsConfiguration]
          .reverse()
          .find((bc) => bc.enabled)?.type || "device-independent"
      );

      const missingExtensions = getMissingExtensionsFromProject(
        response.extensions
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

      const slideIdToSelect = project.pages.pages[0];
      if (slideIdToSelect) {
        _activateSlide(slideIdToSelect);
        _selectSlides([slideIdToSelect]);
        _selectForProperties({ id: slideIdToSelect, type: "slide" });
      }

      _updateEditor({ sliderChanged: true, isExistingProject: false });
      _doClearHistory();
      _resetChangedState();

      preloadFonts(response?.fonts ?? []);

      onRequestClose();
    });
  };

  const renderRow = (template: any, { onDelete, classes }: LibraryRowCtx) => (
    <>
      <div className={classes.thumb}>
        <div
          className={classes.thumbHolder}
          style={{
            width: template.preview.width + "px",
            height: template.preview.height + "px",
          }}
        >
          <div
            className={classes.thumbHolderInner}
            style={{
              backgroundRepeat: "no-repeat",
              backgroundImage: `url('${template.preview.base64}')`,
              height: "100%",
            }}
          />
        </div>
      </div>
      <div className={classes.name}>
        {template.name}
        <br />
        <span className={classes.description}>{template.description}</span>
      </div>
      <div className={classes.slides}>{template.slides}</div>
      <div className={classes.created}>
        {new Date(template.created).toLocaleDateString()}
      </div>
      <div className={classes.action}>
        <ChangeCheckerButton
          intent="primary"
          onAllow={() => onLoadTemplate(template.id)}
          onDenied={() => {}}
          confirmButtonText="Discard changes and Load template"
        >
          Use template
        </ChangeCheckerButton>
        <Button
          intent="danger"
          icon="trash"
          className={classes.delete}
          minimal
          onClick={() => onDelete(template.id)}
        />
      </div>
    </>
  );

  return (
    <LibraryPanel
      title="TEMPLATES"
      fetchFn={fetchFn}
      searchPlaceholder="Find template..."
      columns={[
        { key: "thumb", label: "Preview" },
        { key: "name", label: "Name & Description" },
        { key: "slides", label: "Pages" },
        { key: "created", label: "Created" },
        { key: "action", label: "Action" },
      ]}
      renderRow={renderRow}
      onDelete={async (id, removeItem) => {
        const { id: deletedId } = await deleteTemplate(id);
        removeItem(String(deletedId));
        AppToaster.show({ intent: "success", message: "Template is successfully deleted." });
      }}
      deleteMessage={(template) => (
        <>
          Are you sure you want to delete <b>{template?.name}</b> template?
        </>
      )}
    />
  );
};

const mapStateToProps = (_state: IStore) => ({});

const mapDispatchToProps = {
  _resetChangedState: () =>
    updateEditor({ sliderChanged: false, isExistingProject: true }),
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _openProject: (project: any) => openProject(project),
  _doClearHistory: () => doClearHistory(),
  _activateSlide: (id: string): any => activateSlide(id),
  _selectSlides: (ids: string[]): any => selectSlides(ids),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _setDevice: setDevice,
  _updateEditor: updateEditor,
};

export default connect(mapStateToProps, mapDispatchToProps)(MyTemplatesPanel);
