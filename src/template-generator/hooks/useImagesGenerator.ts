import axios from "axios";

export const useImagesGenerator = () => {
  // const generateImages = (
  //   props: {
  //     type: "image";
  //     width: string;
  //     height: string;
  //     objectId: string;
  //     prompt: string;
  //   }[]
  // ): Promise<{ data?: { objectId?: string; mediaId: string }[] }> => {
  //   return axios
  //     .post(`/api/v1/image-generator`, props)
  //     .then((response) => response.data)
  //     .catch(console.log);
  // };

  // const generateImagesPrompt = (
  //   id: string,
  //   props: {
  //     type: "image";
  //     width: string;
  //     height: string;
  //     objectId: string;
  //     prompt: string;
  //   }[]
  // ): Promise<{ data?: { objectId?: string; mediaId: string }[] }> => {
  //   return axios
  //     .post(`/api/v1/image-generator-prompt`, { id, jsonPrompts: props })
  //     .then((response) => response.data)
  //     .catch(console.log);
  // };

  return {
    // generateImages,
    // generateImagesPrompt,
  };
};
