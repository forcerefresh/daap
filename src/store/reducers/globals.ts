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
  snapToDocument: boolean;
  snapToDocumentThreshold: number;
  outlineColor: RGBColor;
  publishSettings?: {
    enabled: boolean;
    name?: string;
    endpoint?: string;
    key?: string;
    secretKey?: string;
  };
  homePage?: "search" | "editor" | string | undefined;
  // editor behaviour
  groupNesting?: "one" | "unlimited";
  // user capabilities sourced from /api/v1/me — not a user-configurable setting
  canUseAIGenerator?: boolean;
  userRole?: "USER" | "ADMIN";
}

const appZoomFromLocalStorage = parseFloat(
  localStorage.getItem(`appZoom`) ?? "1",
);

export function globals(
  state: IAppSettings = {
    // layoutType: "default-layers",
    appZoom: !isNaN(appZoomFromLocalStorage) ? appZoomFromLocalStorage : 1,
    enableDeveloper: true,
    devTools: false,
    theme: "dark",
    snapToObject: true,
    snapToObjectThreshold: 5,
    snapToMargin: true,
    snapToMarginThreshold: 5,
    snapToDocument: true,
    snapToDocumentThreshold: 5,
    outlineColor: { r: 0, g: 0, b: 0, a: 1 },
    appVersion: __APP_VERSION__,
    groupNesting: "unlimited",
  },
  action: ActionTypes,
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
