import { ActionTypes, SET_GLOBALS } from "../actions/actions";

export interface IGlobals {
  layoutType: "default" | "default-layers";
  scale: number;
}

export function globals(
  state: IGlobals = {
    layoutType: "default-layers",
    scale: 1,
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
