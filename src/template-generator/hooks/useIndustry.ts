import axios from "axios";
import { IndustryWithChildren } from "../types/industry";

export const useIndustry = () => {
  const getIndustryTree = (): Promise<{
    industries: IndustryWithChildren[];
  }> => {
    return axios
      .get(`/api/v1/generator/industry-tree`)
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    getIndustryTree,
  };
};
