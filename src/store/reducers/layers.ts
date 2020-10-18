import { omit, without } from "lodash-es";
import { ActionTypes, ADD_LAYER, DELETE_SLIDE } from "../actions/actions";

export interface ILayer {
  id: string;
  slideId: string;
  name: string;
  isVisible: boolean;
  hasTimeline: boolean;
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
    case ADD_LAYER:
      const layer = action.payload;

      return Object.assign({}, state, {
        layerById: {
          ...state.layerById,
          ...{ [layer.id]: layer },
        },
        allLayers: [...state.allLayers, layer.id],
      });
    case DELETE_SLIDE:
      const deleteId = action.payload.slideId;
      const layersToDeleteIds: string[] = Object.values(state.layerById)
        .filter((layer) => layer.slideId === deleteId)
        .map((layer) => layer.id);

      const layerById = omit(state.layerById, layersToDeleteIds);
      const allLayers = without(state.allLayers, ...layersToDeleteIds);
      return { ...state, layerById, allLayers };
    default:
      return state;
  }
}
