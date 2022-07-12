import {
  MediaDataInfo,
  ImageData,
  MediaType,
} from "../../../webslider-sdk/src/common/i-media-types";
import {
  blobToBase64,
  file2Base64,
  getImageFromFile,
} from "../../../utils/doom-utils/video";
import { resizeFile } from "../../components/my-image-select/my-images-utils";

export const useMyMediaHook = () => {
  const upload = async (
    type: MediaType,
    file: File,
    fileMetadata: MediaDataInfo
  ): Promise<{ status: "OK" | "ERROR"; errorMessage?: string }> => {
    const { ipcRenderer } = window.require("electron");

    // NOTE: Get thumbnail, only for video
    const { blob, videoItem: previewImageItem } = await getImageFromFile(file);
    const previewImageBase64 = await resizeFile(blob!, 10000, 10000, 70, "jpg");

    //const previewImageBase64 = await blobToBase64(blob!);

    // base64
    const fileBase64 = await file2Base64(file);

    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke(
          "myMediaUpload",
          JSON.stringify({
            fileBase64,
            fileMetadata,
            type,
            previewImageBase64: "data:image/jpg;base64," + previewImageBase64,
            previewImageItem,
          })
        )
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
    type: MediaType;
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
