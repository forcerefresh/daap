import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./MediaLibraryPanel.module.scss";
import { Tab, Tabs } from "@blueprintjs/core";
import ImagesLibraryPanel from "../images-library-panel/ImagesLibraryPanel";
import VectorsLibraryPanel from "../vector-library-panel/VectorLibraryPanel";
import { includes, noop, pick } from "lodash-es";
import { IntegrationContext } from "../../integration";
import {
  ImageData,
  MediaType,
  SaaSMediaData,
  VectorData,
} from "webslider-sdk/lib/common/i-media-types";
import MediaManagementPanel from "../images-library-panel/MediaManagementPanel";
import { Pagination } from "../../types/pagination";
import { addNewObject } from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { getNewMediaObjectBounds } from "./add-object-utils";

export enum Panels {
  MyImages = "myImages",
  MyVideos = "myVideos",
  MyAudios = "myAudios",
  MyVectors = "myVectors",
  MyFonts = "myFonts",
  Images = "images",
  Vectors = "vectors",
}

export enum SelectionType {
  Single = "single",
  Multiple = "multiple",
}

interface IMediaLibraryPanelProps {
  selectionType?: SelectionType;
  panelsToShow?: Panels[];
  addObject?: boolean;
  instaSelect?: boolean;
  showRemoveItem?: boolean;
  onSelect?: (mediaItem: { media: SaaSMediaData }) => void;
  onAdd?: (mediaItem: { media: SaaSMediaData }) => void;
  onRequestClose: () => void;
  className?: string;
  defaultSelectedTabId?: "myFonts";
}

export type IMediaLibraryPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IMediaLibraryPanelProps;

