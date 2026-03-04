import { RGBColor } from "react-color";
import { Breakpoints } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IGlobalSlideOverlapTime } from "webslider-sdk/lib/common/i-slider-duration";

export type ITheme = "light" | "dark" | string;

export interface ISettings {
  // document
  documentTypeId?: string;

  // slide config
  slideDuration: string;
  exitSlideDuration: string;
  skipFirstSlideAnimation: boolean;
  breakpointReference: "viewport" | "parent";
  hideOutsideContent?: boolean;

  // slider config
  pageBackgroundColor: RGBColor;
  autoPlay: boolean;

  //preview
  outlineColor: RGBColor;

  // pageBackgroundColor: RGBColor;
  layoutBoxBackgroundColor: RGBColor;
  transparentHeader: boolean;

  // breakpoint
  breakpoints: Breakpoints;

  //theme
  theme: ITheme;
  themeClass: string;

  groupNesting: "one" | "unlimited";
}
