import { RGBColor } from "react-color";
import { Breakpoints } from "../../webslider-sdk/src/common/i-breakpoint-configuration";
import { IGlobalSlideOverlapTime } from "../../webslider-sdk/src/common/i-slider-duration";

export interface ISettings {
  // slide
  slideDuration: string;
  exitSlideDuration: string;
  //exitOverlapSlideDuration: IGlobalSlideOverlapTime;

  sliderBackgroundColor: RGBColor;
  //preview
  pageBackgroundColor: RGBColor;
  layoutBoxBackgroundColor: RGBColor;
  transparentHeader: boolean;
  // breakpoint
  breakpoints: Breakpoints;
}
