import { cloneDeep } from "lodash-es";
import { ActionTypes, SET_FORM_STATE } from "../actions/actions";
import { IFormState } from "./i-uiforms";

export interface IUIForms {
  uiFormSate: { [key: string]: IFormState };
}

export function uiforms(
  state: IUIForms = {
    uiFormSate: {},
  },
  action: ActionTypes,
) {
  switch (action.type) {
    case SET_FORM_STATE: {
      const newState = cloneDeep(state);
      newState.uiFormSate[action.payload.formId] = action.payload.formState;
      return newState;
    }

    default:
      return state;
  }
}
