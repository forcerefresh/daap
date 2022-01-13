// *** implementation for Electoron
// *** this file contains implementation for development

export const myImagesHook = () => {
  const upload = (
    file: File
  ): Promise<{ status: "OK" | "ERROR"; errorMessage?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: "OK" });
      }, 2000);
    });
  };

  return { upload };
};
