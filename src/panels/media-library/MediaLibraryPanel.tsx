import React, { useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./MediaLibraryPanel.module.scss";
import { Tab, Tabs } from "@blueprintjs/core";
import ImagesLibraryPanel from "../images-library-panel/ImagesLibraryPanel";

interface IMediaLibraryPanelProps {
  onRequestClose: () => void;
}

export type IMediaLibraryPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IMediaLibraryPanelProps;

const MediaLibraryPanel: React.FC<IMediaLibraryPanelMergedProps> = (props) => {
  return (
    <div className={cx("bp3-dark", css.mediaLibraryPanel)}>
      <div>
        <Tabs className={css.tabs}>
          <Tab
            id="project"
            title="Images library"
            panel={<ImagesLibraryPanel onRequestClose={props.onRequestClose} />}
          />
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
