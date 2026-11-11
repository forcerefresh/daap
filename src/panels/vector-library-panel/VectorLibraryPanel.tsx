import React, { ReactNode, useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./VectorLibraryPanel.module.scss";
import {
  Alert,
  Button,
  Icon,
  InputGroup,
  Intent,
  Popover,
  PopoverInteractionKind,
  Position,
  Spinner,
} from "@blueprintjs/core";
import { addNewObject } from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce, filter, noop } from "lodash-es";
import { MediaType, VectorData } from "webslider-sdk/lib/common/i-media-types";
import classnames from "classnames";
import TagsView from "../../utils/components/tags-view/TagsView";
import { SVG } from "../../objects/svg/svg";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { checkIfAssetsServiceHasError } from "../../utils/api-services/api-services-utils";
import NoSelection from "../media-library/assets/no-selection.svg?react";
import { Pagination } from "../../types/pagination";

interface IMediaLibraryPanelProps {
  hasApiKey: boolean;
  uploadComponent?: ReactNode;

  fetchMediasFunc: (props: {
    type: MediaType;
    from: number;
    tags?: string[];
    search?: string;
    perPage?: number;
  }) => Promise<{
    data: any[];
    pagination: Pagination;
  }>;

  deleteImagesFunc?: (
    type: MediaType,
    ids: string[]
  ) => Promise<{ response: { status: "SUCCESS" | "ERROR"; id: string }[] }>;
  addObject?: boolean;
  instaSelect?: boolean;
  showRemoveItem?: boolean;
  onSelect?: (item: {
    type: string;
    initialValues: { [key: string]: any }[];
  }) => void;
  onRequestClose: () => void;
}

export type IVectorPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IMediaLibraryPanelProps;

const VectorsLibraryPanel: React.FC<IVectorPanelMergedProps> = (props) => {
  const {
    uploadComponent,
    fetchMediasFunc,
    deleteImagesFunc,
    activeLayerId,
    _addNewObject,
    onRequestClose,
    addObject = true,
    instaSelect = false,
    showRemoveItem = false,
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
    setLoading(true);

    from = from === -1 ? images?.length || 0 : from;

    fetchMediasFunc({
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
        setHasMore((result as any).hasMore);
      },

      (error) => {
        logger.app.warn(error);
      }
    );
  };

  useEffect(() => {
    debounceFetchData();
  }, []);

  const debounceFetchData = debounce((from = -1) => fetchData(from), 100);

  const [selectedTags] = useState<{ [key: string]: boolean }>({});

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
      <div
        className={css.mainSection}
        id="mediaHolder"
        onScroll={() => {
          setSelectedImage(-1);
        }}
      >
        {!!errorMessage && <div className="error">{errorMessage}</div>}
        <InfiniteScroll
          dataLength={images?.length || -1} //This is important field to render the next data
          next={debounceFetchData}
          hasMore={hasMore}
          loader={
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
              <b>All items have been loaded for the chosen criteria.</b>
            </p>
          }
        >
          {showRemoveItem && (
            <div style={{ display: "inline-block", verticalAlign: "bottom" }}>
              <div className={classnames(css.imageListHolder)}>
                <div
                  className={cx(css.imageHolder)}
                  onClick={(_e) => {
                    onSelect(null);
                    onRequestClose();
                  }}
                >
                  <NoSelection style={{ fill: "#dc3545" }} />
                </div>
                <div
                  className={css.imageListTitle}
                  style={{
                    textAlign: "center",
                    textTransform: "uppercase",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  Remove mask
                </div>
              </div>
            </div>
          )}
          {images?.map((image, idx) => (
            <div
              key={image.id + "_" + (image as any).title + "_" + image.filename}
              style={{ display: "inline-block", verticalAlign: "bottom" }}
            >
              {image?.svgString && !instaSelect ? (
                <Popover
                  interactionKind={PopoverInteractionKind.CLICK}
                  position={Position.RIGHT_TOP}
                  modifiers={{ preventOverflow: { enabled: true } }}
                  portalClassName={"image-preview-popover"}
                  minimal
                  isOpen={selectedImage === idx}
                  content={
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
                  }
                >
                  {/* // TODO: duplicated code */}
                  <div
                    className={classnames(css.imageListHolder, {
                      [css.selectedImage]: selectedImage === idx,
                    })}
                    style={{ display: "inline-block" }}
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
                    {(image as any).title && (
                      <div className={css.imageListTitle}>{(image as any).title}</div>
                    )}
                    {image.tags && (
                      <div className={css.imageListTags}>
                        <TagsView tags={image?.tags || []} />
                      </div>
                    )}
                  </div>
                </Popover>
              ) : null}
              {image?.svgString && instaSelect ? (
                <div
                  className={classnames(css.imageListHolder, {
                    [css.selectedImage]: selectedImage === idx,
                  })}
                  onClick={() => {
                    onSelect({
                      type: SVG,
                      initialValues: {
                        svg: image.svgString,
                      },
                    });
                    onRequestClose();
                  }}
                >
                  {/* // TODO: duplicated code */}
                  <div
                    className={cx(css.imageHolder)}
                    key={idx}
                    onClick={() => {
                      onSelect({
                        type: SVG,
                        initialValues: {
                          svg: image.svgString,
                        },
                      });
                      onRequestClose();
                    }}
                    dangerouslySetInnerHTML={{ __html: image.svgString }}
                  ></div>
                  {(image as any).title && (
                    <div className={css.imageListTitle}>{(image as any).title}</div>
                  )}
                  {image.tags && (
                    <div className={css.imageListTags}>
                      <TagsView tags={image?.tags || []} />
                    </div>
                  )}
                </div>
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
        className="bp5-dark"
        style={{ zIndex: 1001 }}
      >
        <p>Delete "{(imagesForDelete?.[0] as any)?.title}" image?</p>
      </Alert>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  return {
    activeLayerId: state.project.selection.activeLayerId,
  };
};

const mapDispatchToProps = {
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>,
    values?: { [key: string]: any }
  ) => addNewObject(layerId, type, objectProps, values),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VectorsLibraryPanel) as React.ComponentType<IMediaLibraryPanelProps>;
