import axios from "axios";
import { IPlugin } from "webslider-sdk/lib/plugins/i-plugin";
import { registerPlugin } from "webslider-sdk/lib/plugins/plugins-register";

interface IServerPlugin {
  id: string;
  type: string;
  version: string;
  name: string;
  scriptUrl: string;
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

export const usePluginsHook = () => {
  const loadPlugins = async (): Promise<void> => {
    const response = await axios.get<{ data: IServerPlugin[] }>("/api/v1/plugins");
    const serverPlugins = response.data.data;

    for (const serverPlugin of serverPlugins) {
      try {
        await loadPluginScript(serverPlugin.scriptUrl);
        const win = window as any;
        const key = `${serverPlugin.type}-${serverPlugin.version}`;
        const def: IPlugin | undefined = win.WebSlider_GlobalScope?.plugins?.[key];
        if (def) {
          registerPlugin(def);
        } else {
          console.warn(`Plugin script loaded but def not found in GlobalScope: ${key}`);
        }
      } catch (err) {
        console.error(`Failed to load plugin ${serverPlugin.type}@${serverPlugin.version}:`, err);
      }
    }
  };

  return { loadPlugins };
};
