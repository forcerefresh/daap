import axios from "axios";

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
  }: {
    textAISettings: any;
  }): Promise<any> => {
    const response = await axios.patch(
      `${daapForcerefreshSettings.root}daap/v1/settings`,
      { textAISettings },
      {
        headers: {
          "X-WP-Nonce": daapForcerefreshSettings.nonce,
        },
      }
    );
    return response.data.data;
  };

  return {
    getSettings,
    patchSettings,
  };
};
