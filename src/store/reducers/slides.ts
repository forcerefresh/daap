import { omit, without } from "lodash-es";
import {
  ActionTypes,
  ADD_LAYER,
  ADD_SLIDE,
  DELETE_SLIDE,
} from "../actions/actions";
import update from "immutability-helper";

export interface ISlide {
  id: string;
  name: string;
  layerIds: string[];
  nextLayerIdCounter: number;
}

export interface ISlides {
  slideById: { [id: string]: ISlide };
  allSlides: string[];
  nextSlideIdCounter: number;
}

export function slides(
  state: ISlides = { nextSlideIdCounter: 0, slideById: {}, allSlides: [] },
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

      console.log(state.slideById[layer.slideId].nextLayerIdCounter);
      return update(state, {
        slideById: {
          [layer.slideId]: {
            layerIds: { $push: [layer.id] },
            nextLayerIdCounter: (idx) => idx + 1,
          },
        },
      });

      /*const slideId = layer.slideId;
      const slide = { ...state.slideById[slideId] };
      slide.layerIds.push(layer.id);

      return {
        ...state,
        ...{ slideById: { ...state.slideById, ...{ [slide.id]: slide } } },
      };*/
    }
    default:
      return state;
  }
}
