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
  REMOVE_LAYERS_FROM_SELECTION,
  SELECT_OBJECTS,
  ADD_OBJECTS_TO_SELECTION,
  REMOVE_OBJECTS_FROM_SELECTION,
  OPEN_PROJECT,
  CREATE_NEW_PROJECT,
  SELECT_FOR_PROPERTIES,
  selectForPropertiesProps,
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

  selectionForProperties: selectForPropertiesProps | null;
}

const getSelectionDefault = () => ({
  activeSlideId: null,
  activeLayerId: null,
  activeObjectId: null,
  selectedSlideIds: [],
  selectedLayerIds: [],
  selectedObjectIds: [],
  selectionForProperties: null, //{ type: "none", id: "" },
});

export function selection(
  state: ISelection = getSelectionDefault(),
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
      return {
        ...state,
        activeLayerId,
        activeObjectId: null,
        selectedObjectIds: [],
      };
    }
    case SELECT_FOR_PROPERTIES: {
      return {
        ...state,
        selectionForProperties: action.payload,
      };
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
    case SELECT_OBJECTS: {
      const selectedObjectIds = action.payload;

      return { ...state, selectedObjectIds };
    }

    case ADD_OBJECTS_TO_SELECTION: {
      const addObjectIds = action.payload;

      return update(state, {
        selectedObjectIds: {
          $apply: (selIds: string[]) => uniq(selIds.concat(addObjectIds)),
        },
      });
    }

    case REMOVE_OBJECTS_FROM_SELECTION: {
      const removeObjectIds = action.payload;

      return update(state, {
        selectedObjectIds: {
          $apply: (selIds: string[]) =>
            selIds.filter((id) => removeObjectIds.indexOf(id) === -1),
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
        selectionForProperties: {
          $apply: (curr) => {
            return curr && layerIds.indexOf(curr.id) !== -1 ? null : curr;
          },
        },
      });
    }
    case DELETE_SLIDE: {
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
            return activeId === action.payload.slideId ? null : activeId;
          },
        },
        selectedSlideIds: {
          $apply: (selIds: string[]) =>
            selIds.filter((id) => action.payload.slideId !== id),
        },
        selectionForProperties: {
          $apply: (curr) => {
            return curr && action.payload.slideId === curr.id ? null : curr;
          },
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
    case REMOVE_LAYERS_FROM_SELECTION: {
      const removeLayerIds = action.payload;

      return update(state, {
        selectedLayerIds: {
          $apply: (selIds: string[]) =>
            selIds.filter((id) => removeLayerIds.indexOf(id) === -1),
        },
      });
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

        selectedObjectIds: {
          $apply: (selIds: string[]) =>
            selIds.filter((id) => deletedObjectIds.indexOf(id) === -1),
        },

        selectionForProperties: {
          $apply: (curr) => {
            return curr && deletedObjectIds.indexOf(curr.id) !== -1
              ? null
              : curr;
          },
        },
      });
    }
    case OPEN_PROJECT: {
      return {
        ...action.payload.selection,
      };
    }
    case CREATE_NEW_PROJECT: {
      return getSelectionDefault();
    }
    default:
      return state;
  }
}
