import { forIn, omit, without } from "lodash-es";
import {
  ActionTypes,
  ADD_LAYER,
  ADD_SLIDE,
  CREATE_NEW_PROJECT,
  DELETE_LAYERS,
  DELETE_SLIDE,
  OPEN_PROJECT,
  UPDATE_SLIDE,
} from "../actions/actions";
import update from "immutability-helper";
import { EmptyID } from "../types";
import { ISlides } from "./i-slides";

const getSlidesDefault = () => ({
  nextSlideIdCounter: 1,
  slideById: {},
  allSlides: [],
});

export function slides(
  state: ISlides = getSlidesDefault(),
  action: ActionTypes
) {
  switch (action.type) {
    case ADD_SLIDE: {
      const slide = action.payload;

      return Object.assign({}, state, {
        slideById: {
          ...state.slideById,
          ...{ [slide.id]: slide },
        },
        allSlides: [...state.allSlides, slide.id],
        nextSlideIdCounter: state.nextSlideIdCounter + 1,
      });
    }
    case DELETE_SLIDE: {
      const deleteId = action.payload.slideId;
      const slideById = omit(state.slideById, [deleteId]);
      const allSlides = without(state.allSlides, deleteId);
      return { ...state, slideById, allSlides };
    }
    case ADD_LAYER: {
      const layer = action.payload;

      return update(state, {
        slideById: {
          [layer.slideId]: {
            layerIds: { $push: [layer.id] },
            nextLayerIdCounter: (idx) => idx + 1,
          },
        },
      });
    }
    case UPDATE_SLIDE: {
      const slide = action.payload;

      return Object.assign({}, state, {
        slideById: {
          ...state.slideById,
          ...{ [slide.id]: { ...slide } },
        },
      });
    }
    case DELETE_LAYERS: {
      const deleteLayerIds = action.payload;

      // find slideId by first delete layer id (all delete layer ids belong to one slide)
      let slideId: string = EmptyID;
      forIn(state.slideById, function (slide, _slideId) {
        if (slide.layerIds.indexOf(deleteLayerIds[0]) !== -1) {
          slideId = _slideId;
        }
      });

      if (slideId === EmptyID) return state;

      return update(state, {
        slideById: {
          [slideId]: {
            layerIds: {
              $apply: (_layerIds: string[]) =>
                without(
                  state.slideById[slideId as string].layerIds,
                  ...deleteLayerIds
                ),
            },
          },
        },
      });
    }
    case OPEN_PROJECT: {
      return {
        ...action.payload.slides,
      };
    }
    case CREATE_NEW_PROJECT: {
      return getSlidesDefault();
    }
    default:
      return state;
  }
}
