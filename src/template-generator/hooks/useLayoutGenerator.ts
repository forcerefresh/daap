import axios from "axios";

export const useLayoutGenerator = () => {
  const generateLayout = (props: {
    project: string;
  }): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/layout-generator`, props)
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    generateLayout,
  };
};
