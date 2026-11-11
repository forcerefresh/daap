import React from "react";
import { IPlatformFlags } from "./integration/core/i-platform-flags";
import { platformFlags } from "@platform/platform-flags";

import { ObjectStorageItem } from "./integration/hooks/object-storage-hook/i-object-storage-hook";
import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import {
  MediaDataInfo,
  MediaType,
} from "webslider-sdk/lib/common/i-media-types";
import { DevelopmentItem } from "./panels/development-panel/i-development-types";
import { Preset, PresetGroup } from "./utils/presets/i-presets";
import { Pagination } from "./types/pagination";

import type {
  Media,
  Settings,
  Template,
  Project,
  IServerPlugin,
  SaveTemplateArgs,
  SaveProjectArgs,
} from "@daap/integration/core/i-hooks";

export interface Document {
  id: string;
  parentId: string;
  level: string;
  name: string;
  children: Document[];
}

export interface getFullscreenButtonComponentProps {
  isFullscreen: boolean;
  toggle: () => void;
  className?: string;
}

export interface AccountComponentProps {
  placement: "editor-header" | "search-header";
}

export interface getMyUploadComponentProps {
  type: MediaType;
  onComplete: () => void;
  onStop: () => void;
  inputs?: {
    name?: { label?: string; hide?: boolean };
    tags?: { label?: string; hide?: boolean };
    filename?: { label?: string; hide?: boolean };
  };
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
    listStorageObjects: (_req: {
      projectId?: string;
    }): Promise<ObjectStorageItem[]> => Promise.resolve([]),

    listAssignedStorageObjects: (_req: {
      projectId: string;
    }): Promise<ObjectStorageItem[]> => Promise.resolve([]),

    addStorageObject: (
      _so: Omit<ObjectStorageItem, "id">
    ): Promise<ObjectStorageItem> => Promise.resolve({} as ObjectStorageItem),

    deleteStorageObject: (_req: {
      id: string;
    }): Promise<{ deletedId: string }> => Promise.resolve({ deletedId: "" }),

    uploadPlayerToStorageObject: (_req: {
      id: string;
    }): Promise<{ status: "OK" | "ERROR"; error?: string }> =>
      Promise.resolve({ status: "OK" }),

    assignBucketToProject: (_req: {
      bucketId: string;
      projectId: string;
    }): Promise<{ status: string; error?: string }> =>
      Promise.resolve({ status: "" }),

    removeBucketFromProject: (_req: {
      bucketId: string;
      projectId: string;
    }): Promise<{ status: string; error?: string }> =>
      Promise.resolve({ status: "" }),

    getAssignedBucketIds: (_req: { projectId: string }): Promise<string[]> =>
      Promise.resolve([]),

    publishToStorageObject: (_req: {
      bucketId: string;
      projectId: string;
      revision: number;
    }): Promise<{ status: string; error?: string }> =>
      Promise.resolve({ status: "" }),

    subscribeToPublishDetails: (_callback: (details: unknown) => void) => () =>
      undefined,

    openPublishUrl: (_req: {
      bucketId: string;
      projectId: string;
      debug?: boolean;
    }): void => undefined,

    getPublishDetails: (_req: {
      bucketId: string;
      projectId: string;
    }): Promise<{ indexUrl: string; jsonUrl: string; playerUrl: string }> => {
      return Promise.resolve({ indexUrl: "", jsonUrl: "", playerUrl: "" });
    },

