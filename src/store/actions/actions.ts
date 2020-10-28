import { ISlide } from "../reducers/slides";
import { ILayer } from "../reducers/layers";
import { IStore } from "../store";
import { v4 as uuid } from "uuid";
import { Action, AnyAction } from "@reduxjs/toolkit";
import { difference, differenceWith, isEqual } from "lodash-es";
import { IObject, ObjectType } from "../../objects/types";
import { InputType, TextProperties } from "../../inputs/types";

export interface Dispatch<A extends Action = AnyAction> {
  <T extends A>(action: T): T | undefined;
}

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

export function deleteSlideThree(slideId: string) {
  return function (dispatch: any, getState: () => IStore) {
    const layerIds = getState().slides.slideById[slideId].layerIds;
    const objectIds = getState().objects.allObjects.filter(
      (objectId) =>
        layerIds.indexOf(getState().objects.objectById[objectId].layerId) !== -1
    );

    console.log(objectIds);
    dispatch(deleteObjects(objectIds));
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
      objectIds: [],
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

function _activateSlide(slideId: string): ActivateSlideAction {
  return {
    type: ACTIVATE_SLIDE,
    payload: slideId,
  };
}

export function activateSlide(slideId: string) {
  return function (dispatch: Dispatch, getState: () => IStore) {
    if (getState().selection.activeSlideId === slideId) {
      console.log("aaaa ");
      return;
    }
    dispatch(_activateSlide(slideId));
  };
}

// ****

// ****
export const ACTIVATE_LAYER = "Activate layer";

export interface ActivateLayerAction {
  type: typeof ACTIVATE_LAYER;
  payload: string;
}

function _activateLayer(layerId: string): ActivateLayerAction {
  return {
    type: ACTIVATE_LAYER,
    payload: layerId,
  };
}

export function activateLayer(layerId: string): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    if (getState().selection.activeLayerId === layerId) {
      console.log("layer is already active");
      return;
    }
    dispatch(_activateLayer(layerId));
  };
}

// ****
export const ACTIVATE_OBJECT = "Activate object";

export interface ActivateObjectAction {
  type: typeof ACTIVATE_OBJECT;
  payload: string;
}

function _activateObject(objectId: string): ActivateObjectAction {
  return {
    type: ACTIVATE_OBJECT,
    payload: objectId,
  };
}

export function activateObject(objectId: string): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    if (getState().selection.activeObjectId === objectId) {
      console.log("object is already active ");
      return;
    }
    dispatch(_activateObject(objectId));
  };
}

// ****
export const SELECT_SLIDES = "Select slides";

export interface SelectSlidesAction {
  type: typeof SELECT_SLIDES;
  payload: string[];
}

function _selectSlides(slides: string[]): SelectSlidesAction {
  return {
    type: SELECT_SLIDES,
    payload: slides,
  };
}

export function selectSlides(slideIds: string[]) {
  return function (dispatch: Dispatch, getState: () => IStore) {
    if (
      differenceWith(slideIds, getState().selection.selectedSlideIds, isEqual)
        .length === 0
    ) {
      return;
    }

    dispatch(_selectSlides(slideIds));
  };
}

// ****
export const SELECT_LAYERS = "Select layers";

export interface SelectLayersAction {
  type: typeof SELECT_LAYERS;
  payload: string[];
}

function _selectLayers(layers: string[]): SelectLayersAction {
  return {
    type: SELECT_LAYERS,
    payload: layers,
  };
}

export function selectLayers(layerIds: string[]): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    if (
      differenceWith(layerIds, getState().selection.selectedLayerIds, isEqual)
        .length === 0
    ) {
      return;
    }

    dispatch(_selectLayers(layerIds));
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

// **** OBJECTS

export const ADD_OBJECT = "Add object";

export interface AddObjectAction {
  type: typeof ADD_OBJECT;
  payload: IObject;
}

export function addNewObject(layerId: string, type: string): any {
  return function (dispatch: any, getState: () => IStore) {
    /*const nextId = getState().slides.slideById[slideId].nextLayerIdCounter;

    const layer = {
      id: uuid(),
      slideId,
      name: `Layer ${nextId}`,
      isVisible: true,
      hasTimeline: true,
    };*/

    const object: IObject<TextProperties> = {
      id: uuid(),
      layerId,
      type: ObjectType.TEXT,
      isVisible: true,
      hasTimeline: true,
      timeline: {
        keyFrames: [
          {
            time: 1000,
            properties: {
              left: 0,
              top: 0,
            },
          },
          {
            time: 4000,
            properties: {
              left: 500,
              top: 100,
            },
          },
        ],
      },
      left: 100,
      leftType: "px",
      width: 300,
      widthType: "px",
      top: 100,
      topType: "px",
      height: 100,
      heightType: "px",

      definition: {
        id: uuid(),
        type: ObjectType.IMAGE,
        properties: {
          color: {
            displayName: "Color",
            propertyName: "color",
            inputType: InputType.COLOR,
            value: null,
            defaultValue: { r: 0, g: 0, b: 0, a: 1 },
          },
          fontSize: {
            displayName: "Font size",
            propertyName: "string",
            inputType: InputType.NUMBER,
            value: 1,
            defaultValue: 1,
          },
          weight: {
            displayName: "Weight",
            propertyName: "string",
            inputType: InputType.SELECT,
            value: "2",
            defaultValue: "3",
            options: [
              { value: "100", label: "100	Thin" },
              { value: "200", label: "200	Extra Light" },
              { value: "300", label: "300	Light" },
              { value: "400", label: "400	Normal" },
              { value: "500", label: "500	Medium" },
              { value: "600", label: "600	Semi Bold" },
              { value: "700", label: "700	Bold" },
              { value: "800", label: "800	Extra Bold" },
              { value: "900", label: "900	Black" },
              { value: "950", label: "950	Extra Black" },
            ],
          },
        },
      },
    };

    dispatch(addObject(object));
  };
}

export function addObject(object: IObject): AddObjectAction {
  return {
    type: ADD_OBJECT,
    payload: object,
  };
}

// ***
// ******

export const DELETE_OBJECTS = "Delete objects";

export interface DeleteObjectsAction {
  type: typeof DELETE_OBJECTS;
  payload: string[];
}

export function deleteObjects(objectIds: string[]): DeleteObjectsAction {
  return {
    type: DELETE_OBJECTS,
    payload: objectIds,
  };
}

// ****
// ***
export const UPDATE_OBJECT = "Update object";

export interface UpdateObjectAction {
  type: typeof UPDATE_OBJECT;
  payload: IObject;
}

export function updateObject(object: IObject): any {
  return function (dispatch: any, getState: () => IStore) {
    console.log(object);
    dispatch(_updateObject(object));
  };
}

export function _updateObject(object: IObject): UpdateObjectAction {
  return {
    type: UPDATE_OBJECT,
    payload: object,
  };
}

// ***
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
  | ActivateSlideAction
  | ActivateLayerAction
  | SelectLayersAction
  //object
  | AddObjectAction
  | ActivateObjectAction
  | UpdateObjectAction
  | DeleteObjectsAction;
