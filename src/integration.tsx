import React from "react";
import { Preset, PresetGroup } from "./inputs/types";

/** IntegrationContext provides API for integration (wp, electron, etc...) */
export const IntegrationContext = React.createContext({
  useAssetsHook: () => ({
    addMedia: (): Promise<{ url: string }> =>
      Promise.resolve({
        source: "", //"external-assets-library"
        url: "",
        originalUrl: "",
        mediaName: "",
      }),
  }),

  useMediaHook: () => ({
    requestMedia: (type: "image" | "video"): Promise<{ url: string }> =>
      Promise.resolve({ url: "" }),
  }),

  useAPIHook: () => ({
    /* returns project */
    getProject: (id: number): Promise<any> => Promise.resolve({}), // todo: add interface for api response

    /* returns projects */
    getProjects: (from: number, search: string): Promise<any> =>
      Promise.resolve({}), // todo: add interface for api response

    /* delete project */
    deleteProject: (id: number): Promise<any> => Promise.resolve({}), // todo: add interface for api response

    /* get next id for project (NOTE: use only for slider name) */
    getNextProjectId: (): Promise<number> => Promise.resolve(1),

    /* save project */
    saveProject: ({
      id,
      name,
      description,
      project,
      preview,
    }: {
      id?: number;
      name: string;
      description?: string;
      slides?: number;
      created?: string;
      modified?: string;
      project: any;
      preview: {
        width: number;
        height: number;
        scale: number;
        html: string;
      };
    }): Promise<{
      id: number;
      name: string;
      description: string;
      slides: number;
      created: string;
      modified: string;
    }> =>
      Promise.resolve({
        id: 1,
        name: "",
        description: "",
        slides: 0,
        created: "",
        modified: "",
      }), // todo: add interface for api response
  }),

  usePresets: () => ({
    /* add preset */
    //addPreset: (
    // type: PresetGroup,
    // preset: Preset<any>
    //): Promise<Preset<any>[]> => Promise.resolve([]), // todo: add interface for api response

    /* returns presets */
    getPresets: (type: PresetGroup): Promise<Preset<any>[]> =>
      Promise.resolve([]), // todo: add interface for api response

    /* delete preset */
    //deletePreset: (type: PresetGroup, name: string): Promise<Preset<any>[]> =>
    //  Promise.resolve([]), // todo: add interface for api response
  }),
});

// *** PUBLIC INTEGRATION FACTORY FUNCTIONS ***

/** return selector for app holder */
export function useAppRootSelector() {
  if (process.env.REACT_APP_INTEGRATION === "wp") {
    return "WebSlider-RootContainer";
  } else {
    return "root";
  }
}

// *** PRIVATE INTEGRATION FACTORY FUNCTIONS ***

function useMediaHookFactory() {
  if (process.env.REACT_APP_INTEGRATION === "wp") {
    return require("./integration/hooks/media-hook/wp-use-media-hook")
      .useMediaHook;
  } else {
    return require("./integration/hooks/media-hook/use-media-hook")
      .useMediaHook;
  }
}

function useAPIHookFactory() {
  if (process.env.REACT_APP_INTEGRATION === "wp") {
    return require("./integration/hooks/api-hook/wp-use-api-hook").useAPIHook;
  }
  if (process.env.REACT_APP_INTEGRATION === "electron") {
    return require("./integration/hooks/api-hook/electron-use-api-hook")
      .useAPIHook;
  } else {
    return require("./integration/hooks/api-hook/use-api-hook").useAPIHook;
  }
}

function useAssetsHookFactory() {
  return require("./integration/hooks/assets-hook/use-assets-hook")
    .useAssetsHook;
}

export const IntegrationContextProvider = (
  props: React.PropsWithChildren<React.ReactNode>
) => {
  return (
    <IntegrationContext.Provider
      value={{
        useMediaHook: useMediaHookFactory(),
        useAPIHook: useAPIHookFactory(),
        useAssetsHook: useAssetsHookFactory(),
        usePresets: () => ({
          getPresets: (type: PresetGroup) => {
            return Promise.resolve([
              {
                name: "preset1",
                value: [
                  { r: 234, g: 123, b: 234, a: 1 },
                  { r: 34, g: 123, b: 234, a: 1 },
                  { r: 234, g: 1, b: 200, a: 1 },
                ],
              },
              {
                name: "preset2",
                value: [
                  { r: 255, g: 33, b: 33, a: 1 },
                  { r: 255, g: 255, b: 33, a: 1 },
                ],
              },
            ]);
          },
        }),
      }}
    >
      {props.children}
    </IntegrationContext.Provider>
  );
};
