import React, { useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./ImagesLibraryPanel.module.scss";
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
import classnames from "classnames";

interface ImageItem {
  url: string;
  size: {
    height: number;
    width: number;
    type: string;
  };
}

interface ImageData {
  title: string;
  images: {
    thumbnail: ImageItem;
    small: ImageItem;
    medium: ImageItem;
    large: ImageItem;
    xlarge: ImageItem;
    xxlarge: ImageItem;
  };
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

export type IImagesPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IMediaLibraryPanelProps;

const ImagesLibraryPanel: React.FC<IImagesPanelMergedProps> = (props) => {
  const {
    activeLayerId,
    _addNewObject,
    onRequestClose,
    addObject = true,
    onSelect = noop,
  } = props;

  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedResolution, setSelectedResolution] =
    useState<string>("medium");

  const badImages = React.useRef<number[]>([]);

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
    fetch(url)
      .then((res) => res.json())
      .then(
        (result) => {
          console.log(result);
          setImages([...images, ...result.photos]);
          setLoading(false);
          setHasMore(result.photos.length > 0);
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
    setImages([]);
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
      className={css.imageLibraryPanel}
      onClick={() => {
        setSelectedImage(-1);
      }}
    >
      <div className={css.headerSection}>
        <InputGroup
          large
          leftIcon="search"
          placeholder="Find photo..."
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
              {qwe(image, idx)}
              {image?.images?.small ? (
                <Popover
                  interactionKind={PopoverInteractionKind.CLICK}
                  position={Position.RIGHT}
                  modifiers={{ preventOverflow: { enabled: false } }}
                  boundary={"window"}
                  portalClassName={"image-preview-popover"}
                  minimal
                  isOpen={selectedImage === idx}
                >
                  <img
                    className={classnames(css.image, {
                      [css.selectedImage]: selectedImage === idx,
                    })}
                    width="200px"
                    key={idx}
                    src={`${process.env.REACT_APP_ASSETS_BASE_URL}/${image.images.small.url}`}
                    alt=""
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(idx);
                    }}
                  />
                  <div
                    className={css.popoverHolder}
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <div>
                      <img
                        style={{ maxHeight: "400px", maxWidth: "400px" }}
                        key={idx}
                        src={`${process.env.REACT_APP_ASSETS_BASE_URL}/${image.images.medium.url}`}
                        alt=""
                      />
                    </div>
                    <div>
                      <Text className={css.previewTitle}>Chose resolution</Text>
                      {Object.entries(image.images).map(
                        ([sizeAlias, oneimg]) => (
                          <p>
                            <Checkbox
                              checked={selectedResolution === sizeAlias}
                              onChange={() => {
                                setSelectedResolution(sizeAlias);
                              }}
                            >
                              {oneimg.size.width}px x {oneimg.size.height}px
                            </Checkbox>
                          </p>
                        )
                      )}
                      {addObject && (
                        <Button
                          onClick={() => {
                            if (activeLayerId) {
                              if (addObject) {
                                _addNewObject(
                                  activeLayerId,
                                  ObjectType.IMAGE, //cover
                                  {},
                                  {
                                    url: `${
                                      process.env.REACT_APP_ASSETS_BASE_URL
                                    }/${
                                      (image?.images as any)[selectedResolution]
                                        ?.url
                                    }`,
                                    //placement: getDefaultCoveragePlacement,
                                  }
                                );
                              }

                              onRequestClose();
                            }
                          }}
                        >
                          Cover image
                        </Button>
                      )}

                      {!addObject && (
                        <Button
                          onClick={() => {
                            onSelect?.({
                              type: ObjectType.IMAGE,
                              initialValues: {
                                url: `${
                                  process.env.REACT_APP_ASSETS_BASE_URL
                                }/${
                                  (image?.images as any)[selectedResolution]
                                    ?.url
                                }`,
                                //placement: getDefaultCoveragePlacement,
                              },
                            });
                            onRequestClose();
                          }}
                        >
                          Select image
                        </Button>
                      )}
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

export default connect(mapStateToProps, mapDispatchToProps)(ImagesLibraryPanel);
