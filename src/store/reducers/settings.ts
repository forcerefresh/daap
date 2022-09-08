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
import { ISettings } from "./i-settings";
import { Breakpoints } from "../../webslider-sdk/src/common/i-breakpoint-configuration";
import { DeviceType } from "../../webslider-sdk/src/common/i-device-type";

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

function getDefaultBreakpointConfiguration(): Breakpoints {
  return {
    breakpointsConfiguration: [
      {
        type: "small-1",
        name: "Small devices",
        layout: "normal",
        normal: {
          breakpoint: { width: { from: 320, fromMin: true, to: 480 } },
          page: { width: 480, height: 850 },
          maxSliderSize: { width: 480, height: 850 },
          heightBehavior: { type: "keepAspectRatio" },
          guidelinesPadding: { left: 30, right: 30, top: 30, bottom: 30 },
          grid: {
            vertical: 24,
            horizontal: 24,
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
          breakpoint: { width: { from: 481, to: 768 } },
          page: { width: 768, height: 1366 },
          maxSliderSize: { width: 768, height: 1366 },
          heightBehavior: { type: "keepAspectRatio" },
          guidelinesPadding: { left: 40, right: 40, top: 40, bottom: 40 },
          grid: {
            vertical: 24,
            horizontal: 24,
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
          breakpoint: { width: { from: 769, to: 1024 } },
          page: { width: 1024, height: 576 },
          maxSliderSize: { width: 1024, height: 576 },
          heightBehavior: { type: "keepAspectRatio" },
          guidelinesPadding: { left: 50, right: 50, top: 50, bottom: 50 },
          grid: {
            vertical: 24,
            horizontal: 24,
          },
          //keepProportion: false,
          horizontalFitTo: "viewport",
          verticalFitTo: "viewport",
        },
        fullViewport: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
      {
        type: "xlarge-1",
        name: "Extra large devices",
        layout: "normal",
        normal: {
          breakpoint: { width: { from: 1025, to: 1240, toMax: true } },
          page: { width: 1240, height: 720 },
          maxSliderSize: { width: 1100, height: 720 },
          heightBehavior: { type: "keepAspectRatio" },
          guidelinesPadding: { left: 50, right: 50, top: 50, bottom: 50 },
          grid: {
            vertical: 24,
            horizontal: 24,
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

const getSettingsDefault = (): ISettings => ({
  // slide
  slideDuration: "10s",
  exitSlideDuration: "1s",
  skipFirstSlideEffect: false,
  // slider
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
