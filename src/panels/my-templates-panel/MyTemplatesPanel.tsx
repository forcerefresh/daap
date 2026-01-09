import React, { useContext, useEffect, useRef, useState } from "react";
import cx from "classnames";
import { base64ToBlob, downloadBlob } from "../../utils/file/file-utils";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce, isNil, remove, round } from "lodash-es";
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
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { IntegrationContext } from "../../integration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { IMeta } from "../../store/reducers/meta";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import css from "./MyTemplatesPanel.module.scss";
import { ISettings } from "../../store/reducers/i-settings";
import { getMissingExtensionsFromProject } from "../../utils/extensions/extensions-utils";
import ChangeCheckerButton from "../../utils/components/change-checker-button/ChangeCheckerButton";
import { IPages } from "../../store/reducers/i-pages";
import {
  preloadFonts,
  updateProjectWithNewIds,
} from "../../utils/project/project-utils";
import { Pagination } from "../../types/pagination";
import { RightPanelHeader } from "../common/panel-header/PanelHeader";

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

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteLoading, setDeleteLoading] = useState(false);

  const globalContext = useContext(IntegrationContext);
  const UploadComponent = globalContext?.getMyUploadComponent;
  const { getTemplate, getTemplates, deleteTemplate, downloadTemplate } =
    globalContext.useTemplateHook();

  const [latestPagination, setLatestPagination] = useState<Pagination | null>(
    null
  );

  const fetchData = (fromPage?: number) => {
    setLoading(true);

    let from: number | null = null;

    if (isNil(fromPage)) {
      if (isNil(latestPagination)) {
        // load first page
        from = 1;
      } else {
        // load next page
        if (!isNil(latestPagination.nextPage)) {
          from = latestPagination.nextPage;
        }
      }
    } else {
      from = fromPage;
    }

    // from = from === -1 ? projects?.length || 0 : from;

    if (!isNil(from)) {
      getTemplates(from, searchValue).then(
        (result) => {
          if (from === 1) {
            setTemplates([...result.data]);
          } else {
            setTemplates([...templates, ...result.data]);
          }

          setLatestPagination(result.pagination);
          setLoading(false);
          setHasMore(!!result.pagination.nextPage);
        },

        (error) => {
          logger.app.error(error);
        }
      );
    }
  };

  useEffect(() => {
    debounceFetchData();
  }, []);

  const getTemplateById = (id: string) => {
    return templates?.find((tl) => tl.id === id);
  };

  const debounceFetchData = debounce(
    (fromPage?: number) => fetchData(fromPage),
    100
  );

  const deleteIdRef = useRef("");
  const onDeleteTemplate = (id: string) => {
    setIsOpen(true);
    deleteIdRef.current = id;
  };

  const deleteConfirm = () => {
    setDeleteLoading(true);

    deleteTemplate(deleteIdRef.current).then(({ id }: { id: number }) => {
      const newTemplates = templates.concat();
      remove(newTemplates, (p: any) => {
        return p.id === id;
      });
      setTemplates(newTemplates);

      if (newTemplates.length === 0) {
        setHasMore(false);
      }

      setIsOpen(false);
      setDeleteLoading(false);
      AppToaster.show({
        intent: "success",
        message: "Template is successfully deleted.",
      });
    });
  };

  const deleteCancel = () => {
    setIsOpen(false);
    setDeleteLoading(false);
  };

  const onLoadTemplate = (id: string) => {
    getTemplate(id).then((response: any) => {
      const meta: IMeta = {
        id: undefined, //response.project.id,
        name: response.name,
        description: response.description,
        // modified: response.modified,
        // created: response.created,
        saveRevision: 0,
        //publishRevision: response.project.publishRevision,
      };
      _updateProjectMeta(meta);

      const project: {
        // NOTE: there are other props. We need only settings from project
        settings: ISettings;
        pages: IPages;
      } = response.project;

      // const { updatedProject, fromToIds } = updateProjectWithNewIds(project);

      const updatedProject = project;

      _openProject(updatedProject);

      _setDevice(
        [...updatedProject.settings.breakpoints.breakpointsConfiguration]
          .reverse()
          .find((bc) => bc.enabled)?.type || "device-independent"
      );

      // missing extensions >>>
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
      // missing extensions <<<

      _doClearHistory();

      const slideIdToSelect = updatedProject.pages.pages[0];
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

      // _createNewProject();
      // _doClearHistory();
      // _initializeSlideAndLayer();
      // _updateEditor({ isExistingProject: false, sliderChanged: false });
      // if (isDiscartConfirmOpen) {
      //   setIsDiscartConfirmOpen(false);
      // }
    });
  };

  // NOTE: replace urls to point assets to template asset directory
  // const getTemplatePreviewHtml = (template: any) => {
  //   const htmlStr = template.preview.html;
  //   return htmlStr
  //     .replace(
  //       "webslider-fp://my-uploads/my-images/",
  //       `webslider-fp://my-uploads/my-templates/${template.id}/assets/`
  //     )
  //     .replace(
  //       "webslider-fp://my-uploads/my-videos/",
  //       `webslider-fp://my-uploads/my-templates/${template.id}/assets/`
  //     );
  // };

  return (
    <div className={cx("bp5-dark", css.projectsPanel)}>
      <RightPanelHeader>
        <div>TEMPLATES</div>
      </RightPanelHeader>

      {/* <UploadComponent
        type="template"
        onComplete={() => {
          debounceFetchData(1);
          //setForceUpdate(Math.random());
        }}
        onStop={() => {
          debounceFetchData(1);
          //setForceUpdate(Math.random());
        }}
      /> */}
      <div className={css.headerSection}>
        <InputGroup
          large
          leftIcon="search"
          placeholder="Find template..."
          rightElement={
            <Button
              large
              icon="arrow-right"
              onClick={() => {
                setTemplates(() => []);
                debounceFetchData(1);
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
              debounceFetchData(1);
            }
          }}
        ></InputGroup>
      </div>

      <div className={cx(css.headerSection, css.tableHeader)}>
        <div className={css.thumb}>Preview</div>
        <div className={css.name}>Name &amp; Description</div>
        <div className={css.slides}>Pages</div>
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
                <b>No templates were found for the chosen criteria.</b>
              ) : (
                <b>All templates have been loaded for the chosen criteria.</b>
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
                      width: template.preview.width + "px",
                      height: template.preview.height + "px",
                    }}
                  >
                    <div
                      className={css.thumbHolderInner}
                      // dangerouslySetInnerHTML={{
                      //   __html: getTemplatePreviewHtml(template),
                      // }}
                      // style={{
                      //   transform: `scale(${round(template.preview.scale, 2)})`,
                      // }}
                      style={{
                        backgroundRepeat: "no-repeat",
                        backgroundImage: `url('${template.preview.base64}')`,
                        height: "100%",
                      }}
                    ></div>
                  </div>
                </div>
                <div className={css.name}>
                  {template.name}
                  <br />
                  <span className={css.description}>
                    {template.description}
                  </span>
                </div>
                <div className={css.slides}>{template.slides}</div>
                <div className={css.created}>
                  {new Date(template.created).toLocaleDateString()}
                </div>
                <div className={css.action}>
                  <ChangeCheckerButton
                    intent="primary"
                    onAllow={() => onLoadTemplate(template.id)}
                    onDenied={() => {}}
                    confirmButtonText="Discard changes and Load template"
                  >
                    Use template
                  </ChangeCheckerButton>
                  <a
                    href={`webslider-fp://my-uploads/my-templates/${template.id}.zip`}
                  >
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
                  </a>

                  {/*<Button intent="primary">Integration</Button>*/}
                  <Button
                    intent="danger"
                    icon="trash"
                    className={css.delete}
                    minimal
                    onClick={() => onDeleteTemplate(template.id)}
                  ></Button>
                </div>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        canOutsideClickCancel={false}
        icon="trash"
        loading={isDeleteLoading}
        intent={Intent.DANGER}
        isOpen={isOpen}
        onCancel={deleteCancel}
        onConfirm={deleteConfirm}
        className="bp5-dark"
      >
        <p>
          Are you sure you want to delete{" "}
          <b>{getTemplateById(deleteIdRef.current)?.name}</b> template?
        </p>
      </Alert>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  // activeLayerId: state.project.selection.activeLayerId,
});

const mapDispatchToProps = {
  _resetChangedState: () =>
    updateEditor({ sliderChanged: false, isExistingProject: true }),
  _addNewObject: (
    layerId: string,
    type: string,
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

export default connect(mapStateToProps, mapDispatchToProps)(MyTemplatesPanel);
