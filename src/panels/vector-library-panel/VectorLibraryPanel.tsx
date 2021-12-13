import React, { useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./VectorLibraryPanel.module.scss";
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
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce, noop, uniq } from "lodash-es";
import { fetchMock } from "./mock";

export interface VectorData {
  title: string;
  svgString: string;
  categories: string[];
  tags: string[];
  rating: number;
}

interface IMediaLibraryPanelProps {
  addObject?: boolean;
  onSelect?: (item: {
    type: ObjectType;
    initialValues: { [key: string]: any }[];
  }) => void;
  onRequestClose: () => void;
}

export type IVectorPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IMediaLibraryPanelProps;

const VectorsLibraryPanel: React.FC<IVectorPanelMergedProps> = (props) => {
  const {
    activeLayerId,
    _addNewObject,
    onRequestClose,
    addObject = true,
    onSelect = noop,
  } = props;

  const [images, setImages] = useState<VectorData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>("");

  const fetchData = (from = -1) => {
    setLoading(true);

    console.log("LOAD DATA");
    console.log({ ...selectedTags });
    from = from === -1 ? images?.length || 0 : from;

    let url = `${process.env.REACT_APP_ASSETS_BASE_URL}/api/v1?from=${from}`;
    if (searchValue) {
      url += `&search=${encodeURIComponent(searchValue)}`;
    }
    if (Object.keys(selectedTags).length > 0) {
      url += `&tags=${Object.keys(selectedTags)
        .map((tag) => encodeURIComponent(tag))
        .join(",")}`;
    }
    // TODO
    fetchMock()
      //fetch(url)
      //.then((res) => res.json())
      .then(
        (result) => {
          console.log(result);
          setImages([...images, ...result.vectors]);
          setLoading(false);
          setHasMore(result.vectors.length > 0);
        },

        (error) => {
          console.log(error);
          //this.setState({
          //  isLoaded: true,
          //  error,
          //});
        }
      );
  };

  useEffect(() => {
    debounceFetchData();
  }, []);

  const debounceFetchData = debounce((from = -1) => fetchData(from), 100);

  const tags = ["Arrows", "Emotions", "Animals", "People"];

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
    setImages([]);
  };

  useEffect(() => {
    console.log({ ...selectedTags });
    debounceFetchData(0);
  }, [selectedTags]);

  const [selectedImage, setSelectedImage] = useState<number>(-1);

  useEffect(() => {
    return () => {
      setSelectedImage(-1);
    };
  }, []);

  return (
    <div
      className={css.imageLibraryPanel}
      onClick={() => {
        setSelectedImage(-1);
      }}
    >
      <div className={css.headerSection}>
        <InputGroup
          large
          leftIcon="search"
          placeholder="Find vector..."
          rightElement={
            <Button
              large
              icon="arrow-right"
              onClick={() => {
                setImages(() => []);
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
              setImages(() => []);
              debounceFetchData(0);
            }
          }}
        ></InputGroup>
      </div>
      <div className={css.headerSection}>
        {tags.map((tag) => (
          <Tag
            large
            round
            minimal={!selectedTags[tag]}
            intent={selectedTags[tag] ? "success" : "none"}
            className={css.tag}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Tag>
        ))}
      </div>
      <div
        className={css.mainSection}
        id="mediaHolder"
        onScroll={() => {
          setSelectedImage(-1);
        }}
      >
        <InfiniteScroll
          dataLength={images?.length || -1} //This is important field to render the next data
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
              <b>All images are loaded for the selected criteria.</b>
            </p>
          }
        >
          {images?.map((image, idx) => (
            <>
              {image?.svgString ? (
                <Popover
                  interactionKind={PopoverInteractionKind.CLICK}
                  position={Position.RIGHT_TOP}
                  modifiers={{ preventOverflow: { enabled: false } }}
                  boundary={"window"}
                  portalClassName={"image-preview-popover"}
                  minimal
                  isOpen={selectedImage === idx}
                >
                  <div
                    className={cx(css.imageHolder, {
                      [css.selectedImage]: selectedImage === idx,
                    })}
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(idx);
                    }}
                    dangerouslySetInnerHTML={{ __html: image.svgString }}
                  ></div>
                  <div
                    className={css.popoverHolder}
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <div>
                      <Button
                        onClick={() => {
                          if (activeLayerId) {
                            if (addObject) {
                              _addNewObject(
                                activeLayerId,
                                ObjectType.SVG,
                                {
                                  left: 0,
                                  top: 0,
                                  width: 100,
                                  height: 100,
                                },
                                {
                                  svg: image.svgString,
                                }
                              );
                            }
                            onSelect({
                              type: ObjectType.SVG,
                              initialValues: {
                                svg: image.svgString,
                              },
                            });
                            onRequestClose();
                          }
                        }}
                      >
                        {addObject ? "Add SVG" : "Select SVG"}
                      </Button>
                    </div>
                  </div>
                </Popover>
              ) : null}
            </>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

/*          */
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VectorsLibraryPanel);
