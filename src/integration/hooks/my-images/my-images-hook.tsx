// *** this file contains implementation for development

import { ImageDataInfo, ImageData } from "../../../utils/assets/types";
import { resizeFile } from "../../components/my-image-select/my-images-utils";

export const myImagesHook = () => {
  const upload = (
    file: File,
    fileMetadata: ImageDataInfo
  ): Promise<{ status: "OK" | "ERROR"; errorMessage?: string }> => {
    console.log(fileMetadata);
    return new Promise(async (resolve) => {
      const thumbFile = await resizeFile(file, 80, 80, 70);
      const smallFile = await resizeFile(file, 120, 120, 70);
      const mediumFile = await resizeFile(file, 200, 200, 70);

      const myImages: any[] = JSON.parse(
        localStorage.getItem(`my-images`) || "[]"
      );

      const item: ImageData = {
        ...fileMetadata,
        images: {
          original: {
            url: thumbFile as string,
            size: { width: 80, height: 80, type: "jpg" },
          },
          small: {
            url: smallFile as string,
            size: { width: 120, height: 120, type: "jpg" },
          },
          medium: {
            url: mediumFile as string,
            size: { width: 200, height: 200, type: "jpg" },
          },
        },
      };

      myImages.unshift(item);

      localStorage.setItem(`my-images`, JSON.stringify(myImages));

      console.log(thumbFile);
      setTimeout(() => {
        resolve({ status: "OK" });
      }, 1);
    });
  };

  const fetchImages = async (props: {
    from: number;
    tag?: string;
    search?: string;
    perPage?: number;
  }): Promise<ImageData[]> => {
    const { from, tag, search, perPage = 10 } = props;

    let myImages: ImageData[] = JSON.parse(
      localStorage.getItem(`my-images`) || "[]"
    );

    console.log(tag);
    if (tag) {
      myImages = myImages.filter(
        (image) => image.tags && image.tags.indexOf(tag) !== -1
      );
    }

    if (search) {
      myImages = myImages.filter((image) => image.title.indexOf(search) !== -1);
    }

    console.log(myImages.length);
    console.log(props);
    const retArr = myImages.splice(from, from + perPage);

    return { photos: retArr } as any; //ImageSetData[];
  };

  return { upload, fetchImages };
};
