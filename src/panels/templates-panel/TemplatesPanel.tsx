import React, { useContext, useEffect, useRef, useState } from "react";
import cx from "classnames";
import { base64ToBlob, downloadBlob } from "../../utils/file/file-utils";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce, remove, round } from "lodash-es";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import { Alert, Button, InputGroup, Intent, Spinner } from "@blueprintjs/core";
import {
  activateSlide,
  addNewObject,
  doClearHistory,
  openProject,
  selectForProperties,
  selectForPropertiesProps,
  selectSlides,
  setDevice,
  updateEditor,
  updateProjectMeta,
} from "../../store/actions/actions";
import { IObject, ObjectType } from "webslider-sdk/lib/objects/i-object";
import { IntegrationContext } from "../../integration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { IMeta } from "../../store/reducers/meta";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import css from "./TemplatesPanel.module.scss";
import { ISettings } from "../../store/reducers/i-settings";
import { getMissingExtensionsFromProject } from "../../utils/extensions/extensions-utils";
import ChangeCheckerButton from "../../utils/components/change-checker-button/ChangeCheckerButton";
import {
  preloadFonts,
  updateProjectWithNewIds,
} from "../../utils/project/project-utils";
import { ISlides } from "../../store/reducers/i-slides";

interface ITemplatesPanelProps {
  onRequestClose: () => void;
}

export type ITemplatesMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ITemplatesPanelProps;

