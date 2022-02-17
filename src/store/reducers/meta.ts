import {
  ActionTypes,
  CREATE_NEW_PROJECT,
  UPDATE_PROJECT_META,
} from "../actions/actions";

export interface IMeta {
  id?: number;
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

const getMetaDefault = () => ({ saveRevision: 0, publishRevision: 0 });

export function meta(state: IMeta = getMetaDefault(), action: ActionTypes) {
  switch (action.type) {
    case UPDATE_PROJECT_META: {
      return {
        ...state,
        ...action.payload,
      };
    }
    case CREATE_NEW_PROJECT: {
      return getMetaDefault();
    }
    default:
      return state;
  }
}
