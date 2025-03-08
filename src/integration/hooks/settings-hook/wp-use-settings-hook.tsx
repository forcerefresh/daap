import axios from "axios";
import { scaleApp } from "./utils";

export const useSettingsHook = () => {
  const getSettings = (id: string): Promise<any> => {
    return axios
      .get(`${daapForcerefreshSettings.root}daap/v1/settings`, {
        headers: {
          "X-WP-Nonce": daapForcerefreshSettings.nonce,
        },
      })
      .then((response) => response.data);
  };

  const patchSettings = async ({
    textAISettings,
    appSettings,
  }: {
    textAISettings?: any;
    appSettings?: any;
  }): Promise<any> => {
    const response = await axios.patch(
      `${daapForcerefreshSettings.root}daap/v1/settings`,
      { textAISettings, appSettings },
      {
        headers: {
          "X-WP-Nonce": daapForcerefreshSettings.nonce,
        },
      }
    );
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
