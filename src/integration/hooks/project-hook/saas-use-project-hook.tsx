import { IPlayerData } from "../../../export/i-export-html";
import { IStore } from "../../../store/store";
import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import {
  GetAssetsUrlFuncReturnType,
  GetFontsFuncReturnType,
} from "webslider-sdk/lib/objects/objects-register";
import axios from "axios";
import { isEmpty } from "lodash-es";
import type { components } from "../../../types/api";

type Project = components["schemas"]["Project"];
type Pagination = components["schemas"]["Pagination"];

export const useProjectHook = () => {
  // const getNextProjectId = (): Promise<number> => {
  //   return new Promise((resolve, reject) => {
  //     const { ipcRenderer } = window.require("electron");

  //     ipcRenderer.invoke("Projects::GetNextProjectId").then((result: any) => {
  //       resolve(result);
  //     });
  //   });
  // };

  const getProject = (id: string): Promise<Project> => {
    return axios
      .get(`/api/v1/projects/${id}`)
      .then((response) => response.data);

    // return new Promise((resolve, reject) => {
    //   const { ipcRenderer } = window.require("electron");

    //   const json = {
    //     id,
    //   };

    //   ipcRenderer
    //     .invoke("Projects::GetProject", JSON.stringify(json))
    //     .then((result: any) => {
    //       resolve(result);
    //     });
    // });
  };

  const getProjects = (
    from: number,
    search: string,
    perPage = 10
  ): Promise<{ data: Project[]; pagination: Pagination }> => {
    return axios
      .get(`/api/v1/projects`, {
        params: {
          page: from,
          limit: perPage,
          ...(!isEmpty(search) ? { search } : {}),
        },
      })
      .then((response) => response.data);

    // return new Promise((resolve, reject) => {
    //   const { ipcRenderer } = window.require("electron");

    //   const json = {
    //     from,
    //     search,
    //     perPage,
    //   };

    //   ipcRenderer
    //     .invoke("Projects::GetProjects", JSON.stringify(json))
    //     .then((result: any) => {
    //       resolve(result);
    //     });
    // });
  };

  const createProject = async ({
    name,
    description,
    documentTypeId,
    slides,
    project,
    preview,
    playerData,
    assetsUrls,
    fonts,
    extensions,
  }: {
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
      base64: string;
    };
    playerData: IPlayerData;
    assetsUrls: GetAssetsUrlFuncReturnType;
    fonts: GetFontsFuncReturnType;
    extensions: IExtensionItem[];
  }): Promise<Project> => {
    const json = {
      name,
      description,
      documentTypeId,
      slides,
      project,
      preview,
      playerData,
      assetsUrls,
      fonts,
      extensions,
    };

    const response = await axios.post(`/api/v1/projects`, json);

    return response.data.data;
  };

  const updateProject = async (
    id: string,
    {
      name,
      description,
      documentTypeId,
      slides,
      project,
      preview,
      playerData,
      assetsUrls,
      fonts,
      extensions,
    }: {
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
        base64: string;
      };
      playerData: IPlayerData;
      assetsUrls: GetAssetsUrlFuncReturnType;
      fonts: GetFontsFuncReturnType;
      extensions: IExtensionItem[];
    }
  ): Promise<Project> => {
    const json = {
      name,
      description,
      documentTypeId,
      slides,
      project,
      preview,
      playerData,
      assetsUrls,
      fonts,
      extensions,
    };

    const response = await axios.put(`/api/v1/projects/${id}`, json);
    return response.data.data;
  };

  const deleteProject = async (id: string): Promise<{ id: string }> => {
    await axios.delete(`/api/v1/projects/${id}`);
    return { id };

    // return new Promise((resolve, reject) => {
    //   const { ipcRenderer } = window.require("electron");

    //   const json = {
    //     id,
    //   };

    //   ipcRenderer
    //     .invoke("Projects::DeleteProject", JSON.stringify(json))
    //     .then((result: any) => {
    //       resolve(result);
    //     });
    // });
  };

  return {
    getProject,
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    //getNextProjectId,
  };
};
