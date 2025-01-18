import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import { getFonts } from "./utils/fonts/fonts";
import { getGoogleFontList } from "./utils/fonts/google-fonts";

export interface IGlobals {
  WebSlider_GlobalScope: {
    getExternalFonts: () => string[];
    getFonts: () => { fontFamily: string; source: string }[];
    getMyFonts: () => SaaSMediaData[];
  };
}

export function getGlobals() {
  return (window as any as IGlobals).WebSlider_GlobalScope;
}

const WebSlider_GlobalScope = {
  getExternalFonts: getGoogleFontList,
  getFonts: getFonts,
  getMyFonts: () => [],
};

const globals = window as any as IGlobals;
if (!globals.WebSlider_GlobalScope) {
  globals.WebSlider_GlobalScope = WebSlider_GlobalScope;
} else {
  globals.WebSlider_GlobalScope = {
    ...globals.WebSlider_GlobalScope,
    ...WebSlider_GlobalScope,
  };
}
