import { omit, without } from "lodash-es";
import { ActionTypes, ADD_OBJECT } from "../actions/actions";

export interface IObject {
  id: string;
  layerId: string;
  type: string; // Object type
  isVisible: boolean;
  hasTimeline: boolean;
}

export interface IObjects {
  objectById: { [id: string]: IObject };
  allObjects: string[];
}

export function objects(
  state: IObjects = { objectById: {}, allObjects: [] },
  action: ActionTypes
) {
  switch (action.type) {
    case ADD_OBJECT:
      const object = action.payload;

      return Object.assign({}, state, {
        objectById: {
          ...state.objectById,
          ...{ [object.id]: object },
        },
        allObjects: [...state.allObjects, object.id],
      });
    default:
      return state;
  }
}
