import { ActionTypes, EXTERNAL_FONT_LOADED } from "../actions/actions";

export interface IFonts {
  loadedFontFamilies: string[];
}

export function fonts(
  state: IFonts = {
    loadedFontFamilies: [],
  },
  action: ActionTypes
) {
  switch (action.type) {
    case EXTERNAL_FONT_LOADED: {
      return {
        ...state,
        loadedFontFamilies: [...state.loadedFontFamilies, action.payload],
      };
    }

    default:
      return state;
  }
}
