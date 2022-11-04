import { MediaItem, MediaType } from "webslider-sdk2/lib/common/i-media-types";

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

// NOTE has to be on global scope in order to be  available in external extensions
const global = window as any;
if (!global.WebSlider_GlobalScope) {
  global.WebSlider_GlobalScope = {};
}
global.WebSlider_GlobalScope.getMediaSrc = getMediaSrc;
