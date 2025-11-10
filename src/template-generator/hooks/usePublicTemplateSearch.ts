import axios from "axios";
import { isEmpty } from "lodash-es";

export const usePublicTemplateSearch = () => {
  const searchPublicTemplate = (
    from: number,
    search: string,
    perPage = 10
  ): Promise<any> => {
    return axios
      .get(`/api/v1/public-templates-search`, {
        params: {
          page: from,
          limit: perPage,
          ...(!isEmpty(search) ? { search } : {}),
        },
      })
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    searchPublicTemplate,
  };
};
