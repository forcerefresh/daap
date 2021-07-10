import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce, uniq } from "lodash-es";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import {
  Button,
  Checkbox,
  InputGroup,
  Popover,
  PopoverInteractionKind,
  Position,
  Spinner,
  Tag,
  Text,
} from "@blueprintjs/core";
import { addNewObject } from "../../store/actions/actions";
import { IObject, ObjectType } from "../../objects/types";

import css from "./ProjectsPanel.module.scss";
import { IntegrationContext } from "../../integration";

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
  const { activeLayerId, _addNewObject, onRequestClose } = props;

  const [projects, setProjects] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedResolution, setSelectedResolution] =
    useState<string>("medium");

  const badImages = React.useRef<number[]>([]);

  const globalContext = useContext(IntegrationContext);
  const { getProjects } = globalContext.useAPIHook();

  /*const onClickSave = (duplicate = false) => {
    setShowSpinner(true);
    saveProject({
      id: duplicate ? undefined : localMeta.id,
      name: localMeta.name!,
      description: localMeta.description!,
      project,
    }).then(({ id, name, description }) => {
      _updateProjectMeta({ id, name, description });
      setShowSpinner(false);
    });
  };*/

  const fetchData = (from = -1) => {
    setLoading(true);

    from = from === -1 ? projects?.length || 0 : from;

    getProjects(from, searchValue).then(
      (result) => {
        console.log(result);
        setProjects([...projects, ...result.projects]);
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

  const tags = [
    "Abstract",
    "Architecture",
    "Background",
    "Baking",
    "Texture",
    "Business",
    "Duotone",
    "Fashion",
    "Food",
    "Drink",
    "Holidays",
    "Letters",
    "Love",
    "Nature",
    "Animals",
    "People",
    "Roads",
    "Sports",
    "Technology",
    "Transportation",
  ];

  const [selectedTags, setSelectedTags] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleTag = (tag: string) => {
    setSelectedImage(-1);
    setSearchValue("");
    setSelectedTags(
      { [tag]: !selectedTags[tag] }
      //removeFalsy({ ...selectedTags, [tag]: !selectedTags[tag] })
    );
    setProjects([]);
  };

  useEffect(() => {
    console.log({ ...selectedTags });
    debounceFetchData(0);
  }, [selectedTags]);

  const [selectedImage, setSelectedImage] = useState<number>(-1);

  const qwe = (image: any, idx: number) => {
    if (!image.images.small) {
      badImages.current.push(idx);
      //console.log(image.title);
    }

    return null;
  };

  console.log(process.env);
  return (
    <div
      className={css.projectsPanel}
      onClick={() => {
        setSelectedImage(-1);
      }}
    >
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
        <div className={css.thumb}>Thumbnail</div>
        <div className={css.name}>Name &amp; Description</div>
        <div className={css.slides}>Slides</div>
        <div className={css.created}>Created</div>
        <div className={css.modified}>Modified</div>
        <div className={css.action}>Action</div>
      </div>

      <div
        className={css.mainSection}
        id="mediaHolder"
        onScroll={() => {
          setSelectedImage(-1);
        }}
      >
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
              <b>All projects are loaded for the selected criteria.</b>
            </p>
          }
        >
          {projects?.map((project, idx) => (
            <>
              <div className={cx(css.headerSection, css.tableRow)}>
                <div className={css.thumb}>
                  <img
                    className={selectedImage === idx ? css.selectedImage : ""}
                    width="90px"
                    key={idx}
                    src={``}
                    alt=""
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(idx);
                    }}
                  />
                </div>
                <div className={css.name}>
                  {project.id} <br /> {project.name} <br />{" "}
                  {project.description}
                </div>
                <div className={css.slides}>5</div>
                <div className={css.created}>11/12/21</div>
                <div className={css.modified}>11/12/21</div>
                <div className={css.action}>
                  <Button intent="primary">Open</Button>
                  <Button intent="primary">Integration</Button>
                  <Button
                    intent="danger"
                    icon="trash"
                    className={css.delete}
                    minimal
                  ></Button>
                </div>
              </div>
            </>
          ))}
        </InfiniteScroll>
      </div>
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
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsPanel);
