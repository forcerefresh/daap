import React from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./ProjectsLibraryPanel.module.scss";
import { Tab, Tabs, Tag } from "@blueprintjs/core";
import ProjectsPanel from "../projects-panel/ProjectsPanel";
import MyTemplatesPanel from "../my-templates-panel/MyTemplatesPanel";

interface IProjectsLibraryPanelProps {
  onRequestClose: () => void;
}

export type IProjectsLibraryPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IProjectsLibraryPanelProps;

const ProjectsLibraryPanel: React.FC<IProjectsLibraryPanelMergedProps> = (
  props
) => {
  const { enableDeveloper, missingExtensions } = props;

  return (
    <div className={cx("bp5-dark", css.projectsLibraryPanel)}>
      <div>
        <Tabs className={css.tabs} renderActiveTabPanelOnly>
          <Tab
            id="project"
            title="Projects"
            panel={<ProjectsPanel onRequestClose={props.onRequestClose} />}
          />
          {/* <Tab
            id="templates"
            title="Templates"
            panel={<TemplatesPanel onRequestClose={props.onRequestClose} />}
          /> */}
          <Tab
            id="myTemplates"
            title="Templates"
            panel={<MyTemplatesPanel onRequestClose={props.onRequestClose} />}
          />
          {/* <Tab
            id="extensions"
            title={
              <>
                Extensions{" "}
                {missingExtensions?.length > 0 && (
                  <Tag intent={"danger"} round>
                    {missingExtensions.length}
                  </Tag>
                )}
              </>
            }
            panel={<ExtensionsPanel onRequestClose={props.onRequestClose} />}
          /> */}
          {/* <Tab
            id="myExtensions"
            title="Local Extensions"
            panel={<MyExtensionsPanel onRequestClose={props.onRequestClose} />}
          /> */}
          {/* {enableDeveloper && (
            <Tab
              id="development"
              title="Development"
              panel={<DevelopmentPanel onRequestClose={props.onRequestClose} />}
            />
          )} */}
        </Tabs>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  enableDeveloper: state.globals.enableDeveloper,
  missingExtensions: state.editor.missingExtensions,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsLibraryPanel);
