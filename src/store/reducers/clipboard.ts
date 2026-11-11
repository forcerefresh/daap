import {
  ActionTypes,
  CLIPBOARD_CLEAR,
  CLIPBOARD_COPY,
  CLIPBOARD_CUT,
  CLIPBOARD_PASTE_OBJECTS,
  UPDATE_OBJECT,
} from "../actions/actions";
import { IClipboard } from "./i-clipboard";

const getSettingsDefault = (): IClipboard => ({
  entityIds: [],
  entityType: null,
  operation: null,
});

export function clipboard(
  state: IClipboard = getSettingsDefault(),
  action: ActionTypes
) {
  switch (action.type) {
    case UPDATE_OBJECT:
      return getSettingsDefault();
    case CLIPBOARD_COPY:
    case CLIPBOARD_CUT:
      {
        return {
          ...state,
          ...action.payload,
        };
      }
    case CLIPBOARD_PASTE_OBJECTS:
      if (action.payload.operation === "cut") {
        return getSettingsDefault();
      }
      return state;
    case CLIPBOARD_CLEAR:
      return getSettingsDefault();
    default:
      return state;
  }
}
