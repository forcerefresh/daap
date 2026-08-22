import axios from "axios";
import { IPlugin } from "webslider-sdk/lib/plugins/i-plugin";
import { registerPlugin } from "webslider-sdk/lib/plugins/plugins-register";

export interface IServerPlugin {
  id: string;
  type: string;
  version: string;
  name: string;
  description?: string;
  logoUrl?: string;
  scriptUrl: string;
  isBuiltIn?: boolean;
}

function loadPluginScript(scriptUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.onload = () => setTimeout(() => resolve(), 200);
    script.onerror = () => reject(new Error(`Failed to load plugin: ${scriptUrl}`));
    script.src = scriptUrl;
    document.getElementsByTagName("head")[0].appendChild(script);
  });
}

async function loadAndRegisterPlugin(serverPlugin: IServerPlugin): Promise<void> {
  await loadPluginScript(serverPlugin.scriptUrl);
  const win = window as any;
  const key = `${serverPlugin.type}-${serverPlugin.version}`;
  const def: IPlugin | undefined = win.WebSlider_GlobalScope?.plugins?.[key];
  if (def) {
    registerPlugin(def);
  } else {
    console.warn(`Plugin script loaded but def not found in GlobalScope: ${key}`);
  }
}

export const usePluginsHook = () => {
  const loadPlugins = async (): Promise<void> => {
    const response = await axios.get<{ data: IServerPlugin[] }>("/api/v1/plugins");
    const serverPlugins = response.data.data;

    for (const serverPlugin of serverPlugins) {
      try {
        await loadAndRegisterPlugin(serverPlugin);
      } catch (err) {
        console.error(`Failed to load plugin ${serverPlugin.type}@${serverPlugin.version}:`, err);
      }
    }
  };

  const getAvailablePlugins = async (): Promise<IServerPlugin[]> => {
    const response = await axios.get<IServerPlugin[]>("/api/v1/available-plugins");
    return response.data;
  };

  const getInstalledPlugins = async (): Promise<IServerPlugin[]> => {
    const response = await axios.get<{ data: IServerPlugin[] }>("/api/v1/plugins");
    return response.data.data;
  };

  const installPlugin = async (plugin: IServerPlugin): Promise<IServerPlugin> => {
    const response = await axios.post<{ data: IServerPlugin }>("/api/v1/plugins", {
      type: plugin.type,
      version: plugin.version,
      name: plugin.name,
      description: plugin.description ?? "",
      logoUrl: plugin.logoUrl ?? "",
      scriptUrl: plugin.scriptUrl,
    });
    await loadAndRegisterPlugin(plugin);
    return response.data.data;
  };

  const uninstallPlugin = async (id: string): Promise<void> => {
    await axios.delete(`/api/v1/plugins/${id}`);
  };

  const uploadPlugin = async (
    fileBase64: string,
    filename: string,
    type: string,
    version: string,
  ): Promise<{ scriptUrl: string }> => {
    const response = await axios.post<{ data: { scriptUrl: string } }>(
      "/api/v1/plugins/upload",
      { type, version, filename, fileBase64 },
    );
    return response.data.data;
  };

  return {
    loadPlugins,
    getAvailablePlugins,
    getInstalledPlugins,
    installPlugin,
    uninstallPlugin,
    uploadPlugin,
  };
};