    downloadPackage: (_req: { projectId: string }): Promise<string> =>
      Promise.resolve(""),
  }),

  getMyUploadComponent: ((_props) => {
    return <div></div>;
  }) as React.FC<getMyUploadComponentProps>,

  getFullscreenButtonComponent: ((_props) => {
    return <div></div>;
  }) as React.FC<getFullscreenButtonComponentProps>,

  /** platform-specific login/account UI (SAAS: login dialog + account menu, WP: nothing) */
  AccountComponent: ((_props) => null) as React.FC<AccountComponentProps>,

  CloseMonitorComponent: ((_props) => {
    return <div></div>;
  }) as React.FC,

  useExitHook: () => undefined,

  useMyMediaHook: () => ({
    upload: (
      _type: MediaType,
      _file: File,
      _filesInfo: MediaDataInfo
    ): Promise<{ status: "OK" | "ERROR"; errorMessage?: string }> =>
      Promise.resolve({
        status: "OK",
      }),

    uploadToWP: (
      _filename: string,
      _file: string //File
    ): Promise<{ status: "OK" | "ERROR"; errorMessage?: string }> =>
      Promise.resolve({
        status: "OK",
      }),

    fetchMedias: (_props: {
      type: MediaType;
      from: number;
      tags?: string[];
      search?: string;
      perPage?: number;
    }): Promise<{ data: Media[]; pagination: Pagination }> => {
      return Promise.resolve({ data: [], pagination: {} as Pagination });
    },

    deleteMedias: (
      _type: MediaType,
      _ids: string[]
    ): Promise<{ response: { status: "SUCCESS" | "ERROR"; id: string }[] }> => {
      return Promise.resolve({ response: [] });
    },
  }),

  useLibraryMediaHook: () => ({
    fetchLibraryMedias: (_props: {
      type: MediaType;
      from: number;
      tags?: string[];
      search?: string;
      perPage?: number;
    }): Promise<{ data: Media[]; pagination: Pagination }> => {
      return Promise.resolve({ data: [], pagination: {} as Pagination });
    },

    deleteLibraryMedias: (
      _type: MediaType,
      _ids: string[]
    ): Promise<{ response: { status: "SUCCESS" | "ERROR"; id: string }[] }> => {
      return Promise.resolve({ response: [] });
    },
  }),

  useAIHook: () => ({
    textQuery: (_props: {
      query: string;
      template: string;
    }): Promise<{ output?: string; error?: string }> => {
      return Promise.resolve({});
    },
  }),

  useLicenseHook: () => ({
    saveSerial: (_props: {
      serial: string;
      allowTransfer: boolean;
    }): Promise<void> => {
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

    addDevelopmentItem: (_item: DevelopmentItem): Promise<void> => {
      return Promise.resolve();
    },

    updateDevelopmentItem: (_item: Partial<DevelopmentItem>): Promise<void> => {
      return Promise.resolve();
    },

    deleteDevelopmentItem: (_id: string): Promise<void> => {
      return Promise.resolve();
    },
  }),

  usePluginsHook: () => ({
    loadPlugins: (): Promise<void> => Promise.resolve(),
    getAvailablePlugins: (): Promise<IServerPlugin[]> => Promise.resolve([]),
    getInstalledPlugins: (): Promise<IServerPlugin[]> => Promise.resolve([]),
    installPlugin: (_plugin: IServerPlugin): Promise<IServerPlugin> => Promise.resolve(_plugin),
    uninstallPlugin: (_id: string): Promise<void> => Promise.resolve(),
    uploadPlugin: (_fileBase64: string, _filename: string, _type: string, _version: string): Promise<{ scriptUrl: string }> => Promise.resolve({ scriptUrl: "" }),
  }),

  useExtensionsHook: () => ({
    /* get installed extensions */
    getInstalledExtensions: (): Promise<{ data: IExtensionItem[] }> =>
      Promise.resolve({ data: [] as IExtensionItem[] }),

    /* get extensions  from server */
    getExtensions: (
      _from: number,
      _search?: string,
      _tags?: string[],
      _missingExtensions?: string[],
      _apiKey?: string
    ): Promise<{ data: IExtensionItem[] }> =>
      Promise.resolve({ data: [] as IExtensionItem[] }),

    /* install extension */
    installExtension: (_extension: IExtensionItem): Promise<IExtensionItem> =>
      Promise.resolve({} as IExtensionItem),

    /* uninstall extension */
    uninstallExtension: (_props: {
      type: string | number;
    }): Promise<IExtensionItem> => Promise.resolve({} as IExtensionItem),
  }),

  useRemoteTemplateHook: () => ({
    getRemoteTemplate: (_id: string): Promise<unknown> => Promise.resolve({}),
    getRemoteTemplates: (_from: number, _search: string): Promise<unknown> => Promise.resolve({}),
    uninstallRemoteTemplate: (_id: string): Promise<unknown> => Promise.resolve({}),
    installRemoteTemplate: (_req: unknown): Promise<string> => Promise.resolve(""),
    getInstalledRemoteTemplates: (): Promise<{ items: unknown[] }> => Promise.resolve({ items: [] }),
  }),

  useTemplateHook: () => ({
    getTemplate: (_id: string): Promise<Template> => Promise.resolve({} as Template),
    getTemplates: (_from: number, _search: string): Promise<{ data: Template[]; pagination: Pagination }> =>
      Promise.resolve({ data: [], pagination: {} as Pagination }),
    deleteTemplate: (_id: string): Promise<{ id: string }> => Promise.resolve({ id: "" }),

    downloadTemplate: (_req: { id: string }): Promise<string> =>
      Promise.resolve(""),

    saveTemplate: (_args: SaveTemplateArgs): Promise<Template> =>
      Promise.resolve({} as Template),
  }),

  useSettingsHook: () => ({
    getSettings: (): Promise<Settings> =>
      Promise.resolve({} as Settings),
    patchSettings: (_args: {
      textAISettings?: Record<string, unknown>;
      appSettings?: Record<string, unknown>;
      publishSettings?: Record<string, unknown>;
    }): Promise<void> => Promise.resolve(),
    scaleUI: (_zoom: number): Promise<void> => Promise.resolve(undefined),
  }),

  useDocumentsTypeHook: () => ({
    getDocumentTypeTree: (): Promise<{ documents: Record<string, unknown>[] }> =>
      Promise.resolve({ documents: [] }),
  }),

  useProjectHook: () => ({
    getProject: (_id: string): Promise<Project> => Promise.resolve({} as Project),
    getProjects: (
      _from: number,
      _search: string
    ): Promise<{ data: Project[]; pagination: Pagination }> =>
      Promise.resolve({ data: [], pagination: {} as Pagination }),

    /* delete project */
    deleteProject: (_id: string): Promise<{ id: string }> =>
      Promise.resolve({ id: "" }), // todo: add interface for api response

    createProject: (_args: SaveProjectArgs): Promise<Project> =>
      Promise.resolve({} as Project),

    updateProject: (_id: string, _args: SaveProjectArgs): Promise<Project> =>
      Promise.resolve({} as Project),
  }),

  usePresets: () => ({
    addPreset: (
      _type: PresetGroup,
      _preset: Preset<unknown>
    ): Promise<Preset<unknown>[]> => Promise.resolve([]),
    getPresets: (_type: PresetGroup): Promise<Preset<unknown>[]> =>
      Promise.resolve([]),
    updatePreset: (
      _type: PresetGroup,
      _preset: Preset<unknown>
    ): Promise<Preset<unknown>[]> => Promise.resolve([]),
    deletePreset: (_type: PresetGroup, _name: string): Promise<Preset<unknown>[]> =>
      Promise.resolve([]),
  }),

  platform: platformFlags as IPlatformFlags,
});

