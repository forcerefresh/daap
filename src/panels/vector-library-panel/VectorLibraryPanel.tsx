import React, { ReactNode, useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./VectorLibraryPanel.module.scss";
import {
  Alert,
  Button,
  Checkbox,
  Icon,
  InputGroup,
  Intent,
  Popover,
  PopoverInteractionKind,
  Position,
  Spinner,
  Tag,
  Text,
} from "@blueprintjs/core";
import { addNewObject } from "../../store/actions/actions";
import { IObject, ObjectType } from "webslider-sdk/lib/objects/i-object";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce, filter, noop, uniq } from "lodash-es";
import { MediaType, VectorData } from "webslider-sdk/lib/common/i-media-types";
import classnames from "classnames";
import TagsView from "../../utils/components/tags-view/TagsView";
import { getImageTags } from "../../utils/tags/tags";
import { SVG } from "../../objects/svg/svg";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { is } from "immer/dist/internal";
import { checkIfAssetsServiceHasError } from "../../utils/api-services/api-services-utils";

interface IMediaLibraryPanelProps {
  hasApiKey: boolean;
  uploadComponent?: ReactNode;
  fetchImagesFunc: (props: {
    type: MediaType;
    from: number;
    tags?: string[];
    search?: string;
    perPage?: number;
  }) => Promise<{ data: VectorData[]; hasMore: boolean }>;
  deleteImagesFunc?: (
    type: MediaType,
    ids: string[]
  ) => Promise<{ response: { status: "SUCCESS" | "ERROR"; id: string }[] }>;
  //
  //
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
    hasApiKey,
    uploadComponent,
    fetchImagesFunc,
    deleteImagesFunc,
    //
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

  const [requestReload, setRequestReload] = useState<number>(0);

  const [imagesForDelete, setImagesForDelete] = useState<
    VectorData[] | undefined
  >(undefined);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = () => {
    setRequestReload(requestReload + 1);
  };

  const resetImages = () => {
    setImages([]);
  };

  const fetchData = (from = -1) => {
    if (!hasApiKey) return;

    setLoading(true);

    from = from === -1 ? images?.length || 0 : from;

    fetchImagesFunc({
      type: "vector",
      from,
      search: searchValue,
      tags: Object.keys(selectedTags),
      perPage: 20,
    }).then(
      (result) => {
        const err = checkIfAssetsServiceHasError(result);
        if (err) {
          setErrorMessage(err);
          return;
        }

        setImages([...images, ...result.data]);
        setLoading(false);
        setHasMore(result.hasMore);
      },

      (error) => {
        logger.warn(error);
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

  const debounceFetchData = debounce((from = -1) => fetchData(from), 100);

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

  const [selectedImage, setSelectedImage] = useState<number>(-1);

  useEffect(() => {
    debounceFetchData(0);
  }, [requestReload]);

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
          placeholder="Find vector..."
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
      <div
        className={css.mainSection}
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
              {image?.svgString ? (
                <Popover
                  interactionKind={PopoverInteractionKind.CLICK}
                  position={Position.RIGHT_TOP}
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
                    <div
                      className={cx(css.imageHolder)}
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(idx);
                      }}
                      dangerouslySetInnerHTML={{ __html: image.svgString }}
                    ></div>
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
                    <div style={{ paddingBottom: "50px" }}>
                      <Button
                        intent="primary"
                        onClick={() => {
                          if (activeLayerId) {
                            if (addObject) {
                              _addNewObject(
                                activeLayerId,
                                SVG,
                                {
                                  left: 0,
                                  top: 0,
                                  width: 100,
                                  height: 100,
                                },
                                {
                                  svg: { source: image.svgString },
                                }
                              );
                            }
                            onSelect({
                              type: SVG,
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
          deleteImagesFunc?.("vector", [imagesForDelete?.[0].id!]).then(
            (resp) => {
              console.log(resp);
              const newImages = filter(images, (image) => {
                return (
                  resp.response
                    .filter((res) => res.status === "SUCCESS")
                    .map((res) => res.id)
                    .indexOf(image?.id!) === -1
                );
              });
              setImages(newImages as any); // any is there as lodash has type bug for "filter"
              setIsDeleting(false);
              setSelectedImage(-1);
            }
          );
          setIsDeleting(true);
          setImagesForDelete(undefined);
        }}
        className="bp3-dark"
        style={{ zIndex: 1001 }}
      >
        <p>Delete "{imagesForDelete?.[0].title}" image?</p>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VectorsLibraryPanel);
