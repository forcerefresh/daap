import { IAppSettings } from "../../../store/reducers/globals";

export const useAppSettingsHook = () => {
  const getSettings = (): Promise<IAppSettings | undefined> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer.invoke("AppSettings::GetSettings").then((result: any) => {
        console.log(result);
        resolve(result);
      });
    });
  };

  const saveSettings = (settings: IAppSettings): Promise<IAppSettings> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("AppSettings::SaveSettings", JSON.stringify(settings))
        .then((result: any) => {
          console.log(result);
          resolve(result);
        });
    });
  };

  const scaleUI = (zoom: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("AppSettings::ScaleUI", JSON.stringify({ zoom }))
        .then(() => {
          resolve();
        });
    });
  };

  return { getSettings, saveSettings, scaleUI };
};
