import { cloneDeep, forEach, forIn, forOwn, omit, without } from "lodash-es";
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
  SELECT_OBJECTS,
  NORMALIZE_OBJECT_GROUP,
  CLIPBOARD_PASTE_OBJECTS,
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
import { normalizeGroup } from "../../panels/stage-panel-new/normalize-group-utils";
import { store } from "../store";
import { getCopyName } from "../helpers/utils";

const getObjectsDefault = (): IObjects => ({
  objectById: {},
  allObjects: [],
  nextObjectNameNumber: {},
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
        nextObjectNameNumber: {
          ...state.nextObjectNameNumber,
          [object.type]: state.nextObjectNameNumber[object.type]
            ? state.nextObjectNameNumber[object.type] + 1
            : 2,
        },
      });

      // newState.nextObjectNameNumber[object.type] = newState.nextObjectNameNumber[object.type]
      //   ? newState.nextObjectNameNumber[object.type]+1
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
      console.log("DELETE_OBJECTS REDUCER");

      const objectIds = action.payload;

      // collect children objects id (e.g. for group))
      let childObjectIds: string[] = [];
      objectIds.forEach((objectId) => {
        const childObjIds = state.objectById[objectId]?.objectIds;
        if (childObjIds && childObjIds.length > 0) {
          childObjectIds = [...childObjectIds, ...childObjIds];
        }
      });

      let objectById = omit(state.objectById, [
        ...objectIds,
        ...childObjectIds,
      ]);

      // remove deleted objects from group
      forOwn(objectById, (object, id: any) => {
        objectById[id].objectIds = object.objectIds?.filter(
          (id) => !objectIds.includes(id)
        );
      });

      const allObjects = without(
        state.allObjects,
        ...[...objectIds, ...childObjectIds]
      );

      return { ...state, objectById, allObjects };
    }
    case GROUP_OBJECTS: {
      const { group, objectIds, groupIdsForRemoval, updatedObjectsById } =
        action.payload;

      let newState = cloneDeep(state);

      unlinkObjectIds(groupIdsForRemoval, newState.objectById);
      groupIdsForRemoval.forEach((groupId) => {
        delete newState.objectById[groupId];
      });

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
      newState.allObjects = newState.allObjects.filter(
        (id) => !groupIdsForRemoval.includes(id)
      );

      // console.log(newState);

      objectIds.forEach((objectId) => {
        newState.objectById[objectId] = updatedObjectsById[objectId];
        newState.objectById[objectId].parentId = group.id;
        //dispatch(_updateObject(object));
      });

      newState.nextObjectNameNumber["group"] = newState.nextObjectNameNumber[
        "group"
      ]
        ? newState.nextObjectNameNumber["group"] + 1
        : 2;

      return newState;
    }
    case CLIPBOARD_PASTE_OBJECTS: {
      const { newObjectMapping, objectIds, operation } = action.payload;

      const newState = cloneDeep(state);

      let oldObjectChildIds: string[] = [];

      objectIds.map((fromObjectId, idx) => {
        const newObjectId = newObjectMapping[idx].newObjectId;
        const fromObject = state.objectById[fromObjectId];
        const toObject = cloneDeep(fromObject);
        toObject.id = newObjectId;
        toObject.name =
          operation === "copy"
            ? getCopyName(state.objectById, toObject.name)
            : toObject.name;
        toObject.layerId = newObjectMapping[idx].toLayerId;
        toObject.parentId = newObjectMapping[idx].toLayerId;

        // // if (objectItem.positionMove) {
        // toObject.absoluteLayout!.common.left =
        //   parseFloat(toObject.absoluteLayout?.common.left!) + 20 + "px";
        // toObject.absoluteLayout!.common.top =
        //   parseFloat(toObject.absoluteLayout?.common.top!) + 20 + "px";
        // // }

        newState.allObjects.push(toObject.id);
        newState.objectById[toObject.id] = toObject;

        const child = newObjectMapping[idx].child;

        if (child) {
          toObject.objectIds = child.map((childItem) => childItem.newObjectId);

          child.map((childItem) => {
            oldObjectChildIds.push(childItem.objectId);
            const newObjectId = childItem.newObjectId;
            const fromObject = state.objectById[childItem.objectId];
            const toObject = cloneDeep(fromObject);
            toObject.id = newObjectId;
            toObject.parentId = childItem.toParentId;
            toObject.layerId = childItem.toLayerId;
            toObject.name =
              operation === "copy"
                ? getCopyName(state.objectById, toObject.name)
                : toObject.name;
            toObject.layerId = newObjectMapping[idx].toLayerId;
            // // if (objectItem.positionMove) {
            // toObject.absoluteLayout!.common.left =
            //   parseFloat(toObject.absoluteLayout?.common.left!) + 20 + "px";
            // toObject.absoluteLayout!.common.top =
            //   parseFloat(toObject.absoluteLayout?.common.top!) + 20 + "px";
            // // }
            newState.allObjects.push(toObject.id);
            newState.objectById[toObject.id] = toObject;
          });
        }
      });

      if (operation === "cut") {
        // remove id from parent group
        objectIds.map((fromObjectId, idx) => {
          const newObjectId = newObjectMapping[idx].newObjectId;
          const fromObject = state.objectById[fromObjectId];
          const parentObjectIds =
            state.objectById[fromObject.parentId!]?.objectIds;
          if (parentObjectIds && parentObjectIds.length > 0) {
            newState.objectById[fromObject.parentId!].objectIds =
              newState.objectById[fromObject.parentId!].objectIds?.filter(
                (id) => id !== fromObjectId
              );
          }
        });

        newState.objectById = omit(
          newState.objectById,
          ...[...objectIds, ...oldObjectChildIds]
        );
        newState.allObjects = without(
          newState.allObjects,
          ...[...objectIds, ...oldObjectChildIds]
        );
      }

      return newState;
    }
    case DUPLICATE: {
      // Note: this part duplicate object
      const newState = cloneDeep(state);
      const dS = action.payload;
      dS.forEach((slideItem) => {
        slideItem.childs.forEach((layerItem) => {
          layerItem.childs.forEach((rootObjectItem) => {
            [...[rootObjectItem], ...rootObjectItem.childs].forEach(
              (objectItem) => {
                const fromObject = state.objectById[objectItem.fromId];
                const toObject = cloneDeep(fromObject);
                toObject.id = objectItem.toId!; // CHEK THI !
                toObject.name = getCopyName(newState.objectById, toObject.name);
                toObject.layerId = layerItem.toId!;
                if (objectItem.newObjectIds)
                  toObject.objectIds = objectItem.newObjectIds;
                if (objectItem.newParentId)
                  toObject.parentId = objectItem.newParentId;

                if (objectItem.positionMove) {
                  // NOTE: LAYOUT CHANGE
                  toObject.left = toObject.left! + 20;
                  toObject.top = toObject.top! + 20;
                }

                //applyNewAnimationIdsToTransitionAbleElement(toObject);
                newState.allObjects.push(toObject.id);
                newState.objectById[toObject.id] = toObject;
              }
            );
          });
        });
      });
      return newState;
    }
    case MOVE_OBJECTS: {
      const payload = action.payload;
      const objectById = cloneDeep(state.objectById);

      // If layer are moved to "slide" update pageId on each layer
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

      //ungroupTransformCalc(groupId, objectIds);

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
      console.log("UNGROUP123");
      console.log([...newState.allObjects]);

      newState.allObjects = newState.allObjects.filter((id) => id !== groupId);
      console.log([...newState.allObjects]);

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
        // NOTE: LAYOUT CHANGE
        obj.left = transformPerObject[objId].left;
        obj.top = transformPerObject[objId].top;

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
    case NORMALIZE_OBJECT_GROUP: {
      const {
        objects: groups,
        breakpointConfiguration,
        layerById,
      } = action.payload;

      const updatedObjectsById: { [key: string]: IObject } = {};

      groups.map((group) => {
        const groupObjectsById: { [key: string]: IObject } = {};

        group.objectIds?.forEach((id) => {
          groupObjectsById[id] = state.objectById[id];
        });

        const { group: normalizedGroup, objects: normalizedObjects } =
          normalizeGroup(group, groupObjectsById, {
            objectById: state.objectById,
            breakpointConfig: breakpointConfiguration,
            layerById,
          });

        // apply group and objects
        updatedObjectsById[normalizedGroup.id] = normalizedGroup;
        normalizedObjects?.forEach((updatedObject) => {
          updatedObjectsById[updatedObject.id] = updatedObject;
        });
      });

      return {
        ...state,
        objectById: {
          ...state.objectById,
          ...updatedObjectsById,
        },
      };
    }
    case OPEN_PROJECT: {
      // action.payload.objects.allObjects.map((id: string) => {
      //   const object = action.payload.objects.objectById[id];
      //   object.definition.values = {
      //     ...getCommonPropertiesValues(),
      //     ...object.definition.values,
      //   };
      //   object.definition.valuesMetadata = {
      //     ...getCommonPropertiesMetadataValues(),
      //     ...object.definition.valuesMetadata,
      //   };
      // });

      return {
        ...action.payload.objects,
      };
    }
    case CREATE_NEW_PROJECT: {
      return getObjectsDefault();
    }
    // case SELECT_OBJECTS: {
    //   const { selectedObjectIds, selectionPath } = action.payload;

    //   // >>> NORMALIZE GROUP ON UNSELECT - START
    //   // if (state.selectedObjectIds) {
    //   // }
    //   // <<< NORMALIZE GROUP ON UNSELECT - END

    //   //console.log(selectionPath);
    //   return { ...state, selectedObjectIds, selectionPath };
    // }

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
