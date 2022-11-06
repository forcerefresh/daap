import { RGBColor } from "react-color";
import { Breakpoints } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IGlobalSlideOverlapTime } from "webslider-sdk/lib/common/i-slider-duration";

export interface ISettings {
  // slide config
  slideDuration: string;
  exitSlideDuration: string;
  skipFirstSlideAnimation: boolean;
  breakpointReference: "viewport" | "parent";

  // slider config
  sliderBackgroundColor: RGBColor;

  //preview
  pageBackgroundColor: RGBColor;
  layoutBoxBackgroundColor: RGBColor;
  transparentHeader: boolean;

  // breakpoint
  breakpoints: Breakpoints;
}
