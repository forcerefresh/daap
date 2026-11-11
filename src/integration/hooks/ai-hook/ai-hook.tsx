import axios from "axios";
import { IAIHook } from "../../../integration/core/i-hooks";
import { logger } from "webslider-sdk/lib/utils/logger/logger";

export const useAIHook = (): IAIHook => {
  const textQuery = (props: {
    query: string;
    template: string;
  }): Promise<{ output?: string; error?: string }> => {
    return axios
      .post(`/api/v1/ai`, props)
      .then((response) => response.data)
      .catch((err) => logger.app.warn("useAIHook: textQuery failed", err));
  };

  return {
    textQuery,
  };
};
