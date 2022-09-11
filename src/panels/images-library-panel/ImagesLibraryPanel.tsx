import React, { ReactNode, useEffect, useMemo, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./ImagesLibraryPanel.module.scss";
import {
  Alert,
  Button,
  Checkbox,
  Icon,
  InputGroup,
  Intent,
  Menu,
  MenuItem,
  Popover,
  PopoverInteractionKind,
  Position,
  Spinner,
  Tag,
  Text,
} from "@blueprintjs/core";
import { addNewObject } from "../../store/actions/actions";
import { IObject, ObjectType } from "../../webslider-sdk/src/objects/i-object";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce, filter, noop, startsWith } from "lodash-es";
import classnames from "classnames";
import { SelectionType } from "../media-library/MediaLibraryPanel";
import { getImageTags } from "../../utils/tags/tags";
import {
  ImageData,
  ImageItem,
  MediaType,
  VideoData,
  VideoItem,
} from "../../webslider-sdk/src/common/i-media-types";
import TagsView from "../../utils/components/tags-view/TagsView";
import { getMediaSrc } from "../../integration/utils/local-media";
import { checkIfAssetsServiceHasError } from "../../utils/api-services/api-services-utils";

interface IMediaLibraryPanelProps {
  hasApiKey: boolean;
  type: "image" | "video";
  uploadComponent?: ReactNode;
  fetchImagesFunc: (props: {
    type: MediaType;
    from: number;
    tags?: string[];
    search?: string;
    perPage?: number;
  }) => Promise<{ data: ImageData[]; hasMore: boolean }>;
  deleteImagesFunc?: (
    type: MediaType,
    ids: string[]
  ) => Promise<{ response: { status: "SUCCESS" | "ERROR"; id: string }[] }>;
  //
  selectionType?: SelectionType;
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
    hasApiKey,
    uploadComponent,
    fetchImagesFunc,
    deleteImagesFunc,
    //
    type,
    selectionType = SelectionType.Single,
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
    useState<string>("original");

  const [requestReload, setRequestReload] = useState<number>(0);

  const [imagesForDelete, setImagesForDelete] = useState<
    ImageData[] | undefined
  >(undefined);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = () => {
    setRequestReload(requestReload + 1);
  };

  const resetImages = () => {
    setImages([]);
  };

  /*
  // note: mutate existing data
  const postProcessData = async (data: ImageData[]) => {
    for (let i = 0; i < data.length; i++) {
      const imageData = data[i];
      const sizeKeys = Object.keys(imageData.images);
      for (let j = 0; j < sizeKeys.length; j++) {
        const iItem = (imageData.images as any)[sizeKeys[j]] as
          | ImageItem
          | undefined;

        const iItemWithSrc = getMediaSrc(type, iItem || {});
        (imageData.images as any)[sizeKeys[j]] = iItemWithSrc;
      }
    }
  };*/

  const fetchData = (from = -1) => {
    if (!hasApiKey) return;

    setLoading(true);

    from = from === -1 ? images?.length || 0 : from;

    fetchImagesFunc({
      type: type,
      from,
      search: searchValue,
      tags: Object.keys(selectedTags),
      perPage: 20,
    }).then(
      async (result) => {
        const err = checkIfAssetsServiceHasError(result);
        if (err) {
          setErrorMessage(err);
          return;
        }

        const data = result.data || (result as any).photos;

        //await postProcessData(data);

        setImages([...images, ...data]);
        setLoading(false);
        setHasMore(result.hasMore);
      },

      (error) => {
        /*this.setState({
            isLoaded: true,
            error,
          });*/
      }
    );
  };

  useEffect(() => {
    debounceFetchData();
  }, []);

  const debounceFetchData = useMemo(
    () => debounce((from = -1) => fetchData(from), 100),
    [images]
  );

  const tags = getImageTags();

  const [selectedTags, setSelectedTags] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleTag = (tag: string) => {
    setSelectedImage(-1);
    //setSearchValue("");
    let selectedTagsClone = { ...selectedTags };
    selectedTagsClone[tag]
      ? (selectedTagsClone = {})
      : (selectedTagsClone = { [tag]: true });
    setSelectedTags(
      selectedTagsClone
      //removeFalsy({ ...selectedTags, [tag]: !selectedTags[tag] })
    );
    resetImages();
    reload();
  };

  useEffect(() => {
    debounceFetchData(0);
  }, [requestReload]);

  const [selectedImage, setSelectedImage] = useState<number>(-1);

  const [selection, setSelection] = useState<any[]>([]);
  const addToSelection = (data: any) => {
    setSelection([...selection, data]);
  };

