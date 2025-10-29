import axios from "axios";
import {
  AiProcessingStatus,
  AiPrompt,
  AiPromptKind,
} from "../types/ai-prompts";
import { useCallback } from "react";
import { Pagination } from "../../types/pagination";

// export type Pagination = {
//   currentPage: number;
//   isFirstPage: boolean;
//   isLastPage: boolean;
//   nextPage: number | null;
//   pageCount: number;
//   previousPage: number | null;
//   totalCount: number;
// };

export const useAiPrompt = () => {
  const getTemplateGeneratorPrompts = useCallback(
    (
      props: {
        processingStatus?: AiProcessingStatus;
        forUserUID?: string;
        perPage?: string;
        page?: string;
        limit?: string;
      } = {}
    ): Promise<{
      data: AiPrompt[];
      pagination: Pagination;
    }> => {
      return axios
        .get(`/api/v1/generator/template-generator-prompt`, {
          params: {
            ...props,
          },
        })
        .then((response) => response.data)
        .catch(console.log);
    },
    []
  );

  const updatePrompt = (id: string, prompt: Partial<AiPrompt>) => {
    return axios
      .patch(`/api/v1/generator/template-generator-prompt/${id}`, prompt)
      .then((response) => response.data)
      .catch(console.log);
  };

  const addTemplatePrompt = (props: {
    promptKind: AiPromptKind.TEMPLATE;
    documentTypeId: string;
    industryId: string;
    layoutId: string;
    simplifiedLayout: string;
    neutralColors: string; // "true" : "false",
    uncrowdedImages: string; // "true" : "false",
    noAnyWritingsInImages: string; // "true" : "false",
    noHandsInImages: string; // "true" : "false",
  }): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/generator/template-generator-prompt`, props)
      .then((response) => response.data)
      .catch(console.log);
  };

  const addColorSetPrompt = (props: {
    parentPromptId: string;
    promptKind: AiPromptKind.COLOR_PALETTE;
    documentTypeId: string;
    industryId: string;
    layoutId: string;
    simplifiedLayout: string;
  }): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/generator/template-generator-prompt`, props)
      .then((response) => response.data)
      .catch(console.log);
  };

  const addImagePrompt = (props: {
    parentPromptId: string;
    promptKind: AiPromptKind.IMAGE | AiPromptKind.VECTOR;
    documentTypeId: string;
    industryId: string;
    layoutId: string;
    simplifiedLayout: string;
    imagePrompt: string;
    vectorPrompt: string;
    metadata: Record<string, any>;
    neutralColors: string; // "true" : "false",
    uncrowdedImages: string; // "true" : "false",
    noAnyWritingsInImages: string; // "true" : "false",
    noHandsInImages: string; // "true" : "false",
  }): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/generator/template-generator-prompt`, props)
      .then((response) => response.data)
      .catch(console.log);
  };

  const addLayoutPrompt = (props: {
    parentPromptId: string;
    promptKind: AiPromptKind.LAYOUT;
    documentTypeId: string;
    industryId: string;
    layoutId: string;
    simplifiedLayout: string;
    aiTemplateWithSimplifiedLayout: string;
    neutralColors: string; // "true" : "false",
    uncrowdedImages: string; // "true" : "false",
    noAnyWritingsInImages: string; // "true" : "false",
    noHandsInImages: string; // "true" : "false",
  }): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/generator/template-generator-prompt`, props)
      .then((response) => response.data)
      .catch(console.log);
  };

  const generateTemplate = (
    iaPromptId: string
  ): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/generator/template-generator`, { id: iaPromptId })
      .then((response) => response.data)
      .catch(console.log);
  };

  const generateImageOrVector = (
    iaPromptId: string
  ): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/generator/image-generator`, {
        id: iaPromptId,
      })
      .then((response) => response.data)
      .catch(console.log);
  };

  const generateLayout = (
    iaPromptId: string
  ): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/generator/layout-generator`, {
        id: iaPromptId,
      })
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    generateTemplate,
    addTemplatePrompt,
    addColorSetPrompt,
    addImagePrompt,
    getTemplateGeneratorPrompts,
    generateImageOrVector,
    updatePrompt,
    addLayoutPrompt,
    generateLayout,
  };
};