const MediaLibraryPanel: React.FC<IMediaLibraryPanelMergedProps> = (props) => {
  const {
    breakpointConfig,
    selectionType = SelectionType.Single,
    addObject = true,
    instaSelect = false,
    showRemoveItem = false,
    onSelect = noop,
    onRequestClose,
    className,
    panelsToShow = [
      Panels.MyImages,
      // Panels.MyVideos,
      // Panels.MyAudios,
      Panels.MyVectors,
      Panels.MyFonts,
      // Panels.Images,
      // Panels.Vectors,
    ],
    themeClass,
    _addNewObject,
    activeLayerId,
    defaultSelectedTabId,
  } = props;

  const globalContext = useContext(IntegrationContext);
  const UploadComponent = globalContext?.getMyUploadComponent;
  const { getLicenseDetails } = globalContext.useLicenseHook();
  const { fetchMedias, deleteMedias } = globalContext.useMyMediaHook();

  const [forceUpdate, setForceUpdate] = useState(0);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    getLicenseDetails().then((data) => {
      setApiKey(data.apiKey || null);
    });
  }, []);

  const apiUrl = `${
    import.meta.env.VITE_APP_ASSETS_BASE_URL
  }/api/v1?api-key=${apiKey}`;

  //if (apiKey === null) return null;

  const includeMediaRequiredProps = (media: any) => {
    return pick(
      media,
      "width",
      "height",
      "sourceType",
      "sizeType",
      "mediaSizes",
      "id"
    );
  };
  return (
    <div className={cx(themeClass, css.mediaLibraryPanel, className)}>
      <div style={{ overflow: "hidden" }}>
        <Tabs
          className={css.tabs}
          renderActiveTabPanelOnly={true}
          defaultSelectedTabId={defaultSelectedTabId}
        >
          {includes(panelsToShow, Panels.MyImages) && (
            <Tab
              id="myImages"
              title="Images"
              panel={
                <MediaManagementPanel
                  type="image"
                  key={forceUpdate}
                  deleteMediaFunc={deleteMedias}
                  fetchMediasFunc={fetchMedias}
                  uploadComponent={
                    <UploadComponent
                      type="image"
                      onComplete={() => {
                        setForceUpdate(Math.random());
                      }}
                      onStop={() => {
                        setForceUpdate(Math.random());
                      }}
                    />
                  }
                  selectionType={selectionType}
                  onRequestClose={onRequestClose}
                  isAddObject={addObject}
                  onSelect={onSelect}
                  onAdd={(mediaItem) => {
                    const sizeRect = getNewMediaObjectBounds({
                      media: mediaItem.media,
                      breakpointConfig,
                    });

                    if (activeLayerId) {
                      _addNewObject(
                        activeLayerId,
                        "image",
                        { ...sizeRect },
                        {
                          image: includeMediaRequiredProps(mediaItem.media),
                        }
                      );
                    }
                  }}
                />

                // <ImagesLibraryPanel
                //   hasApiKey={true}
                //   type="image"
                //   key={forceUpdate}
                //   deleteImagesFunc={deleteMedias}
                //   fetchImagesFunc={fetchMedias}
                //   uploadComponent={
                //     <UploadComponent
                //       type="image"
                //       onComplete={() => {
                //         setForceUpdate(Math.random());
                //       }}
                //       onStop={() => {
                //         setForceUpdate(Math.random());
                //       }}
                //     />
                //   }
                //   selectionType={selectionType}
                //   onRequestClose={onRequestClose}
                //   addObject={addObject}
                //   onSelect={onSelect}
                // />
              }
            />
          )}
          {includes(panelsToShow, Panels.MyVideos) && (
            <Tab
              id="myVideos"
              title="Videos"
              panel={
                <MediaManagementPanel
                  type="video"
                  key={forceUpdate}
                  deleteMediaFunc={deleteMedias}
                  fetchMediasFunc={fetchMedias}
                  uploadComponent={
                    <UploadComponent
                      type="video"
                      onComplete={() => {
                        setForceUpdate(Math.random());
                      }}
                      onStop={() => {
                        setForceUpdate(Math.random());
                      }}
                    />
                  }
                  selectionType={selectionType}
                  onRequestClose={onRequestClose}
                  isAddObject={addObject}
                  onSelect={onSelect}
                  onAdd={(mediaItem) => {
                    const sizeRect = getNewMediaObjectBounds({
                      media: mediaItem.media,
                      breakpointConfig,
                    });

                    if (activeLayerId) {
                      _addNewObject(
                        activeLayerId,
                        "video",
                        { ...sizeRect },
                        {
                          image: includeMediaRequiredProps(mediaItem.media),
                        }
                      );
                    }
                  }}
                />
                // <ImagesLibraryPanel
                //   hasApiKey={true}
                //   type="video"
                //   key={forceUpdate}
                //   deleteImagesFunc={deleteMedias}
                //   fetchImagesFunc={fetchMedias}
                //   uploadComponent={
                //     <UploadComponent
                //       type="video"
                //       onComplete={() => {
                //         setForceUpdate(Math.random());
                //       }}
                //       onStop={() => {
                //         setForceUpdate(Math.random());
                //       }}
                //     />
                //   }
                //   selectionType={selectionType}
                //   onRequestClose={onRequestClose}
                //   addObject={addObject}
                //   onSelect={onSelect}
                // />
              }
            />
          )}
          {includes(panelsToShow, Panels.MyAudios) && (
            <Tab
              id="myAudios"
              title="Audios"
              panel={
                <ImagesLibraryPanel
                  hasApiKey={true}
                  type="audio"
                  key={forceUpdate}
                  deleteImagesFunc={deleteMedias}
                  fetchImagesFunc={fetchMedias}
                  uploadComponent={
                    <UploadComponent
                      type="audio"
                      onComplete={() => {
                        setForceUpdate(Math.random());
                      }}
                      onStop={() => {
                        setForceUpdate(Math.random());
                      }}
                    />
                  }
                  selectionType={selectionType}
                  onRequestClose={onRequestClose}
                  addObject={addObject}
                  onSelect={onSelect}
                />
              }
            />
          )}
          {includes(panelsToShow, Panels.MyVectors) && (
            <Tab
              id="myVectors"
              title="Vectors"
              panel={
                <MediaManagementPanel
                  type="vector"
                  key={forceUpdate}
                  deleteMediaFunc={deleteMedias}
                  fetchMediasFunc={fetchMedias}
                  uploadComponent={
                    <UploadComponent
                      type="vector"
                      onComplete={() => {
                        setForceUpdate(Math.random());
                      }}
                      onStop={() => {
                        setForceUpdate(Math.random());
                      }}
                    />
                  }
                  selectionType={selectionType}
                  onRequestClose={onRequestClose}
                  isAddObject={addObject}
                  onSelect={onSelect}
                  onAdd={(mediaItem) => {
                    const sizeRect = getNewMediaObjectBounds({
                      media: mediaItem.media,
                      breakpointConfig,
                    });

                    if (activeLayerId) {
                      _addNewObject(
                        activeLayerId,
                        "image",
                        { ...sizeRect },
                        {
                          image: includeMediaRequiredProps(mediaItem.media),
                        }
                      );
                    }
                  }}
                />

                // <VectorsLibraryPanel
                //   hasApiKey={true}
                //   key={forceUpdate}
                //   deleteImagesFunc={deleteMedias}
                //   fetchMediasFunc={fetchMedias}
                //   uploadComponent={
                //     <UploadComponent
                //       type="vector"
                //       onComplete={() => {
                //         setForceUpdate(Math.random());
                //       }}
                //       onStop={() => {
                //         setForceUpdate(Math.random());
                //       }}
                //     />
                //   }
                //   onRequestClose={onRequestClose}
                //   addObject={addObject}
                //   onSelect={onSelect}
                //   instaSelect={instaSelect}
                //   showRemoveItem={showRemoveItem}
                // />
              }
            />
          )}
          {includes(panelsToShow, Panels.MyFonts) && (
            <Tab
              id="myFonts"
              title="Fonts"
              panel={
                <MediaManagementPanel
                  type="font"
                  key={forceUpdate}
                  deleteMediaFunc={deleteMedias}
                  fetchMediasFunc={fetchMedias}
                  uploadComponent={
                    <UploadComponent
                      type="font"
                      onComplete={() => {
                        setForceUpdate(Math.random());
                      }}
                      onStop={() => {
                        setForceUpdate(Math.random());
                      }}
                    />
                  }
                  //selectionType={selectionType}
                  onRequestClose={onRequestClose}
                  // addObject={addObject}
                  // onSelect={onSelect}
                />

                // <ImagesLibraryPanel
                //   hasApiKey={true}
                //   type="font"
                //   key={forceUpdate}
                //   deleteImagesFunc={deleteMedias}
                //   fetchImagesFunc={fetchMedias}
                //   uploadComponent={
                //     <UploadComponent
                //       type="font"
                //       onComplete={() => {
                //         setForceUpdate(Math.random());
                //       }}
                //       onStop={() => {
                //         setForceUpdate(Math.random());
                //       }}
                //     />
                //   }
                //   //selectionType={selectionType}
                //   onRequestClose={onRequestClose}
                //   // addObject={addObject}
                //   // onSelect={onSelect}
                // />
              }
            />
          )}
          {includes(panelsToShow, Panels.Images) && (
            <Tab
              id="images"
              title="Image library"
              panel={
                <ImagesLibraryPanel
                  hasApiKey={!!apiKey}
                  type="image"
                  key={forceUpdate}
                  fetchImagesFunc={(props: {
                    type: MediaType;
                    from: number;
                    tags?: string[];
                    search?: string;
                    perPage?: number;
                  }): Promise<{ pagination: Pagination; data: any[] }> => {
                    const { from, tags = [], search } = props;
                    let url = `${apiUrl}&from=${from}`;
                    if (search) {
                      url += `&search=${encodeURIComponent(search)}`;
                    }
                    if (tags.length > 0) {
                      url += `&tags=${tags
                        .map((tag) => encodeURIComponent(tag))
                        .join(",")}`;
                    }
                    return fetch(url).then((res) => res.json());
                  }}
                  selectionType={selectionType}
                  onRequestClose={onRequestClose}
                  addObject={addObject}
                  onSelect={onSelect}
                />
              }
            />
          )}
          {includes(panelsToShow, Panels.Vectors) && (
            <Tab
              id="Vector"
              title="Vector library"
              panel={
                <VectorsLibraryPanel
                  hasApiKey={!!apiKey}
                  fetchMediasFunc={(props: {
                    type: MediaType;
                    from: number;
                    tags?: string[];
                    search?: string;
                    perPage?: number;
                  }): Promise<{ pagination: Pagination; data: any[] }> => {
                    const { from, tags = [], search } = props;
                    let url = `${apiUrl}&from=${from}&type=vectors`;
                    if (search) {
                      url += `&search=${encodeURIComponent(search)}`;
                    }
                    if (tags.length > 0) {
                      url += `&tags=${tags
                        .map((tag) => encodeURIComponent(tag))
                        .join(",")}`;
                    }
                    return fetch(url).then((res) => res.json());
                  }}
                  key={forceUpdate}
                  onRequestClose={onRequestClose}
                  addObject={addObject}
                  onSelect={onSelect}
                  instaSelect={instaSelect}
                  showRemoveItem={showRemoveItem}
                />
              }
            />
          )}

          {/*<Tabs.Expander />
          <Button minimal icon="cog" />*/}
        </Tabs>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const {
    project: { settings },
  } = state;

  const breakpointConfig: BreakpointConfiguration | undefined =
    settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice
    );

  return {
    breakpointConfig,
    themeClass: state.project.settings.themeClass,
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

export default connect(mapStateToProps, mapDispatchToProps)(MediaLibraryPanel);
