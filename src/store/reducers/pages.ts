import { cloneDeep, compact, forIn, omit, remove, without } from "lodash-es";
import {
  ActionTypes,
  ADD_LAYER,
  ADD_SLIDE,
  CREATE_NEW_PROJECT,
  DELETE_LAYERS,
  DELETE_SLIDE,
  DUPLICATE,
  MOVE_LAYERS,
  MOVE_SLIDES,
  OPEN_PROJECT,
  UPDATE_SLIDE,
} from "../actions/actions";
import update from "immutability-helper";
import { EmptyID } from "../types";
import { IPage, IPages, PageType } from "./i-pages";
import { applyNewAnimationIdsToTransitionAbleElement } from "./objects";

const getPagesDefault = () => ({
  nextPageNameNumber: 1,
  pageById: {},
  // allPages: [],
  pages: [],
  // loadPages: [],
  // frontPages: [],
  // backPages: [],
});

export function pages(state: IPages = getPagesDefault(), action: ActionTypes) {
  switch (action.type) {
    case ADD_SLIDE: {
      const page = action.payload.slide;
      const position = action.payload.position;

      // const allPages = [...state.allPages, page.id];

      const loadPages =
        page.type === PageType.Load
          ? [...(state.loadPages ?? []), page.id]
          : state.loadPages;

      const frontPages =
        page.type === PageType.Front
          ? [...(state.frontPages ?? []), page.id]
          : state.frontPages;

      const backPages =
        page.type === PageType.Back
          ? [...(state.backPages ?? []), page.id]
          : state.backPages;

      let pages = cloneDeep(state.pages);
      if (!page.type || page.type === PageType.Normal) {
        if (!position) pages.push(page.id);
        else pages.splice(position, 0, page.id);
      }

      return Object.assign({}, state, {
        pageById: {
          ...state.pageById,
          ...{ [page.id]: page },
        },
        // allPages,
        pages,
        loadPages: loadPages,
        frontPages: frontPages,
        backPages: backPages,
        nextPageNameNumber:
          !page.type || page.type === PageType.Normal
            ? state.nextPageNameNumber + 1
            : state.nextPageNameNumber,
      } satisfies IPages);
    }
    case DELETE_SLIDE: {
      const deleteId = action.payload.pageId;
      const pageById = omit(state.pageById, [deleteId]);
      // const allPages = without(state.allPages, deleteId);
      const pages = without(state.pages, deleteId);
      const loadPages = without(state.loadPages, deleteId);
      const frontPages = without(state.frontPages, deleteId);
      const backPages = without(state.backPages, deleteId);

      return {
        ...state,
        pageById,
        // allPages,
        pages,
        loadPages,
        backPages,
        frontPages,
      };
    }
    case ADD_LAYER: {
      const layer = action.payload;

      return update(state, {
        pageById: {
          [layer.pageId]: {
            layerIds: { $push: [layer.id] },
            nextLayerNameNumber: (idx) => idx + 1,
          },
        },
      });
    }
    case UPDATE_SLIDE: {
      const slide = action.payload;

      return Object.assign({}, state, {
        pageById: {
          ...state.pageById,
          ...{ [slide.id]: { ...slide } },
        },
      } satisfies Partial<IPages>);
    }
    case DELETE_LAYERS: {
      const deleteLayerIds = action.payload;

      // find pageId by first delete layer id (all delete layer ids belong to one slide)
      let pageId: string = EmptyID;
      forIn(state.pageById, function (slide, _pageId) {
        if (slide.layerIds.indexOf(deleteLayerIds[0]) !== -1) {
          pageId = _pageId;
        }
      });

      if (pageId === EmptyID) return state;

      return update(state, {
        pageById: {
          [pageId]: {
            layerIds: {
              $apply: (_layerIds: string[]) =>
                without(
                  state.pageById[pageId as string].layerIds,
                  ...deleteLayerIds
                ),
            },
          },
        },
      });
    }
    case MOVE_LAYERS: {
      const payload = action.payload;
      const pageById = cloneDeep(state.pageById);

      forIn(pageById, function (slide, _pageId) {
        remove(slide.layerIds, (id) => {
          return payload.moveIds.indexOf(id) !== -1;
        });
      });

      // add layers above layer id
      if (payload.where === "above") {
        forIn(pageById, function (slide, _pageId) {
          const idx = slide.layerIds.indexOf(payload.refId);
          if (idx !== -1) {
            slide.layerIds.splice(idx, 0, ...payload.moveIds);
          }
        });
      }
      // add layers above layer id
      if (payload.where === "below") {
        forIn(pageById, function (slide, _pageId) {
          const idx = slide.layerIds.indexOf(payload.refId);
          if (idx !== -1) {
            slide.layerIds.splice(idx + 1, 0, ...payload.moveIds);
          }
        });
      }

      // add object in layer (at bottom)
      if (payload.where === "slide") {
        pageById[payload.refId].layerIds.splice(
          pageById[payload.refId].layerIds.length,
          0,
          ...payload.moveIds
        );
      }

      return { ...state, pageById };
    }

    case MOVE_SLIDES: {
      const payload = action.payload;
      const pages = cloneDeep(state.pages);

      remove(pages, (id) => {
        return payload.moveIds.indexOf(id) !== -1;
      });

      // add layers above layer id
      if (payload.where === "above") {
        const idx = pages.indexOf(payload.refId);
        if (idx != -1) {
          pages.splice(idx, 0, ...payload.moveIds);
        }
      }

      // add object in layer (at bottom)
      if (payload.where === "bottom") {
        pages.splice(pages.length, 0, ...payload.moveIds);
      }

      return { ...state, pages };
    }

    case DUPLICATE: {
      // Note: this part duplicate object
      const newState = cloneDeep(state);
      const dS = action.payload;
      dS.forEach((slideItem) => {
        const fromSlide = state.pageById[slideItem.fromId];
        if (!slideItem.skipCreate) {
          const toSlide = cloneDeep(fromSlide);
          //applyNewAnimationIdsToTransitionAbleElement(toSlide);
          toSlide.id = slideItem.toId as string;
          toSlide.name += " (copy)";
          toSlide.layerIds = slideItem.childs.map((item) => item.toId!);
          // newState.allPages.push(toSlide.id);
          newState.pages.push(toSlide.id);
          newState.pageById[toSlide.id] = toSlide;
        } else {
          const toSlide = cloneDeep(fromSlide);
          // add new layer ids if skipCreate is not true
          const layerIdToAdd = slideItem.childs.map((item) =>
            item.skipCreate ? undefined : item.toId!
          );
          toSlide.layerIds = [...toSlide.layerIds, ...compact(layerIdToAdd)];
          newState.pageById[toSlide.id] = toSlide;
        }
      });
      return newState;
    }

    case OPEN_PROJECT: {
      return {
        ...action.payload.pages,
      };
    }
    case CREATE_NEW_PROJECT: {
      return getPagesDefault();
    }
    default:
      return state;
  }
}
