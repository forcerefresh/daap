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
import css from "./LayoutsPanel.module.scss";
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

  const [layouts, setLayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteLoading, setDeleteLoading] = useState(false);

  const globalContext = useContext(IntegrationContext);
  const UploadComponent = globalContext?.getMyUploadComponent;
  const { getLayout, getLayouts, deleteLayout } = useLayoutHook();

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
      getLayouts(from, searchValue).then(
        (result) => {
          if (from === 1) {
            setLayouts([...result.data]);
          } else {
            setLayouts([...layouts, ...result.data]);
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

  const getLayoutById = (id: string) => {
    return layouts?.find((tl) => tl.id === id);
  };

  const debounceFetchData = debounce(
    (fromPage?: number) => fetchData(fromPage),
    100
  );

  const deleteIdRef = useRef("");
  const onDeleteLayout = (id: string) => {
    setIsOpen(true);
    deleteIdRef.current = id;
  };

  const deleteConfirm = () => {
    setDeleteLoading(true);

    deleteLayout(deleteIdRef.current).then(({ id }: { id: string }) => {
      const newLayouts = layouts.concat();
      remove(newLayouts, (p: any) => {
        return p.id === id;
      });
      setLayouts(newLayouts);

      if (newLayouts.length === 0) {
        setHasMore(false);
      }

      setIsOpen(false);
      setDeleteLoading(false);
      AppToaster.show({
        intent: "success",
        message: "Layout is successfully deleted.",
      });
    });
  };

  const deleteCancel = () => {
    setIsOpen(false);
    setDeleteLoading(false);
  };

  const onLoadLayout = (id: string) => {
    getLayout(id).then((response: any) => {
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

  // NOTE: replace urls to point assets to layout asset directory
  // const getLayoutPreviewHtml = (layout: any) => {
  //   const htmlStr = layout.preview.html;
  //   return htmlStr
  //     .replace(
  //       "webslider-fp://my-uploads/my-images/",
  //       `webslider-fp://my-uploads/my-layouts/${layout.id}/assets/`
  //     )
  //     .replace(
  //       "webslider-fp://my-uploads/my-videos/",
  //       `webslider-fp://my-uploads/my-layouts/${layout.id}/assets/`
  //     );
  // };

  return (
    <div className={cx("bp5-dark", css.layoutsPanel)}>
      <RightPanelHeader>
        <div>LAYOUTS</div>
      </RightPanelHeader>

      <UploadComponent
        type="layout"
        onComplete={() => {
          debounceFetchData(1);
          //setForceUpdate(Math.random());
        }}
        onStop={() => {
          debounceFetchData(1);
          //setForceUpdate(Math.random());
        }}
      />
      <div className={css.headerSection}>
        <InputGroup
          large
          leftIcon="search"
          placeholder="Find layout..."
          rightElement={
            <Button
              large
              icon="arrow-right"
              onClick={() => {
                setLayouts(() => []);
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
              setLayouts(() => []);
              debounceFetchData(1);
            }
          }}
        ></InputGroup>
      </div>

      <div className={cx(css.headerSection, css.tableHeader)}>
        <div className={css.thumb}>Preview</div>
        <div className={css.name}>Name &amp; Description</div>
        <div className={css.slides}>Slides</div>
        <div className={css.created}>Created</div>
        <div className={css.action}>Action</div>
      </div>

      <div className={css.mainSection} id="mediaHolder">
        <InfiniteScroll
          dataLength={layouts?.length || -1} //This is important field to render the next data
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
              {layouts.length === 0 ? (
                <b>No layouts were found for the chosen criteria.</b>
              ) : (
                <b>All layouts have been loaded for the chosen criteria.</b>
              )}
            </p>
          }
        >
          {layouts?.map((layout, idx) => (
            <div key={layout.id}>
              <div className={cx(css.headerSection, css.tableRow)}>
                <div className={css.thumb}>
                  <div
                    className={css.thumbHolder}
                    style={{
                      width: layout.preview.width + "px",
                      height: layout.preview.height + "px",
                    }}
                  >
                    <div
                      className={css.thumbHolderInner}
                      // dangerouslySetInnerHTML={{
                      //   __html: getLayoutPreviewHtml(layout),
                      // }}
                      // style={{
                      //   transform: `scale(${round(layout.preview.scale, 2)})`,
                      // }}
                      style={{
                        backgroundRepeat: "no-repeat",
                        backgroundImage: `url('${layout.preview.base64}')`,
                        height: "100%",
                      }}
                    ></div>
                  </div>
                </div>
                <div className={css.name}>
                  {layout.name}
                  <br />
                  <span className={css.description}>{layout.description}</span>
                </div>
                <div className={css.slides}>{layout.slides}</div>
                <div className={css.created}>
                  {new Date(layout.created).toLocaleDateString()}
                </div>
                <div className={css.action}>
                  <ChangeCheckerButton
                    intent="primary"
                    onAllow={() => onLoadLayout(layout.id)}
                    onDenied={() => {}}
                    confirmButtonText="Discard changes and Load layout"
                  >
                    Use layout
                  </ChangeCheckerButton>
                  {/* <a
                    href={`webslider-fp://my-uploads/my-layouts/${layout.id}.zip`}
                  > */}
                  {/* <Button
                      intent="none"
                      // onClick={async () => {
                      //   const base64Zip = await downloadLayout({
                      //     id: layout.id,
                      //   });

                      //   const blob = base64ToBlob(base64Zip, "application/zip");
                      //   downloadBlob(blob, `${layout.id}.zip`);
                      // }}
                    >
                      Download layout
                    </Button> */}
                  {/* </a> */}

                  {/*<Button intent="primary">Integration</Button>*/}
                  <Button
                    intent="danger"
                    icon="trash"
                    className={css.delete}
                    minimal
                    onClick={() => onDeleteLayout(layout.id)}
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
          <b>{getLayoutById(deleteIdRef.current)?.name}</b> layout?
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

export default connect(mapStateToProps, mapDispatchToProps)(LayoutsPanel);
