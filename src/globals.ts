import { getFonts } from "./utils/fonts/fonts";
import { getGoogleFontList } from "./utils/fonts/google-fonts";

export interface IGlobals {
  WebSlider_GlogalScope: {
    getExternalFonts: () => string[];
    getFonts: () => { fontFamily: string; source: string }[];
  };
}

export function getGlobals() {
  return ((window as any) as IGlobals).WebSlider_GlogalScope;
}

const WebSlider_GlogalScope = {
  getExternalFonts: getGoogleFontList,
  getFonts: getFonts,
};

const globals = (window as any) as IGlobals;
globals.WebSlider_GlogalScope = WebSlider_GlogalScope;
