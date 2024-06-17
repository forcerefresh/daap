import React, { ReactNode, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import cx from "classnames";
import css from "./ImagesLibraryPanel.module.scss";
import {
  Alert,
  Button,
  Checkbox,
  Icon,
  InputGroup,
  Intent,
  MenuItem,
  Popover,
  PopoverInteractionKind,
  Position,
  Spinner,
  Tag,
  Text,
} from "@blueprintjs/core";
import { MultiSelect } from "@blueprintjs/select";

import { addNewObject } from "../../store/actions/actions";
import { IObject, ObjectType } from "webslider-sdk/lib/objects/i-object";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce, filter, forOwn, last, noop, remove } from "lodash-es";
import classnames from "classnames";
import { SelectionType } from "../media-library/MediaLibraryPanel";
import { getImageTags } from "../../utils/tags/tags";
import { ImageData, MediaType } from "webslider-sdk/lib/common/i-media-types";
import TagsView from "../../utils/components/tags-view/TagsView";
import { getMediaSrc } from "../../integration/utils/local-media";
import { checkIfAssetsServiceHasError } from "../../utils/api-services/api-services-utils";
import { forceDownload } from "../../utils/utils";
import { ReactComponent as MP3Icon } from "./assets/mp3.svg";
interface IMediaLibraryPanelProps {
  hasApiKey: boolean;
  type: "image" | "video" | "audio" | "font";
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

  const popoverRef = useRef<Popover>();

