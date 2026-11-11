import React from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./ProjectsLibraryPanel.module.scss";
import { Tab, Tabs } from "@blueprintjs/core";
import ProjectsPanel from "../projects-panel/ProjectsPanel";
import MyTemplatesPanel from "../my-templates-panel/MyTemplatesPanel";
import DevelopmentPanel from "../development-panel/DevelopmentPanel";
import PluginsPanel from "../plugins-panel/PluginsPanel";
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
  const { enableDeveloper, userRole } = props;

  return (
    <div className={cx("bp5-dark", css.projectsLibraryPanel)}>
      <div>
        <Tabs className={css.tabs} renderActiveTabPanelOnly>
          <Tab
            id="project"
            title="Projects"
            panel={<ProjectsPanel onRequestClose={props.onRequestClose} />}
          />
          <Tab
            id="myTemplates"
            title="Templates"
            panel={<MyTemplatesPanel onRequestClose={props.onRequestClose} />}
          />
          <Tab
            id="myExtensions"
            title="Local Extensions"
            panel={<MyExtensionsPanel onRequestClose={props.onRequestClose} />}
          />
          {userRole === "ADMIN" && (
            <Tab
              id="plugins"
              title="Plugins"
              panel={<PluginsPanel onRequestClose={props.onRequestClose} />}
            />
          )}
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
  missingExtensions: state.editor.missingExtensions,
  userRole: state.globals.userRole,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsLibraryPanel);
