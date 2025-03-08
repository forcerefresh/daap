// // *** this file contains implementation for development
// import { IAppSettings } from "../../../store/reducers/globals";

// export const useAppSettingsHook = () => {
//   const getSettings = (): Promise<IAppSettings | undefined> => {
//     const appSettingsStr = localStorage.getItem("app-settings");

//     if (appSettingsStr) {
//       try {
//         const appSettings = JSON.parse(appSettingsStr);
//         return Promise.resolve(appSettings);
//       } catch (ex) {
//         return Promise.resolve(undefined);
//       }
//     }

//     return Promise.resolve(undefined);
//   };

//   const saveSettings = (settings: IAppSettings): Promise<IAppSettings> => {
//     localStorage.setItem("app-settings", JSON.stringify(settings));

//     return Promise.resolve(settings);
//   };

//   const scaleUI = (zoom: number): Promise<void> => {
//     scaleApp(zoom);

//     return Promise.resolve();
//   };

//   return { getSettings, saveSettings, scaleUI };
// };
