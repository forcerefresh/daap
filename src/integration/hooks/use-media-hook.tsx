// *** this file contains implementation for development

export const useMediaHook = () => {
  const requestMedia = (
    type: "image" | "video"
  ): Promise<{ url: string; width: number; height: number }> => {
    if (type !== "image" && type !== "video") {
      throw new Error("Media type is not valid");
    }

    if (type === "image") {
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
    } else {
      return new Promise((resolve) => {
        resolve({
          url: "/images/video1.mp4",
          width: 960,
          height: 540,
        });
      });
    }
  };
  return { requestMedia };
};
