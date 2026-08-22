import React from "react";
import { Portal } from "@blueprintjs/core";
import { connect } from "react-redux";
import { IPlugin, IEditorApi } from "webslider-sdk/lib/plugins/i-plugin";
import { IStore } from "../../store/store";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import {
  addObject,
  openProject,
  setDevice,
  updateProjectMeta,
  updateEditor,
  doClearHistory,
  activateSlide,
  selectSlides,
  selectForProperties,
} from "../../store/actions/actions";
import { IMeta } from "../../store/reducers/meta";
import { IEditor } from "../../store/reducers/editor";

interface IPluginDrawerOwnProps {
  plugin: IPlugin;
  onClose: () => void;
}

type IPluginDrawerProps = IPluginDrawerOwnProps &
  ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps;

const PluginDrawer: React.FC<IPluginDrawerProps> = (props) => {
  const {
    plugin,
    onClose,
    project,
    settings,
    meta,
    themeClass,
    pages,
    selection,
    _addObject,
    _openProject,
    _setDevice,
    _updateProjectMeta,
    _updateEditor,
    _clearHistory,
    _activateSlide,
    _selectSlides,
    _selectForProperties,
  } = props;

  const editor: IEditorApi = {
    getProject: () => project,
    getSettings: () => settings,
    getBreakpointConfig: () =>
      settings.breakpoints.breakpointsConfiguration.find((bc: any) => bc.enabled),
    getBreakpoints: () => settings.breakpoints.breakpointsConfiguration,
    getSelectedObjects: () => selection,
    getMeta: () => meta as any,
    getThemeClass: () => themeClass,
    getPages: () => (pages as any)?.pages ?? [],

    addObjects: (objects: IObject[]) => objects.forEach((obj) => _addObject(obj)),
    updateSettings: () => {},
    updateMeta: (partial) => _updateProjectMeta(partial as Partial<IMeta>),
    openProject: (p) => _openProject(p),
    setDevice: (dt) => _setDevice(dt),
    clearHistory: () => _clearHistory(),
    activateSlide: (id) => _activateSlide(id),
    selectSlides: (ids) => _selectSlides(ids),
    selectForProperties: (payload) => _selectForProperties(payload as any),
  };

  const { DrawerComponent } = plugin;

  return (
    <Portal>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 20 }}
        onClick={onClose}
      >
        <div
          className="bp5-dark"
          style={{
            position: "absolute",
            top: "52px",
            left: "68px",
            width: "calc(100% - 68px)",
            height: "calc(100% - 52px)",
            overflow: "hidden",
            background: "rgb(51, 51, 51)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <DrawerComponent onClose={onClose} editor={editor} />
        </div>
      </div>
    </Portal>
  );
};

const mapStateToProps = (state: IStore) => ({
  project: state.project,
  settings: state.project.settings,
  meta: state.meta,
  themeClass: state.project.settings.themeClass ?? "dark",
  pages: state.project.pages,
  selection: Object.values(state.project.objects).filter(
    (obj: any) => state.project.selection.selectedObjectIds?.includes(obj.id)
  ) as IObject[],
});

const mapDispatchToProps = {
  _addObject: (object: IObject) => addObject(object),
  _openProject: (project: any) => openProject(project),
  _setDevice: (deviceType: string) => setDevice(deviceType),
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),
  _clearHistory: () => doClearHistory(),
  _activateSlide: (id: string) => activateSlide(id),
  _selectSlides: (ids: string[]) => selectSlides(ids),
  _selectForProperties: (payload: any) => selectForProperties(payload),
};

export default connect(mapStateToProps, mapDispatchToProps)(PluginDrawer as any) as React.FC<IPluginDrawerOwnProps>;
