import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import {
  GetAssetsUrlFuncReturnType,
  GetFontsFuncReturnType,
} from "webslider-sdk/lib/objects/objects-register";
import axios from "axios";
import { isEmpty } from "lodash-es";
import { IPlayerData } from "../../export/i-export-html";
import { IStore } from "../../store/store";

export interface LayoutSetsWithLayoutsType {
  id: string;
  name: string;
  description: string | null;
  layoutCount: number;
  createdAt: Date;
  updatedAt: Date;
  layouts: {
    id: string;
    name: string;
    description: string;
    creationType: string;
    slides: number;
    created: Date;
    modified: Date;
    project: string;
    preview: string;
    fonts: string;
    userUid: string | null;
    layoutSetId: string | null;
  }[];
}

export const useGeneratorHook = () => {
  const getLayoutSetsWithLayouts = (filters?: {
    documentTypeId?: string;
  }): Promise<LayoutSetsWithLayoutsType[]> => {
    return axios
      .get(`/api/v1/generator/layout-set-with-layouts`, { params: filters })
      .then((response) => response.data);
  };

  return {
    getLayoutSetsWithLayouts,
  };
};
