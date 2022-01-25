import { MediaDataInfo, ImageData } from "../../../utils/assets/types";
import { file2Base64 } from "../../../utils/doom-utils/video";
import { resizeFile } from "../../components/my-image-select/my-images-utils";

export const myImagesHook = () => {
  const upload = async (
    file: File,
    fileMetadata: MediaDataInfo
  ): Promise<{ status: "OK" | "ERROR"; errorMessage?: string }> => {
    const { ipcRenderer } = window.require("electron");

    const fileBase64 = await file2Base64(file);

    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke("myImagesUpload", JSON.stringify({ fileBase64, fileMetadata }))
        .then((result: any) => {
          console.log(result);
          resolve(result);
        });
    });

    /*
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
    });*/
  };

  const fetchImages = async (props: {
    from: number;
    tag?: string;
    search?: string;
    perPage?: number;
  }): Promise<ImageData[]> => {
    const { ipcRenderer } = window.require("electron");

    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke("myImagesFetchImages", JSON.stringify(props))
        .then((result: any) => {
          console.log(result);
          resolve(result);
        });
    });
  };

  return { upload, fetchImages };
};
