import axios from "axios";

export interface Industry {
  id: string;
  parentId: string;
  level: string;
  name: string;
  children: Industry[];
}

export const useIndustry = () => {
  const getIndustryTree = (): Promise<{ industries: Industry[] }> => {
    return axios
      .get(`/api/v1/industry-tree`)
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    getIndustryTree,
  };
};
