// *** this file contains implementation for development
import { IAppSettings } from "../../../store/reducers/globals";

export const useAppSettingsHook = () => {
  const getSettings = (): Promise<IAppSettings | undefined> => {
    const appSettingsStr = localStorage.getItem("app-settings");

    if (appSettingsStr) {
      try {
        const appSettings = JSON.parse(appSettingsStr);
        return Promise.resolve(appSettings);
      } catch (ex) {
        return Promise.resolve(undefined);
      }
    }

    return Promise.resolve(undefined);
  };

  const saveSettings = (settings: IAppSettings): Promise<IAppSettings> => {
    localStorage.setItem("app-settings", JSON.stringify(settings));

    return Promise.resolve(settings);
  };

  const scaleUI = (zoom: number): Promise<void> => {
    scaleApp(zoom);

    return Promise.resolve();
  };

  return { getSettings, saveSettings, scaleUI };
};

function scaleApp(zoom: number) {
  const appEl = document.getElementsByClassName(
    "daap-forcerefresh-app"
  )?.[0] as HTMLDivElement;

  if (appEl) {
    appEl.style.transformOrigin = "top left";
    appEl.style.zoom = `${zoom * 100}%`;
  }
  // (document.firstElementChild! as any).style.transformOrigin = "top left";
  // // (document.firstElementChild! as any).style.zoom = zoom * 100 + "%";
  // (document.firstElementChild! as any).style.transformOrigin = "top left";
  // (document.firstElementChild! as any).style.transform = "scale(" + zoom + ")";
  // (document.firstElementChild! as any).style.width = (1 / zoom) * 100 + "%";
  // (document.firstElementChild! as any).style.height = (1 / zoom) * 100 + "%";
}
