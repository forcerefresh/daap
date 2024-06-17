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
  GROUP_OBJECTS,
  UNGROUP_OBJECTS,
} from "../actions/actions";
import { IObjects } from "./i-objects";
import {
  IObject,
  ITransition,
  ITransitionAble,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";
import { ungroupTransformCalc } from "./layers";
import { unlinkObjectIds } from "../actions/actions-utils";

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

      const newState = Object.assign({}, state, {
        objectById: {
          ...state.objectById,
          ...{ [object.id]: object },
        },
        allObjects: [...state.allObjects, object.id],
        nextObjectId: {
          ...state.nextObjectId,
          [object.type]: state.nextObjectId[object.type]
            ? state.nextObjectId[object.type] + 1
            : 2,
        },
      });

      // newState.nextObjectId[object.type] = newState.nextObjectId[object.type]
      //   ? newState.nextObjectId[object.type]+1
      //   : 2;

      //console.log(newState);

      // add to parent object parentObject.objectIds
      if (object.parentId && newState.objectById[object.parentId]) {
        if (!newState.objectById[object.parentId].objectIds) {
          newState.objectById[object.parentId].objectIds = [];
        }

        newState.objectById[object.parentId].objectIds!.push(object.id);
      }

      return newState;
    }
    case UPDATE_OBJECT: {
      const object = action.payload;

      return {
        ...state,
        objectById: {
          ...state.objectById,
          ...{ [object.id]: { ...object } },
        },
      };

      // return Object.assign({}, state, {
      //   objectById: {
      //     ...state.objectById,
      //     ...{ [object.id]: { ...object } },
      //   },
      // });
    }
    case DELETE_OBJECTS: {
      const objectIds = action.payload;
      const objectById = omit(state.objectById, objectIds);
      const allObjects = without(state.allObjects, ...objectIds);
      return { ...state, objectById, allObjects };
    }
    case GROUP_OBJECTS: {
      const { group, objectIds } = action.payload;

      let newState = cloneDeep(state);

      // get index for group add
      let firstIndex = 0;
      if (newState.objectById[group.parentId!]) {
        newState.objectById[group.parentId!].objectIds?.forEach((id, idx) => {
          if (!firstIndex && objectIds.includes(id)) {
            firstIndex = idx;
          }
        });
      }

      unlinkObjectIds(objectIds, newState.objectById);

      newState.objectById[group.id] = group;

      // if parent is object group
      if (newState.objectById[group.parentId!]) {
        newState.objectById[group.parentId!].objectIds?.splice(
          firstIndex,
          0,
          group.id
        ); // TODO instead of push replace on existing index
      }

      // const newState = Object.assign({}, state, {
      //   objectById: {
      //     ...state.objectById,
      //     ...{ [group.id]: { ...group } },
      //   },
      // });

      newState.allObjects.push(group.id);
      // console.log(newState);

      objectIds.forEach((objectId) => {
        newState.objectById[objectId].parentId = group.id;
        //dispatch(_updateObject(object));
      });

      newState.nextObjectId["group"] = newState.nextObjectId["group"]
        ? newState.nextObjectId["group"] + 1
        : 2;

      return newState;
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
      } else if (payload.where === "above") {
        const toLayerId = state.objectById[payload.refId].layerId;
        forIn(objectById, function (object, _objectId) {
          if (payload.moveIds.indexOf(object.id) !== -1) {
            object.layerId = toLayerId;
          }
        });
      }

      return { ...state, objectById };
    }

    case UNGROUP_OBJECTS: {
      const { groupId, objectIds, parentId, transformPerObject } =
        action.payload;

      ungroupTransformCalc(groupId, objectIds);

      const groupObject = state.objectById[groupId];

      const newState = cloneDeep(state);

      // get index for objects add
      let firstIndex = 0;
      if (newState.objectById[groupObject.parentId!]) {
        newState.objectById[groupObject.parentId!].objectIds?.forEach(
          (id, idx) => {
            if (!firstIndex && id === groupObject.id) {
              firstIndex = idx;
            }
          }
        );
      }

      // remove group id from parent
      if (newState.objectById[groupObject.parentId!]) {
        newState.objectById[groupObject.parentId!].objectIds =
          newState.objectById[groupObject.parentId!].objectIds?.filter(
            (id) => id !== groupId
          );
      }

      // layerId
      const layerId = newState.objectById[groupId].layerId;

      // remove group object
      delete newState.objectById[groupId];

      // let objectById: { [id: string]: IObject<{}> } = omit(state.objectById, [
      //   groupId,
      // ]);

      // remove group id from allObjects
      newState.allObjects = newState.allObjects.filter((id) => id !== groupId);

      if (newState.objectById[parentId!]) {
        newState.objectById[parentId!].objectIds?.splice(
          firstIndex,
          0,
          ...objectIds
        );
      }

      //const updatedObjectById: { [key: string]: IObject } = {};
      objectIds.forEach((objId: string) => {
        const obj: IObject = {
          ...newState.objectById[objId],
          scale: transformPerObject[objId].scale,
          rotation: transformPerObject[objId].rotation,
        };
        obj.absoluteLayout!.common.left = transformPerObject[objId].left + "px";
        obj.absoluteLayout!.common.top = transformPerObject[objId].top + "px";

        obj.parentId = parentId;
        obj.layerId = layerId;
        // obj.absoluteLayout!.common.left =
        //   parseInt(obj.absoluteLayout!.common.left) +
        //   parseInt(groupObject.absoluteLayout!.common.left) +
        //   "px";
        // obj.absoluteLayout!.common.top =
        //   parseInt(obj.absoluteLayout!.common.top) +
        //   parseInt(groupObject.absoluteLayout!.common.top) +
        //   "px";
        newState.objectById[obj.id] = obj;
      });

      return newState;

      // objectById = {
      //   ...objectById,
      //   ...updatedObjectById,
      // };

      // return { ...state, objectById, allObjects };
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
