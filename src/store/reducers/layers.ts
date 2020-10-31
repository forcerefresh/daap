import { omit, without } from "lodash-es";
import {
  ActionTypes,
  ADD_LAYER,
  ADD_OBJECT,
  DELETE_LAYERS,
  DELETE_SLIDE,
} from "../actions/actions";
import update from "immutability-helper";

export interface ILayer {
  id: string;
  slideId: string;
  name: string;
  isVisible: boolean;
  hasTimeline: boolean;
  objectIds: string[];
}

export interface ILayers {
  layerById: { [id: string]: ILayer };
  allLayers: string[];
}

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
    default:
      return state;
  }
}
