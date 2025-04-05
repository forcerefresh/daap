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
}

export function globals(
  state: IAppSettings = {
    // layoutType: "default-layers",
    appZoom: 1,
    enableDeveloper: false,
    devTools: false,
    theme: "dark",
    snapToObject: true,
    snapToObjectThreshold: 5,
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