// *** PUBLIC INTEGRATION FACTORY FUNCTIONS ***

/** return selector for app holder */
export function useAppRootSelector() {
  return "daap-forcerefresh-root";
}

// *** PRIVATE INTEGRATION FACTORY FUNCTIONS ***

function useObjectStorageFactory() {
  return (() => ({ supportStorageObjects: false })) as any;
}

function useMyMediaHookFactory() { return require("@platform/hooks/my-medias-hook").useMyMediaHook; }
function useLibraryMediaHookFactory() { return require("@platform/hooks/library-media-hook").useLibraryMediaHook; }
function useProjectHookFactory() { return require("@platform/hooks/project-hook").useProjectHook; }
function useTemplateHookFactory() { return require("@platform/hooks/template-hook").useTemplateHook; }
function useSettingsHookFactory() { return require("@platform/hooks/settings-hook").useSettingsHook; }
function useDocumentsTypeHookFactory() { return require("@platform/hooks/document-type-hook").useDocumentsTypeHook; }

function useRemoteTemplateHookFactory() {
  return () => ({
    getRemoteTemplate: (_id: string): Promise<unknown> => Promise.resolve({}),
    getRemoteTemplates: (_from: number, _search: string): Promise<unknown> => Promise.resolve({}),
    uninstallRemoteTemplate: (_id: string): Promise<unknown> => Promise.resolve({}),
    installRemoteTemplate: (_req: unknown): Promise<string> => Promise.resolve(""),
    getInstalledRemoteTemplates: (): Promise<{ items: unknown[] }> => Promise.resolve({ items: [] }),
  });
}

