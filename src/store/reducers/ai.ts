import { cloneDeep } from "lodash";
import { ActionTypes, AI_REQUEST_LOADING, AI_ENABLE } from "../actions/actions";

export interface IAI {
  aiLoading: { [objectIs: string]: boolean };
  aiEnabled: { [objectType: string]: boolean };
}

export function ai(
  state: IAI = {
    aiLoading: {},
    aiEnabled: {
      "io.forcerefresh.image.object": false,
      "io.forcerefresh.text.object": false,
    },
  },
  action: ActionTypes
) {
  switch (action.type) {
    case AI_REQUEST_LOADING: {
      const newState = cloneDeep(state);
      newState.aiLoading[action.payload.objectId] = action.payload.loading;
      return newState;
    }

    case AI_ENABLE: {
      const newState = cloneDeep(state);
      action.payload.forEach((item) => {
        newState.aiEnabled[item.objectType] = item.enabled;
      });
      return newState;
    }

    default:
      return state;
  }
}
