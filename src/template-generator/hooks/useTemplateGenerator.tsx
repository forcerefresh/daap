import axios from "axios";
import { AiPrompt, AiPromptKind } from "../types/ai-prompts";
import { useCallback } from "react";

export const useAiPrompt = () => {
  const getTemplateGeneratorPrompts = useCallback(
    (
      props: {} = {}
    ): Promise<{
      prompts: AiPrompt[];
    }> => {
      return axios
        .get(`/api/v1/generator/template-generator-prompt`)
        .then((response) => response.data)
        .catch(console.log);
    },
    []
  );

  const addTemplatePrompt = (props: {
    promptKind: AiPromptKind.TEMPLATE;
    documentTypeId: string;
    industryId: string;
    layoutId: string;
    simplifiedLayout: string;
    neutralColors: string; // "true" : "false",
    uncrowdedImages: string; // "true" : "false",
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

  return {
    generateTemplate,
    addTemplatePrompt,
    addColorSetPrompt,
    addImagePrompt,
    getTemplateGeneratorPrompts,
    generateImageOrVector,
  };
};
