import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import {
  GetAssetsUrlFuncReturnType,
  GetFontsFuncReturnType,
} from "webslider-sdk/lib/objects/objects-register";
import axios from "axios";
import { isEmpty } from "lodash-es";
import { IPlayerData } from "../../export/i-export-html";
import { IStore } from "../../store/store";
import { LayoutReviewStatus } from "../../template-generator/types/layout";

export const useLayoutHook = () => {
  const patchLayout = (
    id: string,
    payload: { reviewState: LayoutReviewStatus },
  ): Promise<any> => {
    return axios
      .patch(`/api/v1/layouts/${id}`, payload)
      .then((response) => response.data);
  };

  const getLayout = (id: string): Promise<any> => {
    return axios.get(`/api/v1/layouts/${id}`).then((response) => response.data);
  };

  const getLayouts = (
    from: number,
    search: string,
    perPage = 10,
  ): Promise<any> => {
    return axios
      .get(`/api/v1/layouts`, {
        params: {
          page: from,
          limit: perPage,
          ...(!isEmpty(search) ? { search } : {}),
        },
      })
      .then((response) => response.data);
  };

  const saveLayout = async ({
    id,
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
    parentId,
  }: {
    id: string;
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
    documentTypeId?: string;
    slides: number;
    created: string;
    modified: string;
    saveRevision: number;
  }> => {
    const json = {
      id,
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
      parentId,
    };

    const response = await axios.post(`/api/v1/layouts`, json);

    return response.data.data;
  };

  const updateLayout = async (
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
        html: string;
      };
      playerData: IPlayerData;
      assetsUrls: GetAssetsUrlFuncReturnType;
      fonts: GetFontsFuncReturnType;
      extensions: IExtensionItem[];
    },
  ): Promise<{
    id: string;
    name: string;
    description: string;
    documentTypeId?: string;
    slides: number;
    created: string;
    modified: string;
    saveRevision: number;
  }> => {
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

    const response = await axios.put(`/api/v1/layouts/${id}`, json);
    return response.data.data;
  };

  const deleteLayout = async (id: string): Promise<{ id: string }> => {
    await axios.delete(`/api/v1/layouts/${id}`);
    return { id };
  };

  return {
    getLayout,
    getLayouts,
    saveLayout,
    updateLayout,
    deleteLayout,
    patchLayout,
  };
};
