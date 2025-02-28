import React from "react";
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
  const getTemplate = (id: string): Promise<any> => {
    return axios
      .get(`${daapForcerefreshSettings.root}daap/v1/templates/${id}`, {
        headers: {
          "X-WP-Nonce": daapForcerefreshSettings.nonce,
        },
      })
      .then((response) => response.data);
  };

  const getTemplates = (
    from: number,
    search: string,
    perPage = 10
  ): Promise<any> => {
    return axios
      .get(`${daapForcerefreshSettings.root}daap/v1/templates`, {
        params: {
          page: from,
          limit: perPage,
          ...(!isEmpty(search) ? { search } : {}),
        },
        headers: {
          "X-WP-Nonce": daapForcerefreshSettings.nonce,
        },
      })
      .then((response) => response.data);
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

    const response = await axios.post(
      `${daapForcerefreshSettings.root}daap/v1/templates`,
      json,
      {
        headers: {
          "X-WP-Nonce": daapForcerefreshSettings.nonce,
        },
      }
    );

    return response.data.data;
  };

  const deleteTemplate = async (id: string): Promise<{ id: string }> => {
    await axios.delete(
      `${daapForcerefreshSettings.root}daap/v1/templates/${id}`,
      {
        headers: {
          "X-WP-Nonce": daapForcerefreshSettings.nonce,
        },
      }
    );
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
    getTemplate,
    getTemplates,
    saveTemplate,
    deleteTemplate,
  };
};
