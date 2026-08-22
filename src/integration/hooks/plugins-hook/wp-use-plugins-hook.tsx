import { IServerPlugin } from "./saas-use-plugins-hook";

export const usePluginsHook = () => {
  const loadPlugins = async (): Promise<void> => {};
  const getAvailablePlugins = async (): Promise<IServerPlugin[]> => [];
  const getInstalledPlugins = async (): Promise<IServerPlugin[]> => [];
  const installPlugin = async (plugin: IServerPlugin): Promise<IServerPlugin> => plugin;
  const uninstallPlugin = async (_id: string): Promise<void> => {};
  const uploadPlugin = async (
    _fileBase64: string,
    _filename: string,
    _type: string,
    _version: string,
  ): Promise<{ scriptUrl: string }> => ({ scriptUrl: "" });

  return {
    loadPlugins,
    getAvailablePlugins,
    getInstalledPlugins,
    installPlugin,
    uninstallPlugin,
    uploadPlugin,
  };
};
