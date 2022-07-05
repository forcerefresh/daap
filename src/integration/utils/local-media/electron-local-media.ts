import { MediaItem, MediaType } from "../../../utils/assets/types";

export function getMediaSrc(type: MediaType, mediaItem: MediaItem): MediaItem {
  const { ipcRenderer } = window.require("electron");

  return ipcRenderer.sendSync(
    "getMediaSrc",
    JSON.stringify({ type, mediaItem })
  );
}
