import { cloneDeep, forEach, forIn, omit, without } from "lodash-es";
import { object } from "yup";
import {
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";
import {
  ActionTypes,
  ADD_OBJECT,
  CREATE_NEW_PROJECT,
  DELETE_OBJECTS,
  DUPLICATE,
  OPEN_PROJECT,
  UPDATE_OBJECT,
  MOVE_OBJECTS,
} from "../actions/actions";
import { IObjects } from "./i-objects";
import {
  IObject,
  ITransition,
  ITransitionAble,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";

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
            applyNewAnimationIdsToTransitionAbleElement(toObject);
            newState.allObjects.push(toObject.id);
            newState.objectById[toObject.id] = toObject;
          });
        });
      });
      return newState;
    }
    case MOVE_OBJECTS: {
      const payload = action.payload;
      const objectById = cloneDeep(state.objectById);

      // If layer are moved to "slide" update slideId on each layer
      if (payload.where === "layer") {
        forIn(objectById, function (object, _objectId) {
          if (payload.moveIds.indexOf(object.id) !== -1) {
            object.layerId = payload.refId;
          }
        });
      }

      return { ...state, objectById };
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

export function applyNewAnimationIdsToTransitionAbleElement(
  object: ITransitionAble
) {
  Object.keys(object.transitions).forEach((key: string) => {
    const animArr = (object.transitions as any)[key];
    animArr.forEach((anim: ITransition) => {
      anim.uid = uuid();
    });
  });
}
