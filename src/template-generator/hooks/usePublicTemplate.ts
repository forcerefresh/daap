import axios from "axios";

export const usePublicTemplate = () => {
  const addPublicTemplate = (props: {
    // industryStr: string;
    // documentTypeStr: string;
    promptStr: string;
    industryId: string;
    documentTypeId: string;
    aiPromptId: string;
    previewImageBase64: string;
    language: string;
    previewUid?: string; //. only used when adding translation image
    template: string;
  }): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/public-templates-private`, props)
      .then((response) => response.data)
      .catch(console.log);
  };

  const getPublicTemplate = (id: string, lang: string): Promise<any> => {
    return axios
      .get(
        `${
          import.meta.env.VITE_SAAS_API_URL
        }/api/v1/public-templates/${id}?language=${lang}`
      )
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    getPublicTemplate,
    addPublicTemplate,
  };
};
