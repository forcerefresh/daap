import React from "react";
import { IPlayerData } from "./export/i-export-html";
import { Preset, PresetGroup } from "./inputs/types";
import { MyImageSelect } from "./integration/components/my-image-select/my-image-select";
import { ObjectStorageItem } from "./integration/hooks/object-storage-hook/i-object-storage-hook";
import { IMarketItem } from "./webslider-sdk/src/objects/i-marketplace";
import { IAppSettings } from "./store/reducers/globals";
import { MediaDataInfo, MediaType } from "./utils/assets/types";
export interface getMyUploadComponentProps {
  type: MediaType;
  onComplete: () => void;
  onStop: () => void;
}

/** IntegrationContext provides API for integration (wp, electron, etc...) */
export const IntegrationContext = React.createContext({
  useObjectStorageHook: () => ({
    supportStorageObjects: false,
    listStorageObjects: (req: {
      projectId?: number;
    }): Promise<ObjectStorageItem[]> => Promise.resolve([]),

    listAssignedStorageObjects: (req: {
      projectId: number;
    }): Promise<ObjectStorageItem[]> => Promise.resolve([]),

    addStorageObject: (
      so: Omit<ObjectStorageItem, "id">
    ): Promise<ObjectStorageItem> => Promise.resolve({} as ObjectStorageItem),

    deleteStorageObject: (req: {
      id: string;
    }): Promise<{ deletedId: string }> => Promise.resolve({ deletedId: "" }),

    uploadPlayerToStorageObject: (req: {
      id: string;
    }): Promise<{ status: "OK" | "ERROR"; error?: string }> =>
      Promise.resolve({ status: "OK" }),

    assignBucketToProject: (req: {
      bucketId: string;
      projectId: number;
    }): Promise<{ status: string; error?: string }> =>
      Promise.resolve({ status: "" }),

    removeBucketFromProject: (req: {
      bucketId: string;
      projectId: number;
    }): Promise<{ status: string; error?: string }> =>
      Promise.resolve({ status: "" }),

    getAssignedBucketIds: (req: { projectId: number }): Promise<string[]> =>
      Promise.resolve([]),

    publishToStorageObject: (req: {
      bucketId: string;
      projectId: number;
      revision: number;
    }): Promise<{ status: string; error?: string }> =>
      Promise.resolve({ status: "" }),

    subscribeToPublishDetails: (callback: (details: any) => void) => () =>
      undefined,

    openPublishUrl: (req: { bucketId: string; projectId: number }): void =>
      undefined,

    downloadPackage: (req: { projectId: number }): Promise<string> =>
      Promise.resolve(""),
  }),

  getMyUploadComponent: ((props) => {
    return <div></div>;
  }) as React.FC<getMyUploadComponentProps>,

  useMyImagesHook: () => ({
    upload: (
      type: MediaType,
      file: File,
      filesInfo: MediaDataInfo
    ): Promise<{ status: "OK" | "ERROR"; errorMessage?: string }> =>
      Promise.resolve({
        status: "OK",
      }),

    fetchImages: (props: {
      type: MediaType;
      from: number;
      tags?: string[];
      search?: string;
      perPage?: number;
    }): Promise<{
      data: /*ImageData[] | VectorData[] |*/ any[];
      hasMore: boolean;
    }> => {
      return Promise.resolve({ data: [], hasMore: false });
    },

    deleteImages: (
      type: MediaType,
      ids: string[]
    ): Promise<{ deletedIds: string[] }> => {
      return Promise.resolve({ deletedIds: [] });
    },
  }),

  useAppSettingsHook: () => ({
    getSettings: (): Promise<IAppSettings | undefined> => {
      return Promise.resolve({} as IAppSettings);
    },

    saveSettings: (settings: IAppSettings): Promise<IAppSettings> => {
      return Promise.resolve({} as IAppSettings);
    },

    scaleUI: (zoom: number): Promise<void> => Promise.resolve(undefined),
  }),

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

  useMarketplaceHook: () => ({
    /* get installed market items */
    getInstalledMarketItems: (): Promise<{ items: IMarketItem[] }> =>
      Promise.resolve({ items: [] as IMarketItem[] }),

    /* get market items from server */
    getMarketItems: (
      from: number,
      search?: string,
      tags?: string[]
    ): Promise<{ items: IMarketItem[] }> =>
      Promise.resolve({ items: [] as IMarketItem[] }),

    /* install market item */
    installMarketItem: (marketItem: IMarketItem): Promise<any> =>
      Promise.resolve({} as IMarketItem),

    /* uninstall market item */
    uninstallMarketItem: (id: number): Promise<any> =>
      Promise.resolve({} as IMarketItem),
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
      playerData: IPlayerData;
      assetsUrls: { url: string; type: "url" | string }[];
    }): Promise<{
      id: number;
      name: string;
      description: string;
      slides: number;
      created: string;
      modified: string;
      saveRevision: number;
      assetsUrls: { url: string; type: "url" | string }[];
    }> =>
      Promise.resolve({
        id: 1,
        name: "",
        description: "",
        slides: 0,
        created: "",
        modified: "",
        saveRevision: 0,
        assetsUrls: [],
      }), // todo: add interface for api response
  }),

  usePresets: () => ({
    /* add preset */
    addPreset: (
      type: PresetGroup,
      preset: Preset<any>
    ): Promise<Preset<any>[]> => Promise.resolve([]),

    /* returns presets */
    getPresets: (type: PresetGroup): Promise<Preset<any>[]> =>
      Promise.resolve([]),

    /* update preset */
    updatePreset: (
      type: PresetGroup,
      preset: Preset<any>
    ): Promise<Preset<any>[]> => Promise.resolve([]),

    /* delete preset */
    deletePreset: (type: PresetGroup, name: string): Promise<Preset<any>[]> =>
      Promise.resolve([]),
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

function useObjectStorageFactory() {
  if (process.env.REACT_APP_INTEGRATION === "electron") {
    return require("./integration/hooks/object-storage-hook/electron-object-storage-hook")
      .useObjectStorageHook;
  }
  return () => ({
    supportStorageObjects: false,
  });
}

function useMyImagesHookFactory() {
  if (process.env.REACT_APP_INTEGRATION === "electron") {
    return require("./integration/hooks/my-images/electron-my-images-hook")
      .myImagesHook;
  } else {
    return require("./integration/hooks/my-images/my-images-hook").myImagesHook;
  }
}

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

function getMyUploadComponentFactory() {
  /*if (process.env.REACT_APP_INTEGRATION === "wp") {
    return WPMyImageSelect;
  }
  if (process.env.REACT_APP_INTEGRATION === "electron") {
    return ElectronMyImageSelect;
  } else {*/
  return MyImageSelect;
  /** }*/
}

function useAppSettingsHookFactory() {
  if (process.env.REACT_APP_INTEGRATION === "electron") {
    return require("./integration/hooks/app-settings-hook/electron-use-app-settings-hook")
      .useAppSettingsHook;
  } else {
    return require("./integration/hooks/app-settings-hook/use-app-settings-hook")
      .useAppSettingsHook;
  }
}

function useAssetsHookFactory() {
  return require("./integration/hooks/assets-hook/use-assets-hook")
    .useAssetsHook;
}

function usePresetsHookFactory() {
  return require("./integration/hooks/presets-hook/use-presets-hook")
    .usePresets;
}

function useMarketplaceHookFactory() {
  /*if (process.env.REACT_APP_INTEGRATION === "electron") {
    return require("./integration/hooks/marketplace-hook/electron-use-marketplace-hook")
      .useMarketplaceHook;
  } else {*/
  return require("./integration/hooks/marketplace-hook/use-marketplace-hook")
    .useMarketplaceHook;
  /*}*/
}

export const IntegrationContextProvider = (
  props: React.PropsWithChildren<React.ReactNode>
) => {
  return (
    <IntegrationContext.Provider
      value={{
        useMyImagesHook: useMyImagesHookFactory(),
        useMediaHook: useMediaHookFactory(),
        useAPIHook: useAPIHookFactory(),
        useAssetsHook: useAssetsHookFactory(),
        usePresets: usePresetsHookFactory(),
        getMyUploadComponent: getMyUploadComponentFactory(),
        useObjectStorageHook: useObjectStorageFactory(),
        useMarketplaceHook: useMarketplaceHookFactory(),
        useAppSettingsHook: useAppSettingsHookFactory(),
      }}
    >
      {props.children}
    </IntegrationContext.Provider>
  );
};
