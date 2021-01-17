// *** this file contains implementation for development

export const useMediaHook = () => {
  const requestMedia = (type: "image" | "video"): Promise<{ url: string }> => {
    if (type !== "image" && type !== "video") {
      throw new Error("Media type is not valid");
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ url: "logo192.png" });
      }, 1);
    });
  };
  return { requestMedia };
};
