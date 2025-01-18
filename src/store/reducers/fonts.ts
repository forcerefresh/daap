import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import {
  ActionTypes,
  EXTERNAL_FONT_LOADED,
  SET_MY_FONTS,
} from "../actions/actions";
import { IGlobals } from "../../globals";

export interface IFonts {
  loadedFontFamilies: string[];
  myFonts: SaaSMediaData[];
}

export function fonts(
  state: IFonts = {
    loadedFontFamilies: [],
    myFonts: [],
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

    case SET_MY_FONTS: {
      const myFonts = action.payload;
      const globals = window as any as IGlobals;
      if (globals.WebSlider_GlobalScope) {
        globals.WebSlider_GlobalScope.getMyFonts = () => myFonts;
      }

      return {
        ...state,
        myFonts,
      };
    }

    default:
      return state;
  }
}
