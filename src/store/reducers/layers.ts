import { cloneDeep, compact, forIn, omit, remove, without } from "lodash-es";
import {
  ActionTypes,
  ADD_LAYER,
  ADD_OBJECT,
  CREATE_NEW_PROJECT,
  DELETE_LAYERS,
  DELETE_OBJECTS,
  DELETE_SLIDE,
  DUPLICATE,
  MOVE_OBJECTS,
  OPEN_PROJECT,
  UPDATE_LAYER,
  MOVE_LAYERS,
  GROUP_OBJECTS,
  UNGROUP_OBJECTS,
  CLIPBOARD_PASTE_OBJECTS,
  REPLACE_OBJECT,
} from "../actions/actions";
import update from "immutability-helper";
import { ILayers } from "./i-layers";

const getLayersDefault = () => ({ layerById: {}, allLayers: [] });

export function layers(
  state: ILayers = getLayersDefault(),
  action: ActionTypes
) {
  switch (action.type) {
    case ADD_LAYER: {
      const layer = action.payload;

      return Object.assign({}, state, {
        layerById: {
          ...state.layerById,
          ...{ [layer.id]: layer },
        },
        allLayers: [...state.allLayers, layer.id],
      });
    }
    case UPDATE_LAYER: {
      const layer = action.payload;
      return Object.assign({}, state, {
        layerById: {
          ...state.layerById,
          ...{ [layer.id]: { ...layer } },
        },
      });
    }
    case ADD_OBJECT: {
      const object = action.payload;

      //  condition to prevent adding object to layer when object is added to group
      if (object.parentId && state.layerById[object.parentId]) {
        return update(state, {
          layerById: {
            [object.layerId]: {
              objectIds: { $push: [object.id] },
            },
          },
        });
      }

      return state;
    }

    // TODO: this does not work when object is in the group
    case REPLACE_OBJECT: {
      const { replaceObjectId, object } = action.payload;

      const newState = cloneDeep(state);
      const layer = newState.layerById[object.layerId];

      const idx = layer.objectIds.findIndex((value) => {
        return value === replaceObjectId;
      });

      if (idx !== -1) {
        newState.layerById[object.layerId].objectIds[idx] = object.id;
      }

      return newState;
    }

    case GROUP_OBJECTS: {
      const { group, objectIds, groupIdsForRemoval } = action.payload;

      // do nothing if parent is not
      if (!state.layerById[group.parentId!]) {
        return state;
      }

      const newState = cloneDeep(state);

      // get index for group add
      let firstIndex = 0;
      newState.layerById[group.parentId!].objectIds?.forEach((id, idx) => {
        if (!firstIndex && objectIds.includes(id)) {
          firstIndex = idx;
        }
      });

      // remove object
      forIn(newState.layerById, function (layer, _layerId) {
        remove(layer.objectIds, (objectId) => {
          // note, remove object or removed groups
          return (
            objectIds.indexOf(objectId) !== -1 ||
            groupIdsForRemoval.indexOf(objectId) !== -1
          );
        });
      });

      // add group

      // only if parentId is layer (exist)
      newState.layerById[group.parentId!].objectIds.splice(
        firstIndex,
        0,
        group.id
      );

      return newState;
    }
    case UNGROUP_OBJECTS: {
      const { groupId, parentId, objectIds } = action.payload;

      const newState = cloneDeep(state);

      if (newState.layerById[parentId]) {
        newState.layerById[parentId].objectIds = without(
          newState.layerById[parentId].objectIds,
          groupId
        );
        newState.layerById[parentId].objectIds = [
          ...newState.layerById[parentId].objectIds,
          ...objectIds,
        ];
      }

      return newState;
    }
    case CLIPBOARD_PASTE_OBJECTS: {
      const { newObjectMapping, objectIds, operation } = action.payload;

      const newState = cloneDeep(state);
      newObjectMapping.forEach((objectMap) => {
        const layer = newState.layerById[objectMap.toLayerId];
        layer.objectIds.push(objectMap.newObjectId);
      });

      if (operation === "cut") {
        forIn(newState.layerById, function (layer, _layerId) {
          remove(layer.objectIds, (objectId) => {
            return objectIds.indexOf(objectId) !== -1;
          });
        });
      }

      return newState;
    }
    case DUPLICATE: {
      // Note: this part duplicate object
      const newState = cloneDeep(state);
      const dS = action.payload;
      dS.forEach((slideItem) => {
        slideItem.childs.forEach((layerItem) => {
          const fromLayer = state.layerById[layerItem.fromId];

          if (!layerItem.skipCreate) {
            const toLayer = cloneDeep(fromLayer);
            toLayer.id = layerItem.toId!;
            toLayer.name += " (copy)";
            toLayer.objectIds = layerItem.childs.map((item) => item.toId!);
            toLayer.pageId = slideItem.toId!;
            newState.allLayers.push(toLayer.id);
            newState.layerById[toLayer.id] = toLayer;
          } else {
            const toLayer = cloneDeep(fromLayer);
            // add new layer ids if skipCreate is not true
            const objectIdToAdd = layerItem.childs.map((item) =>
              item.skipCreate ? undefined : item.toId!
            );
            toLayer.objectIds = [
              ...toLayer.objectIds,
              ...compact(objectIdToAdd),
            ];
            toLayer.pageId = slideItem.toId!;
            newState.layerById[toLayer.id] = toLayer;
          }
        });
      });
      return newState;
    }
    case DELETE_LAYERS: {
      const layersToDeleteIds = action.payload;

      const layerById = omit(state.layerById, layersToDeleteIds);
      const allLayers = without(state.allLayers, ...layersToDeleteIds);
      return { ...state, layerById, allLayers };
    }
    case DELETE_SLIDE: {
      const deleteId = action.payload.pageId;
      const layersToDeleteIds: string[] = Object.values(state.layerById)
        .filter((layer) => layer.pageId === deleteId)
        .map((layer) => layer.id);

      const layerById = omit(state.layerById, layersToDeleteIds);
      const allLayers = without(state.allLayers, ...layersToDeleteIds);
      return { ...state, layerById, allLayers };
    }

    case DELETE_OBJECTS: {
      const deleteObjectIds = action.payload;
      const newState = cloneDeep(state);

      forIn(newState.layerById, function (layer, _layerId) {
        remove(layer.objectIds, (objectId) => {
          return deleteObjectIds.indexOf(objectId) !== -1;
        });
      });

      return newState;
    }
    case MOVE_OBJECTS: {
      const payload = action.payload;
      const layerById = cloneDeep(state.layerById);

      forIn(layerById, function (layer, _layerId) {
        remove(layer.objectIds, (id) => {
          return payload.moveIds.indexOf(id) !== -1;
        });
      });

      // add object above object id
      if (payload.where === "above") {
        forIn(layerById, function (layer, _layerId) {
          const idx = layer.objectIds.indexOf(payload.refId);
          if (idx != -1) {
            layer.objectIds.splice(idx, 0, ...payload.moveIds);
          }
        });
      }

      // add object below object id
      if (payload.where === "below") {
        forIn(layerById, function (layer, _layerId) {
          const idx = layer.objectIds.indexOf(payload.refId);
          if (idx != -1) {
            layer.objectIds.splice(idx + 1, 0, ...payload.moveIds);
          }
        });
      }

      // add object in layer (at bottom)
      if (payload.where === "layer") {
        layerById[payload.refId].objectIds.splice(
          layerById[payload.refId].objectIds.length,
          0,
          ...payload.moveIds
        );
      }

      return { ...state, layerById };
    }

    case MOVE_LAYERS: {
      const payload = action.payload;
      const layerById = cloneDeep(state.layerById);

      // If layer are moved to "slide" update pageId on each layer
      if (payload.where === "slide") {
        forIn(layerById, function (layer, _layerId) {
          if (payload.moveIds.indexOf(layer.id) !== -1) {
            layer.pageId = payload.refId;
          }
        });
      }

      return { ...state, layerById };
    }

    case OPEN_PROJECT: {
      return {
        ...action.payload.layers,
      };
    }
    case CREATE_NEW_PROJECT: {
      return getLayersDefault();
    }
    default:
      return state;
  }
}

