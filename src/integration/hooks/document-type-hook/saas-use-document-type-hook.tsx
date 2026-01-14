import axios from "axios";

export const useDocumentsTypeHook = () => {
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
