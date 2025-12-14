import axios from "axios";

export const useWPPublicTemplate = () => {
  const getPublicTemplate = (id: string, lang: string): Promise<any> => {
    return axios
      .get(
        `${
          import.meta.env.VITE_SAAS_API_URL
        }/api/v1/public/public-templates/${id}?language=${lang}`
      )
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    getPublicTemplate,
  };
};
