import { cloneDeep } from "lodash-es";
import {
  ActionTypes,
  UPDATE_SLIDE_BREAKPOINTS,
  UPDATE_SLIDE_DURATION,
} from "../actions/actions";

export type ResponsiveIcon =
  | "none"
  | "phone"
  | "tablet"
  | "laptop"
  | "desktop"
  | "watch"
  | "tv";
export interface BreakpointConfiguration {
  name: string;
  icon: ResponsiveIcon;
  layout: "normal" | "fullViewport";
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
    /* keepProportion will scale content when width is lover that breakpoint width*/
    keepProportion: boolean;
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
export interface BreakpointsConfiguration {
  breakpointsConfiguration: BreakpointConfiguration[];
}
export interface ISettings {
  slideDuration: number;
  breakpointsConfiguration: BreakpointsConfiguration;
}

function getDefaultBreakpointConfiguration(): BreakpointsConfiguration {
  return {
    breakpointsConfiguration: [
      {
        name: "Small devices",
        icon: "phone",
        layout: "normal",
        normal: {
          page: { width: 480 },
          slide: { width: 480, height: 850 },
          guidelinesPadding: { left: 30, right: 30, top: 30, bottom: 30 },
          keepProportion: false,
        },
        fullViewport: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
      {
        name: "Medium devices",
        icon: "tablet",
        layout: "normal",
        normal: {
          page: { width: 1024 },
          slide: { width: 1024, height: 1365 },
          guidelinesPadding: { left: 40, right: 40, top: 40, bottom: 40 },
          keepProportion: false,
        },
        fullViewport: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
      {
        name: "Large devices",
        icon: "laptop",
        layout: "normal",
        normal: {
          page: { width: 1450 },
          slide: { width: 1244, height: 700 },
          guidelinesPadding: { left: 50, right: 50, top: 50, bottom: 50 },
          keepProportion: false,
        },
        fullViewport: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
    ],
  };
}

export function settings(
  state: ISettings = {
    slideDuration: 10000,
    breakpointsConfiguration: getDefaultBreakpointConfiguration(),
  },
  action: ActionTypes
) {
  switch (action.type) {
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

    default:
      return state;
  }
}
