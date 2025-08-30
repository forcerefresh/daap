import axios from "axios";

export const useImagesGenerator = () => {
  const generateImages = (
    props: {
      type: "image";
      objectId: string;
      prompt: string;
    }[]
  ): Promise<{ data?: { objectId?: string; mediaId: string }[] }> => {
    return axios
      .post(`/api/v1/image-generator`, props)
      .then((response) => response.data)
      .catch(console.log);
  };

  const generateVectors = (
    props: {
      type: "vector";
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
    generateImages,
    generateVectors,
  };
};
