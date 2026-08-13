import React from "react";
import { Drawer, DrawerSize } from "@blueprintjs/core";
import { connect } from "react-redux";
import { IPlugin } from "webslider-sdk/lib/plugins/i-plugin";
import { IEditorApi } from "webslider-sdk/lib/plugins/i-plugin";
import { IStore } from "../../store/store";
import { addObject } from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";

interface IPluginDrawerOwnProps {
  plugin: IPlugin;
  onClose: () => void;
}

type IPluginDrawerProps = IPluginDrawerOwnProps &
  ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps;

const PluginDrawer: React.FC<IPluginDrawerProps> = (props) => {
  const { plugin, onClose, project, settings, selection, _addObject } = props;

  const editor: IEditorApi = {
    getProject: () => project,
    getSettings: () => settings,
    getBreakpointConfig: () =>
      settings.breakpoints.breakpointsConfiguration.find((bc: any) => bc.enabled),
    getBreakpoints: () => settings.breakpoints.breakpointsConfiguration,
    getSelectedObjects: () => selection,
    addObjects: (objects: IObject[]) => objects.forEach((obj) => _addObject(obj)),
    updateSettings: () => {},
  };

  const { DrawerComponent } = plugin;

  return (
    <Drawer
      isOpen
      title={plugin.name}
      size={DrawerSize.SMALL}
      onClose={onClose}
      className="bp5-dark"
      canOutsideClickClose
    >
      <DrawerComponent onClose={onClose} editor={editor} />
    </Drawer>
  );
};

const mapStateToProps = (state: IStore) => ({
  project: state.project,
  settings: state.project.settings,
  selection: Object.values(state.project.objects).filter(
    (obj: any) => state.project.selection.selectedObjectIds?.includes(obj.id)
  ) as IObject[],
});

const mapDispatchToProps = {
  _addObject: (object: IObject) => addObject(object),
};

export default connect(mapStateToProps, mapDispatchToProps)(PluginDrawer);
