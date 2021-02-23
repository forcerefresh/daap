// *** this file contains implementation for development

export const useMediaHook = () => {
  const requestMedia = (
    type: "image" | "video"
  ): Promise<{ url: string; width: number; height: number }> => {
    if (type !== "image" && type !== "video") {
      throw new Error("Media type is not valid");
    }

    return new Promise((resolve) => {
      const image = document.createElement("img");
      image.onload = () => {
        resolve({
          url: "/images/wall1.webp",
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      };
      image.src = "/images/wall1.webp";
    });
  };
  return { requestMedia };
};
