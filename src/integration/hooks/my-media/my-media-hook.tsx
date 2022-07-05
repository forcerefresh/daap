// *** this file contains implementation for development

import {
  MediaDataInfo,
  ImageData,
  MediaType,
  VectorData,
  VideoData,
  ExtesnsionData,
} from "../../../utils/assets/types";
import { resizeFile } from "../../components/my-image-select/my-images-utils";
import { v4 as uuid } from "uuid";
import { remove } from "lodash-es";
import { file2Base64, getImageFromFile } from "../../../utils/doom-utils/video";
import { appendToFileName } from "../../../utils/file/file-utils";

export const useMyMediaHook = () => {
  const upload = (
    type: MediaType,
    file: File,
    fileMetadata: MediaDataInfo
  ): Promise<{ status: "OK" | "ERROR"; errorMessage?: string }> => {
    const lsKey = `my-${type}s`;
    const lsMediaKey = `my-${type}s-storage`;

    if (fileMetadata.tags?.[0] === "") {
      fileMetadata.tags = [];
    }

    return new Promise(async (resolve) => {
      const lsMyMedia: any[] = JSON.parse(localStorage.getItem(lsKey) || "[]");
      const lsMyMediaStorage: any = JSON.parse(
        localStorage.getItem(lsMediaKey) || "{}"
      );

      let item: ImageData | VectorData | VideoData | ExtesnsionData;

      switch (type) {
        case "image": {
          const id = uuid();

          const thumbFile = await resizeFile(file, 80, 80, 70);
          const smallFile = await resizeFile(file, 120, 120, 70);
          const mediumFile = await resizeFile(file, 300, 300, 70);

          lsMyMediaStorage[id] = {
            original: thumbFile as string,
            small: smallFile as string,
            medium: mediumFile as string,
          };

          item = {
            id,
            ...fileMetadata,
            images: {
              original: {
                id,
                filename: fileMetadata.filename,
                mediaType: "image",
                sourceType: "local",
                sizeType: "original",
                size: { width: 80, height: 80, type: "jpg" },
              },
              small: {
                id,
                filename: appendToFileName(fileMetadata.filename!, "_120"),
                mediaType: "image",
                sourceType: "local",
                sizeType: "small",
                size: { width: 120, height: 120, type: "jpg" },
              },
              medium: {
                id,
                filename: appendToFileName(fileMetadata.filename!, "_300"),
                mediaType: "image",
                sourceType: "local",
                sizeType: "medium",
                size: { width: 300, height: 300, type: "jpg" },
              },
            },
          };
          break;
        }
        case "video": {
          // TODO: filename
          const { blob, videoItem } = await getImageFromFile(file);
          const originalFile = await resizeFile(blob!, 80, 80, 70);
          const thumbFile = await resizeFile(blob!, 80, 80, 70);
          const smallFile = await resizeFile(blob!, 120, 120, 70);
          const mediumFile = await resizeFile(blob!, 300, 300, 70);
          //videoItem.url = await file2Base64(file);
          const videoBase64 = await file2Base64(file);

          const id = uuid();

          lsMyMediaStorage[id] = {
            video: videoBase64,
            original: thumbFile as string,
            small: smallFile as string,
            medium: mediumFile as string,
          };

          item = {
            id,
            ...fileMetadata,
            videos: {
              original: {
                id,
                filename: fileMetadata.filename,
                mediaType: "video",
                sourceType: "local",
                sizeType: "original",
                size: videoItem.size,
              },
            },
            images: {
              thumbnail: {
                id,
                filename: "id:" + id,
                mediaType: "image",
                sourceType: "local",
                sizeType: "medium",
                //url: thumbFile as string,
                size: { width: 80, height: 80, type: "jpg" },
              },
              small: {
                id,
                filename: "id:" + id,
                mediaType: "image",
                sourceType: "local",
                sizeType: "medium",
                //url: smallFile as string,
                size: { width: 120, height: 120, type: "jpg" },
              },
              medium: {
                id,
                filename: "id:" + id,
                mediaType: "image",
                sourceType: "local",
                sizeType: "medium",
                //url: mediumFile as string,
                size: { width: 300, height: 300, type: "jpg" },
              },
              original: {
                id,
                filename: "id:" + id,
                mediaType: "image",
                sourceType: "local",
                sizeType: "medium",
                //url: originalFile as string,
                size: { width: 300, height: 300, type: "jpg" },
              },
            },
          };
          break;
        }
        case "vector": {
          item = {
            id: uuid(),
            ...fileMetadata,
            svgString: await file.text(),
          };
          break;
        }
        case "extension": {
          item = {
            id: uuid(),
            ...fileMetadata,
            file: "file",
            // no sense to save extension in local storafe. elestorn only impl.
          };
          break;
        }
      }

      lsMyMedia.unshift(item);

      localStorage.setItem(lsKey, JSON.stringify(lsMyMedia));
      localStorage.setItem(lsMediaKey, JSON.stringify(lsMyMediaStorage));

      setTimeout(() => {
        resolve({ status: "OK" });
      }, 1);
    });
  };

  const fetchImages = async (props: {
    type: MediaType;
    from: number;
    tags?: string[];
    search?: string;
    perPage?: number;
  }): Promise<{ data: ImageData[] | VectorData[]; hasMore: boolean }> => {
    const { from, tags, search, type, perPage = 10 } = props;
    const lsKey = `my-${type}s`;

    let myImages: ImageData[] = JSON.parse(localStorage.getItem(lsKey) || "[]");

    console.log(tags);
    console.log();
    if (tags && tags.length > 0) {
      console.log(tags);

      const tagsUpper = tags?.map((tag) => tag.toUpperCase()) || [];
      myImages = myImages.filter(
        (image) =>
          image.tags &&
          image.tags.find((tag) => tagsUpper.indexOf(tag.toUpperCase()) !== -1)
      );
    }

    if (search) {
      myImages = myImages.filter((image) => image.title.indexOf(search) !== -1);
    }

    console.log(myImages.length);
    console.log(props);
    const retArr = [...myImages].splice(from, from + perPage);

    console.log(myImages.length);
    console.log(from + perPage);

    const hasMore = myImages.length > from + perPage;

    return { data: retArr, hasMore }; //ImageSetData[];
  };

  const deleteImages = async (
    type: MediaType,
    ids: string[]
  ): Promise<{ deletedIds: string[] }> => {
    const lsKey = `my-${type}s`;

    const myImages: ImageData[] = JSON.parse(
      localStorage.getItem(lsKey) || "[]"
    );

    console.log(myImages);
    ids.forEach((id) => {
      remove(myImages, (item) => {
        return item.id === id;
      });
    });
    console.log(myImages);

    localStorage.setItem(lsKey, JSON.stringify(myImages));

    return { deletedIds: ids };
  };
  return { upload, fetchImages, deleteImages };
};
