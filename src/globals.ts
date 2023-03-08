import { getFonts } from "./utils/fonts/fonts";
import { getGoogleFontList } from "./utils/fonts/google-fonts";

export interface IGlobals {
  WebSlider_GlobalScope: {
    getExternalFonts: () => string[];
    getFonts: () => { fontFamily: string; source: string }[];
  };
}

export function getGlobals() {
  return (window as any as IGlobals).WebSlider_GlobalScope;
}

const WebSlider_GlobalScope = {
  getExternalFonts: getGoogleFontList,
  getFonts: getFonts,
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
