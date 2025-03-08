import { MediaItem, MediaType } from "webslider-sdk/lib/common/i-media-types";

/**
 * used for dev mode only, returns image from local storage
 */
export function getMediaSrc(
  type: MediaType,
  mediaItem: MediaItem,
  options?: { useId?: boolean; filename?: string }
): MediaItem {
  switch (type) {
    case "image": {
      if (mediaItem.sourceType === "url") {
        return {
          ...mediaItem,
          src: mediaItem.url,
        };
      }

      if (mediaItem.sourceType === "library") {
        return {
          ...mediaItem,
          src: mediaItem.url,
        };
      }

      if (mediaItem.sourceType === "local") {
        return {
          ...mediaItem,
          src: "assets/" + (options?.filename || mediaItem.filename),
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
        return {
          ...mediaItem,
          src: "assets/" + (options?.filename || mediaItem.filename),
        };
      }

      return mediaItem;
    }
    default: {
      return { ...mediaItem };
    }
  }
}
