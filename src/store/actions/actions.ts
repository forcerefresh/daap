import { ISlide } from "../reducers/slides";
import { ILayer } from "../reducers/layers";
import { IStore } from "../store";
import { v4 as uuid } from "uuid";

// **** SLIDES ACTION

export const ADD_SLIDE = "Add slide";

export interface AddSlideActionPayload {
  slide: ISlide;
}

export interface AddSlideAction {
  type: typeof ADD_SLIDE;
  payload: ISlide;
}

export function addNewSlide(): any {
  return function (dispatch: any, getState: () => IStore) {
    const slide = {
      id: uuid(),
      name: `Slide ${getState().slides.nextSlideIdCounter}`,
      layerIds: [],
      nextLayerIdCounter: 0,
    };
    dispatch(addSlide(slide));
  };
}

export function addSlide(slide: ISlide): AddSlideAction {
  return {
    type: ADD_SLIDE,
    payload: slide,
  };
}

// ****

export const DELETE_SLIDE = "Delete slide";

export interface DeleteSlideActionPayload {
  slideId: string;
}

export interface DeleteSlideAction {
  type: typeof DELETE_SLIDE;
  payload: DeleteSlideActionPayload;
}

export function deleteSlideDeep(slideId: string) {
  return function (dispatch: any, getState: () => IStore) {
    const layerIds = getState().slides.slideById[slideId].layerIds;
    dispatch(deleteLayers(layerIds));
    dispatch(deleteSlide(slideId));
  };
}

export function deleteSlide(slideId: string) {
  return {
    type: DELETE_SLIDE,
    payload: { slideId },
  };
}

// **** LAYERS ACTIONS

export const ADD_LAYER = "Add layer";

export interface AddLayerAction {
  type: typeof ADD_LAYER;
  payload: ILayer;
}

export function addNewLayer(slideId: string): any {
  return function (dispatch: any, getState: () => IStore) {
    const nextId = getState().slides.slideById[slideId].nextLayerIdCounter;

    const layer = {
      id: uuid(),
      slideId,
      name: `Layer ${nextId}`,
      isVisible: true,
      hasTimeline: true,
    };

    dispatch(addLayer(layer));
  };
}

export function addLayer(layer: ILayer): AddLayerAction {
  return {
    type: ADD_LAYER,
    payload: layer,
  };
}

// ******

export const DELETE_LAYERS = "Delete layers";

export interface DeleteLayersAction {
  type: typeof DELETE_LAYERS;
  payload: string[];
}

export function deleteLayers(layerIds: string[]): DeleteLayersAction {
  return {
    type: DELETE_LAYERS,
    payload: layerIds,
  };
}

// ****

export const SELECT_LAYER = "Select layer";

export interface SelectLayerAction {
  type: typeof SELECT_LAYER;
  payload: string;
}

export function selectLayer(layerId: string): SelectLayerAction {
  return {
    type: SELECT_LAYER,
    payload: layerId,
  };
}

// ****
export const ACTIVATE_SLIDE = "Activate slide";

export interface ActivateSlideAction {
  type: typeof ACTIVATE_SLIDE;
  payload: string;
}

export function activateSlide(slideId: string): ActivateSlideAction {
  return {
    type: ACTIVATE_SLIDE,
    payload: slideId,
  };
}

// ****
export const SELECT_SLIDES = "Select slides";

export interface SelectSlidesAction {
  type: typeof SELECT_SLIDES;
  payload: string[];
}

export function selectSlides(slides: string[]): SelectSlidesAction {
  return {
    type: SELECT_SLIDES,
    payload: slides,
  };
}

// ****
export const ADD_SLIDES_TO_SELECTION = "Add slides to selection";

export interface AddSlidesToSelectionAction {
  type: typeof ADD_SLIDES_TO_SELECTION;
  payload: string[];
}

export function addSlidesToSelection(
  slides: string[]
): AddSlidesToSelectionAction {
  return {
    type: ADD_SLIDES_TO_SELECTION,
    payload: slides,
  };
}

// ***
export const REMOVE_SLIDES_FROM_SELECTION = "Remove slides from selection";

export interface RemoveSlidesFromSelectionAction {
  type: typeof REMOVE_SLIDES_FROM_SELECTION;
  payload: string[];
}

export function removeSlidesFromSelection(
  slideIds: string[]
): RemoveSlidesFromSelectionAction {
  return {
    type: REMOVE_SLIDES_FROM_SELECTION,
    payload: slideIds,
  };
}
// ***

// ****
export const ADD_LAYERS_TO_SELECTION = "Add layers to selection";

export interface AddLayersToSelectionAction {
  type: typeof ADD_LAYERS_TO_SELECTION;
  payload: string[];
}

export function addLayersToSelection(
  layerIds: string[]
): AddLayersToSelectionAction {
  return {
    type: ADD_LAYERS_TO_SELECTION,
    payload: layerIds,
  };
}

export type ActionTypes =
  //slide
  | AddSlideAction
  | DeleteSlideAction
  //layer
  | AddLayerAction
  | DeleteLayersAction
  //select layer
  | SelectLayerAction
  | AddLayersToSelectionAction
  //select slide
  | SelectSlidesAction
  | AddSlidesToSelectionAction
  | RemoveSlidesFromSelectionAction
  //activate slide
  | ActivateSlideAction;
