import type { components } from "@daap/types/api";
import { IPlayerData } from "@daap/export/i-export-html";
import { IStore } from "@daap/store/store";
import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import {
  GetAssetsUrlFuncReturnType,
  GetFontsFuncReturnType,
} from "webslider-sdk/lib/objects/objects-register";
import { MediaDataInfo, MediaType } from "webslider-sdk/lib/common/i-media-types";
import { Preset, PresetGroup } from "@daap/utils/presets/i-presets";
import { DevelopmentItem } from "@daap/panels/development-panel/i-development-types";
import { getLicenseDetailsResponse } from "@daap/integration";

// ─── Re-export server types for convenience ──────────────────────────────────

export type Project = components["schemas"]["Project"];
export type Template = components["schemas"]["Template"];
export type Settings = components["schemas"]["Settings"];
export type Media = components["schemas"]["Media"];
export type Pagination = components["schemas"]["Pagination"];
export type SearchPagination = components["schemas"]["SearchPagination"];

// ─── Shared arg types ────────────────────────────────────────────────────────

export interface SaveProjectArgs {
  name: string;
  description?: string;
  documentTypeId?: string;
  slides?: number;
  created?: string;
  modified?: string;
  project: Omit<IStore["project"], "diff">;
  preview: {
    width: number;
    height: number;
    scale: number;
    base64?: string;
    html?: string;
  };
  playerData: IPlayerData;
  assetsUrls: GetAssetsUrlFuncReturnType;
  fonts: GetFontsFuncReturnType;
  extensions: IExtensionItem[];
}

export interface SaveTemplateArgs {
  name: string;
  description?: string;
  documentTypeId?: string;
  slides?: number;
  created?: string;
  project: Omit<IStore["project"], "diff">;
  preview: {
    width: number;
    height: number;
    scale: number;
    base64?: string;
    html?: string;
  };
  playerData: IPlayerData;
  assetsUrls: GetAssetsUrlFuncReturnType;
  fonts: GetFontsFuncReturnType;
  extensions: IExtensionItem[];
}

export interface IServerPlugin {
  id: string;
  type: string;
  version: string;
  name: string;
  description?: string;
  logoUrl?: string;
  scriptUrl: string;
  isBuiltIn?: boolean;
}

// ─── Hook interfaces ─────────────────────────────────────────────────────────

/** Called as a React hook on mount — sets up exit/unsaved-changes behavior. Returns nothing. */
export type IExitHook = () => void;

export interface IAIHook {
  textQuery(props: { query: string; template: string }): Promise<{ output?: string; error?: string }>;
}

export interface IProjectHook {
  getProject(id: string): Promise<Project>;
  getProjects(from: number, search: string, perPage?: number): Promise<{ data: Project[]; pagination: Pagination }>;
  createProject(args: SaveProjectArgs): Promise<Project>;
  updateProject(id: string, args: SaveProjectArgs): Promise<Project>;
  deleteProject(id: string): Promise<{ id: string }>;
}

export interface ITemplateHook {
  getTemplate(id: string): Promise<Template>;
  getTemplates(from: number, search: string, perPage?: number): Promise<{ data: Template[]; pagination: Pagination }>;
  saveTemplate(args: SaveTemplateArgs): Promise<Template>;
  deleteTemplate(id: string): Promise<{ id: string }>;
  downloadTemplate?(req: { id: string }): Promise<string>;
}

export interface ISettingsHook {
  getSettings(id?: string): Promise<Settings>;
  patchSettings(args: {
    textAISettings?: Record<string, unknown>;
    appSettings?: Record<string, unknown>;
    publishSettings?: Record<string, unknown>;
  }): Promise<void>;
  scaleUI(zoom: number): Promise<void>;
}

export interface IMyMediaHook {
  upload(
    type: MediaType,
    file: File,
    fileMetadata: MediaDataInfo,
  ): Promise<{ status: "OK" | "ERROR"; errorMessage?: string }>;
  /** WP-only: upload pre-encoded file directly to WP media library */
  uploadToWP?(
    filename: string,
    fileBase64: string,
  ): Promise<{ status: "OK" | "ERROR"; errorMessage?: string }>;
  fetchMedias(props: {
    type: MediaType;
    from: number;
    tags?: string[];
    search?: string;
    perPage?: number;
  }): Promise<{ data: Media[]; pagination: Pagination }>;
  deleteMedias(
    type: MediaType,
    ids: string[],
  ): Promise<{ response: { status: "SUCCESS" | "ERROR"; id: string }[] }>;
}

export interface ILibraryMediaHook {
  fetchLibraryMedias(props: {
    type: MediaType;
    from: number;
    tags?: string[];
    search?: string;
    perPage?: number;
  }): Promise<{ data: Media[]; pagination: Pagination }>;
  deleteLibraryMedias(
    type: MediaType,
    ids: string[],
  ): Promise<{ response: { status: "SUCCESS" | "ERROR"; id: string }[] }>;
}

export interface IExtensionsHook {
  getExtensions(
    from: number,
    search?: string,
    tags?: string[],
    missingExtensions?: string[],
    apiKey?: string,
  ): Promise<{ data: IExtensionItem[] }>;
  getInstalledExtensions(): Promise<{ data: IExtensionItem[] }>;
  installExtension(extension: IExtensionItem): Promise<IExtensionItem>;
  uninstallExtension(props: { type: string | number }): Promise<IExtensionItem>;
}

export interface IPluginsHook {
  loadPlugins(): Promise<void>;
  getAvailablePlugins(): Promise<IServerPlugin[]>;
  getInstalledPlugins(): Promise<IServerPlugin[]>;
  installPlugin(plugin: IServerPlugin): Promise<IServerPlugin>;
  uninstallPlugin(id: string): Promise<void>;
  uploadPlugin(fileBase64: string, filename: string, type: string, version: string): Promise<{ scriptUrl: string }>;
}

export interface IDocumentsTypeHook {
  getDocumentTypeTree(): Promise<{ documents: Record<string, unknown>[] }>;
}

export interface ILicenseHook {
  saveSerial(props: { serial: string; allowTransfer: boolean }): Promise<void>;
  getLicenseDetails(): Promise<getLicenseDetailsResponse>;
}

export interface IDevelopmentHook {
  getAll(): Promise<DevelopmentItem[]>;
  addDevelopmentItem(item: DevelopmentItem): Promise<void>;
  updateDevelopmentItem(item: Partial<DevelopmentItem>): Promise<void>;
  deleteDevelopmentItem(id: string): Promise<void>;
}

export interface IPresetsHook {
  getPresets(type: PresetGroup): Promise<Preset<unknown>[]>;
  addPreset(type: PresetGroup, preset: Preset<unknown>): Promise<Preset<unknown>[]>;
  updatePreset(type: PresetGroup, preset: Preset<unknown>): Promise<Preset<unknown>[]>;
  deletePreset(type: PresetGroup, uid: string): Promise<Preset<unknown>[]>;
}
