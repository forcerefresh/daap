import { MediaItem, MediaType } from "../../../utils/assets/types";

let localMedia: {
  getMediaSrc: (type: MediaType, mediaItem: MediaItem) => MediaItem;
} = {
  getMediaSrc: (type: MediaType, mediaItem: any) => ({}),
};

if (process.env.REACT_APP_INTEGRATION === "electron") {
  localMedia = require("./electron-local-media");
} else {
  localMedia = require("./local-media");
}

export const getMediaSrc = localMedia.getMediaSrc;
