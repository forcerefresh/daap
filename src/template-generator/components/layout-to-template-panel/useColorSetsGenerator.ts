import axios from "axios";

export const useColorSetsGenerator = () => {
  const generateColorSets = (props: {
    whatToCreate: string;
    layout: string;
  }): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/color-sets-generator`, props)
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    generateColorSets,
  };
};
