// used for dev mode only
import { MediaItem, MediaType } from "webslider-sdk2/lib/common/i-media-types";

/**
 * used for dev mode only, returns image from local storage
 */
export function getMediaSrc(
  type: MediaType,
  mediaItem: MediaItem,
  options?: { useId?: boolean; filename?: string }
): MediaItem {
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

      if (mediaItem.sourceType === "library") {
        // if (options?.useId) {
        //   return {
        //     ...mediaItem,
        //     src:
        //       "{MEDIA_ITEM_LIBRARY}" + (options.filename || mediaItem.filename),
        //   };
        // }
        return {
          ...mediaItem,
          src: mediaItem.url,
        };
      }

      if (mediaItem.sourceType === "local") {
        if (options?.useId) {
          return {
            ...mediaItem,
            src:
              "{MEDIA_ITEM_LOCAL}" + (options.filename || mediaItem.filename),
          };
        }
        return {
          ...mediaItem,
          src: myMediaStorage[mediaItem.id!]?.[mediaItem.sizeType!],
        };
      }

      return mediaItem;
    }
    case "video": {
      if (mediaItem.sourceType === "url") {
        return {
          ...mediaItem,
          src: mediaItem.url,
        };
      }

      if (mediaItem.sourceType === "local") {
        if (options?.useId) {
          return {
            ...mediaItem,
            src:
              "{MEDIA_ITEM_LOCAL}" + (options.filename || mediaItem.filename),
          };
        }

        // NOTE: for video we are storing video and  preview images as well under mediaItem.id
        const key =
          mediaItem.mediaType === "video" ? "video" : mediaItem.sizeType;

        return {
          ...mediaItem,
          src: myMediaStorage[mediaItem.id!][key!],
        };
      }

      return mediaItem;
    }
    default: {
      return { ...mediaItem };
    }
  }
}
