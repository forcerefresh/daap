import React, { useContext, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./MediaLibraryPanel.module.scss";
import { Button, Tab, Tabs } from "@blueprintjs/core";
import ImagesLibraryPanel from "../images-library-panel/ImagesLibraryPanel";
import { includes, noop, pick } from "lodash-es";
import { IntegrationContext } from "../../integration";
import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import MediaManagementPanel from "../images-library-panel/MediaManagementPanel";
import { addNewObject, replaceObject } from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { getNewMediaObjectBounds } from "./add-object-utils";
import { GlobalEventsContext } from "../../utils/global-events/GlobalEvents";
import { IMAGE } from "../../objects/image/image";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { SVG_MASK } from "../../objects/svg-mask/svg-mask";

export enum Panels {
  MyImages = "myImages",
  MyVideos = "myVideos",
  MyAudios = "myAudios",
  MyVectors = "myVectors",
  MyFonts = "myFonts",
  Images = "images",
  Vectors = "vectors",
  SvgMask = "svgMask",
  MySvgMask = "mySvgMask",
}

export enum SelectionType {
  Single = "single",
  Multiple = "multiple",
}

export const includeMediaRequiredProps = (media: any) => {
  return pick(
    media,
    "width",
    "height",
    "sourceType",
    "sizeType",
    "mediaSizes",
    "inlineSvgPreview",
    "id",
  );
};
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
    onSelect = noop,
    onRequestClose,
    className,
    panelsToShow = [
      Panels.MyImages,
      // Panels.MyVideos,
      // Panels.MyAudios,
      Panels.MyVectors,
      Panels.MyFonts,
      Panels.Images,
      Panels.Vectors,
      Panels.MySvgMask,
      Panels.SvgMask,
    ],
    themeClass,
    _addNewObject,
    activeLayerId,
    defaultSelectedTabId,
    _replaceObject,
  } = props;

  const globalContext = useContext(IntegrationContext);
  const { platform } = globalContext;

  const UploadComponent = globalContext?.getMyUploadComponent;
  const { fetchMedias, deleteMedias } = globalContext.useMyMediaHook();
  const { fetchLibraryMedias, deleteLibraryMedias } =
    globalContext.useLibraryMediaHook();

  const [forceUpdate, setForceUpdate] = useState(0);

  const { replaceItem } = useContext(GlobalEventsContext);

  return (
    <div className={cx(themeClass, css.mediaLibraryPanel, className)}>
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        <Button icon="cross" minimal onClick={onRequestClose} />
      </div>
      <div style={{ overflow: "hidden" }}>
        <Tabs
          className={css.tabs}
          renderActiveTabPanelOnly={true}
          defaultSelectedTabId={defaultSelectedTabId}
        >
          {includes(panelsToShow, Panels.MyImages) && (
            <Tab
              id="myImages"
              title="My Images"
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
                    if (
                      replaceItem?.type === "image" ||
                      replaceItem?.type === "background"
                    ) {
                      _replaceObject(
                        replaceItem.objectId!,
                        IMAGE,
                        replaceItem.objectProps,
                        {
                          ...replaceItem.values,
                          image: includeMediaRequiredProps(mediaItem.media),
                        },
                      );
                      return;
                    }

                    const sizeRect = getNewMediaObjectBounds({
                      media: mediaItem.media,
                      breakpointConfig,
                    });

                    if (activeLayerId) {
                      _addNewObject(
                        activeLayerId,
                        IMAGE,
                        { ...sizeRect },
                        {
                          image: includeMediaRequiredProps(mediaItem.media),
                        },
                      );
                    } else {
                      AppToaster.show({
                        intent: "warning",
                        message: `No layer selected. Please choose a layer first.`,
                      });
                    }
                  }}
                />
              }
            />
          )}

          {platform.hasLibraryMedia &&
            includes(panelsToShow, Panels.MyImages) && (
              <Tab
                id="images"
                title="Library Images"
                panel={
                  <MediaManagementPanel
                    type="image"
                    key={forceUpdate}
                    deleteMediaFunc={deleteLibraryMedias}
                    fetchMediasFunc={fetchLibraryMedias}
                    uploadComponent={<></>}
                    selectionType={selectionType}
                    onRequestClose={onRequestClose}
                    isAddObject={addObject}
                    onSelect={onSelect}
                    onAdd={(mediaItem) => {
                      if (
                        replaceItem?.type === "image" ||
                        replaceItem?.type === "background"
                      ) {
                        _replaceObject(
                          replaceItem.objectId!,
                          IMAGE,
                          replaceItem.objectProps,
                          {
                            ...replaceItem.values,
                            image: includeMediaRequiredProps(mediaItem.media),
                          },
                        );
                        return;
                      }

                      const sizeRect = getNewMediaObjectBounds({
                        media: mediaItem.media,
                        breakpointConfig,
                      });

                      if (activeLayerId) {
                        _addNewObject(
                          activeLayerId,
                          IMAGE,
                          { ...sizeRect },
                          {
                            image: includeMediaRequiredProps(mediaItem.media),
                          },
                        );
                      } else {
                        AppToaster.show({
                          intent: "warning",
                          message: `No layer selected. Please choose a layer first.`,
                        });
                      }
                    }}
                  />
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
                        },
                      );
                    } else {
                      AppToaster.show({
                        intent: "warning",
                        message: `No layer selected. Please choose a layer first.`,
                      });
                    }
                  }}
                />
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
              title="My Vectors"
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
                        IMAGE,
                        { ...sizeRect },
                        {
                          image: includeMediaRequiredProps(mediaItem.media),
                        },
                      );
                    } else {
                      AppToaster.show({
                        intent: "warning",
                        message: `No layer selected. Please choose a layer first.`,
                      });
                    }
                  }}
                />
              }
            />
          )}

          {platform.hasLibraryMedia &&
            includes(panelsToShow, Panels.Vectors) && (
              <Tab
                id="vectors"
                title="Vectors"
                panel={
                  <MediaManagementPanel
                    type="vector"
                    key={forceUpdate}
                    deleteMediaFunc={deleteLibraryMedias}
                    fetchMediasFunc={fetchLibraryMedias}
                    uploadComponent={<></>}
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
                          IMAGE,
                          { ...sizeRect },
                          {
                            image: includeMediaRequiredProps(mediaItem.media),
                          },
                        );
                      } else {
                        AppToaster.show({
                          intent: "warning",
                          message: `No layer selected. Please choose a layer first.`,
                        });
                      }
                    }}
                  />
                }
              />
            )}

          {includes(panelsToShow, Panels.MySvgMask) && (
              <Tab
                id="my-svg-mask"
                title="My Masks"
                panel={
                  <MediaManagementPanel
                    type="svg-mask"
                    key={forceUpdate}
                    deleteMediaFunc={deleteMedias}
                    fetchMediasFunc={fetchMedias}
                    uploadComponent={
                      <UploadComponent
                        type="svg-mask"
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
                          SVG_MASK,
                          { ...sizeRect },
                          {
                            mask: includeMediaRequiredProps(mediaItem.media),
                          },
                        );
                      } else {
                        AppToaster.show({
                          intent: "warning",
                          message: `No layer selected. Please choose a layer first.`,
                        });
                      }
                    }}
                  />
                }
              />
            )}

          {platform.hasLibraryMedia &&
            includes(panelsToShow, Panels.SvgMask) && (
              <Tab
                id="svg-mask"
                title="Masks"
                panel={
                  <MediaManagementPanel
                    type="svg-mask"
                    key={forceUpdate}
                    deleteMediaFunc={deleteLibraryMedias}
                    fetchMediasFunc={fetchLibraryMedias}
                    uploadComponent={<></>}
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
                          SVG_MASK,
                          { ...sizeRect },
                          {
                            mask: includeMediaRequiredProps(mediaItem.media),
                          },
                        );
                      } else {
                        AppToaster.show({
                          intent: "warning",
                          message: `No layer selected. Please choose a layer first.`,
                        });
                      }
                    }}
                  />
                }
              />
            )}

          {includes(panelsToShow, Panels.MyFonts) && (
            <Tab
              id="myFonts"
              title="My Fonts"
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
                      inputs={{
                        name: { label: "Preview" },
                        tags: { hide: true },
                        filename: { hide: true },
                      }}
                    />
                  }
                  onRequestClose={onRequestClose}
                />
              }
            />
          )}
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
        breakpointConfig.type === state.stage.selectedDevice,
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
    values?: { [key: string]: any },
  ) => addNewObject(layerId, type, objectProps, values),

  _replaceObject: replaceObject,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MediaLibraryPanel) as React.ComponentType<IMediaLibraryPanelProps>;
