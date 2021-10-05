// *** this file contains implementation for development

export const useAssetsHook = () => {
  const addExternalMedia = (
    url: string
  ): Promise<{ originalUrl: string; localUrl: string; mediaName: string }> => {
    return new Promise((resolve) => {
      resolve({ originalUrl: url, localUrl: url, mediaName: url });
    });
  };

  return { addExternalMedia };
};
