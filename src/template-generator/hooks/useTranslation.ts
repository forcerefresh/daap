import axios from "axios";

export const useTemplateTranslate = () => {
  const translateTemplates = (props: {
    aiPromptIds: string[];
  }): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/generator/template-translation`, props)
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    translateTemplates,
  };
};
