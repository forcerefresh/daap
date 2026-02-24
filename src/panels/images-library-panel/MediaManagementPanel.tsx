import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import { Button, InputGroup, Spinner } from "@blueprintjs/core";

import { addNewObject } from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce, isNil, noop } from "lodash-es";
import classnames from "classnames";
import { SelectionType } from "../media-library/MediaLibraryPanel";
import {
  MediaType,
  SaaSMediaData,
} from "webslider-sdk/lib/common/i-media-types";
import TagsView from "../../utils/components/tags-view/TagsView";
import { getMediaSrc } from "../../integration/utils/local-media";
import { Pagination } from "../../types/pagination";
import ConfirmButton from "../../utils/components/confirm-button/confirm-button";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import cx from "classnames";

import css from "./MediaManagementPanel.module.scss";

interface IMediaManagementPanelProps {
  type: MediaType;
  uploadComponent?: ReactNode;
  fetchMediasFunc: (props: {
    type: MediaType;
    from: number;
    tags?: string[];
    search?: string;
    perPage?: number;
  }) => Promise<{ pagination: Pagination; data: any[] }>;
  deleteMediaFunc?: (
    type: MediaType,
    ids: string[],
  ) => Promise<{ response: { status: "SUCCESS" | "ERROR"; id: string }[] }>;

  selectionType?: SelectionType;
  isAddObject?: boolean;
  onSelect?: (mediaItem: { media: SaaSMediaData }) => void;
  onAdd?: (mediaItem: { media: SaaSMediaData }) => void;
  onRequestClose: () => void;
}

export type IMediaMManagementPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IMediaManagementPanelProps;

