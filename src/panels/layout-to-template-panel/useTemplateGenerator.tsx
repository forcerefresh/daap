import axios from "axios";

export const useTemplateGenerator = () => {
  const generateTemplate = (props: {
    whatToCreate: string;
    layout: string;
  }): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/template-generator`, props)
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    generateTemplate,
  };
};