function getMyUploadComponentFactory() {
  return require("@platform/components").MyUploadComponent;
}

function getFullscreenButtonComponentFactory() {
  return require("@platform/components").FullscreenButtonComponent;
}

function getAccountComponentFactory() {
  return require("@platform/components").AccountComponent;
}

function getCloseMonitorComponent() {
  return require("./integration/components/close-monitor/close-monitor").CloseMonitor;
}

function useAIHookFactory() { return require("@platform/hooks/ai-hook").useAIHook; }
function useExitHookFactory() { return require("@platform/hooks/exit-hook").useExitHook; }
function usePresetsHookFactory() {
  return require("./integration/hooks/presets-hook/use-presets-hook").usePresets;
}
function useExtensionsHookFactory() { return require("@platform/hooks/extensions-hook").useExtensionsHook; }
function useLicenseHookFactory() {
  return require("./integration/hooks/license-hook/use-license-hook").useLicenseHook;
}
function usePluginsHookFactory() { return require("@platform/hooks/plugins-hook").usePluginsHook; }
function getPlatformFlagsFactory(): IPlatformFlags { return require("@platform/platform-flags").platformFlags; }

function useDevelopmentHookFactory() {
  return require("./integration/hooks/development-hook/use-development-hook").useDevelopmentHook;
}

export const IntegrationContextProvider = (
  props: { children?: React.ReactNode }
) => {
  return (
    <IntegrationContext.Provider
      value={{
        useExitHook: useExitHookFactory(),
        useMyMediaHook: useMyMediaHookFactory(),
        useProjectHook: useProjectHookFactory(),
        useTemplateHook: useTemplateHookFactory(),
        useSettingsHook: useSettingsHookFactory(),
        useDocumentsTypeHook: useDocumentsTypeHookFactory(),
        usePresets: usePresetsHookFactory(),
        useObjectStorageHook: useObjectStorageFactory(),
        usePluginsHook: usePluginsHookFactory(),
        useExtensionsHook: useExtensionsHookFactory(),
        useDevelopmentHook: useDevelopmentHookFactory(),
        useLicenseHook: useLicenseHookFactory(),
        useRemoteTemplateHook: useRemoteTemplateHookFactory(),
        // components
        CloseMonitorComponent: getCloseMonitorComponent(),
        getMyUploadComponent: getMyUploadComponentFactory(),
        useAIHook: useAIHookFactory(),
        getFullscreenButtonComponent: getFullscreenButtonComponentFactory(),
        AccountComponent: getAccountComponentFactory(),
        useLibraryMediaHook: useLibraryMediaHookFactory(),
        platform: getPlatformFlagsFactory(),
      }}
    >
      {props.children}
    </IntegrationContext.Provider>
  );
};
