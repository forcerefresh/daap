import { RGBColor } from "react-color";

export type DeviceType =
  | "xsmall-1"
  | "xsmall-2"
  | "xsmall-3"
  | "xsmall-4"
  | "xsmall-5"
  | "small-1"
  | "small-2"
  | "small-3"
  | "small-4"
  | "small-5"
  | "medium-1"
  | "medium-2"
  | "medium-3"
  | "medium-4"
  | "medium-5"
  | "large-1"
  | "large-2"
  | "large-3"
  | "large-4"
  | "large-5"
  | "xlarge-1"
  | "xlarge-2"
  | "xlarge-3"
  | "xlarge-4"
  | "xlarge-5"
  | "xxlarge-1"
  | "xxlarge-2"
  | "xxlarge-3"
  | "xxlarge-4"
  | "xxlarge-5";

export interface BreakpointConfiguration {
  type: DeviceType;
  name: string;
  //icon: ResponsiveIcon;
  layout: "normal" | "fullViewport";
  portrait?: boolean;
  /*configuration for normal layout */
  normal: {
    /* "page" is the most outer size, usually browser width */
    page: { width: number };
    /* "slide" size is a main area used during editing*/
    slide: { width: number; height: number };
    /* "guidelines" are used for easier positioning, its a padding inside "slider" size */
    guidelinesPadding: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    /* "grid" are used for easier positioning*/
    grid: {
      vertical: number;
      horizontal: number;
    };
    /* keepProportion will scale content when width is lover that breakpoint width*/
    //keepProportion: boolean;
    /* horizontal  fit to */
    horizontalFitTo: "viewport" | "slider" | "fitToParent" | "custom";
    /* vertical  fit to */
    verticalFitTo: "viewport" | "custom" | "fitToParent" | "keepAspectRation";
  };
  /*configuration for full viewport layout */
  fullViewport: {
    padding: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
}

export interface Breakpoints {
  breakpointsConfiguration: BreakpointConfiguration[];
}
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
