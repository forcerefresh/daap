import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import { IGlobals } from "../../../globals";

let localMedia: {
  getMediaSrc: (
    mediaItem: SaaSMediaData,
    preferredSize?: string,
    propertyToUse?: "previewSizes" | "mediaSizes"
  ) => string;
} = {
  getMediaSrc: (
    _mediaItem: SaaSMediaData,
    _preferredSize?: string,
    _propertyToUse?: "previewSizes" | "mediaSizes"
  ) => "",
};

if (import.meta.env.VITE_APP_TYPE === "player") {
  localMedia = require("./local-media");
} else {
  localMedia = require("@platform/utils/local-media");
}

export const getMediaSrc = localMedia.getMediaSrc;

// NOTE has to be on global scope in order to be available in external extensions
const global = window as unknown as IGlobals;
if (!global.WebSlider_GlobalScope) {
  global.WebSlider_GlobalScope = {};
}
global.WebSlider_GlobalScope.getMediaSrc = getMediaSrc as unknown as (mediaId: string) => string;
