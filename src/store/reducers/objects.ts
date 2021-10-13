import { omit, without } from "lodash-es";
import {
  ActionTypes,
  ADD_OBJECT,
  CREATE_NEW_PROJECT,
  DELETE_OBJECTS,
  OPEN_PROJECT,
  UPDATE_OBJECT,
} from "../actions/actions";
import { IObjects } from "./i-objects";

const getObjectsDefault = () => ({ objectById: {}, allObjects: [] });

export function objects(
  state: IObjects = getObjectsDefault(),
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
    case OPEN_PROJECT: {
      return {
        ...action.payload.objects,
      };
    }
    case CREATE_NEW_PROJECT: {
      return getObjectsDefault();
    }
    default:
      return state;
  }
}
