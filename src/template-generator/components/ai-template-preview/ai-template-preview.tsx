import { PropsWithChildren, ReactElement } from "react";
import { IStore } from "../../../store/store";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { last, omit } from "lodash-es";
import { IMeta } from "../../../store/reducers/meta";
import {
  replaceObject,
  updateEditor,
  updateProjectMeta,
} from "../../../store/actions/actions";
import { IEditor } from "../../../store/reducers/editor";
import { connect } from "react-redux";
import { PagePreviewInternal } from "../../../panels/pages-simplified/PagePreview";
import css from "./ai-template-preview.module.scss";

interface AITemplatePreviewProps {
  currentProject: any;
  width?: number;
}

export type AITemplatePreviewPropsMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  AITemplatePreviewProps;

export const AITemplatePreview = (
  props: PropsWithChildren<AITemplatePreviewPropsMergedProps>
): ReactElement | null => {
  const {
    project,
    meta,
    slides,
    layers,
    objects,
    breakpointConfig,
    settings,
    breakpoints,
    _updateProjectMeta,
    _updateEditor,
    // onRequestClose,
    selectedDevice,
    themeClass,
    pages,
    currentProject,
    // _replaceObject,
    width = 250,
  } = props;

  //currentProject = currentLayoutData.layout.project

  return (
    <div className={css.holder}>
      <PagePreviewInternal
        width={width}
        {...currentProject}
        page={currentProject.pages.pageById[currentProject.pages.pages[0]]}
        selectedDevice={"device-independent"}
        breakpoints={currentProject.settings.breakpoints}
        breakpointConfig={
          currentProject.settings.breakpoints.breakpointsConfiguration[0]
        }
      />
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  // NOTE: get largest enabled
  const breakpointConfig: BreakpointConfiguration | undefined = last(
    state.project.settings.breakpoints.breakpointsConfiguration.filter(
      (bc) => bc.enabled
    )
  );

  return {
    project: omit({ ...state.project }, "diff", "clipboard"), //, "selection"
    meta: state.meta,
    slides: state.project.pages,
    layers: state.project.layers,
    objects: state.project.objects,
    breakpointConfig,
    settings: state.project.settings,
    breakpoints: state.project.settings.breakpoints,
    themeClass: state.project.settings.themeClass,
    selectedDevice: state.stage.selectedDevice,
    pages: state.project.pages,
  };
};

const mapDispatchToProps = {
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),
  _replaceObject: replaceObject,
};

export default connect(mapStateToProps, mapDispatchToProps)(AITemplatePreview);
