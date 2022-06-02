import { ActionTypes, SET_GLOBALS } from "../actions/actions";

export interface IAppSettings {
  layoutType: "default" | "default-layers";
  appZoom: number;
}

export function globals(
  state: IAppSettings = {
    layoutType: "default-layers",
    appZoom: 1,
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
