import { RGBColor } from "react-color";
import { Breakpoints } from "../../webslider-sdk/src/common/i-breakpoint-configuration";

export interface ISettings {
  // slide
  slideDuration: string;
  sliderBackgroundColor: RGBColor;
  //preview
  pageBackgroundColor: RGBColor;
  layoutBoxBackgroundColor: RGBColor;
  transparentHeader: boolean;
  // breakpoint
  breakpoints: Breakpoints;
}
