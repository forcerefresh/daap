import axios from "axios";
import { isEmpty } from "lodash-es";

export const usePublicTemplateSearch = () => {
  const searchPublicTemplate = (
    from: number,
    search: string,
    language = "en",
    documentType: string,
    perPage = 10,
  ): Promise<any> => {
    return axios
      .get(
        `${import.meta.env.VITE_SAAS_API_URL}/public/public-templates-search`,
        {
          params: {
            page: from,
            limit: perPage,
            language: language,
            documentType: documentType,
            ...(!isEmpty(search) ? { search } : {}),
          },
        },
      )
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    searchPublicTemplate,
  };
};
