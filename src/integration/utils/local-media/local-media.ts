// used for dev mode only
import {
  MediaItem,
  MediaType,
} from "../../../webslider-sdk/src/common/i-media-types";

/**
 * used for dev mode only, returns image from local storage
 */
export function getMediaSrc(type: MediaType, mediaItem: MediaItem): MediaItem {
  const lsKey = `my-${type}s`;
  const myMedia: any[] = JSON.parse(localStorage.getItem(lsKey) || "[]");

  const lsStorageKey = `my-${type}s-storage`;
  const myMediaStorage: any = JSON.parse(
    localStorage.getItem(lsStorageKey) || "{}"
  );

  switch (type) {
    case "image": {
      if (mediaItem.sourceType === "url") {
        return {
          ...mediaItem,
          src: mediaItem.url,
        };
      }

      if (mediaItem.sourceType === "local") {
        return {
          ...mediaItem,
          src: myMediaStorage[mediaItem.id!][mediaItem.sizeType!],
        };
      }

      return mediaItem;
    }
    case "video": {
      // NOTE: for video we are storing video and  preview images as well
      const key =
        mediaItem.mediaType === "video" ? "video" : mediaItem.sizeType;

      return {
        ...mediaItem,
        src: myMediaStorage[mediaItem.id!][key!],
      };
    }
    default: {
      return { ...mediaItem };
    }
  }
}
