import { cloneDeep, forIn, omit, remove, without } from "lodash-es";
import {
  ActionTypes,
  ADD_LAYER,
  ADD_SLIDE,
  CREATE_NEW_PROJECT,
  DELETE_LAYERS,
  DELETE_SLIDE,
  MOVE_LAYERS,
  MOVE_SLIDES,
  OPEN_PROJECT,
  UPDATE_SLIDE,
} from "../actions/actions";
import update from "immutability-helper";
import { EmptyID } from "../types";
import { ISlides, SlideType } from "./i-slides";

const getSlidesDefault = () => ({
  nextSlideIdCounter: 1,
  slideById: {},
  allSlides: [],
  normalSlides: [],
  frontSlides: [],
  backSlides: [],
});

export function slides(
  state: ISlides = getSlidesDefault(),
  action: ActionTypes
) {
  switch (action.type) {
    case ADD_SLIDE: {
      const slide = action.payload;

      const allSlides = [...state.allSlides, slide.id];

      const frontSlides =
        slide.slideType === SlideType.Front
          ? [...state.frontSlides, slide.id]
          : state.frontSlides;

      const backSlides =
        slide.slideType === SlideType.Back
          ? [...state.backSlides, slide.id]
          : state.backSlides;

      const normalSlides =
        slide.slideType === SlideType.Normal
          ? [...state.normalSlides, slide.id]
          : state.normalSlides;

      return Object.assign({}, state, {
        slideById: {
          ...state.slideById,
          ...{ [slide.id]: slide },
        },
        allSlides,
        normalSlides,
        frontSlides,
        backSlides,
        nextSlideIdCounter:
          slide.slideType === SlideType.Normal
            ? state.nextSlideIdCounter + 1
            : state.nextSlideIdCounter,
      });
    }
    case DELETE_SLIDE: {
      const deleteId = action.payload.slideId;
      const slideById = omit(state.slideById, [deleteId]);
      const allSlides = without(state.allSlides, deleteId);
      const normalSlides = without(state.normalSlides, deleteId);
      const frontSlides = without(state.frontSlides, deleteId);
      const backSlides = without(state.backSlides, deleteId);

      return {
        ...state,
        slideById,
        allSlides,
        normalSlides,
        backSlides,
        frontSlides,
      };
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
    case MOVE_LAYERS: {
      const payload = action.payload;
      const slideById = cloneDeep(state.slideById);

      forIn(slideById, function (slide, _slideId) {
        remove(slide.layerIds, (id) => {
          return payload.moveIds.indexOf(id) !== -1;
        });
      });

      // add layers above layer id
      if (payload.where === "above") {
        forIn(slideById, function (slide, _slideId) {
          const idx = slide.layerIds.indexOf(payload.refId);
          if (idx != -1) {
            slide.layerIds.splice(idx, 0, ...payload.moveIds);
          }
        });
      }

      // add object in layer (at bottom)
      if (payload.where === "slide") {
        slideById[payload.refId].layerIds.splice(
          slideById[payload.refId].layerIds.length,
          0,
          ...payload.moveIds
        );
      }

      return { ...state, slideById };
    }

    case MOVE_SLIDES: {
      const payload = action.payload;
      const normalSlides = cloneDeep(state.normalSlides);

      remove(normalSlides, (id) => {
        return payload.moveIds.indexOf(id) !== -1;
      });

      // add layers above layer id
      if (payload.where === "above") {
        const idx = normalSlides.indexOf(payload.refId);
        if (idx != -1) {
          normalSlides.splice(idx, 0, ...payload.moveIds);
        }
      }

      // add object in layer (at bottom)
      if (payload.where === "bottom") {
        normalSlides.splice(normalSlides.length, 0, ...payload.moveIds);
      }

      return { ...state, normalSlides };
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
