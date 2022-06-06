import React, { useContext, useEffect, useRef, useState } from "react";
import cx from "classnames";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce, remove, round, uniq } from "lodash-es";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import {
  Alert,
  Button,
  Checkbox,
  InputGroup,
  Intent,
  Popover,
  PopoverInteractionKind,
  Position,
  Spinner,
  Tag,
  Text,
} from "@blueprintjs/core";
import {
  addNewObject,
  doClearHistory,
  openProject,
  updateEditor,
  updateProjectMeta,
} from "../../store/actions/actions";
import { IObject, ObjectType } from "../../webslider-sdk/src/objects/i-object";

import css from "./ProjectsPanel.module.scss";
import { IntegrationContext } from "../../integration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { IMeta } from "../../store/reducers/meta";

interface ImageItem {
  url: string;
  size: {
    height: number;
    width: number;
    type: string;
  };
}

interface ImageData {
  id: string;
  name: string;
  description: string;
}

interface IProjectsPanelProps {
  onRequestClose: () => void;
}

export type IProjectsMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IProjectsPanelProps;

const ProjectsPanel: React.FC<IProjectsMergedProps> = (props) => {
  const {
    onRequestClose,
    _updateProjectMeta,
    _openProject,
    _doClearHistory,
    _resetChangedState,
  } = props;

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteLoading, setDeleteLoading] = useState(false);

  const badImages = React.useRef<number[]>([]);

  const globalContext = useContext(IntegrationContext);
  const { getProject, getProjects, deleteProject } = globalContext.useAPIHook();

  const fetchData = (from = -1) => {
    setLoading(true);

    from = from === -1 ? projects?.length || 0 : from;

    getProjects(from, searchValue).then(
      (result) => {
        console.log(result);
        if (from === 0) {
          setProjects([...result.projects]);
        } else {
          setProjects([...projects, ...result.projects]);
        }
        setLoading(false);
        setHasMore(result.projects.length > 0);
      },

      (error) => {
        console.log(error);
        /*this.setState({
            isLoaded: true,
            error,
          });*/
      }
    );

    setTimeout(() => {
      console.log(uniq(badImages.current));
    }, 500);
  };

  useEffect(() => {
    debounceFetchData();
  }, []);

  const debounceFetchData = debounce((from = -1) => fetchData(from), 100);

  const deleteIdRef = useRef(-1);
  const onDeleteProject = (id: number) => {
    setIsOpen(true);
    deleteIdRef.current = id;
  };

  const deleteConfirm = () => {
    setDeleteLoading(true);

    console.log(deleteIdRef.current);
    deleteProject(deleteIdRef.current).then(({ id }: { id: number }) => {
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
    });
  };

  const deleteCancel = () => {
    setIsOpen(false);
    setDeleteLoading(false);
  };

  const onOpenProject = (id: number) => {
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

      const project = response.project.project;
      delete project.diff;

      _openProject(project);

      _doClearHistory();

      _resetChangedState();

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
        <div className={css.id}>ID</div>
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
            <p style={{ textAlign: "center", margin: "20px" }}>
              <Spinner size={50} />
            </p>
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
            <>
              <div className={cx(css.headerSection, css.tableRow)}>
                <div className={css.id}>{project.id}</div>
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
                  <Button
                    intent="primary"
                    onClick={() => onOpenProject(project.id)}
                  >
                    Open
                  </Button>
                  {/*<Button intent="primary">Integration</Button>*/}
                  <Button
                    intent="danger"
                    icon="trash"
                    className={css.delete}
                    minimal
                    onClick={() => onDeleteProject(project.id)}
                  ></Button>
                </div>
              </div>
            </>
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
          Are you sure you want to delete <b>filename</b> slider?
        </p>
      </Alert>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
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
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsPanel);
