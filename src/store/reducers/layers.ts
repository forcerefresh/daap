import { forIn, omit, without } from "lodash-es";
import {
  ActionTypes,
  ADD_LAYER,
  ADD_OBJECT,
  DELETE_LAYERS,
  DELETE_OBJECTS,
  DELETE_SLIDE,
  OPEN_PROJECT,
  UPDATE_LAYER,
} from "../actions/actions";
import update from "immutability-helper";
import { EmptyID } from "../types";
import { ILayers } from "./i-layers";

export function layers(
  state: ILayers = { layerById: {}, allLayers: [] },
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
    case OPEN_PROJECT: {
      return {
        ...action.payload.layers,
      };
    }
    default:
      return state;
  }
}
