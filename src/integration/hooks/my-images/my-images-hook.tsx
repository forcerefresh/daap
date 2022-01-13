// *** this file contains implementation for development

import { resizeFile } from "../../components/my-image-select/my-images-utils";
import { ImageSetData, ImageSetDataMetadata } from "./my-images-common";

export const myImagesHook = () => {
  const upload = (
    file: File,
    fileMetadata: ImageSetDataMetadata
  ): Promise<{ status: "OK" | "ERROR"; errorMessage?: string }> => {
    return new Promise(async (resolve) => {
      const thumbFile = await resizeFile(file);

      const myImages: any[] = JSON.parse(
        localStorage.getItem(`my-images`) || "[]"
      );

      const item: ImageSetData = {
        ...fileMetadata,
        images: {
          original: {
            url: thumbFile as string,
            size: { width: 100, height: 100, type: "jpg" },
          },
          small: {
            url: thumbFile as string,
            size: { width: 100, height: 100, type: "jpg" },
          },
          medium: {
            url: thumbFile as string,
            size: { width: 100, height: 100, type: "jpg" },
          },
        },
      };

      myImages.unshift(item);

      localStorage.setItem(`my-images`, JSON.stringify(myImages));

      console.log(thumbFile);
      setTimeout(() => {
        resolve({ status: "OK" });
      }, 2000);
    });
  };

  const fetchImages = async (props: {
    page: number;
    tag?: string;
    category?: string;
    search?: string;
  }): Promise<ImageSetData[]> => {
    const myImages: any[] = JSON.parse(
      localStorage.getItem(`my-images`) || "[]"
    );
    return { photos: myImages } as any; //ImageSetData[];
  };

  return { upload, fetchImages };
};
