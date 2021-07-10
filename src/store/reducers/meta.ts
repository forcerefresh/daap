import { ActionTypes, UPDATE_PROJECT_META } from "../actions/actions";

export interface IMeta {
  id?: number;
  name?: string;
  description?: string;
  created?: string;
  updated?: string;
}

export function meta(state: IMeta = {}, action: ActionTypes) {
  switch (action.type) {
    case UPDATE_PROJECT_META: {
      return {
        ...state,
        ...action.payload,
      };
    }

    default:
      return state;
  }
}
