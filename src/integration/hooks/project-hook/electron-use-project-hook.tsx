import { IPlayerData } from "../../../export/i-export-html";
import { IStore } from "../../../store/store";
import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import { GetAssetsUrlFuncReturnType } from "webslider-sdk/lib/objects/objects-register";

export const useProjectHook = () => {
  const getNextProjectId = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer.invoke("Projects::GetNextProjectId").then((result: any) => {
        resolve(result);
      });
    });
  };

  const getProject = (id: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      const json = {
        id,
      };

      ipcRenderer
        .invoke("Projects::GetProject", JSON.stringify(json))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const getProjects = (
    from: number,
    search: string,
    perPage = 10
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      const json = {
        from,
        search,
        perPage,
      };

      ipcRenderer
        .invoke("Projects::GetProjects", JSON.stringify(json))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const saveProject = ({
    id,
    name,
    description,
    slides,
    project,
    preview,
    playerData,
    assetsUrls,
    extensions,
  }: {
    id?: number;
    name: string;
    description?: string;
    slides?: number;
    created?: string;
    modified?: string;
    project: Omit<IStore["project"], "diff">;
    preview: {
      width: number;
      height: number;
      scale: number;
      html: string;
    };
    playerData: IPlayerData;
    assetsUrls: GetAssetsUrlFuncReturnType;
    extensions: IExtensionItem[];
  }): Promise<{
    id: number;
    name: string;
    description: string;
    slides: number;
    created: string;
    modified: string;
    saveRevision: number;
  }> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      const json = {
        id,
        name,
        description,
        slides,
        project,
        preview,
        playerData,
        assetsUrls,
        extensions,
      };

      ipcRenderer
        .invoke("Projects::SaveProject", JSON.stringify(json))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const deleteProject = (id: number): Promise<{ id: number }> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      const json = {
        id,
      };

      ipcRenderer
        .invoke("Projects::DeleteProject", JSON.stringify(json))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  return {
    getProject,
    getProjects,
    saveProject,
    deleteProject,
    getNextProjectId,
  };
};
