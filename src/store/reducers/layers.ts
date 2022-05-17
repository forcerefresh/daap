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
} from "../actions/actions";
import update from "immutability-helper";
import { EmptyID } from "../types";
import { ILayers } from "./i-layers";
import {
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "../../objects/common-properties";

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
      return update(state, {
        layerById: {
          [object.layerId]: {
            objectIds: { $push: [object.id] },
            //nextObjectIdCounter: (idx) => idx + 1,
          },
        },
      });
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
      const deleteId = action.payload.slideId;
      const layersToDeleteIds: string[] = Object.values(state.layerById)
        .filter((layer) => layer.slideId === deleteId)
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

      forIn(newState.layerById, function (layer, _layerId) {
        if (layer.objectIds.indexOf(deleteObjectIds[0]) !== -1) {
          layerId = _layerId;
        }
      });

      // find layerId by first delete object id (all delete object ids belong to one layer)
      let layerId: string = EmptyID;
      forIn(state.layerById, function (layer, _layerId) {
        if (layer.objectIds.indexOf(deleteObjectIds[0]) !== -1) {
          layerId = _layerId;
        }
      });

      if (layerId === EmptyID) return state;

      return update(state, {
        layerById: {
          [layerId]: {
            objectIds: {
              $apply: (_layerIds: string[]) =>
                without(
                  state.layerById[layerId as string].objectIds,
                  ...deleteObjectIds
                ),
            },
          },
        },
      });
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
