import axios from "axios";

export const useVectorsGenerator = () => {
  const generateVectors = (
    props: {
      type: "vector";
      width: number;
      height: number;
      objectId: string;
      prompt: string;
    }[]
  ): Promise<{ data?: { objectId?: string; mediaId: string }[] }> => {
    return axios
      .post(`/api/v1/image-generator`, props)
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    generateVectors,
  };
};
