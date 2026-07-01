import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import {
  IObjectAppDefinition,
  IObjectPlayerDefinition,
  registerExternalObject,
  unregisterObject,
} from "webslider-sdk/lib/objects/objects-register";
import {
  registerExternalAnimation,
  unregisterAnimation,
} from "webslider-sdk/lib/animations/animations-register";
import { getFonts } from "./utils/fonts/fonts";
import { getGoogleFontList } from "./utils/fonts/google-fonts";

export interface IWebSliderGlobalScope {
  // Object registry — populated by external object bundles at runtime
  playerObjects?: Record<string, IObjectPlayerDefinition>;
  appObjects?: Record<string, IObjectAppDefinition>;
  playerAnimations?: Record<string, unknown>;
  appAnimations?: Record<string, unknown>;
  // Registration helpers exposed for external bundles
  registerExternalObject?: typeof registerExternalObject;
  unregisterObject?: typeof unregisterObject;
  registerExternalAnimation?: typeof registerExternalAnimation;
  unregisterAnimation?: typeof unregisterAnimation;
  // Font helpers
  getExternalFonts?: () => string[];
  getFonts?: () => { fontFamily: string; source: string }[];
  getMyFonts?: () => SaaSMediaData[];
  // Media helpers (set by WP/local-media integration)
  getMediaSrc?: (mediaId: string) => string;
}

export interface IGlobals {
  WebSlider_GlobalScope: IWebSliderGlobalScope;
}

export function getGlobals(): IWebSliderGlobalScope {
  return (window as unknown as IGlobals).WebSlider_GlobalScope;
}

const WebSlider_GlobalScope = {
  getExternalFonts: getGoogleFontList,
  getFonts: getFonts,
  getMyFonts: () => [],
};

const globals = window as unknown as IGlobals;
if (!globals.WebSlider_GlobalScope) {
  globals.WebSlider_GlobalScope = WebSlider_GlobalScope;
} else {
  globals.WebSlider_GlobalScope = {
    ...globals.WebSlider_GlobalScope,
    ...WebSlider_GlobalScope,
  };
}
