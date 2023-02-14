import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import { ActionTypes, UPDATE_EDITOR } from "../actions/actions";

export interface IEditor {
  sliderChanged: boolean;
  isExistingProject: boolean;
  missingExtensions: IExtensionItem[];
}

export function editor(
  state: IEditor = {
    sliderChanged: false,
    isExistingProject: false,
    missingExtensions: [],
  },
  action: ActionTypes
) {
  switch (action.type) {
    case UPDATE_EDITOR: {
      return {
        ...state,
        ...action.payload,
      };
    }

    default:
      return state;
  }
}
