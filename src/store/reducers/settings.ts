import { ActionTypes, UPDATE_SLIDE_DURATION } from "../actions/actions";

export interface ISettings {
  slideDuration: number;
}

export function settings(
  state: ISettings = { slideDuration: 10000 },
  action: ActionTypes
) {
  switch (action.type) {
    case UPDATE_SLIDE_DURATION: {
      return {
        ...state,
        slideDuration: action.payload,
      };
    }
    default:
      return state;
  }
}
