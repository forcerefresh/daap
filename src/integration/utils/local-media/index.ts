import {
  MediaItem,
  MediaType,
} from "../../../webslider-sdk/src/common/i-media-types";

let localMedia: {
  getMediaSrc: (
    type: MediaType,
    mediaItem: MediaItem,
    options?: { useId?: boolean; filename?: string }
  ) => MediaItem;
} = {
  getMediaSrc: (
    type: MediaType,
    mediaItem: any,
    options?: { useId?: boolean; filename?: string }
  ) => ({}),
};

if (process.env.REACT_APP_INTEGRATION === "electron") {
  localMedia = require("./electron-local-media");
} else {
  localMedia = require("./local-media");
}

export const getMediaSrc = localMedia.getMediaSrc;
