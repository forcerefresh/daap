import { MediaItem, MediaType } from "webslider-sdk/lib/common/i-media-types";

export function getMediaSrc(
  type: MediaType,
  mediaItem: MediaItem,
  options?: { useId?: boolean; filename?: string }
): MediaItem {
  const { ipcRenderer } = window.require("electron");

  switch (type) {
    case "image": {
      if (mediaItem.sourceType === "url") {
        return {
          ...mediaItem,
          src: mediaItem.url,
        };
      }

      if (mediaItem.sourceType === "library") {
        if (options?.useId) {
          return {
            ...mediaItem,
            src:
              "{MEDIA_ITEM_LIBRARY}" + (options.filename || mediaItem.filename),
          };
        }

        return {
          ...mediaItem,
          src: mediaItem.url,
        };
      }

      if (mediaItem.sourceType === "local") {
        if (!mediaItem.id) {
          return mediaItem;
        }

        if (options?.useId) {
          return {
            ...mediaItem,
            src:
              "{MEDIA_ITEM_LOCAL}" + (options.filename || mediaItem.filename),
          };
        }

        return ipcRenderer.sendSync(
          "MyUploads::GetMediaSrc",
          JSON.stringify({ type, mediaItem })
        );
      }

      return mediaItem;
    }
    case "video":
    case "audio": {
      if (mediaItem.sourceType === "url") {
        return {
          ...mediaItem,
          src: mediaItem.url,
        };
      }

      if (mediaItem.sourceType === "local") {
        if (!mediaItem.id) {
          return mediaItem;
        }

        if (options?.useId) {
          return {
            ...mediaItem,
            src:
              "{MEDIA_ITEM_LOCAL}" + (options.filename || mediaItem.filename),
          };
        }

        return ipcRenderer.sendSync(
          "MyUploads::GetMediaSrc",
          JSON.stringify({ type, mediaItem })
        );
      }

      return mediaItem;
    }
    default: {
      return mediaItem;
    }
  }
}
