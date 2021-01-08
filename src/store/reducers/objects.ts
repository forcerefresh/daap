import { omit, without } from "lodash-es";
import { IObject } from "../../objects/types";
import {
  ActionTypes,
  ADD_OBJECT,
  DELETE_OBJECTS,
  UPDATE_OBJECT,
} from "../actions/actions";

export interface IObjects {
  objectById: { [id: string]: IObject<{}> };
  allObjects: string[];
}

export function objects(
  state: IObjects = { objectById: {}, allObjects: [] },
  action: ActionTypes
) {
  switch (action.type) {
    case ADD_OBJECT: {
      const object = action.payload;

      return Object.assign({}, state, {
        objectById: {
          ...state.objectById,
          ...{ [object.id]: object },
        },
        allObjects: [...state.allObjects, object.id],
      });
    }
    case UPDATE_OBJECT: {
      const object = action.payload;
      return Object.assign({}, state, {
        objectById: {
          ...state.objectById,
          ...{ [object.id]: { ...object } },
        },
      });
    }
    case DELETE_OBJECTS:
      const objectIds = action.payload;
      const objectById = omit(state.objectById, objectIds);
      const allObjects = without(state.allObjects, ...objectIds);
      return { ...state, objectById, allObjects };
    default:
      return state;
  }
}
