import { ISlide } from "../reducers/slides";
import { ILayer } from "../reducers/layers";
import { IStore } from "../store";
import { v4 as uuid } from "uuid";
import { Action, AnyAction } from "@reduxjs/toolkit";
import { undo, redo } from "../../libraries/redux-deep-diff/src/actions";

import { differenceWith, isEqual } from "lodash-es";
import { IObject, ObjectType } from "../../objects/types";
import { createObject } from "../../objects/create-object-factory";
import { IPreviewState, IStageSize } from "../reducers/stage";

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
    const slide: ISlide = {
      id: uuid(),
      name: `Slide ${getState().slides.nextSlideIdCounter}`,
      duration: {
        inheritFrom: "custom",
        customValue: 10000,
      },
      layerIds: [],
      nextLayerIdCounter: 0,
    };
    dispatch(addSlide(slide));
    dispatch(activateSlide(slide.id));
    dispatch(selectSlides([slide.id]));
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

    const layer: ILayer = {
      id: uuid(),
      slideId,
      name: `Layer ${nextId}`,
      isVisible: true,
      hasTimeline: true,
      objectIds: [],
    };

    dispatch(addLayer(layer));
    dispatch(activateLayer(layer.id));
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
  payload: string | null;
}

function _activateObject(objectId: string | null): ActivateObjectAction {
  return {
    type: ACTIVATE_OBJECT,
    payload: objectId,
  };
}

export function activateObject(objectId: string | null): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    if (getState().selection.activeObjectId === objectId) {
      console.log("object is already active ");
      return;
    }

    const layerId = getState().objects.objectById[objectId as string].layerId;

    dispatch(_activateLayer(layerId));
    dispatch(_activateObject(objectId));
  };
}

export function deactivateObject(objectId: string): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    if (getState().selection.activeObjectId === objectId) {
      dispatch(_activateObject(null));
    }
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
        .length === 0 &&
      differenceWith(getState().selection.selectedSlideIds, slideIds, isEqual)
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

// ***
export const REMOVE_LAYERS_FROM_SELECTION = "Remove layers from selection";

export interface RemoveLayersFromSelectionAction {
  type: typeof REMOVE_LAYERS_FROM_SELECTION;
  payload: string[];
}

export function removeLayersFromSelection(
  layerIds: string[]
): RemoveLayersFromSelectionAction {
  return {
    type: REMOVE_LAYERS_FROM_SELECTION,
    payload: layerIds,
  };
}

// *****

export const SELECT_OBJECTS = "Select objects";

export interface SelectObjectAction {
  type: typeof SELECT_OBJECTS;
  payload: string[];
}

export function selectObjects(objectsId: string[]): SelectObjectAction {
  return {
    type: SELECT_OBJECTS,
    payload: objectsId,
  };
}

// ****
export const ADD_OBJECTS_TO_SELECTION = "Add objects to selection";

export interface AddObjectsToSelectionAction {
  type: typeof ADD_OBJECTS_TO_SELECTION;
  payload: string[];
}

export function addObjectsToSelection(
  objectIds: string[]
): AddObjectsToSelectionAction {
  return {
    type: ADD_OBJECTS_TO_SELECTION,
    payload: objectIds,
  };
}

// ***
export const REMOVE_OBJECTS_FROM_SELECTION = "Remove objects from selection";

export interface RemoveObjectsFromSelectionAction {
  type: typeof REMOVE_OBJECTS_FROM_SELECTION;
  payload: string[];
}

export function removeObjectsFromSelection(
  objectIds: string[]
): RemoveObjectsFromSelectionAction {
  return {
    type: REMOVE_OBJECTS_FROM_SELECTION,
    payload: objectIds,
  };
}

// **** OBJECTS

export const ADD_OBJECT = "Add object";

export interface AddObjectAction {
  type: typeof ADD_OBJECT;
  payload: IObject;
}

