import {
  ActionTypes,
  ADD_RECENT_COLOR,
  COLLECT_COLORS,
  COLORS_FROM_IMAGES,
  UPDATE_BRAND_COLORS,
  UPDATE_COLORS_STATE,
} from "../actions/actions";
import { IColors } from "./i-colors";

export function colors(
  state: IColors = {
    recentColors: [],
    usedInDocument: [],
    imagesColors: [],
    documentColorPalettes: [],
    myColorPalettes: [],
  },
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
    case UPDATE_COLORS_STATE: {
      const { payload } = action;
      return {
        ...state,
        ...payload,
      };
    }
    case COLORS_FROM_IMAGES: {
      const { payload } = action;
      return {
        ...state,
        imagesColors: payload,
      };
    }
    case UPDATE_BRAND_COLORS: {
      const { payload } = action;
      return {
        ...state,
        documentColorPalettes: payload,
      };
    }

    default:
      return state;
  }
}
