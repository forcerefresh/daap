import axios from "axios";

export const useTemplateKeywords = () => {
  const templateKeywords = (props: {
    aiPromptId: string;
  }): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/generator/template-keywords`, props)
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    templateKeywords,
  };
};
