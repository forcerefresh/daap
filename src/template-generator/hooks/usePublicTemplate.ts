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

  const updatePublicTemplate = async (
    id: string,
    {
      isPublic,
    }: {
      isPublic: boolean;
    },
  ): Promise<{
    id: string;
  }> => {
    const json = {
      isPublic,
    };

    const response = await axios.put(
      `/api/v1/public-templates-private/${id}`,
      json,
    );
    return response.data.data;
  };

  const getPublicTemplate = (id: string, lang: string): Promise<any> => {
    return axios
      .get(
        `${
          import.meta.env.VITE_SAAS_API_URL
        }/public-templates/${id}?language=${lang}`,
      )
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    getPublicTemplate,
    addPublicTemplate,
    updatePublicTemplate,
  };
};
