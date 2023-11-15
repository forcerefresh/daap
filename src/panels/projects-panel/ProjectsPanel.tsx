import React, { useContext, useEffect, useRef, useState } from "react";
import cx from "classnames";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce, remove, round, uniq } from "lodash-es";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import { Alert, Button, InputGroup, Intent, Spinner } from "@blueprintjs/core";
import {
  addNewObject,
  doClearHistory,
  openProject,
  setDevice,
  updateEditor,
  updateProjectMeta,
} from "../../store/actions/actions";
import { IObject, ObjectType } from "webslider-sdk/lib/objects/i-object";
import { IntegrationContext } from "../../integration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { IMeta } from "../../store/reducers/meta";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import css from "./ProjectsPanel.module.scss";
import { ISettings } from "../../store/reducers/i-settings";
import { setupNewProject } from "../../store/actions/multi-actions";
import { getDefaultSlide } from "../../objects/create-object-factory";
import { SlideType } from "../../store/reducers/i-slides";
import { IEditor } from "../../store/reducers/editor";
import { getMissingExtensionsFromProject } from "../../utils/extensions/extensions-utils";
import ChangeCheckerButton from "../../utils/components/change-checker-button/ChangeCheckerButton";
import { preloadFonts } from "../../utils/project/project-utils";

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
    _updateEditor,
  } = props;

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteLoading, setDeleteLoading] = useState(false);

  const globalContext = useContext(IntegrationContext);
  const { getProject, getProjects, deleteProject } =
    globalContext.useProjectHook();

  const fetchData = (from = -1) => {
    setLoading(true);

    from = from === -1 ? projects?.length || 0 : from;

    getProjects(from, searchValue).then(
      (result) => {
        if (from === 0) {
          setProjects([...result.projects]);
        } else {
          setProjects([...projects, ...result.projects]);
        }
        setLoading(false);
        setHasMore(result.projects.length > 0);
      },

      (error) => {
        logger.app.error(error);
      }
    );
  };

  useEffect(() => {
    debounceFetchData();
  }, []);

  const debounceFetchData = debounce((from = -1) => fetchData(from), 100);

  const deleteIdRef = useRef<{ id: string; name: string } | null>(null);
  const onDeleteProject = (id: string, name: string) => {
    setIsOpen(true);
    deleteIdRef.current = { id, name };
  };

  const deleteConfirm = () => {
    setDeleteLoading(true);

    deleteProject(deleteIdRef.current!.id).then(({ id }: { id: number }) => {
      const newProjects = projects.concat();
      remove(newProjects, (p: any) => {
        return p.id === id;
      });
      setProjects(newProjects);

      if (newProjects.length === 0) {
        setHasMore(false);
      }

      setIsOpen(false);
      setDeleteLoading(false);
      AppToaster.show({
        intent: "success",
        message: "Slider is successfully deleted.",
      });

      // cleanup open project if its deleted
      if (meta.id === deleteIdRef.current!.id) {
        _setupNewProject();
      }

      deleteIdRef.current = null;
    });
  };

  const deleteCancel = () => {
    setIsOpen(false);
    setDeleteLoading(false);
  };

  const onOpenProject = (id: string) => {
    getProject(id).then((response: any) => {
      const meta: IMeta = {
        id: response.project.id,
        name: response.project.name,
        description: response.project.description,
        modified: response.project.modified,
        created: response.project.created,
        saveRevision: response.project.saveRevision,
        //publishRevision: response.project.publishRevision,
      };
      _updateProjectMeta(meta);

      const project: {
        // NOTE: there are other props. We need only settings from project
        settings: ISettings;
        diff: any;
        fonts: any[];
      } = response.project.project;

      delete project.diff;

      _setDevice(
        [...project.settings.breakpoints.breakpointsConfiguration]
          .reverse()
          .find((bc) => bc.enabled)?.type || "large-1"
      );

      // NOTE: Backward compatibility: Front slide is added on 1st February 2023
      if (!(project as any).slides.loadSlides) {
        const loadSlide = getDefaultSlide("Load", SlideType.Load);
        (project as any).slides.loadSlides = [loadSlide.id];
        (project as any).slides.allSlides.push(loadSlide.id);
        (project as any).slides.slideById[loadSlide.id] = loadSlide;
      }

      _openProject(project);

      // missing extensions >>>
      const missingExtensions = getMissingExtensionsFromProject(
        response.project.extensions
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

      _resetChangedState();

      preloadFonts(response.project?.fonts ?? []);

      onRequestClose();
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
                setProjects(() => []);
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
              setProjects(() => []);
              debounceFetchData(0);
            }
          }}
        ></InputGroup>
      </div>

      <div className={cx(css.headerSection, css.tableHeader)}>
        {/* <div className={css.id}>ID</div> */}
        <div className={css.thumb}>Thumbnail</div>
        <div className={css.name}>Name &amp; Description</div>
        <div className={css.slides}>Slides</div>
        <div className={css.created}>Created</div>
        <div className={css.modified}>Modified</div>
        <div className={css.action}>Action</div>
      </div>

      <div className={css.mainSection} id="mediaHolder">
        <InfiniteScroll
          dataLength={projects?.length || -1} //This is important field to render the next data
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
              {projects.length === 0 ? (
                <b>There are no project for the selected criteria.</b>
              ) : (
                <b>All projects are loaded for the selected criteria.</b>
              )}
            </p>
          }
        >
          {projects?.map((project, idx) => (
            <div key={project.id}>
              <div className={cx(css.headerSection, css.tableRow)}>
                {/* <div className={css.id}>{project.id}</div> */}
                <div className={css.thumb}>
                  <div
                    className={css.thumbHolder}
                    style={{
                      width: project.preview.width + "px",
                      height: project.preview.height + "px",
                    }}
                  >
                    <div
                      className={css.thumbHolderInner}
                      dangerouslySetInnerHTML={{
                        __html: project.preview.html,
                      }}
                      style={{
                        transform: `scale(${round(project.preview.scale, 2)})`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className={css.name}>
                  {project.name}
                  <br />
                  <span className={css.description}>{project.description}</span>
                </div>
                <div className={css.slides}>{project.slides}</div>
                <div className={css.created}>
                  {new Date(project.created).toLocaleDateString()}
                  <br />
                  {new Date(project.created).toLocaleTimeString()}
                </div>
                <div className={css.modified}>
                  {new Date(project.modified).toLocaleDateString()}
                  <br />
                  {new Date(project.modified).toLocaleTimeString()}
                </div>
                <div className={css.action}>
                  <ChangeCheckerButton
                    intent="primary"
                    onAllow={() => onOpenProject(project.id)}
                    onDenied={() => {}}
                    confirmButtonText="Discard changes and Open project"
                  >
                    Open
                  </ChangeCheckerButton>
                  {/*<Button intent="primary">Integration</Button>*/}
                  <Button
                    intent="danger"
                    icon="trash"
                    className={css.delete}
                    minimal
                    onClick={() => onDeleteProject(project.id, project.name)}
                  ></Button>
                  <div className={css.idHolder}>{project.id}</div>
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
          Are you sure you want to delete <b>{deleteIdRef.current?.name}</b>{" "}
          slider?
        </p>
      </Alert>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  meta: state.meta,
  activeLayerId: state.project.selection.activeLayerId,
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
  _setDevice: setDevice,
  _setupNewProject: () => setupNewProject(),
  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsPanel);
