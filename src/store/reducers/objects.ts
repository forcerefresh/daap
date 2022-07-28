import { cloneDeep, omit, without } from "lodash-es";
import { object } from "yup";
import {
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "../../webslider-sdk/src/objects/common-properties";
import {
  ActionTypes,
  ADD_OBJECT,
  CREATE_NEW_PROJECT,
  DELETE_OBJECTS,
  DUPLICATE,
  OPEN_PROJECT,
  UPDATE_OBJECT,
} from "../actions/actions";
import { IObjects } from "./i-objects";

const getObjectsDefault = (): IObjects => ({
  objectById: {},
  allObjects: [],
  nextObjectId: {},
});

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
        nextObjectId: {
          ...state.nextObjectId,
          [object.type]: state.nextObjectId[object.type]
            ? state.nextObjectId[object.type]++
            : 2,
        },
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
    case DELETE_OBJECTS: {
      const objectIds = action.payload;
      const objectById = omit(state.objectById, objectIds);
      const allObjects = without(state.allObjects, ...objectIds);
      return { ...state, objectById, allObjects };
    }
    case DUPLICATE: {
      // Note: this part duplicate object
      const newState = cloneDeep(state);
      const dS = action.payload;
      dS.forEach((slideItem) => {
        slideItem.childs.forEach((layerItem) => {
          layerItem.childs.forEach((objectItem) => {
            const fromObject = state.objectById[objectItem.fromId];
            const toObject = cloneDeep(fromObject);
            toObject.id = objectItem.toId!; // CHEK THI !
            toObject.name += " (copy)";
            toObject.layerId = layerItem.toId!;
            newState.allObjects.push(toObject.id);
            newState.objectById[toObject.id] = toObject;
          });
        });
      });
      return newState;
    }
    case OPEN_PROJECT: {
      action.payload.objects.allObjects.map((id: string) => {
        const object = action.payload.objects.objectById[id];
        object.definition.values = {
          ...getCommonPropertiesValues(),
          ...object.definition.values,
        };
        object.definition.valuesMetadata = {
          ...getCommonPropertiesMetadataValues(),
          ...object.definition.valuesMetadata,
        };
      });

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
