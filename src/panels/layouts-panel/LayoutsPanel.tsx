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
import { useLayoutHook } from "./useLayoutHook";

interface ILayoutsPanelProps {
  onRequestClose: () => void;
}

export type ILayoutsMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ILayoutsPanelProps;

const LayoutsPanel: React.FC<ILayoutsMergedProps> = (props) => {
  const {
    _resetChangedState,
    onRequestClose,
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
  const UploadComponent = globalContext?.getMyUploadComponent;
  const { getLayout, getLayouts, deleteLayout } = useLayoutHook();

  const fetchFn = (page: number, search: string) => getLayouts(page, search);

  const onLoadLayout = (id: string) => {
    getLayout(id).then((response: any) => {
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

  const renderRow = (layout: any, { onDelete, classes }: LibraryRowCtx) => (
    <>
      <div className={classes.thumb}>
        <div
          className={classes.thumbHolder}
          style={{
            width: layout.preview.width + "px",
            height: layout.preview.height + "px",
          }}
        >
          <div
            className={classes.thumbHolderInner}
            style={{
              backgroundRepeat: "no-repeat",
              backgroundImage: `url('${layout.preview.base64}')`,
              height: "100%",
            }}
          />
        </div>
      </div>
      <div className={classes.name}>
        {layout.name}
        <br />
        <span className={classes.description}>{layout.description}</span>
      </div>
      <div className={classes.slides}>{layout.slides}</div>
      <div className={classes.created}>
        {new Date(layout.created).toLocaleDateString()}
      </div>
      <div className={classes.action}>
        <ChangeCheckerButton
          intent="primary"
          onAllow={() => onLoadLayout(layout.id)}
          onDenied={() => {}}
          confirmButtonText="Discard changes and Load layout"
        >
          Use layout
        </ChangeCheckerButton>
        <Button
          intent="danger"
          icon="trash"
          className={classes.delete}
          minimal
          onClick={() => onDelete(layout.id)}
        />
      </div>
    </>
  );

  return (
    <LibraryPanel
      title="LAYOUTS"
      fetchFn={fetchFn}
      searchPlaceholder="Find layout..."
      columns={[
        { key: "thumb", label: "Preview" },
        { key: "name", label: "Name & Description" },
        { key: "slides", label: "Slides" },
        { key: "created", label: "Created" },
        { key: "action", label: "Action" },
      ]}
      renderRow={renderRow}
      onDelete={async (id, removeItem) => {
        const { id: deletedId } = await deleteLayout(id);
        removeItem(String(deletedId));
        AppToaster.show({ intent: "success", message: "Layout is successfully deleted." });
      }}
      deleteMessage={(layout) => (
        <>
          Are you sure you want to delete <b>{layout?.name}</b> layout?
        </>
      )}
      uploadSlot={
        <UploadComponent
          type="layout"
          onComplete={() => {}}
          onStop={() => {}}
        />
      }
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

export default connect(mapStateToProps, mapDispatchToProps)(LayoutsPanel);
