import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./MediaLibraryPanel.module.scss";
import { Tab, Tabs } from "@blueprintjs/core";
import ImagesLibraryPanel from "../images-library-panel/ImagesLibraryPanel";
import VectorsLibraryPanel from "../vector-library-panel/VectorLibraryPanel";
import { includes, noop } from "lodash-es";
import { ObjectType } from "webslider-sdk/lib/objects/i-object";
import { IntegrationContext } from "../../integration";
import { ImageData, VectorData } from "webslider-sdk/lib/common/i-media-types";
import { fetchMock } from "../vector-library-panel/mock";

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
  onSelect?: (
    item:
      | {
          type: ObjectType;
          initialValues: { [key: string]: any }[];
        }
      | any
  ) => void;
  onRequestClose: () => void;
  className?: string;
}

export type IMediaLibraryPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IMediaLibraryPanelProps;

const MediaLibraryPanel: React.FC<IMediaLibraryPanelMergedProps> = (props) => {
  const {
    selectionType = SelectionType.Single,
    addObject = true,
    instaSelect = false,
    showRemoveItem = false,
    onSelect = noop,
    onRequestClose,
    className,
    panelsToShow = [
      Panels.MyImages,
      Panels.MyVideos,
      Panels.MyAudios,
      Panels.MyVectors,
      Panels.MyFonts,
      Panels.Images,
      Panels.Vectors,
    ],
    themeClass,
  } = props;

  const globalContext = useContext(IntegrationContext);
  const UploadComponent = globalContext?.getMyUploadComponent;
  const { getLicenseDetails } = globalContext.useLicenseHook();
  const { fetchImages, deleteImages } = globalContext.useMyMediaHook();

  const [forceUpdate, setForceUpdate] = useState(0);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    getLicenseDetails().then((data) => {
      setApiKey(data.apiKey || null);
    });
  }, []);

  const apiUrl = `${process.env.REACT_APP_ASSETS_BASE_URL}/api/v1?api-key=${apiKey}`;

  //if (apiKey === null) return null;

  return (
    <div className={cx(themeClass, css.mediaLibraryPanel, className)}>
      <div style={{ overflow: "hidden" }}>
        <Tabs className={css.tabs} renderActiveTabPanelOnly={true}>
          {includes(panelsToShow, Panels.MyImages) && (
            <Tab
              id="myImages"
              title="Images"
              panel={
                <ImagesLibraryPanel
                  hasApiKey={true}
                  type="image"
                  key={forceUpdate}
                  deleteImagesFunc={deleteImages}
                  fetchImagesFunc={fetchImages}
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
                  addObject={addObject}
                  onSelect={onSelect}
                />
              }
            />
          )}
          {includes(panelsToShow, Panels.MyVideos) && (
            <Tab
              id="myVideos"
              title="Videos"
              panel={
                <ImagesLibraryPanel
                  hasApiKey={true}
                  type="video"
                  key={forceUpdate}
                  deleteImagesFunc={deleteImages}
                  fetchImagesFunc={fetchImages}
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
                  addObject={addObject}
                  onSelect={onSelect}
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
                  deleteImagesFunc={deleteImages}
                  fetchImagesFunc={fetchImages}
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
                <VectorsLibraryPanel
                  hasApiKey={true}
                  key={forceUpdate}
                  deleteImagesFunc={deleteImages}
                  fetchImagesFunc={fetchImages}
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
                  onRequestClose={onRequestClose}
                  addObject={addObject}
                  onSelect={onSelect}
                  instaSelect={instaSelect}
                  showRemoveItem={showRemoveItem}
                />
              }
            />
          )}
          {includes(panelsToShow, Panels.MyFonts) && (
            <Tab
              id="myFonts"
              title="Fonts"
              panel={
                <ImagesLibraryPanel
                  hasApiKey={true}
                  type="font"
                  key={forceUpdate}
                  deleteImagesFunc={deleteImages}
                  fetchImagesFunc={fetchImages}
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
                    from: number;
                    tags?: string[];
                    search?: string;
                  }): Promise<{ data: ImageData[]; hasMore: boolean }> => {
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
                  fetchImagesFunc={(props: {
                    from: number;
                    tags?: string[];
                    search?: string;
                  }): Promise<{ data: VectorData[]; hasMore: boolean }> => {
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

const mapStateToProps = (state: IStore) => ({
  themeClass: state.project.settings.themeClass,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(MediaLibraryPanel);
