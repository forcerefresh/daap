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
  updateEditor,
  updateProjectMeta,
} from "../../store/actions/actions";
import { IObject, ObjectType } from "webslider-sdk2/lib/objects/i-object";
import { IntegrationContext } from "../../integration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { IMeta } from "../../store/reducers/meta";
import { logger } from "webslider-sdk2/lib/utils/logger/logger";
import css from "./MyTemplatesPanel.module.scss";

interface ITemplatesPanelProps {
  onRequestClose: () => void;
}

export type ITemplatesMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ITemplatesPanelProps;

const MyTemplatesPanel: React.FC<ITemplatesMergedProps> = (props) => {
  const {
    onRequestClose,
    _updateProjectMeta,
    _openProject,
    _doClearHistory,
    _resetChangedState,
    _activateSlide,
    _selectSlides,
    _selectForProperties,
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

  const fetchData = (from = -1) => {
    setLoading(true);

    from = from === -1 ? templates?.length || 0 : from;

    getTemplates(from, searchValue).then(
      (result) => {
        if (from === 0) {
          setTemplates([...result.templates]);
        } else {
          setTemplates([...templates, ...result.templates]);
        }
        setLoading(false);
        setHasMore(result.templates.length > 0);
      },

      (error) => {
        logger.error(error);
      }
    );
  };

  useEffect(() => {
    debounceFetchData();
  }, []);

  const getTemplateById = (id: string) => {
    return templates?.find((tl) => tl.id === id);
  };

  const debounceFetchData = debounce((from = -1) => fetchData(from), 100);

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
        name: response.template.name,
        description: response.template.description,
        // modified: response.template.modified,
        // created: response.template.created,
        saveRevision: 0,
        //publishRevision: response.project.publishRevision,
      };
      _updateProjectMeta(meta);

      const project = response.template.project;

      _openProject(project);

      _doClearHistory();

      _resetChangedState();

      const slideIdToSelect = response.template.project.slides.normalSlides[0];
      if (slideIdToSelect) {
        _activateSlide(slideIdToSelect);
        _selectSlides([slideIdToSelect]);
        _selectForProperties({ id: slideIdToSelect, type: "slide" });
      }

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
  const getTemplatePreviewHtml = (template: any) => {
    const htmlStr = template.preview.html;
    return htmlStr
      .replace(
        "webslider-fp://my-uploads/my-images/",
        `webslider-fp://my-uploads/my-templates/${template.id}/assets/`
      )
      .replace(
        "webslider-fp://my-uploads/my-videos/",
        `webslider-fp://my-uploads/my-templates/${template.id}/assets/`
      );
  };

  return (
    <div className={css.projectsPanel}>
      <UploadComponent
        type="template"
        onComplete={() => {
          debounceFetchData(0);
          //setForceUpdate(Math.random());
        }}
        onStop={() => {
          debounceFetchData(0);
          //setForceUpdate(Math.random());
        }}
      />
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
        <div className={css.name}>Name, Id &amp; Description</div>
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
                      width: template.preview.width + "px",
                      height: template.preview.height + "px",
                    }}
                  >
                    <div
                      className={css.thumbHolderInner}
                      dangerouslySetInnerHTML={{
                        __html: getTemplatePreviewHtml(template),
                      }}
                      style={{
                        transform: `scale(${round(template.preview.scale, 2)})`,
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
                  {new Date(template.created).toLocaleDateString()}
                  <br />
                  {new Date(template.created).toLocaleTimeString()}
                </div>
                <div className={css.action}>
                  <Button
                    intent="primary"
                    onClick={() => onLoadTemplate(template.id)}
                  >
                    Load template
                  </Button>
                  <a
                    href={`webslider-fp://my-uploads/my-templates/${template.id}.zip`}
                  >
                    <Button
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
                    </Button>
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
        className="bp3-dark"
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
  _addNewObject: (
    layerId: string,
    type: ObjectType,
    objectProps: Partial<IObject>,
    values?: { [key: string]: any }
  ) => addNewObject(layerId, type, objectProps, values),
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _openProject: (project: any) => openProject(project),
  _doClearHistory: () => doClearHistory(),
  _resetChangedState: () =>
    updateEditor({ sliderChanged: false, isExistingProject: true }),
  _activateSlide: (id: string): any => activateSlide(id),
  _selectSlides: (ids: string[]): any => selectSlides(ids),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
};

export default connect(mapStateToProps, mapDispatchToProps)(MyTemplatesPanel);
