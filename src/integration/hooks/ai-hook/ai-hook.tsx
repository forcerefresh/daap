import axios from "axios";

export const useAIHook = () => {
  const textQuery = (props: {
    query: string;
    template: string;
  }): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/ai`, props)
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    textQuery,
  };
};
