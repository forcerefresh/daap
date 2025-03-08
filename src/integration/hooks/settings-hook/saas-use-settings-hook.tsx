import axios from "axios";
import { scaleApp } from "./utils";

export const useSettingsHook = () => {
  const getSettings = (id: string): Promise<any> => {
    return axios.get(`/api/v1/settings`).then((response) => response.data);
  };

  const patchSettings = async ({
    textAISettings,
    appSettings,
  }: {
    textAISettings: any;
    appSettings: any;
  }): Promise<any> => {
    const response = await axios.patch(`/api/v1/settings`, {
      textAISettings,
      appSettings,
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
