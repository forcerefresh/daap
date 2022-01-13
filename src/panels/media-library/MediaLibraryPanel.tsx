import React, { useContext, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./MediaLibraryPanel.module.scss";
import { Tab, Tabs } from "@blueprintjs/core";
import ImagesLibraryPanel from "../images-library-panel/ImagesLibraryPanel";
import VectorsLibraryPanel from "../vector-library-panel/VectorLibraryPanel";
import { includes, noop } from "lodash-es";
import { ObjectType } from "../../objects/types";
import { IntegrationContext } from "../../integration";

export enum Panels {
  MyImages = "myImages",
  Images = "images",
  MyVectors = "myVectors",
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
    onSelect = noop,
    onRequestClose,
    className,
    panelsToShow = [Panels.MyImages, Panels.Images, Panels.Vectors],
  } = props;

  const globalContext = useContext(IntegrationContext);
  const ImageSelectComponent = globalContext?.getMyImageUploadComponent;

  const [forceUpdate, setForceUpdate] = useState(0);
  return (
    <div className={cx("bp3-dark", css.mediaLibraryPanel, className)}>
      <div key={forceUpdate}>
        <Tabs className={css.tabs} renderActiveTabPanelOnly={true}>
          {includes(panelsToShow, Panels.MyImages) && (
            <Tab
              id="myImages"
              title="My Images"
              panel={
                <ImagesLibraryPanel
                  uploadComponent={
                    <ImageSelectComponent
                      onComplete={() => {
                        setForceUpdate(Math.random());
                      }}
                      onStop={() => {
                        setForceUpdate(Math.random());
                      }}
                    />
                  }
                  api={`${process.env.REACT_APP_ASSETS_BASE_URL}/api/v1`}
                  selectionType={selectionType}
                  onRequestClose={onRequestClose}
                  addObject={addObject}
                  onSelect={onSelect}
                />
              }
            />
          )}
          {includes(panelsToShow, Panels.Images) && (
            <Tab
              id="images"
              title="Images library"
              panel={
                <ImagesLibraryPanel
                  api={`${process.env.REACT_APP_ASSETS_BASE_URL}/api/v1`}
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
                  onRequestClose={onRequestClose}
                  addObject={addObject}
                  onSelect={onSelect}
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

const mapStateToProps = (state: IStore) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(MediaLibraryPanel);
