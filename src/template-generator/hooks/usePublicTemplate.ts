import axios from "axios";

export const usePublicTemplate = () => {
  const addPublicTemplate = (props: {
    industryStr: string;
    documentTypeStr: string;
    promptStr: string;
    industryId: string;
    documentTypeId: string;
    aiPromptId: string;
    previewImageBase64: string;
  }): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/public-templates`, props)
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    addPublicTemplate,
  };
};
