import { MediaItem, MediaType } from "webslider-sdk/lib/common/i-media-types";

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

if (import.meta.env.VITE_APP_INTEGRATION === "electron") {
  localMedia = require("./electron-local-media");
} else if (import.meta.env.VITE_APP_TYPE === "player") {
  localMedia = require("./player-local-media");
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
