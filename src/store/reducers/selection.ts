import {
  ActionTypes,
  ACTIVATE_SLIDE,
  ADD_SLIDES_TO_SELECTION,
  DELETE_SLIDE,
  REMOVE_SLIDES_FROM_SELECTION,
  SELECT_SLIDES,
  ADD_LAYERS_TO_SELECTION,
  DELETE_LAYERS,
  ACTIVATE_LAYER,
  SELECT_LAYERS,
  ACTIVATE_OBJECT,
  DELETE_OBJECTS,
} from "../actions/actions";
import update from "immutability-helper";
import { cloneDeep, uniq } from "lodash-es";

export interface ISelection {
  activeSlideId: string | null;
  activeLayerId: string | null;
  activeObjectId: string | null;
  selectedSlideIds: string[];
  selectedLayerIds: string[];
  selectedObjectIds: string[];
}
export function selection(
  state: ISelection = {
    activeSlideId: null,
    activeLayerId: null,
    activeObjectId: null,
    selectedSlideIds: [],
    selectedLayerIds: [],
    selectedObjectIds: [],
  },
  action: ActionTypes
) {
  switch (action.type) {
    case ACTIVATE_SLIDE: {
      const activeSlideId = action.payload;

      // reset layerSelection (selectedLayerIds: [])
      return {
        ...state,
        activeSlideId,
        activeLayerId: null,
        selectedLayerIds: [],
        activeObjectId: null,
        selectedObjectIds: [],
      };
    }
    case ACTIVATE_LAYER: {
      const activeLayerId = action.payload;

      // reset layerSelection (selectedLayerIds: [])
      return { ...state, activeLayerId };
    }
    case ACTIVATE_OBJECT: {
      const activeObjectId = action.payload;

      // reset layerSelection (selectedLayerIds: [])
      return { ...state, activeObjectId };
    }
    case SELECT_SLIDES: {
      const selectedSlideIds = action.payload;

      return { ...state, selectedSlideIds };
    }
    case SELECT_LAYERS: {
      const selectedLayerIds = action.payload;

      return { ...state, selectedLayerIds };
    }

    case ADD_SLIDES_TO_SELECTION: {
      const selectedSlideIds = action.payload;

      return update(state, {
        selectedSlideIds: {
          $apply: (selIds: string[]) => uniq(selIds.concat(selectedSlideIds)),
        },
      });
    }
    case REMOVE_SLIDES_FROM_SELECTION: {
      const selectedSlideIds = action.payload;

      return update(state, {
        selectedSlideIds: {
          $apply: (selIds: string[]) =>
            selIds.filter((id) => selectedSlideIds.indexOf(id) === -1),
        },
      });
    }
    case DELETE_LAYERS: {
      const layerIds = action.payload;
      return update(state, {
        activeLayerId: {
          $apply: (activeId) =>
            layerIds.indexOf(activeId as string) === -1 ? activeId : null,
        },
        selectedLayerIds: {
          $apply: (selIds: string[]) =>
            selIds.filter((id) => layerIds.indexOf(id) === -1),
        },
      });
    }
    case DELETE_SLIDE: {
      console.log(action);
      return update(state, {
        activeObjectId: {
          $apply: (activeId) => null,
        },
        selectedObjectIds: {
          $apply: () => [],
        },
        activeLayerId: {
          $apply: (activeId) => null,
        },
        selectedLayerIds: {
          $apply: () => [],
        },
        activeSlideId: {
          $apply: (activeId) => {
            console.log(activeId);
            console.log(action.payload.slideId);
            return activeId === action.payload.slideId ? null : activeId;
          },
        },
        selectedSlideIds: {
          $apply: (selIds: string[]) =>
            selIds.filter((id) => action.payload.slideId !== id),
        },
      });
    }
    case ADD_LAYERS_TO_SELECTION: {
      const addLayerIds = action.payload;

      return update(state, {
        selectedLayerIds: {
          $apply: (selIds: string[]) => uniq(selIds.concat(addLayerIds)),
        },
      });
    }
    case DELETE_LAYERS: {
      return { ...state }; // TODO, selectedLayerIds };
    }
    case DELETE_OBJECTS: {
      const deletedObjectIds = action.payload;

      return update(state, {
        activeObjectId: {
          $apply: (activeId) => {
            return deletedObjectIds.indexOf(activeId as string) !== -1
              ? null
              : activeId;
          },
        },
      });
      return;
    }
    default:
      return state;
  }
}
