import { cloneDeep } from "lodash-es";
import {
  ActionTypes,
  CREATE_NEW_PROJECT,
  CREATE_NEW_PROJECT_FROM_EXISTING,
  CreateNewProjectActionPayload,
  OPEN_PROJECT,
  SET_THEME,
  UPDATE_PROJECT_SETTINGS,
  UPDATE_SLIDE_BREAKPOINTS,
  UPDATE_SLIDE_DURATION,
} from "../actions/actions";
import { ISettings } from "./i-settings";
import { Breakpoints } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";

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

// function getDefaultBreakpointConfiguration(): Breakpoints {
//   return {
//     breakpointsConfiguration: [
//       {
//         type: "small-1",
//         name: "Small devices",
//         enabled: true,
//         layout: "normal",
//         normal: {
//           breakpoint: { width: { from: 320, fromMin: true, to: 320 } },
//           page: { width: 480, height: 500 },
//           maxSliderSize: { width: 480, height: 500 },
//           heightBehavior: { type: "keepAspectRatio" },
//           widthBehavior: { type: "useMaxWidth" },
//           guidelinesPadding: { left: 30, right: 30, top: 30, bottom: 30 },
//           grid: {
//             vertical: 24,
//             horizontal: 24,
//           },
//           //keepProportion: false,
//           horizontalFitTo: "viewport",
//           verticalFitTo: "viewport",
//         },
//         fullViewport: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
//       },
//       {
//         type: "medium-1",
//         name: "Medium devices",
//         enabled: true,
//         layout: "normal",
//         normal: {
//           breakpoint: { width: { from: 481, to: 768 } },
//           page: { width: 768, height: 1366 },
//           maxSliderSize: { width: 768, height: 1366 },
//           heightBehavior: { type: "keepAspectRatio" },
//           widthBehavior: { type: "useMaxWidth" },
//           guidelinesPadding: { left: 40, right: 40, top: 40, bottom: 40 },
//           grid: {
//             vertical: 24,
//             horizontal: 24,
//           },
//           //keepProportion: false,
//           horizontalFitTo: "viewport",
//           verticalFitTo: "viewport",
//         },
//         fullViewport: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
//       },
//       {
//         type: "large-1",
//         name: "Large devices",
//         enabled: true,
//         layout: "normal",
//         normal: {
//           breakpoint: { width: { from: 769, to: 1024 } },
//           page: { width: 1024, height: 576 },
//           maxSliderSize: { width: 1024, height: 576 },
//           heightBehavior: { type: "keepAspectRatio" },
//           widthBehavior: { type: "useMaxWidth" },
//           guidelinesPadding: { left: 50, right: 50, top: 50, bottom: 50 },
//           grid: {
//             vertical: 24,
//             horizontal: 24,
//           },
//           //keepProportion: false,
//           horizontalFitTo: "viewport",
//           verticalFitTo: "viewport",
//         },
//         fullViewport: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
//       },
//       {
//         type: "xlarge-1",
//         name: "Extra large devices",
//         enabled: true,
//         layout: "normal",
//         normal: {
//           breakpoint: { width: { from: 1025, to: 1240, toMax: true } },
//           page: { width: 1240, height: 720 },
//           maxSliderSize: { width: 1100, height: 720 },
//           heightBehavior: { type: "keepAspectRatio" },
//           widthBehavior: { type: "useMaxWidth" },
//           guidelinesPadding: { left: 50, right: 50, top: 50, bottom: 50 },
//           grid: {
//             vertical: 24,
//             horizontal: 24,
//           },
//           //keepProportion: false,
//           horizontalFitTo: "viewport",
//           verticalFitTo: "viewport",
//         },
//         fullViewport: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
//       },
//     ],
//   };
// }

function getDefaultBreakpointConfiguration(props: {
  width: string;
  height: string;
  margins?: { left: number; top: number; right: number; bottom: number };
}): Breakpoints {
  const {
    height,
    width,
    margins = { left: 0, top: 0, bottom: 0, right: 0 },
  } = props;

  const heightInt = parseInt(height);
  const widthInt = parseInt(width);

  return {
    breakpointsConfiguration: [
      {
        type: "device-independent",
        name: "Device independent",
        enabled: true,
        layout: "normal",
        normal: {
          breakpoint: {
            width: {
              from: widthInt,
              fromMin: true,
              to: widthInt,
            },
          },
          page: { width: widthInt, height: heightInt },
          margins,
          maxSliderSize: { width: widthInt, height: heightInt },
          heightBehavior: { type: "keepAspectRatio" },
          widthBehavior: { type: "useMaxWidth" },
          guidelinesPadding: { left: 30, right: 30, top: 30, bottom: 30 },
          grid: {
            vertical: 24,
            horizontal: 24,
          },
          horizontalFitTo: "viewport",
          verticalFitTo: "viewport",
        },
        // fullViewport: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
    ],
  };
}

const getSettingsDefault = (props?: {
  width: string;
  height: string;
  margins?: { left: number; top: number; right: number; bottom: number };
}): ISettings => ({
  // slide
  slideDuration: "10s",
  exitSlideDuration: "1s",
  skipFirstSlideAnimation: false,
  breakpointReference: "viewport",
  // slider
  pageBackgroundColor: { r: 70, g: 70, b: 70, a: 1 },
  autoPlay: true,
  // preview
  // pageBackgroundColor: { r: 70, g: 70, b: 70, a: 1 },
  layoutBoxBackgroundColor: { r: 20, g: 155, b: 70, a: 0.8 },
  transparentHeader: false,
  // breakpoints
  breakpoints: getDefaultBreakpointConfiguration(
    props ?? {
      width: "1080px",
      height: "1080px",
      margins: { left: 80, top: 80, bottom: 80, right: 80 },
    },
  ),
  //theme
  theme: "dark",
  themeClass: "bp5-dark",
});

export function settings(
  state: ISettings = getSettingsDefault(),
  action: ActionTypes,
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
      const settings = action.payload.settings;

      // backward compatibility
      settings.breakpoints.breakpointsConfiguration =
        settings.breakpoints.breakpointsConfiguration.map((bc) => {
          return {
            ...bc,
            normal: {
              ...bc.normal,
              margins: bc.normal.margins ?? {
                left: 0,
                top: 0,
                bottom: 0,
                right: 0,
              },
            },
          };
        });

      return {
        ...settings,
      };
    }
    case CREATE_NEW_PROJECT:
    case CREATE_NEW_PROJECT_FROM_EXISTING: {
      return getSettingsDefault({
        width: action.payload.width,
        height: action.payload.height,
        margins: action.payload.margins,
      });
    }
    case SET_THEME: {
      return {
        ...state,
        theme: action.payload,
        themeClass: action.payload === "dark" ? "bp5-dark" : "",
      };
    }
    default:
      return state;
  }
}