export function addNewObject(
  layerId: string,
  type: ObjectType,
  objectProps: Partial<IObject>
): any {
  return function (dispatch: any, getState: () => IStore) {
    const object = createObject(type, objectProps);
    dispatch(addObject({ ...object, layerId }));
    dispatch(activateObject(object.id));
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
    dispatch(_updateObject(object));
  };
}

export function _updateObject(object: IObject): UpdateObjectAction {
  return {
    type: UPDATE_OBJECT,
    payload: object,
  };
}

// ******

export const SET_STAGE_SIZE = "Set stage size";

export interface SetStageSizeAction {
  type: typeof SET_STAGE_SIZE;
  payload: IStageSize;
}

export function setStageSize(stageSize: IStageSize): SetStageSizeAction {
  return {
    type: SET_STAGE_SIZE,
    payload: stageSize,
  };
}

// ******

export const getZoomScale = () => [
  10,
  20,
  40,
  60,
  80,
  100,
  125,
  150,
  175,
  200,
  300,
  400,
  500,
  600,
  800,
  1000,
];
export const SET_STAGE_ZOOM = "Set stage zoom";

export interface SetStageZoomAction {
  type: typeof SET_STAGE_ZOOM;
  payload: number;
}

export function setStageZoom(zoom: number): SetStageZoomAction {
  return {
    type: SET_STAGE_ZOOM,
    payload: zoom,
  };
}

export function increaseStageZoom(): any {
  return function (dispatch: any, getState: () => IStore) {
    const zoomPerc = getZoomScale().find(
      (item) => item / 100 > getState().stage.zoom
    );
    if (zoomPerc) {
      dispatch(setStageZoom(zoomPerc / 100));
    }
  };
}
export function decreaseStageZoom(): any {
  return function (dispatch: any, getState: () => IStore) {
    const zoomPerc = getZoomScale()
      .reverse()
      .find((item) => item / 100 < getState().stage.zoom);
    if (zoomPerc) {
      dispatch(setStageZoom(zoomPerc / 100));
    }
  };
}

// ******

export const SET_STAGE_PREVIEW = "Set stage preview";

export interface SetStagePreviewAction {
  type: typeof SET_STAGE_PREVIEW;
  payload: Partial<IPreviewState>;
}

export function setStagePreview(
  preview: Partial<IPreviewState>
): SetStagePreviewAction {
  return {
    type: SET_STAGE_PREVIEW,
    payload: preview,
  };
}

export const UPDATE_SLIDE_DURATION = "Update slide duration";

export interface UpdateSlideDurationAction {
  type: typeof UPDATE_SLIDE_DURATION;
  payload: number;
}

export function updateSlideDuration(
  duration: number
): UpdateSlideDurationAction {
  return {
    type: UPDATE_SLIDE_DURATION,
    payload: duration,
  };
}

// *** UNDO - REDO

export function doUndo(): any {
  return function (dispatch: any) {
    dispatch(undo());
  };
}

export function doRedo(): any {
  return function (dispatch: any) {
    dispatch(redo());
  };
}

// ***
export type ActionTypes =
  // slide
  | AddSlideAction
  | DeleteSlideAction

  // layer
  | AddLayerAction
  | DeleteLayersAction

  // object
  | AddObjectAction
  | SelectObjectAction
  | UpdateObjectAction
  | DeleteObjectsAction
  | AddObjectsToSelectionAction
  | RemoveObjectsFromSelectionAction

  // layer selection
  | SelectLayerAction
  | SelectLayersAction
  | AddLayersToSelectionAction
  | RemoveLayersFromSelectionAction

  // slide selection
  | SelectSlidesAction
  | AddSlidesToSelectionAction
  | RemoveSlidesFromSelectionAction

  // activate
  | ActivateSlideAction
  | ActivateLayerAction
  | ActivateObjectAction

  //settings
  | UpdateSlideDurationAction

  //stage
  | SetStageSizeAction
  | SetStageZoomAction
  | SetStagePreviewAction;
