import axios from "axios";
import { isEmpty } from "lodash-es";

export const usePublicTemplateSearch = () => {
  const searchPublicTemplate = (
    from: number,
    search: string,
    perPage = 10
  ): Promise<any> => {
    return axios
      .get(
        `${
          import.meta.env.VITE_SAAS_API_URL
        }/api/v1/public/public-templates-search`,
        {
          params: {
            page: from,
            limit: perPage,
            ...(!isEmpty(search) ? { search } : {}),
          },
        }
      )
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    searchPublicTemplate,
  };
};
