import axios from "axios";

export const useAIHook = () => {
  const textQuery = (props: {
    query: string;
    template: string;
  }): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`${daapForcerefreshSettings.root}daap/v1/ai`, props, {
        headers: {
          "X-WP-Nonce": daapForcerefreshSettings.nonce,
        },
      })
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    textQuery,
  };
};