  const renderSelectedImage = (image: any, idx: number) => {
    return (
      <div
        className={css.selectionImageHolder}
        key={idx + image + "_selected_image"}
      >
        <div className={css.removeSelection}>
          <Button
            onClick={(event: any) => {
              event.stopPropagation();
              const newSelection = [...selection];
              newSelection.splice(idx, 1);
              setSelection(newSelection);
            }}
            className={css.deleteLayer}
            small={true}
            icon="delete"
          ></Button>
        </div>
        <img
          className={css.selectionImage}
          key={image + idx}
          src={`${getMediaSrc("image", image).src}`}
          alt=""
          onClick={(e) => {}}
        />
      </div>
    );
  };

  return (
    <div
      className={css.imageLibraryPanel}
      onClick={() => {
        setSelectedImage(-1);
      }}
    >
      {uploadComponent}
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
                setSelectedImage(-1);
                resetImages();
                reload();
              }}
            />
          }
          value={searchValue}
          onChange={(event: any) => {
            setSearchValue((event.currentTarget as HTMLInputElement).value);
          }}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              setSelectedImage(-1);
              resetImages();
              reload();
            }
          }}
        ></InputGroup>
      </div>
      <div className={css.headerSection}>
        {tags.map((tag) => (
          <Tag
            key={tag}
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
      {selectionType === SelectionType.Multiple && (
        <div className={css.selectionSectionHolder}>
          <div className={css.selectionSection}>
            {selection.map((sel, idx) => renderSelectedImage(sel, idx))}
            {selection.length === 0 && (
              <div className={css.emptySelection}>Image selection is empty</div>
            )}
          </div>
          <div className={css.selectionActions}>
            {addObject && (
              <Button intent={"primary"} disabled={selection.length === 0}>
                Add multi image
              </Button>
            )}
            <br />
            {!addObject && (
              <Button
                intent={"success"}
                disabled={selection.length === 0}
                onClick={() => {
                  const retImages = selection.map((image) => ({
                    image: image,
                    filename: image.filename,
                  }));
                  onSelect(retImages);
                  onRequestClose();
                }}
              >
                Add selected images
              </Button>
            )}
          </div>
        </div>
      )}
      <div
        className={classnames(css.mainSection, {
          [css.mainSectionMultiple]: selectionType === SelectionType.Multiple,
        })}
        id="mediaHolder"
        onScroll={() => {
          setSelectedImage(-1);
        }}
      >
        {!hasApiKey && (
          <div className="error">
            {
              "API KEY is not found. Goto Settings > Licenses and enter valid serial number."
            }
          </div>
        )}
        {!!errorMessage && <div className="error">{errorMessage}</div>}
        <InfiniteScroll
          className={css.infScroll}
          dataLength={images?.length || -1} //This is important field to render the next data
          next={debounceFetchData}
          hasMore={hasMore}
          loader={
            hasApiKey &&
            !errorMessage && (
              <div style={{ textAlign: "center", margin: "20px" }}>
                <Spinner size={50} />
              </div>
            )
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
            <div
              key={image.id + "_" + image.title + "_" + image.filename}
              style={{ display: "inline-block" }}
            >
              {/*qwe(image, idx)   // TODO: remove this in the future*/}
              {image?.images?.small || (image as any)?.videos ? (
                <Popover
                  interactionKind={PopoverInteractionKind.CLICK}
                  position={Position.RIGHT}
                  modifiers={{ preventOverflow: { enabled: true } }}
                  boundary={"window"}
                  portalClassName={"image-preview-popover"}
                  minimal
                  isOpen={selectedImage === idx}
                >
                  <div
                    className={classnames(css.imageListHolder, {
                      [css.selectedImage]: selectedImage === idx,
                    })}
                  >
                    <img
                      width="200px"
                      key={idx}
                      src={getMediaSrc(type, image?.images?.small || {}).src}
                      alt=""
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(idx);
                      }}
                    />
                    <div className={css.imageListTitle}>{image.title}</div>
                    <div className={css.imageListTabs}>
                      <TagsView tags={image?.tags || []} />
                    </div>
                  </div>
                  <div
                    className={css.popoverHolder}
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <div>
                      {type === "image" && (
                        <img
                          style={{ maxHeight: "400px", maxWidth: "400px" }}
                          key={idx}
                          src={
                            getMediaSrc("image", image.images?.medium || {}).src
                          }
                          alt=""
                        />
                      )}

                      {type === "video" && (
                        <video
                          autoPlay
                          style={{ maxHeight: "400px", maxWidth: "400px" }}
                          key={idx}
                          src={
                            getMediaSrc(
                              "video",
                              (image as any).videos.original || {}
                            ).src
                          }
                        />
                      )}
                    </div>
                    <div style={{ paddingBottom: "40px" }}>
                      {!!image.images && (
                        <>
                          <Text className={css.previewTitle}>
                            Chose resolution
                          </Text>
                          {Object.entries<any>(
                            ((image as any).videos as any) || image.images
                          ).map(([sizeAlias, oneimg]) => (
                            <p key={sizeAlias}>
                              <Checkbox
                                checked={selectedResolution === sizeAlias}
                                onChange={() => {
                                  setSelectedResolution(sizeAlias);
                                }}
                              >
                                {oneimg?.size.width}px x {oneimg?.size.height}
                                px {sizeAlias === "original" && "(original)"}
                              </Checkbox>
                            </p>
                          ))}
                        </>
                      )}

                      {/* Create new object*/}
                      {addObject &&
                        type === "image" &&
                        selectionType === SelectionType.Single && (
                          <Button
                            intent="primary"
                            onClick={() => {
                              if (activeLayerId) {
                                if (addObject) {
                                  console.log({
                                    image: (image?.images as any)[
                                      selectedResolution
                                    ],
                                    filename: "",
                                  });
                                  _addNewObject(
                                    activeLayerId,
                                    "image", //cover
                                    {},
                                    {
                                      image: {
                                        image: (image?.images as any)[
                                          selectedResolution
                                        ],
                                        filename: "",
                                      },
                                    }
                                  );
                                }

                                onRequestClose();
                              }
                            }}
                          >
                            Add Image to stage
                          </Button>
                        )}

                      {/* Create new object*/}
                      {addObject &&
                        type === "video" &&
                        selectionType === SelectionType.Single && (
                          <Button
                            intent="primary"
                            onClick={() => {
                              if (activeLayerId) {
                                if (addObject) {
                                  _addNewObject(
                                    activeLayerId,
                                    "video", //cover
                                    {},
                                    {
                                      video: {
                                        video: (image as any).videos.original,
                                        previewImage: (image?.images as any)
                                          .original,
                                      },
                                    }
                                  );
                                }

                                onRequestClose();
                              }
                            }}
                          >
                            Add Video to stage
                          </Button>
                        )}

                      {!addObject &&
                        type === "image" &&
                        selectionType === SelectionType.Single && (
                          <Button
                            intent="primary"
                            onClick={() => {
                              onSelect?.({
                                image: (image?.images as any)[
                                  selectedResolution
                                ],
                              });
                              onRequestClose();
                            }}
                          >
                            Select image
                          </Button>
                        )}

                      {!addObject &&
                        type === "video" &&
                        selectionType === SelectionType.Single && (
                          <Button
                            intent="primary"
                            onClick={() => {
                              onSelect?.({
                                video: (image as any).videos.original,
                                previewImage: (image?.images as any).original,
                                filename: "",
                              });
                              onRequestClose();
                            }}
                          >
                            Select Video
                          </Button>
                        )}

                      {type === "image" &&
                        selectionType === SelectionType.Multiple && (
                          <Button
                            intent="primary"
                            onClick={() => {
                              addToSelection(
                                (image?.images as any)[selectedResolution]
                              );
                              setSelectedImage(-1);
                            }}
                          >
                            Add Image to selection
                          </Button>
                        )}

                      {!!deleteImagesFunc && (
                        <Button
                          className={css.deleteImageButton}
                          onClick={() => {
                            setSelectedImage(-1);
                            setImagesForDelete([image]);
                          }}
                          icon="trash"
                          minimal
                        ></Button>
                      )}
                    </div>
                  </div>
                </Popover>
              ) : null}
            </div>
          ))}
        </InfiniteScroll>
      </div>

      <Alert
        cancelButtonText="Cancel"
        loading={isDeleting}
        confirmButtonText="Remove"
        canOutsideClickCancel={false}
        icon={<Icon icon="info-sign" size={36} intent={Intent.WARNING} />}
        intent={Intent.PRIMARY}
        isOpen={!!imagesForDelete || isDeleting}
        onCancel={() => setImagesForDelete(undefined)}
        onConfirm={() => {
          deleteImagesFunc?.(type, [imagesForDelete?.[0].id!]).then((resp) => {
            console.log(resp);

            const newImages = filter(images, (image) => {
              return (
                resp.response
                  .filter((res) => res.status === "SUCCESS")
                  .map((res) => res.id)
                  .indexOf(image?.id!) === -1
              );
            });

            const hasError = !!resp.response.find(
              (res) => res.status === "ERROR"
            );
            if (hasError) {
              alert("ERROR");
            }
            setImages(newImages as any); // any is there as lodash has type bug for "filter"
            setIsDeleting(false);
            setSelectedImage(-1);
          });
          setIsDeleting(true);
          setImagesForDelete(undefined);
        }}
        className="bp3-dark"
        style={{ zIndex: 1001 }}
      >
        <p>
          If media file is used in some projects it won't be available and
          visible after deletion.
        </p>

        <p>
          Are you sure you want to delete "
          {imagesForDelete?.[0].title || imagesForDelete?.[0].filename}" image?
        </p>
      </Alert>
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
    type: ObjectType | string,
    objectProps: Partial<IObject>,
    values?: { [key: string]: any }
  ) => addNewObject(layerId, type, objectProps, values),
};

export default connect(mapStateToProps, mapDispatchToProps)(ImagesLibraryPanel);
