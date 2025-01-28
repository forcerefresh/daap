import { IPlayerData } from "../../../export/i-export-html";
import { IStore } from "../../../store/store";
import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import {
  GetAssetsUrlFuncReturnType,
  GetFontsFuncReturnType,
} from "webslider-sdk/lib/objects/objects-register";
import axios from "axios";
import { isEmpty } from "lodash-es";

export const useTemplateHook = () => {
  // const getNextProjectId = (): Promise<number> => {
  //   return new Promise((resolve, reject) => {
  //     const { ipcRenderer } = window.require("electron");

  //     ipcRenderer.invoke("Projects::GetNextProjectId").then((result: any) => {
  //       resolve(result);
  //     });
  //   });
  // };

  const getTemplate = (id: string): Promise<any> => {
    return axios
      .get(`/api/v1/templates/${id}`)
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

  const getTemplates = (
    from: number,
    search: string,
    perPage = 10
  ): Promise<any> => {
    return axios
      .get(`/api/v1/templates`, {
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

  const saveTemplate = async ({
    name,
    description,
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
    fonts: GetFontsFuncReturnType;
    extensions: IExtensionItem[];
  }): Promise<{
    id: string;
    name: string;
    description: string;
    slides: number;
    created: string;
    modified: string;
    saveRevision: number;
  }> => {
    const json = {
      name,
      description,
      slides,
      project,
      preview,
      playerData,
      assetsUrls,
      fonts,
      extensions,
    };

    const response = await axios.post(`/api/v1/templates`, json);

    return response.data.data;
  };

  // const updateTemplate = async (
  //   id: string,
  //   {
  //     name,
  //     description,
  //     slides,
  //     project,
  //     preview,
  //     playerData,
  //     assetsUrls,
  //     fonts,
  //     extensions,
  //   }: {
  //     name: string;
  //     description?: string;
  //     slides?: number;
  //     created?: string;
  //     modified?: string;
  //     project: Omit<IStore["project"], "diff">;
  //     preview: {
  //       width: number;
  //       height: number;
  //       scale: number;
  //       html: string;
  //     };
  //     playerData: IPlayerData;
  //     assetsUrls: GetAssetsUrlFuncReturnType;
  //     fonts: GetFontsFuncReturnType;
  //     extensions: IExtensionItem[];
  //   }
  // ): Promise<{
  //   id: string;
  //   name: string;
  //   description: string;
  //   slides: number;
  //   created: string;
  //   modified: string;
  //   saveRevision: number;
  // }> => {
  //   const json = {
  //     name,
  //     description,
  //     slides,
  //     project,
  //     preview,
  //     playerData,
  //     assetsUrls,
  //     fonts,
  //     extensions,
  //   };

  //   const response = await axios.put(`/api/v1/templates/${id}`, json);
  //   return response.data.data;
  // };

  const deleteTemplate = async (id: string): Promise<{ id: string }> => {
    await axios.delete(`/api/v1/templates/${id}`);
    return { id };
  };

  return {
    getTemplate,
    getTemplates,
    saveTemplate,
    deleteTemplate,
  };
};
