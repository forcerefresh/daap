import axios from "axios";
import type { components } from "../../../types/api";
import { scaleApp } from "./utils";

type Settings = components["schemas"]["Settings"];
type PublishSettings = components["schemas"]["PublishSettings"];

export const useSettingsHook = () => {
  const getSettings = (_id?: string): Promise<Settings> => {
    return axios.get(`/api/v1/settings`).then((response) => response.data);
  };

  const patchSettings = async ({
    textAISettings,
    appSettings,
    publishSettings,
  }: {
    textAISettings?: Record<string, unknown>;
    appSettings?: Record<string, unknown>;
    publishSettings?: PublishSettings;
  }): Promise<void> => {
    if (appSettings?.appZoom) {
      localStorage.setItem("appZoom", appSettings.appZoom);
    }

    const response = await axios.patch(`/api/v1/settings`, {
      textAISettings,
      appSettings,
      publishSettings,
    });
    return response.data.data;
  };

  const scaleUI = (zoom: number): Promise<void> => {
    scaleApp(zoom);

    return Promise.resolve();
  };

  return {
    getSettings,
    patchSettings,
    scaleUI,
  };
};