  const fetchData = (from = -1) => {
    // CHANGE123: if (!hasApiKey) return;

    setLoading(true);

    from = from === -1 ? images?.length || 0 : from;

    const tags: string[] = selectedTags;
    // forOwn(selectedTags, (val, key) => {
    //   if (val) tags.push(key);
    // });

    fetchImagesFunc({
      type: type,
      from,
      search: searchValue,
      tags,
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
    // CHANGE123: if (hasApiKey) debounceFetchData();
    debounceFetchData();
  }, [hasApiKey]);

  const debounceFetchData = debounce((from = -1) => fetchData(from), 100);

  const tags = getImageTags();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  console.log(selectedTags);
  // const toggleTag = (tag: string) => {
  // setSelectedImage(-1);
  // //setSearchValue("");
  // let selectedTagsClone = { ...selectedTags };
  // selectedTagsClone[tag]
  //   ? (selectedTagsClone = {})
  //   : (selectedTagsClone = { [tag]: true });
  // setSelectedTags(
  //   selectedTagsClone
  //   //removeFalsy({ ...selectedTags, [tag]: !selectedTags[tag] })
  // );
  // resetImages();
  // reload();
  // };

  useEffect(() => {
    //if (hasApiKey) debounceFetchData(0);
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

  const getOneImageSize = (
    images?: { [key: string]: any },
    defaultSize = "small"
  ) => {
    return images?.[defaultSize] || images?.original;
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
        <MultiSelect
          placeholder="Click to select tags..."
          items={tags}
          selectedItems={selectedTags}
          // onItemSelect={(tag) => {
          //   setSelectedTags([...selectedTags, tag]);
          //   reload();
          // }}
          onItemSelect={() => {}}
          onRemove={(tag) => {
            const selectedTagsClone = [...selectedTags];
            remove(selectedTagsClone, (item) => item === tag);
            setSelectedTags(selectedTagsClone);
            resetImages();
            reload();
          }}
          itemRenderer={(tag) => (
            <MenuItem
              key={tag}
              // {...getFilmItemProps(film, props)}
              //roleStructure="listoption"
              //selected={false}
              //shouldDismissPopover={false}
              onClick={() => {
                setSelectedTags([...selectedTags, tag]);
                resetImages();
                reload();
              }}
              text={`${tag}`}
            />
          )}
          popoverProps={{
            matchTargetWidth: true,
            minimal: true,
            portalClassName: cx("multiselect-tags", css.multiSelectPortalClass),
          }}
          tagRenderer={(tag) => tag}
        />
        {/* {tags.map((tag) => (
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
        ))} */}
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
          [css.mainSectionFreeVer]: !hasApiKey,
        })}
        id="mediaHolder"
        onScroll={() => {
          setSelectedImage(-1);
        }}
      >
        {!hasApiKey && (
          <div className={css.registerAap}>
            Get access to 10.000 photos
            <br />
            Browse{" "}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const { shell } = window.require("electron");
                shell.openExternal("http://webslider.io/prices");
              }}
            >
              Plans
            </a>
          </div>
        )}
        {/*  // CHANGE123: {!hasApiKey && (
          <div className="error">
            {
              "API KEY is not found. Goto Settings > Licenses and enter valid serial number."
            }
          </div>
        )} */}
        {!!errorMessage && <div className="error">{errorMessage}</div>}
        <InfiniteScroll
          className={css.infScroll}
          dataLength={images?.length || -1} //This is important field to render the next data
          next={debounceFetchData}
          hasMore={hasMore}
          loader={
            //hasApiKey &&
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
              {hasApiKey && (
                <b>All items are loaded for the selected criteria.</b>
              )}
            </p>
          }
        >
          {images?.map((image, idx) => {
            if (!image) return null;

            const resolutionObject =
              ((image as any).videos as any) ||
              image.images ||
              ((image as any).font as any);
            const resolutionImages = Object.entries<any>(resolutionObject);
            const originalResolution = resolutionObject["original"]
              ? "original"
              : last(resolutionImages)?.[0];

            const isAudio = !!(image as any)?.audio;
            const isFont = !!(image as any)?.font;

            if (isFont) {
              return (
                <div
                  className={classnames(css.imageItemHolder, {
                    [css.selectedImage]: selectedImage === idx,
                  })}
                  style={{ display: "inline-block" }}
                >
                  <div style={{ display: "inline-block" }}>
                    <Icon icon={"font"} size={100} />
                  </div>
                  <div className={css.imageListTitle222}>
                    {prepareText(image.filename || "")}
                  </div>
                  <div className={css.imageListTitle}>{image.title}</div>
                  <div className={css.imageListTabs}>
                    <TagsView tags={image?.tags || []} />
                  </div>
                </div>
              );
            }

            if (isAudio) {
              return (
                <div
                  className={classnames(css.imageItemHolder, {
                    [css.selectedImage]: selectedImage === idx,
                  })}
                  style={{ display: "inline-block" }}
                >
                  <div style={{ display: "inline-block" }}>
                    <MP3Icon style={{ width: "100px", height: "100px" }} />
                  </div>
                  <div className={css.imageListTitle222}>
                    {prepareText((image as any)?.audio.filename || "")}
                  </div>
                  <div>
                    {addObject && type === "audio" && (
                      <Button
                        intent="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeLayerId) {
                            _addNewObject(
                              activeLayerId,
                              "audio", //cover
                              {},
                              {
                                audio: {
                                  audio: (image as any)?.audio,
                                  filename: "",
                                },
                              }
                            );
                            onRequestClose();
                          }
                        }}
                      >
                        Add audio
                      </Button>
                    )}

                    {!addObject && type === "audio" && (
                      <Button
                        intent="primary"
                        onClick={() => {
                          onSelect?.({
                            audio: (image as any)?.audio,
                          });
                          onRequestClose();
                        }}
                      >
                        Select audio
                      </Button>
                    )}

                    {!!deleteImagesFunc && (
                      <Button
                        onClick={() => {
                          setSelectedImage(-1);
                          setImagesForDelete([image]);
                        }}
                        icon="trash"
                        minimal
                        style={{ marginLeft: "20px" }}
                      ></Button>
                    )}
                  </div>

                  <div className={css.imageListTitle}>{image.title}</div>
                  <div className={css.imageListTabs}>
                    <TagsView tags={image?.tags || []} />
                  </div>
                </div>
              );
            }

            const imageOneSize = getOneImageSize(image?.images);
            return (
              <div
                key={image.id + "_" + image.title + "_" + image.filename}
                style={{ display: "inline-block" }}
              >
                {/*qwe(image, idx)   // TODO: remove this in the future*/}
                {imageOneSize || (image as any)?.videos ? (
                  <Popover
                    interactionKind={PopoverInteractionKind.HOVER_TARGET_ONLY}
                    position={Position.RIGHT}
                    modifiers={{ preventOverflow: { enabled: true } }}
                    portalClassName={cx(
                      "image-preview-popover",
                      css.imagePreviewPortal
                    )}
                    minimal
                    //isOpen={selectedImage === idx}
                    content={
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
                                getMediaSrc(
                                  "image",
                                  getOneImageSize(image.images, "medium") || {}
                                ).src
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
                              {resolutionImages.map(([sizeAlias, oneimg]) => (
                                <p key={sizeAlias}>
                                  <Checkbox
                                    checked={selectedResolution === sizeAlias}
                                    onChange={() => {
                                      setSelectedResolution(sizeAlias);
                                    }}
                                  >
                                    {oneimg?.size?.width}px x{" "}
                                    {oneimg?.size?.height}
                                    px{" "}
                                    {sizeAlias === "original" && "(original)"}
                                  </Checkbox>
                                </p>
                              ))}
                            </>
                          )}

                          {/* Create new object*/}
                          {addObject &&
                            type === "image" &&
                            selectionType === SelectionType.Single &&
                            [{ close: true }, { close: false }].map((conf) => (
                              <div
                                key={"add_button_" + conf.close}
                                className={css.addButtonHolder}
                              >
                                <Button
                                  intent="primary"
                                  onClick={() => {
                                    if (activeLayerId) {
                                      if (addObject) {
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

                                      if (conf.close) {
                                        onRequestClose();
                                      } else {
                                        setSelectedImage(-1);
                                      }
                                    }
                                  }}
                                >
                                  {conf.close
                                    ? " Add Image & Close"
                                    : "Add Image"}
                                </Button>{" "}
                              </div>
                            ))}

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
                                            video: (image as any).videos
                                              .original,
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
                                    previewImage: (image?.images as any)
                                      .original,
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

                          <div className={css.subActionHolder}>
                            <Button
                              small={true}
                              onClick={() => {
                                const url = getMediaSrc(
                                  "image",
                                  (image?.images as any).original
                                ).src;
                                forceDownload(url!);
                              }}
                            >
                              Download
                            </Button>

                            {!!deleteImagesFunc && (
                              <Button
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
                      </div>
                    }
                  >
                    <div
                      className={classnames(css.imageItemHolder, {
                        [css.selectedImage]: selectedImage === idx,
                      })}
                    >
                      <div
                        className={css.imageHolder}
                        onClick={(e) => {
                          // TODO duplicated code
                          if (activeLayerId) {
                            if (addObject) {
                              _addNewObject(
                                activeLayerId,
                                "image", //cover
                                {},
                                {
                                  image: {
                                    image: (image?.images as any)[
                                      originalResolution!
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
                        <img
                          key={idx}
                          src={getMediaSrc(type, imageOneSize || {}).src}
                          alt=""
                        />
                      </div>

                      <div className={css.imageListTitle}>{image.title}</div>
                      <div className={css.imageListTabs}>
                        <TagsView tags={image?.tags || []} />
                      </div>
                      {/* <div
                        className={css.openPreview}
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          setSelectedImage(idx);
                        }}
                      >
                        <Button intent="primary">Resolutions</Button>
                      </div> */}
                    </div>
                  </Popover>
                ) : null}
              </div>
            );
          })}
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
        className="bp5-dark"
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

function prepareText(text: string, textLimit = 20) {
  var returnString = text;
  var textLimit = 20;
  if (text.length > textLimit) {
    var lastWord = text.slice(
      Math.max(text.lastIndexOf(" "), text.length - Math.round(textLimit / 2)) +
        1
    );
    var indexFromEnd = lastWord.length;
    var ellipsis = "...";

    returnString = text.slice(0, textLimit - indexFromEnd - ellipsis.length);
    returnString = returnString + ellipsis + lastWord;
  }
  return returnString;
}
