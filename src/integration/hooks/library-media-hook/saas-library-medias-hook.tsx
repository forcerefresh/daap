import { ImageData, MediaType } from "webslider-sdk/lib/common/i-media-types";

import axios from "axios";
import { isEmpty } from "lodash-es";
import { Pagination } from "../../../types/pagination";

export const useLibraryMediaHook = () => {
  const fetchLibraryMedias = async (props: {
    type: MediaType;
    from: number;
    tag?: string;
    search?: string;
    perPage?: number;
  }): Promise<{ pagination: Pagination; data: ImageData[] }> => {
    const { type, from, tag, search, perPage } = props;

    return axios
      .get(`/api/v1/library-medias/${type}`, {
        params: {
          page: from,
          limit: perPage,
          ...(!isEmpty(search) ? { search } : {}),
        },
      })
      .then((response) => response.data);
  };

  const deleteLibraryMedias = async (
    type: MediaType,
    ids: string[]
  ): Promise<{ response: { status: "SUCCESS" | "ERROR"; id: string }[] }> => {
    try {
      await axios.delete(`/api/v1/library-media/${ids[0]}`);

      return { response: [{ status: "SUCCESS", id: ids[0] }] };
    } catch (ex) {}

    return { response: [{ status: "ERROR", id: ids[0] }] };
  };

  return { fetchLibraryMedias, deleteLibraryMedias };
};
