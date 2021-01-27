import { getGoogleFontList } from "./utils/fonts/google-fonts";

export interface IGlobals {
  WebSlider_GlogalScope: {
    getExternalFonts: () => string[];
  };
}

export function getGlobals() {
  return ((window as any) as IGlobals).WebSlider_GlogalScope;
}

const WebSlider_GlogalScope = {
  getExternalFonts: getGoogleFontList,
};

const globals = (window as any) as IGlobals;
globals.WebSlider_GlogalScope = WebSlider_GlogalScope;