const TemplatesPanel: React.FC<ITemplatesMergedProps> = (props) => {
  const {
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

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentlyUninstallingTemplates, setCurrentlyUninstallingTemplates] =
    useState<{ [key: string]: boolean }>({});

  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentlyInstallingTemplates, setCurrentlyInstallingTemplates] =
    useState<{ [key: string]: boolean }>({});
  const [installedTemplates, setInstalledTemplates] = useState<any[]>();

  const globalContext = useContext(IntegrationContext);
  const {
    installRemoteTemplate,
    uninstallRemoteTemplate,
    getRemoteTemplates,
    getRemoteTemplate,
    getInstalledRemoteTemplates,
  } = globalContext.useRemoteTemplateHook();

  useEffect(() => {
    getInstalledRemoteTemplates().then((res: { items: any[] }) => {
      setInstalledTemplates(res.items);
    });
  }, []);

  const fetchData = (from = -1) => {
    setLoading(true);

    from = from === -1 ? templates?.length || 0 : from;

    getRemoteTemplates(from, searchValue).then(
      (result) => {
        if (from === 0) {
          setTemplates([...result.items]);
        } else {
          setTemplates([...templates, ...result.items]);
        }
        setLoading(false);
        setHasMore(result.items.length > 0);
      },

      (error) => {
        logger.app.error(error);
      }
    );
  };

  useEffect(() => {
    debounceFetchData();
  }, []);

  const getTemplateById = (id: string) => {
    return templates?.find((tpl) => tpl.id === id);
  };

  const debounceFetchData = debounce((from = -1) => fetchData(from), 100);

  const onUninstallTemplate = (id: string) => {
    setCurrentlyUninstallingTemplates({
      ...currentlyUninstallingTemplates,
      [id]: true,
    });

    uninstallRemoteTemplate(id).then(() => {
      getInstalledRemoteTemplates().then((res) => {
        setInstalledTemplates(res.items);
      });

      setCurrentlyUninstallingTemplates({
        ...currentlyUninstallingTemplates,
        [id]: false,
      });

      AppToaster.show({
        intent: "success",
        message: `Template is successfully uninstalled.`,
      });
    });
  };

  const onInstallTemplate = (id: any) => {
    const tpl = getTemplateById(id);
    setCurrentlyInstallingTemplates({
      ...currentlyInstallingTemplates,
      [tpl.id]: true,
    });
    installRemoteTemplate({ ...tpl }).then((mItem) => {
      AppToaster.show({
        intent: "success",
        message: `Template "${tpl.name}" is successfully installed.`,
      });

      setCurrentlyInstallingTemplates({
        ...currentlyInstallingTemplates,
        [tpl.id]: false,
      });

      getInstalledRemoteTemplates().then((res) => {
        setInstalledTemplates(res.items);
      });
    });
  };

  const onLoadTemplate = (id: string) => {
    getRemoteTemplate(id).then((response: any) => {
      const meta: IMeta = {
        id: undefined, //response.project.id,
        name: response.template.name,
        description: response.template.description,
        // modified: response.template.modified,
        // created: response.template.created,
        saveRevision: 0,
        //publishRevision: response.project.publishRevision,
      };
      _updateProjectMeta(meta);

      const project: {
        // NOTE: there are other props. We need only settings from project
        settings: ISettings;
        slides: ISlides;
      } = response.template.project;

      const { updatedProject, fromToIds } = updateProjectWithNewIds(project);

      _openProject(updatedProject);

      _setDevice(
        [...updatedProject.settings.breakpoints.breakpointsConfiguration]
          .reverse()
          .find((bc) => bc.enabled)?.type || "large-1"
      );

      // missing extensions >>>
      const missingExtensions = getMissingExtensionsFromProject(
        response.template.extensions
      );
      _updateEditor({ missingExtensions });
      if (missingExtensions.length > 0) {
        AppToaster.show({
          intent: "warning",
          message:
            "Missing Extension found! Go to Library > Extensions to install missing extensions.",
        });
      }
      // missing extensions <<<

      _doClearHistory();

      const slideIdToSelect = updatedProject.slides.normalSlides[0];
      if (slideIdToSelect) {
        _activateSlide(slideIdToSelect);
        _selectSlides([slideIdToSelect]);
        _selectForProperties({ id: slideIdToSelect, type: "slide" });
      }

      _updateEditor({ sliderChanged: true, isExistingProject: false });

      _doClearHistory();

      preloadFonts(response.template?.fonts ?? []);

      onRequestClose();

      // _createNewProject();
      // _doClearHistory();
      // _initializeSlideAndLayer();
      // _updateEditor({ isExistingProject: false, sliderChanged: false });
      // if (isDiscartConfirmOpen) {
      //   setIsDiscartConfirmOpen(false);
      // }
    });
  };

  return (
    <div className={css.projectsPanel}>
      <div className={css.headerSection}>
        <InputGroup
          large
          leftIcon="search"
          placeholder="Find slider..."
          rightElement={
            <Button
              large
              icon="arrow-right"
              onClick={() => {
                setTemplates(() => []);
                debounceFetchData(0);
              }}
            />
          }
          value={searchValue}
          onChange={(event: any) => {
            setSearchValue((event.currentTarget as HTMLInputElement).value);
          }}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              setTemplates(() => []);
              debounceFetchData(0);
            }
          }}
        ></InputGroup>
      </div>

      <div className={cx(css.headerSection, css.tableHeader)}>
        <div className={css.thumb}>Thumbnail</div>
        <div className={css.name}>Name, Id, Description</div>
        <div className={css.slides}>Slides</div>
        <div className={css.created}>Created</div>
        <div className={css.action}>Action</div>
      </div>

      <div className={css.mainSection} id="mediaHolder">
        <InfiniteScroll
          dataLength={templates?.length || -1} //This is important field to render the next data
          next={debounceFetchData}
          hasMore={hasMore}
          loader={
            <div style={{ textAlign: "center", margin: "20px" }}>
              <Spinner size={50} />
            </div>
          }
          scrollableTarget="mediaHolder"
          scrollThreshold="5px"
          endMessage={
            <p
              style={{
                textAlign: "center",
                display: loading ? "none" : "block",
              }}
            >
              {templates.length === 0 ? (
                <b>There are no project for the selected criteria.</b>
              ) : (
                <b>All projects are loaded for the selected criteria.</b>
              )}
            </p>
          }
        >
          {templates?.map((template, idx) => (
            <div key={template.id}>
              <div className={cx(css.headerSection, css.tableRow)}>
                <div className={css.thumb}>
                  <div
                    className={css.thumbHolder}
                    style={{
                      width: "200px",
                      height: "150px",
                    }}
                  >
                    <div
                      className={css.thumbHolderInner}
                      // dangerouslySetInnerHTML={{
                      //   __html: getTemplatePreviewHtml(template),
                      // }}
                      style={{
                        backgroundImage: `url(${template.previewImage})`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                      }}
                    ></div>
                  </div>
                </div>
                <div className={css.name}>
                  <strong>{template.name}</strong> [{template.id}]
                  <br />
                  <span className={css.description}>
                    {template.description}
                  </span>
                </div>
                <div className={css.slides}>{template.slides}</div>
                <div className={css.created}>
                  {template.created &&
                    new Date(template.created).toLocaleDateString()}
                </div>
                <div className={css.action}>
                  {installedTemplates &&
                    !installedTemplates?.find(
                      (item) => item.id === template.id
                    ) && (
                      <Button
                        disabled={currentlyInstallingTemplates[template.id]}
                        intent="primary"
                        onClick={() => onInstallTemplate(template.id)}
                      >
                        {currentlyInstallingTemplates[template.id]
                          ? "Installing..."
                          : "Install Template"}
                      </Button>
                    )}

                  {installedTemplates &&
                    !!installedTemplates?.find(
                      (item) => item.id === template.id
                    ) && (
                      <>
                        <ChangeCheckerButton
                          intent="primary"
                          onAllow={() => onLoadTemplate(template.id)}
                          onDenied={() => {}}
                          confirmButtonText="Discard changes and Load template"
                        >
                          Load template
                        </ChangeCheckerButton>
                        <Button
                          disabled={currentlyInstallingTemplates[template.id]}
                          minimal
                          intent="danger"
                          icon="trash"
                          onClick={() => onUninstallTemplate(template.id)}
                        >
                          {currentlyUninstallingTemplates[template.id]
                            ? "Uninstalling..."
                            : "Uninstall"}
                        </Button>
                      </>
                    )}

                  {/* <Button
                      intent="none"
                      // onClick={async () => {
                      //   const base64Zip = await downloadTemplate({
                      //     id: template.id,
                      //   });

                      //   const blob = base64ToBlob(base64Zip, "application/zip");
                      //   downloadBlob(blob, `${template.id}.zip`);
                      // }}
                    >
                      Download template
                    </Button> */}
                  {/*<Button intent="primary">Integration</Button>*/}
                  {/* <Button
                    intent="danger"
                    icon="trash"
                    className={css.delete}
                    minimal
                    onClick={() => onDeleteTemplate(template.id)}
                  ></Button> */}
                </div>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  // activeLayerId: state.project.selection.activeLayerId,
});

const mapDispatchToProps = {
  _addNewObject: (
    layerId: string,
    type: ObjectType,
    objectProps: Partial<IObject>,
    values?: { [key: string]: any }
  ) => addNewObject(layerId, type, objectProps, values),
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

export default connect(mapStateToProps, mapDispatchToProps)(TemplatesPanel);
