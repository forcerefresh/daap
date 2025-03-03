import {
  ActionTypes,
  ADD_RECENT_COLOR,
  COLLECT_COLORS,
} from "../actions/actions";
import { IColors } from "./i-colors";

export function colors(
  state: IColors = { recentColors: [], usedInDocument: [] },
  action: ActionTypes
) {
  switch (action.type) {
    case ADD_RECENT_COLOR: {
      const { payload } = action;
      const existingIndex = state.recentColors.findIndex(
        (color) =>
          color.r === payload.r &&
          color.g === payload.g &&
          color.b === payload.b &&
          color.a === payload.a
      );

      let updatedColors = [...state.recentColors];

      if (existingIndex !== -1) {
        updatedColors.splice(existingIndex, 1);
      }

      updatedColors.push(payload);

      if (updatedColors.length > 50) {
        updatedColors.shift();
      }

      return {
        ...state,
        recentColors: updatedColors,
      };
    }
    case COLLECT_COLORS: {
      const { payload } = action;
      return {
        ...state,
        usedInDocument: payload,
      };
    }
    default:
      return state;
  }
}
