// *** this file contains implementation for development

export const useMediaHook = () => {
  const requestMedia = (type: "image" | "video"): Promise<{ url: string }> => {
    if (type !== "image" && type !== "video") {
      throw new Error("Media type is not valid");
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ url: "/images/wall1.webp" });
      }, 1);
    });
  };
  return { requestMedia };
};
