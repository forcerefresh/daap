import { ActionTypes, UPDATE_EDITOR } from "../actions/actions";

export interface IEditor {
  sliderChanged?: boolean;
  isExistingProject?: boolean;
}

export function editor(
  state: IEditor = { sliderChanged: false, isExistingProject: false },
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
