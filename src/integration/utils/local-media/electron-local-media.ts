import {
  MediaItem,
  MediaType,
} from "../../../webslider-sdk/src/common/i-media-types";

export function getMediaSrc(type: MediaType, mediaItem: MediaItem): MediaItem {
  const { ipcRenderer } = window.require("electron");

  if (mediaItem.url) {
    return {
      ...mediaItem,
      src: mediaItem.url,
    };
  }

  if (mediaItem.sourceType === "local") {
    return ipcRenderer.sendSync(
      "getMediaSrc",
      JSON.stringify({ type, mediaItem })
    );
  }

  return mediaItem;
}
