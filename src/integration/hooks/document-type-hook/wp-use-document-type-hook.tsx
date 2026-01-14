import documents from "./data.json";

export const useDocumentsTypeHook = () => {
  const getDocumentTypeTree = (): Promise<{ documents: Document[] }> => {
    return new Promise((resolve) => {
      return resolve({ documents } as unknown as { documents: Document[] });
    });
  };

  return {
    getDocumentTypeTree,
  };
};