const MediaManagementPanel: React.FC<IMediaMManagementPanelMergedProps> = (
  props,
) => {
  const {
    type,
    uploadComponent,
    fetchMediasFunc,
    deleteMediaFunc,
    selectionType = SelectionType.Single,
    onRequestClose,
    isAddObject = true,
    onSelect = noop,
    onAdd = noop,
  } = props;

  const [mediaItems, setMediaItems] = useState<SaaSMediaData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>("");
  const [requestReload, setRequestReload] = useState<number>(0);
  const [latestPagination, setLatestPagination] = useState<Pagination | null>(
    null,
  );
  const [errorMessage] = useState<string | undefined>();

  const [mediaHovered, setMediaHovered] = useState<string | undefined>();

  const debounceFetchData = debounce(
    (fromPage?: number) => fetchData(fromPage),
    100,
  );

  const reload = useCallback(() => {
    setRequestReload(requestReload + 1);
  }, [setRequestReload, requestReload]);

  const resetImages = useCallback(() => {
    setMediaItems([]);
  }, [setMediaItems]);

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

    if (!isNil(from)) {
      fetchMediasFunc({
        type: type,
        from,
        search: searchValue,
        tags: [],
        perPage: 20,
      }).then(
        (result) => {
          if (from === 1) {
            setMediaItems([...result.data]);
          } else {
            setMediaItems([...mediaItems, ...result.data]);
          }

          setLatestPagination(result.pagination);
          setLoading(false);
          setHasMore(!!result.pagination.nextPage);
        },

        (error) => {
          logger.app.error(error);
        },
      );
    }
  };

  // useEffect(() => {
  //   debounceFetchData(1);
  // }, []);

  useEffect(() => {
    debounceFetchData(1);
  }, [requestReload]);

  const debounceSearchReload = useCallback(
    debounce(() => {
      resetImages();
      reload();
    }, 500),
    [resetImages, reload],
  );

  const renderPreviewImage = (url: string, type: string) => {
    return <img src={url} alt="" />;
  };

  return (
    <div className={css.imageLibraryPanel}>
      {uploadComponent}
      <div className={css.headerSection}>
        <InputGroup
          large
          leftIcon="search"
          placeholder={`Find ${type}...`}
          value={searchValue}
          onChange={(event: any) => {
            setSearchValue((event.currentTarget as HTMLInputElement).value);
            debounceSearchReload();
          }}
        ></InputGroup>
      </div>

      <div className={classnames(css.mainSection)} id="mediaHolder">
        {false && (
          <div className={css.registerAap}>
            Please login to manage media files.
            <br />
            LOGIN
          </div>
        )}

        {!!errorMessage && <div className="error">{errorMessage}</div>}

        <InfiniteScroll
          className={css.infScroll}
          dataLength={mediaItems?.length || -1} //This is important field to render the next data
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
            <>
              <div className={css.breakLine}></div>
              <p
                className={css.allItemsLoaded}
                style={{
                  display: loading ? "none" : "block",
                }}
              >
                <b>All items have been loaded for the chosen criteria.</b>
              </p>
            </>
          }
        >
          {mediaItems?.map((mediaItem, idx) => {
            if (!mediaItem) return null;

            // // TODO: move outsize (preview image url)
            // let previewFileName = mediaItem.previewSizes.find(
            //   (size) => size.sizeType === "small"
            // )?.sourceFilename;

            // if (!previewFileName) {
            //   previewFileName = mediaItem.previewSizes.find(
            //     (size) => size.sizeType === "original"
            //   )?.sourceFilename;
            // }

            // const previewImageUrl = `/api/v1/media/${previewFileName}`;

            const previewImageUrl = getMediaSrc(
              mediaItem,
              "small",
              "previewSizes",
            );

            let originalImageUrl: string | undefined;
            if (mediaItem.type === "video") {
              originalImageUrl = getMediaSrc(mediaItem);
              // const originalFileName = mediaItem.mediaSizes.find(
              //   (size) => size.sizeType === "original"
              // )?.sourceFilename;
              // originalImageUrl = `/api/v1/media/${originalFileName}`;
            }

            return (
              <div
                className={classnames(css.itemHolder)}
                key={
                  mediaItem.id + "_" + mediaItem.name + "_" + mediaItem.filename
                }
                style={{ display: "inline-block" }}
                onMouseEnter={() => {
                  setMediaHovered(mediaItem.id);
                }}
                onMouseLeave={() => {
                  setMediaHovered(undefined);
                }}
                onClick={() => {
                  if (isAddObject) {
                    onAdd?.({
                      media: mediaItem,
                    });
                  } else {
                    onSelect?.({
                      media: mediaItem,
                    });
                  }

                  // if (activeLayerId) {
                  //   if (isAddObject) {
                  //     _addNewObject(
                  //       activeLayerId,
                  //       "image",
                  //       {},
                  //       {
                  //         image: mediaItem,
                  //       }
                  //     );
                  //   }

                  // if (conf.close) {
                  onRequestClose();
                  // } else {
                  // setSelectedImage(-1);
                  // }
                  // }
                }}
              >
                <div
                  className={classnames(css.imageItemHolder, {
                    [css.fontImageItemHolder]: type === "font",
                    // [css.selectedImage]: selectedImage === idx,
                  })}
                >
                  <div
                    className={cx(css.imageHolder, {
                      [css.fontImageHolder]: type === "font",
                    })}
                  >
                    <div
                      className={css.floatingActionBar}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ConfirmButton
                        onConfirm={async () => {
                          const deleteResponse = await deleteMediaFunc?.(type, [
                            mediaItem.id!,
                          ]);

                          const newImages = mediaItems.filter(
                            (image) =>
                              image.id !== deleteResponse?.response[0].id,
                          );

                          setMediaItems(newImages);
                        }}
                        buttonProps={{
                          icon: "trash",
                          small: true,
                        }}
                        title={"Delete image"}
                      >
                        <p>
                          Are you sure you want to delete "{mediaItem.name}"
                          file?
                        </p>

                        <p>
                          <strong>Note: </strong> If the file is used in some
                          projects, it will not be available and visible after
                          deletion.
                        </p>
                      </ConfirmButton>

                      {/* <Button icon={"more"}></Button> */}
                    </div>

                    {originalImageUrl && mediaHovered === mediaItem.id ? (
                      <video
                        autoPlay
                        style={{ maxHeight: "100%", maxWidth: "100%" }}
                        key={idx}
                        src={originalImageUrl}
                      />
                    ) : (
                      renderPreviewImage(previewImageUrl, type)
                    )}
                  </div>

                  <div className={css.imageListTitle}>{mediaItem.name}</div>
                  <div className={css.imageListTags}>
                    <TagsView tags={mediaItem?.tags} />
                  </div>
                </div>
              </div>
            );
          })}
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
    type: string,
    objectProps: Partial<IObject>,
    values?: { [key: string]: any },
  ) => addNewObject(layerId, type, objectProps, values),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MediaManagementPanel);
