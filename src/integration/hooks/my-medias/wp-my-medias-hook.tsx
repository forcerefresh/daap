import {
  MediaDataInfo,
  ImageData,
  MediaType,
  VideoItem,
  SaaSMediaData,
} from "webslider-sdk/lib/common/i-media-types";
import {
  blobToBase64,
  file2Base64,
  getImageVideoFromFile,
  textFile2Text,
} from "../../../utils/doom-utils/video";
import { resizeFile } from "../../components/my-image-select/my-images-utils";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import axios from "axios";
import { isEmpty } from "lodash-es";
import { Pagination } from "../../../types/pagination";
import { addStyle } from "../../../utils/doom-utils/css-utils";
import { createFontPreviewImage } from "../../../utils/doom-utils/font-utils";
import { delayPromise } from "../../../utils/common/delay-utils";

export const useMyMediaHook = () => {
  const uploadToWP = async (
    filename: string,
    fileBase64: string ///File
  ): Promise<{ status: "OK" | "ERROR"; errorMessage?: string }> => {
    const json = {
      fileBase64, //: file2Base64(file),
      filename: filename,
    };

    const response = await axios.post(
      `${daapForcerefreshSettings.root}daap/v1/medias/image/wp-media`,
      json,
      {
        headers: {
          "X-WP-Nonce": daapForcerefreshSettings.nonce,
        },
      }
    );

    return response.data;
  };

  const upload = async (
    type: MediaType,
    file: File,
    fileMetadata: MediaDataInfo
  ): Promise<{ status: "OK" | "ERROR"; errorMessage?: string }> => {
    logger.app.log(type, fileMetadata);

    // let previewImageBase64: string | undefined;
    // let previewImageItem: VideoItem | undefined;

    // if (type === "video") {
    //   const { blob, videoItem } = await getImageFromFile(file);
    //   previewImageItem = videoItem;
    //   previewImageBase64 =
    //     "data:image/jpg;base64," +
    //     (await resizeFile(blob!, 10000, 10000, 70, "jpg"));
    // }

    let fileBase64: string = "";

    let previewImageBase64: string | undefined;

    let videoSize: { width: number; height: number } | undefined = undefined;

    if (type === "image") {
      fileBase64 = await file2Base64(file);
    } else if (type === "font") {
      fileBase64 = await file2Base64(file);
    } else if (type === "video") {
      fileBase64 = await file2Base64(file);
      const { blob, size } = await getImageVideoFromFile(file);
      const blobBase64 = await blobToBase64(blob!);
      console.log(blobBase64);

      videoSize = size;
      previewImageBase64 = "data:image/jpeg;base64," + blobBase64;
      //"data:image/jpeg;base64," + (await resizeFile(blob!, 10000, 10000, 75));
    } else if (type === "vector") {
      videoSize = { width: 100, height: 100 };
      let svgString = await textFile2Text(file);

      console.log(svgString);
      console.log(fileMetadata);

      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, "text/html");

      const viewBox = doc.querySelector("svg")?.getAttribute("viewBox");
      console.log(viewBox);
      if (viewBox) {
        const rect = viewBox.split(" ");
        videoSize = { width: parseInt(rect[2]), height: parseInt(rect[3]) };
      }

      // if (fileMetadata.doNotPreserveAspectRatio) {
      //   svgString = svgString.replace(
      //     "<svg ",
      //     '<svg preserveAspectRatio="none" '
      //   );
      // }
      fileBase64 = btoa(svgString);
    }

    console.log({
      // fileBase64,
      fileMetadata,
      type,
      // previewImageBase64,
      // previewImageItem,
    });

    const json = {
      previewImageBase64,
      fileBase64,
      name: fileMetadata.name,
      description: fileMetadata.description,
      tags: fileMetadata.tags,
      filename: fileMetadata.filename,
      size: videoSize,
    };

    let response: any;
    try {
      response = await axios.post(
        `${daapForcerefreshSettings.root}daap/v1/medias/${type}`,
        json,
        {
          headers: {
            "X-WP-Nonce": daapForcerefreshSettings.nonce,
          },
        }
      );
    } catch (ex: any) {
      return { status: "ERROR", errorMessage: ex?.response?.data?.message };
    }

    console.log(response);

    if (type === "font") {
      const mediaSizes = JSON.parse(response.data.data.addedMedia.mediaSizes);
      const fontFilename = mediaSizes.find(
        (item: any) => item.sizeType === "original"
      ).sourceFilename;
      const fontUrl = `${daapForcerefreshSettings.baseMediaUrl}/${fontFilename}`;

      addStyle(`
        @font-face{
          font-family: "${response.data.data.addedMedia.name}";
          src: url("${fontUrl}");
        }
      `);

      await delayPromise(300);
      await delayPromise(300);
      await delayPromise(300);
      await delayPromise(300);
      await delayPromise(300);

      const imageBlob = await createFontPreviewImage({
        url: fontUrl,
        name: response.data.data.addedMedia.name,
        type: response.data.data.addedMedia.format,
      });

      if (imageBlob) {
        const previewImageBase64 = await blobToBase64(imageBlob);
        const previevJson = { previewImageBase64 };

        await axios.patch(
          `${daapForcerefreshSettings.root}daap/v1/medias/${type}/${response.data.data.addedMedia.id}`,
          previevJson,
          {
            headers: {
              "X-WP-Nonce": daapForcerefreshSettings.nonce,
            },
          }
        );

        // const responsePreviewImage = await axios.patch(
        //   `/api/v1/medias/${type}/${response.data.data.addedMedia.id}`,
        //   previevJson
        // );
      }
    }
    return { status: "OK" };

    // return { status: "OK" };

    // return new Promise((resolve, reject) => {
    //   ipcRenderer
    //     .invoke(
    //       "MyUploads::Upload",
    //       JSON.stringify({
    //         fileBase64,
    //         fileMetadata,
    //         type,
    //         previewImageBase64,
    //         previewImageItem,
    //       })
    //     )
    //     .then((result: any) => {
    //       logger.app.log("resolve!!!!");
    //       resolve(result);
    //     });
    // });

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

  const fetchMedias = async (props: {
    type: MediaType;
    from: number;
    tag?: string;
    search?: string;
    perPage?: number;
  }): Promise<{ pagination: Pagination; data: ImageData[] }> => {
    const { type, from, tag, search, perPage } = props;

    return axios
      .get(`${daapForcerefreshSettings.root}daap/v1/medias/${type}`, {
        params: {
          page: from,
          limit: perPage,
          ...(!isEmpty(search) ? { search } : {}),
        },
        headers: {
          "X-WP-Nonce": daapForcerefreshSettings.nonce,
        },
      })
      .then((response) => response.data);
  };

  const deleteMedias = async (
    type: MediaType,
    ids: string[]
  ): Promise<{ response: { status: "SUCCESS" | "ERROR"; id: string }[] }> => {
    try {
      await axios.delete(
        `${daapForcerefreshSettings.root}daap/v1/media/${ids[0]}`,
        {
          headers: {
            "X-WP-Nonce": daapForcerefreshSettings.nonce,
          },
        }
      );

      return { response: [{ status: "SUCCESS", id: ids[0] }] };
    } catch (ex) {}

    return { response: [{ status: "ERROR", id: ids[0] }] };
  };

  return { upload, uploadToWP, fetchMedias, deleteMedias };
};
