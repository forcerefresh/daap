// *** this file contains implementation for development

export const useMediaHook = () => {
  const requestMedia = (type: "image" | "video"): Promise<{ url: string }> => {
    if (type !== "image" && type !== "video") {
      throw "Media type is not valid";
    }

    return Promise.resolve({ url: "logo192.png" });
  };
  return { requestMedia };
};
