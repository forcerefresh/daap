import axios from "axios";

export const useSettingsHook = () => {
  const getSettings = (id: string): Promise<any> => {
    return axios.get(`/api/v1/settings`).then((response) => response.data);
  };

  const patchSettings = async ({
    textAISettings,
  }: {
    textAISettings: any;
  }): Promise<any> => {
    const response = await axios.patch(`/api/v1/settings`, { textAISettings });
    return response.data.data;
  };

  return {
    getSettings,
    patchSettings,
  };
};
