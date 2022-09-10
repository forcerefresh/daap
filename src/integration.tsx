import React from "react";
import { IPlayerData } from "./export/i-export-html";
import { Preset, PresetGroup } from "./webslider-sdk/src/inputs/i-inputs";
import { MyImageSelect } from "./integration/components/my-image-select/my-image-select";
import { ObjectStorageItem } from "./integration/hooks/object-storage-hook/i-object-storage-hook";
import { IExtensionItem } from "./webslider-sdk/src/objects/i-extensions";
import { IAppSettings } from "./store/reducers/globals";
import {
  MediaDataInfo,
  MediaType,
} from "./webslider-sdk/src/common/i-media-types";
import { DevelopmentItem } from "./panels/development-panel/i-development-types";

export interface getMyUploadComponentProps {
  type: MediaType;
  onComplete: () => void;
  onStop: () => void;
}

export interface getLicenseDetailsResponse {
  serial?: string;
  apiKey?: string;
  status: "OK" | "EXPIRED" | "DOES_NOT_EXIST" | string;
  expiredDate: "string";
  subscriptionType: "monthly" | "yearly" | "nosubscription";
  licenseType: "onedeveloper" | "team" | "largeteam";
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

  useMyMediaHook: () => ({
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
    ): Promise<{ response: { status: "SUCCESS" | "ERROR"; id: string }[] }> => {
      return Promise.resolve({ response: [] });
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

  useLicenseHook: () => ({
    saveSerial: (props: { serial: string }): Promise<void> => {
      return Promise.resolve();
    },

    getLicenseDetails: (): Promise<getLicenseDetailsResponse> => {
      return Promise.resolve({} as getLicenseDetailsResponse);
    },
  }),

  useDevelopmentHook: () => ({
    getAll: (): Promise<DevelopmentItem[]> => {
      return Promise.resolve([]);
    },

    addDevelopmentItem: (item: DevelopmentItem): Promise<void> => {
      return Promise.resolve();
    },

    updateDevelopmentItem: (item: Partial<DevelopmentItem>): Promise<void> => {
      return Promise.resolve();
    },

    deleteDevelopmentItem: (id: string): Promise<void> => {
      return Promise.resolve();
    },
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

  useExtensionsHook: () => ({
    /* get installed extensions */
    getInstalledExtensions: (): Promise<{ items: IExtensionItem[] }> =>
      Promise.resolve({ items: [] as IExtensionItem[] }),

    /* get extensions  from server */
    getExtensions: (
      from: number,
      search?: string,
      tags?: string[],
      apiKey?: string
    ): Promise<{ items: IExtensionItem[] }> =>
      Promise.resolve({ items: [] as IExtensionItem[] }),

    /* install extension */
    installExtension: (extension: IExtensionItem): Promise<any> =>
      Promise.resolve({} as IExtensionItem),

    /* uninstall extension */
    uninstallExtension: (props: {
      id: number;
      source?: "marketplace" | "local";
    }): Promise<any> => Promise.resolve({} as IExtensionItem),
  }),

  useProjectHook: () => ({
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
      assetsUrls: {
        id?: string;
        filename?: string;
        url?: string;
        sourceType?: "local" | "library" | "url" | string;
      }[];
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

function useMyMediaHookFactory() {
  if (process.env.REACT_APP_INTEGRATION === "electron") {
    return require("./integration/hooks/my-uploads/electron-my-uploads-hook")
      .useMyMediaHook;
  } else {
    return require("./integration/hooks/my-uploads/my-uploads-hook")
      .useMyMediaHook;
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

function useProjectHookFactory() {
  if (process.env.REACT_APP_INTEGRATION === "wp") {
    return require("./integration/hooks/project-hook/wp-use-project-hook")
      .useProjectHook;
  }
  if (process.env.REACT_APP_INTEGRATION === "electron") {
    return require("./integration/hooks/project-hook/electron-use-project-hook")
      .useProjectHook;
  } else {
    return require("./integration/hooks/project-hook/use-project-hook")
      .useProjectHook;
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

function useExtensionsHookFactory() {
  if (process.env.REACT_APP_INTEGRATION === "electron") {
    return require("./integration/hooks/extensions-hook/electron-use-extensions-hook")
      .useExtensionsHook;
  } else {
    return require("./integration/hooks/extensions-hook/use-extensions-hook")
      .useExtensionsHook;
  }
}

function useLicenseHookFactory() {
  /*if (process.env.REACT_APP_INTEGRATION === "electron") {

  } else {*/
  return require("./integration/hooks/license-hook/use-license-hook")
    .useLicenseHook;
  /*}*/
}

function useDevelopmentHookFactory() {
  /*if (process.env.REACT_APP_INTEGRATION === "electron") {

  } else {*/
  return require("./integration/hooks/development-hook/use-development-hook")
    .useDevelopmentHook;
  /*}*/
}

export const IntegrationContextProvider = (
  props: React.PropsWithChildren<React.ReactNode>
) => {
  return (
    <IntegrationContext.Provider
      value={{
        useMyMediaHook: useMyMediaHookFactory(),
        useMediaHook: useMediaHookFactory(),
        useProjectHook: useProjectHookFactory(),
        useAssetsHook: useAssetsHookFactory(),
        usePresets: usePresetsHookFactory(),
        getMyUploadComponent: getMyUploadComponentFactory(),
        useObjectStorageHook: useObjectStorageFactory(),
        useExtensionsHook: useExtensionsHookFactory(),
        useAppSettingsHook: useAppSettingsHookFactory(),
        useDevelopmentHook: useDevelopmentHookFactory(),
        useLicenseHook: useLicenseHookFactory(),
      }}
    >
      {props.children}
    </IntegrationContext.Provider>
  );
};
