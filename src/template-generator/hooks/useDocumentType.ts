import axios from "axios";

export interface Document {
  id: string;
  parentId: string;
  level: string;
  name: string;
  children: Document[];
}

export const useDocumentsType = () => {
  const getDocumentTypeTree = (): Promise<{ documents: Document[] }> => {
    return axios
      .get(`/api/v1/generator/documents-type-tree`)
      .then((response) => response.data)
      .catch(console.log);
  };

  return {
    getDocumentTypeTree,
  };
};
