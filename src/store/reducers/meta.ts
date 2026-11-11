import {
  ActionTypes,
  CREATE_NEW_PROJECT,
  CREATE_NEW_PROJECT_FROM_EXISTING,
  UPDATE_PROJECT_META,
} from "../actions/actions";

export interface IMeta {
  id?: string;
  name?: string;
  description?: string;
  slides?: number;
  created?: string;
  modified?: string;
  inSaving?: boolean;
  saveRevision: number;
  assetsUrls?: { url: string; type: "url" | string }[];
  // publishRevision: number;
}

const getMetaDefault = () => ({
  saveRevision: 0,
  name: "Custom " + new Date().toDateString(),
});

export function meta(state: IMeta = getMetaDefault(), action: ActionTypes) {
  switch (action.type) {
    case UPDATE_PROJECT_META: {
      return {
        ...state,
        ...action.payload,
      };
    }
    case CREATE_NEW_PROJECT: {
      return { ...getMetaDefault(), name: action.payload.name };
    }
    case CREATE_NEW_PROJECT_FROM_EXISTING: {
      return { ...getMetaDefault(), name: action.payload.name };
    }
    default:
      return state;
  }
}
