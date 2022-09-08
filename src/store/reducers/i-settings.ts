import { RGBColor } from "react-color";
import { Breakpoints } from "../../webslider-sdk/src/common/i-breakpoint-configuration";
import { IGlobalSlideOverlapTime } from "../../webslider-sdk/src/common/i-slider-duration";

export interface ISettings {
  // slide config
  slideDuration: string;
  exitSlideDuration: string;
  skipFirstSlideEffect: boolean;

  // slider config
  sliderBackgroundColor: RGBColor;

  //preview
  pageBackgroundColor: RGBColor;
  layoutBoxBackgroundColor: RGBColor;
  transparentHeader: boolean;

  // breakpoint
  breakpoints: Breakpoints;
}
