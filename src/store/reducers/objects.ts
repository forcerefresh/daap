import { omit, without } from "lodash-es";
import { IObject } from "../../objects/types";
import { ActionTypes, ADD_OBJECT, UPDATE_OBJECT } from "../actions/actions";

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
      console.log(object  );
      return Object.assign({}, state, {
        objectById: {
          ...state.objectById,
          ...{ [object.id]: { ...object } },
        },
      });
    }
    default:
      return state;
  }
}
