import { cloneDeep } from "lodash-es";
import { RGBColor } from "react-color";
import {
  ActionTypes,
  CREATE_NEW_PROJECT,
  OPEN_PROJECT,
  UPDATE_PROJECT_SETTINGS,
  UPDATE_SLIDE_BREAKPOINTS,
  UPDATE_SLIDE_DURATION,
} from "../actions/actions";
import { DeviceType } from "./i-settings";

export function isAllowedPortrait(type: DeviceType) {
  return (
    [
      "small-1",
      "small-2",
      "small-3",
      "small-4",
      "small-5",
      "medium-1",
      "medium-2",
      "medium-3",
      "medium-4",
      "medium-5",
    ].indexOf(type) === -1
  );
}
const mapSizeIcon = {
  xsmall: "watch",
  small: "phone",
  medium: "tablet",
  large: "laptop",
  xlarge: "desktop",
  xxlarge: "tv",
} as any;

export function getIconByType(type: DeviceType): string {
  const size = type.split("-")[0];
  return mapSizeIcon[size];
}

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
  slideDuration: number;
  sliderBackgroundColor: RGBColor;
  //preview
  pageBackgroundColor: RGBColor;
  layoutBoxBackgroundColor: RGBColor;
  transparentHeader: boolean;
  // breakpoint
  breakpoints: Breakpoints;
}

function getDefaultBreakpointConfiguration(): Breakpoints {
  return {
    breakpointsConfiguration: [
      {
        type: "small-1",
        name: "Small devices",
        layout: "normal",
        normal: {
          page: { width: 480 },
          slide: { width: 480, height: 850 },
          guidelinesPadding: { left: 30, right: 30, top: 30, bottom: 30 },
          grid: {
            vertical: 12,
            horizontal: 12,
          },
          //keepProportion: false,
          horizontalFitTo: "viewport",
          verticalFitTo: "viewport",
        },
        fullViewport: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
      {
        type: "medium-1",
        name: "Medium devices",
        layout: "normal",
        normal: {
          page: { width: 1024 },
          slide: { width: 1024, height: 1365 },
          guidelinesPadding: { left: 40, right: 40, top: 40, bottom: 40 },
          grid: {
            vertical: 12,
            horizontal: 12,
          },
          //keepProportion: false,
          horizontalFitTo: "viewport",
          verticalFitTo: "viewport",
        },
        fullViewport: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
      {
        type: "large-1",
        name: "Large devices",
        layout: "normal",
        normal: {
          page: { width: 1450 },
          slide: { width: 1244, height: 700 },
          guidelinesPadding: { left: 50, right: 50, top: 50, bottom: 50 },
          grid: {
            vertical: 12,
            horizontal: 12,
          },
          //keepProportion: false,
          horizontalFitTo: "viewport",
          verticalFitTo: "viewport",
        },
        fullViewport: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
    ],
  };
}

const getSettingsDefault = () => ({
  // slide
  slideDuration: 10000,
  sliderBackgroundColor: { r: 33, g: 33, b: 33, a: 1 },
  // preview
  pageBackgroundColor: { r: 44, g: 44, b: 44, a: 1 },
  layoutBoxBackgroundColor: { r: 20, g: 155, b: 70, a: 0.8 },
  transparentHeader: false,
  // breakpoints
  breakpoints: getDefaultBreakpointConfiguration(),
});

export function settings(
  state: ISettings = getSettingsDefault(),
  action: ActionTypes
) {
  switch (action.type) {
    case UPDATE_PROJECT_SETTINGS: {
      return {
        ...state,
        ...action.payload,
      };
    }
    case UPDATE_SLIDE_DURATION: {
      return {
        ...state,
        slideDuration: action.payload,
      };
    }
    case UPDATE_SLIDE_BREAKPOINTS: {
      return {
        ...state,
        breakpointsConfiguration: cloneDeep(action.payload),
      };
    }
    case OPEN_PROJECT: {
      return {
        ...action.payload.settings,
      };
    }
    case CREATE_NEW_PROJECT: {
      return getSettingsDefault();
    }
    default:
      return state;
  }
}
