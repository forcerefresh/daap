import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";
import { ActionTypes, SET_GLOBALS } from "../actions/actions";

export interface IAppSettings {
  // layoutType: "default" | "default-layers";
  appZoom: number;
  enableDeveloper: boolean;
  devTools: boolean;
  allowPrerelease?: boolean;
  appVersion?: string;
  availableVersion?: string;
  showGrid?: boolean;
  theme: "dark" | "light";
  snapToObject: boolean;
  snapToObjectThreshold: number;
  snapToMargin: boolean;
  snapToMarginThreshold: number;
  outlineColor: RGBColor;
}

export function globals(
  state: IAppSettings = {
    // layoutType: "default-layers",
    appZoom: 1,
    enableDeveloper: true,
    devTools: false,
    theme: "dark",
    snapToObject: true,
    snapToObjectThreshold: 5,
    snapToMargin: true,
    snapToMarginThreshold: 5,
    outlineColor: { r: 0, g: 0, b: 0, a: 1 },
  },
  action: ActionTypes
) {
  switch (action.type) {
    case SET_GLOBALS: {
      return {
        ...state,
        ...action.payload,
      };
    }

    default:
      return state;
  }
}
