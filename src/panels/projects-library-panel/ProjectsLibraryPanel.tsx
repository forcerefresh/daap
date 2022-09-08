import React, { useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./ProjectsLibraryPanel.module.scss";
import { Tab, Tabs } from "@blueprintjs/core";
import ProjectsPanel from "../projects-panel/ProjectsPanel";
import ExtensionsPanel from "../extensions-panel/ExtensionsPanel";
import DevelopmentPanel from "../development-panel/DevelopmentPanel";
import MyExtensionsPanel from "../my-extensions-panel/MyExtensionsPanel";

interface IProjectsLibraryPanelProps {
  onRequestClose: () => void;
}

export type IProjectsLibraryPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IProjectsLibraryPanelProps;

const ProjectsLibraryPanel: React.FC<IProjectsLibraryPanelMergedProps> = (
  props
) => {
  const { enableDeveloper } = props;

  return (
    <div className={cx("bp3-dark", css.projectsLibraryPanel)}>
      <div>
        <Tabs className={css.tabs} renderActiveTabPanelOnly>
          <Tab
            id="project"
            title="Projects"
            panel={<ProjectsPanel onRequestClose={props.onRequestClose} />}
          />
          <Tab id="templates" title="Templates" panel={<div />} />
          <Tab
            id="extensions"
            title="Extensions"
            panel={<ExtensionsPanel onRequestClose={props.onRequestClose} />}
          />
          <Tab
            id="myExtensions"
            title="Local Extensions"
            panel={<MyExtensionsPanel onRequestClose={props.onRequestClose} />}
          />
          {enableDeveloper && (
            <Tab
              id="development"
              title="Development"
              panel={<DevelopmentPanel onRequestClose={props.onRequestClose} />}
            />
          )}
        </Tabs>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  enableDeveloper: state.globals.enableDeveloper,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsLibraryPanel);
