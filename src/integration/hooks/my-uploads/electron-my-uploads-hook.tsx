import {
  MediaDataInfo,
  ImageData,
  MediaType,
  VideoItem,
} from "../../../webslider-sdk/src/common/i-media-types";
import {
  blobToBase64,
  file2Base64,
  getImageFromFile,
} from "../../../utils/doom-utils/video";
import { resizeFile } from "../../components/my-image-select/my-images-utils";
import { logger } from "../../../webslider-sdk/src/utils/logger/logger";

export const useMyMediaHook = () => {
  const upload = async (
    type: MediaType,
    file: File,
    fileMetadata: MediaDataInfo
  ): Promise<{ status: "OK" | "ERROR"; errorMessage?: string }> => {
    logger.log(type, fileMetadata);

    const { ipcRenderer } = window.require("electron");

    let previewImageBase64: string | undefined;
    let previewImageItem: VideoItem | undefined;

    if (type === "image") {
    }

    if (type === "video") {
      const { blob, videoItem } = await getImageFromFile(file);
      previewImageItem = videoItem;
      previewImageBase64 =
        "data:image/jpg;base64," +
        (await resizeFile(blob!, 10000, 10000, 70, "jpg"));
    }

    // base64
    const fileBase64 = await file2Base64(file);

    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke(
          "MyUploads::Upload",
          JSON.stringify({
            fileBase64,
            fileMetadata,
            type,
            previewImageBase64,
            previewImageItem,
          })
        )
        .then((result: any) => {
          logger.log("resolve!!!!");
          resolve(result);
        });
    });

    /*
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
        .invoke("MyUploads::Fetch", JSON.stringify(props))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  const deleteImages = async (
    type: MediaType,
    ids: string[]
  ): Promise<{ deletedIds: string[] }> => {
    const { ipcRenderer } = window.require("electron");

    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke("MyUploads::Delete", JSON.stringify({ type, ids }))
        .then((result: any) => {
          resolve(result);
        });
    });
  };

  return { upload, fetchImages, deleteImages };
};
