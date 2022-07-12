import { ISlide, ISlides, SlideType } from "../reducers/i-slides";
import { ILayer, ILayers } from "../reducers/i-layers";
import { IStore } from "../store";
import { v4 as uuid } from "uuid";
import { Action, AnyAction } from "@reduxjs/toolkit";
import { clear, jump } from "../../3rd-party-libs/undo-redo/actions";

import {
  cloneDeep,
  delay,
  differenceWith,
  intersection,
  isEqual,
  once,
} from "lodash-es";
import {
  IObject,
  ItemType,
  ObjectType,
} from "../../webslider-sdk/src/objects/i-object";
import {
  createObject,
  getDefaultSlide,
  getDefaultTransitionsForLayer,
  getDefaultTransitionsForSlide,
} from "../../objects/create-object-factory";
import { IPreviewState, StageTools } from "../reducers/stage";
import { IDocument, IDocumentSize } from "../reducers/document";
import { IAppSettings } from "../reducers/globals";
import {
  IRect,
  isIntersectingRect,
  roundNumber,
} from "../../utils/doom-utils/common";
import { LayoutChildrenType } from "../../webslider-sdk/src/inputs/i-inputs";
import { load } from "webfontloader";
import { ISettings } from "../reducers/i-settings";
import {
  BreakpointConfiguration,
  Breakpoints,
} from "../../webslider-sdk/src/common/i-breakpoint-configuration";
import { IMeta } from "../reducers/meta";
import { IObjects } from "../reducers/i-objects";
import { ISelection } from "../reducers/selection";
import {
  calculateObjectSize,
  getSnapLayoutSize,
} from "../../panels/stage-panel/StagePanelUtils";
import { IEditor } from "../reducers/editor";
import { IFormState } from "../reducers/i-uiforms";
import { getObjectDefinition } from "../../webslider-sdk/src/objects/objects-register";
import { IMAGE, ImageValues } from "../../objects/image/image";
import { TextValues } from "../../objects/text/text";
import { humanizeSting } from "../../utils/utils";
import {
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "../../webslider-sdk/src/objects/common-properties";
import { BUTTON, getButtonHtml } from "../../objects/button/button";
import { getRichTextHtml, RICH_TEXT } from "../../objects/rich-text/rich-text";
import { BULLETS, getBulletsHtml } from "../../objects/bullets/bullets";

export interface Dispatch<A extends Action = AnyAction> {
  <T extends A>(action: T): T | undefined;
}

// **** UNDOABLE interfaces

export type IIsUndoable = true | false;
export type IIsSkipHistory = true | false;

export interface IUndoableAction<IsUndoable = boolean, SkipHistory = boolean> {
  isUndoable: IsUndoable;
  skipHistory?: SkipHistory;
}

// **** SLIDES ACTION

export const ADD_SLIDE = "Add slide";

export interface AddSlideActionPayload {
  slide: ISlide;
}

export interface AddSlideAction extends IUndoableAction<true> {
  type: typeof ADD_SLIDE;
  payload: ISlide;
}

export function initializeSlideAndLayer(): any {
  return function (dispatch: Dispatch | any, getState: () => IStore) {
    if (getState().project.slides.allSlides.length === 0) {
      // back
      const backSlide = getDefaultSlide("Back", SlideType.Back);
      dispatch(addSlide(backSlide));
      dispatch(addNewLayer(backSlide.id));
      // front
      const frontSlide = getDefaultSlide("Front", SlideType.Front);
      dispatch(addSlide(frontSlide));
      dispatch(addNewLayer(frontSlide.id));
      // normal
      const slideName = `Slide ${getState().project.slides.nextSlideIdCounter}`;
      const slide = getDefaultSlide(slideName, SlideType.Normal);
      dispatch(addSlide(slide));
      // select
      dispatch(activateSlide(slide.id));
      dispatch(selectSlides([slide.id]));
      // layer
      dispatch(addNewLayer(slide.id));
      dispatch(
        updateEditor({ sliderChanged: false, isExistingProject: false })
      );
    }
  };
}

export function addNewSlide(
  slideType = SlideType.Normal,
  addLayer = false
): any {
  return function (dispatch: Dispatch | any, getState: () => IStore) {
    const slide: ISlide = {
      id: uuid(),
      customId: "",
      name: `Slide ${getState().project.slides.nextSlideIdCounter}`,
      duration: {
        inheritFrom: "inherit",
        customValue: "20s",
      },
      layerIds: [],
      nextLayerIdCounter: 1,
      slideType,
      transitions: getDefaultTransitionsForSlide(),
    };
    dispatch(addSlide(slide));
    dispatch(activateSlide(slide.id));
    dispatch(selectSlides([slide.id]));
    if (addLayer) {
      dispatch(addNewLayer(slide.id));
    }
  };
}

export function addSlide(slide: ISlide): AddSlideAction {
  return {
    type: ADD_SLIDE,
    payload: slide,
    isUndoable: true,
  };
}

// ****

export const DELETE_SLIDE = "Delete slide";

export interface DeleteSlideActionPayload {
  slideId: string;
}

export interface DeleteSlideAction extends IUndoableAction<true> {
  type: typeof DELETE_SLIDE;
  payload: DeleteSlideActionPayload;
}

export function deleteSlideThree(slideId: string) {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const layerIds = getState().project.slides.slideById[slideId].layerIds;
    const objectIds = getState().project.objects.allObjects.filter(
      (objectId: string) =>
        layerIds.indexOf(
          getState().project.objects.objectById[objectId].layerId
        ) !== -1
    );

    dispatch(deleteObjects(objectIds));
    dispatch(deleteLayers(layerIds));
    dispatch(deleteSlide(slideId));
  };
}

export function deleteSlide(slideId: string): DeleteSlideAction {
  return {
    type: DELETE_SLIDE,
    payload: { slideId },
    isUndoable: true,
  };
}

// update slide

export const UPDATE_SLIDE = "Update slide";

export interface UpdateSlideAction extends IUndoableAction<true> {
  type: typeof UPDATE_SLIDE;
  payload: ISlide;
}

export function updateSlide(slide: ISlide): UpdateSlideAction {
  return {
    type: UPDATE_SLIDE,
    payload: slide,
    isUndoable: true,
  };
}
// ****

// duplicate slides
export const DUPLICATE = "Duplicate";

export interface DuplicateSlidesAction extends IUndoableAction<true> {
  type: typeof DUPLICATE;
  payload: IDuplicateSchema;
}

export type IDuplicateSchema = {
  fromId: string;
  toId: string | null;
  skipCreate?: boolean;
  childs: IDuplicateSchema;
}[];

function _duplicateSlides(
  duplicateSlidesSchema: IDuplicateSchema
): DuplicateSlidesAction {
  return {
    type: DUPLICATE,
    payload: duplicateSlidesSchema,
    isUndoable: true,
  };
}

export function duplicateSlides(slideIds: string[]) {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const duplicateSlidesSchema: IDuplicateSchema = [];

    slideIds.forEach((slideId) => {
      const duplicateLayersSchema: IDuplicateSchema = [];
      const layerIds = getState().project.slides.slideById[slideId].layerIds;
      layerIds.forEach((layerId) => {
        const duplicateObjectSchema: IDuplicateSchema = [];

        const objectIds =
          getState().project.layers.layerById[layerId].objectIds;

        objectIds.forEach((objectId) => {
          duplicateObjectSchema.push({
            fromId: objectId,
            toId: uuid(),
            childs: [],
          });
        });

        duplicateLayersSchema.push({
          fromId: layerId,
          toId: uuid(),
          childs: duplicateObjectSchema,
        });
      });

      duplicateSlidesSchema.push({
        fromId: slideId,
        toId: uuid(),
        childs: duplicateLayersSchema,
      });
    });

    console.log(duplicateSlidesSchema);

    dispatch(_duplicateSlides(duplicateSlidesSchema));
  };
}

// **** LAYERS ACTIONS

export const ADD_LAYER = "Add layer";

export interface AddLayerAction extends IUndoableAction<true> {
  type: typeof ADD_LAYER;
  payload: ILayer;
}

export function addNewLayer(slideId: string): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const nextId =
      getState().project.slides.slideById[slideId].nextLayerIdCounter;

    // size fro absolute posstion from breakpoint;
    const breakpointsConfiguration =
      getState().project.settings.breakpoints.breakpointsConfiguration;
    const breakpointConfig = breakpointsConfiguration.find(
      (p: any) => p.type === "large-1"
    );
    const absoluteSize = breakpointConfig?.normal.maxSliderSize;
    const gridSize = breakpointConfig?.normal.grid;

    const layer: ILayer = {
      id: uuid(),
      type: "layer",
      slideId,
      // isBackground: isBackground,
      // name: isBackground ? `Background layer` : `Layer ${nextId}`,
      name: `Layer ${nextId}`,
      isVisible: true,
      hasTimeline: true,
      objectIds: [],
      transitions: getDefaultTransitionsForLayer(),
      responsiveVisibility: { showAll: true, displayOn: [] },
      definition: {
        values: {
          overflow: "visible",
          hasLayoutChildren: false,
          layoutChildren: {
            type: LayoutChildrenType.Column,
            align: "start",
            justify: "start",
            itemsGap: {
              commonValue: "",
              eachValues: [],
              type: "common",
            },
          },
          ...getCommonPropertiesValues(),
        },
        valuesMetadata: { ...{}, ...getCommonPropertiesMetadataValues() },
      },
      layout: "none",
      supportedLayout: {
        none: true,
        absolute: true,
        snap: true,
        fit: true,
        grid: true,
      },
      selfSize: false,
      absoluteLayout: {
        type: "common",
        perDevice: [],
        common: {
          deviceType: "common",
          left: 0,
          top: 0,
          ...absoluteSize!,
        },
      },
      gridLayouts: {
        type: "common",
        perDevice: [],
        common: {
          deviceType: "common",
          left: 0,
          right: gridSize?.horizontal!,
          top: 0,
          bottom: gridSize?.vertical!,
        },
      },
      snapLayout: {
        type: "common",
        edge: "left",
        relativeTo: "stage",
        perDevice: [],
        common: {
          deviceType: "common",
          width: "200px",
          height: "200px",
          gap: 0,
        },
      },
    };

    dispatch(addLayer(layer));
    dispatch(selectLayers([layer.id]));
    dispatch(activateLayer(layer.id));
    dispatch(selectForProperties({ type: "layer", id: layer.id }));
  };
}

export function addLayer(layer: ILayer): AddLayerAction {
  return {
    type: ADD_LAYER,
    payload: layer,
    isUndoable: true,
  };
}

// ******

export const DELETE_LAYERS = "Delete layers";

export interface DeleteLayersAction extends IUndoableAction<true> {
  type: typeof DELETE_LAYERS;
  payload: string[];
}

export function deleteLayers(layerIds: string[]): DeleteLayersAction {
  return {
    type: DELETE_LAYERS,
    payload: layerIds,
    isUndoable: true,
  };
}

export function deleteLayersThree(layerIds: string[]) {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const objectIds = getState().project.objects.allObjects.filter(
      (objectId: string) =>
        layerIds.indexOf(
          getState().project.objects.objectById[objectId].layerId
        ) !== -1
    );

    dispatch(deleteObjects(objectIds));
    dispatch(deleteLayers(layerIds));
  };
}

// ******

// duplicate layers

export function duplicateLayers(layerIds: string[]) {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const duplicateSlidesSchema: IDuplicateSchema = [];

    const allSlides = getState().project.slides.allSlides;
    allSlides.forEach((allSlideId) => {
      const duplicateLayersSchema: IDuplicateSchema = [];
      const allLayerIds =
        getState().project.slides.slideById[allSlideId].layerIds;
      const currentLayersIds = intersection(allLayerIds, layerIds);

      currentLayersIds.forEach((currentLayerId) => {
        const duplicateObjectSchema: IDuplicateSchema = [];

        const objectIds =
          getState().project.layers.layerById[currentLayerId].objectIds;

        objectIds.forEach((objectId) => {
          duplicateObjectSchema.push({
            fromId: objectId,
            toId: uuid(),
            childs: [],
          });
        });

        duplicateLayersSchema.push({
          fromId: currentLayerId,
          toId: uuid(),
          childs: duplicateObjectSchema,
        });
      });

      duplicateSlidesSchema.push({
        fromId: allSlideId,
        toId: allSlideId,
        skipCreate: true,
        childs: duplicateLayersSchema,
      });
    });

    console.log(duplicateSlidesSchema);

    dispatch(_duplicateSlides(duplicateSlidesSchema));
  };
}

//*****

export const UPDATE_LAYER = "Update layer";

export interface UpdateLayerAction extends IUndoableAction<true> {
  type: typeof UPDATE_LAYER;
  payload: ILayer;
}

export function updateLayer(layer: ILayer): UpdateLayerAction {
  return {
    type: UPDATE_LAYER,
    payload: layer,
    isUndoable: true,
  };
}
// ****

export const SELECT_LAYER = "Select layer";

export interface SelectLayerAction extends IUndoableAction<true, true> {
  type: typeof SELECT_LAYER;
  payload: string;
}

export function selectLayer(layerId: string): SelectLayerAction {
  return {
    type: SELECT_LAYER,
    payload: layerId,
    isUndoable: true,
    skipHistory: true,
  };
}

// ****
export const ACTIVATE_SLIDE = "Activate slide";

export interface ActivateSlideAction extends IUndoableAction<true, true> {
  type: typeof ACTIVATE_SLIDE;
  payload: string;
}

function _activateSlide(slideId: string): ActivateSlideAction {
  return {
    type: ACTIVATE_SLIDE,
    payload: slideId,
    isUndoable: true,
    skipHistory: true,
  };
}

export function activateSlide(slideId: string) {
  return function (dispatch: Dispatch, getState: () => IStore) {
    if (getState().project.selection.activeSlideId === slideId) {
      return;
    }
    dispatch(_activateSlide(slideId));
    // activate first layer (BY DESING)
    const firstLayerId =
      getState().project.slides.slideById[slideId].layerIds[0];
    if (firstLayerId) {
      dispatch(activateLayer(firstLayerId));
      dispatch(selectLayers([firstLayerId]));
    }
  };
}

// ****

// ****
export const ACTIVATE_LAYER = "Activate layer";

export interface ActivateLayerAction extends IUndoableAction<true, true> {
  type: typeof ACTIVATE_LAYER;
  payload: string;
}

function _activateLayer(layerId: string): ActivateLayerAction {
  return {
    type: ACTIVATE_LAYER,
    payload: layerId,
    isUndoable: true,
    skipHistory: true,
  };
}

export function activateLayer(layerId: string): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    if (getState().project.selection.activeLayerId === layerId) {
      // console.log("layer is already active");
      return;
    }
    dispatch(_activateLayer(layerId));
  };
}

// ****
export const SELECT_FOR_PROPERTIES = "Select for properties";

export interface selectForPropertiesProps {
  type: ItemType;
  id: string;
}
export interface SelectForPropertiesAction extends IUndoableAction<true, true> {
  type: typeof SELECT_FOR_PROPERTIES;
  payload: selectForPropertiesProps;
}

function _selectForProperties(
  payload: selectForPropertiesProps
): SelectForPropertiesAction {
  return {
    type: SELECT_FOR_PROPERTIES,
    payload: payload,
    isUndoable: true,
    skipHistory: true,
  };
}

export function selectForProperties(payload: selectForPropertiesProps): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    if (
      getState().project.selection.selectionForProperties?.type ===
        payload.type &&
      getState().project.selection.selectionForProperties?.id === payload.id
    ) {
      // console.log("layer is already active");
      return;
    }
    dispatch(_selectForProperties(payload));
  };
}

// ****

export const ACTIVATE_OBJECT = "Activate object";

export interface ActivateObjectAction extends IUndoableAction<true, true> {
  type: typeof ACTIVATE_OBJECT;
  payload: string | null;
}

function _activateObject(objectId: string | null): ActivateObjectAction {
  return {
    type: ACTIVATE_OBJECT,
    payload: objectId,
    isUndoable: true,
    skipHistory: true,
  };
}

export function activateObject(objectId: string | null): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    // if we pass null we wants to deactivate current active object
    if (objectId === null) {
      dispatch(_activateObject(objectId));
      return;
    }
    if (getState().project.selection.activeObjectId === objectId) {
      //console.log("object is already active ");
      return;
    }

    const layerId =
      getState().project.objects.objectById[objectId as string].layerId;

    dispatch(_activateLayer(layerId));
    dispatch(_selectLayers([layerId]));
    dispatch(_activateObject(objectId));
  };
}

export function deactivateObject(objectId: string): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    if (getState().project.selection.activeObjectId === objectId) {
      dispatch(_activateObject(null));
    }
  };
}

// ****
export const SELECT_SLIDES = "Select slides";

export interface SelectSlidesAction extends IUndoableAction<true, true> {
  type: typeof SELECT_SLIDES;
  payload: string[];
}

function _selectSlides(slides: string[]): SelectSlidesAction {
  return {
    type: SELECT_SLIDES,
    payload: slides,
    isUndoable: true,
    skipHistory: true,
  };
}

export function selectSlides(slideIds: string[]) {
  return function (dispatch: Dispatch, getState: () => IStore) {
    if (
      differenceWith(
        slideIds,
        getState().project.selection.selectedSlideIds,
        isEqual
      ).length === 0 &&
      differenceWith(
        getState().project.selection.selectedSlideIds,
        slideIds,
        isEqual
      ).length === 0
    ) {
      return;
    }

    dispatch(_selectSlides(slideIds));
  };
}

// ****
export const SELECT_LAYERS = "Select layers";

export interface SelectLayersAction extends IUndoableAction<true, true> {
  type: typeof SELECT_LAYERS;
  payload: string[];
}

function _selectLayers(layers: string[]): SelectLayersAction {
  return {
    type: SELECT_LAYERS,
    payload: layers,
    isUndoable: true,
    skipHistory: true,
  };
}

export function selectLayers(layerIds: string[]): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    /*if (
      differenceWith(
        layerIds,
        getState().project.selection.selectedLayerIds,
        isEqual
      ).length === 0
    ) {
      return;
    }*/

    dispatch(_selectLayers(layerIds));
  };
}

// ****

export const ADD_SLIDES_TO_SELECTION = "Add slides to selection";

export interface AddSlidesToSelectionAction
  extends IUndoableAction<true, true> {
  type: typeof ADD_SLIDES_TO_SELECTION;
  payload: string[];
}

export function addSlidesToSelection(
  slides: string[]
): AddSlidesToSelectionAction {
  return {
    type: ADD_SLIDES_TO_SELECTION,
    payload: slides,
    isUndoable: true,
    skipHistory: true,
  };
}

// ***
export const REMOVE_SLIDES_FROM_SELECTION = "Remove slides from selection";

export interface RemoveSlidesFromSelectionAction
  extends IUndoableAction<true, true> {
  type: typeof REMOVE_SLIDES_FROM_SELECTION;
  payload: string[];
}

export function removeSlidesFromSelection(
  slideIds: string[]
): RemoveSlidesFromSelectionAction {
  return {
    type: REMOVE_SLIDES_FROM_SELECTION,
    payload: slideIds,
    isUndoable: true,
    skipHistory: true,
  };
}
// ***

// ****
export const ADD_LAYERS_TO_SELECTION = "Add layers to selection";

export interface AddLayersToSelectionAction
  extends IUndoableAction<true, true> {
  type: typeof ADD_LAYERS_TO_SELECTION;
  payload: string[];
}

export function addLayersToSelection(
  layerIds: string[]
): AddLayersToSelectionAction {
  return {
    type: ADD_LAYERS_TO_SELECTION,
    payload: layerIds,
    isUndoable: true,
    skipHistory: true,
  };
}

// ***
export const REMOVE_LAYERS_FROM_SELECTION = "Remove layers from selection";

export interface RemoveLayersFromSelectionAction
  extends IUndoableAction<true, true> {
  type: typeof REMOVE_LAYERS_FROM_SELECTION;
  payload: string[];
}

export function removeLayersFromSelection(
  layerIds: string[]
): RemoveLayersFromSelectionAction {
  return {
    type: REMOVE_LAYERS_FROM_SELECTION,
    payload: layerIds,
    isUndoable: true,
    skipHistory: true,
  };
}

// *****
/*
export const SELECT_OBJECTS_BY_RECT = "Select objects by rect";

export interface SelectObjectsByRectAction extends IUndoableAction<true, true> {
  type: typeof SELECT_OBJECTS_BY_RECT;
  payload: IRect;
}

export function selectObjectsByRect(rect: IRect): SelectObjectsByRectAction {
  return {
    type: SELECT_OBJECTS_BY_RECT,
    payload: rect,
    isUndoable: true,
    skipHistory: true,
  };
}*/

// *****

export const SELECT_OBJECTS = "Select objects";

export interface SelectObjectAction extends IUndoableAction<true, true> {
  type: typeof SELECT_OBJECTS;
  payload: string[];
}

export function selectObjects(objectsId: string[]): SelectObjectAction {
  return {
    type: SELECT_OBJECTS,
    payload: objectsId,
    isUndoable: true,
    skipHistory: true,
  };
}

export function selectObjectsByRect(rect: IRect): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const objectToSelectIds: string[] = [];
    getState().project.objects.allObjects.map((objectId: string) => {
      const object = getState().project.objects.objectById[objectId];

      // TODO
      // TODO: IMPORTANT hardcoded
      const breakpointConfig: BreakpointConfiguration | undefined =
        getState().project.settings.breakpoints.breakpointsConfiguration.find(
          (breakpointConfig: any) =>
            breakpointConfig.type === getState().stage.selectedDevice
        );

      const calculatedObjectSize = calculateObjectSize(
        object,
        breakpointConfig!,
        {
          resetPosition: false,
        }
      );

      if (
        isIntersectingRect(rect, {
          x: parseInt(calculatedObjectSize.left!.toString(), 10),
          y: parseInt(calculatedObjectSize.top!.toString(), 10),
          w: parseInt(calculatedObjectSize.width!.toString(), 10),
          h: parseInt(calculatedObjectSize.height!.toString(), 10),
        })
      ) {
        objectToSelectIds.push(object.id);
      }
    });
    dispatch(selectObjects(objectToSelectIds));
  };
}

// ****
export const ADD_OBJECTS_TO_SELECTION = "Add objects to selection";

export interface AddObjectsToSelectionAction
  extends IUndoableAction<true, true> {
  type: typeof ADD_OBJECTS_TO_SELECTION;
  payload: string[];
}

export function addObjectsToSelection(
  objectIds: string[]
): AddObjectsToSelectionAction {
  return {
    type: ADD_OBJECTS_TO_SELECTION,
    payload: objectIds,
    isUndoable: true,
    skipHistory: true,
  };
}

// ***
export const REMOVE_OBJECTS_FROM_SELECTION = "Remove objects from selection";

export interface RemoveObjectsFromSelectionAction
  extends IUndoableAction<true, true> {
  type: typeof REMOVE_OBJECTS_FROM_SELECTION;
  payload: string[];
}

export function removeObjectsFromSelection(
  objectIds: string[]
): RemoveObjectsFromSelectionAction {
  return {
    type: REMOVE_OBJECTS_FROM_SELECTION,
    payload: objectIds,
    isUndoable: true,
    skipHistory: true,
  };
}

// ***
export const MOVE_OBJECTS = "Move objects";

export interface MoveObjectsActionPayload {
  refId: string;
  where: "above" | "below" | "layer" | "slide" | "bottom";
  moveIds: string[];
}

export interface MoveObjectsAction extends IUndoableAction<true, false> {
  type: typeof MOVE_OBJECTS;
  payload: MoveObjectsActionPayload;
}

export function moveObjects(
  refId: string,
  where: "above" | "below" | "layer" | "slide" | "bottom",
  moveIds: string[]
): MoveObjectsAction {
  return {
    type: MOVE_OBJECTS,
    payload: { refId, where, moveIds },
    isUndoable: true,
    skipHistory: false,
  };
}

// move layers
export const MOVE_LAYERS = "Move layers";

export interface MoveLayerActionPayload {
  refId: string;
  where: "above" | "below" | "layer" | "slide" | "bottom";
  moveIds: string[];
}

export interface MoveLayersAction extends IUndoableAction<true, false> {
  type: typeof MOVE_LAYERS;
  payload: MoveLayerActionPayload;
}

export function moveLayers(
  refId: string,
  where: "above" | "below" | "layer" | "slide" | "bottom",
  moveIds: string[]
): MoveLayersAction {
  return {
    type: MOVE_LAYERS,
    payload: { refId, where, moveIds },
    isUndoable: true,
    skipHistory: false,
  };
}

// move slides
export const MOVE_SLIDES = "Move slides";

export interface MoveSlidesActionPayload {
  refId: string;
  where: "above" | "bottom" | string;
  moveIds: string[];
}

export interface MoveSlidesAction extends IUndoableAction<true, false> {
  type: typeof MOVE_SLIDES;
  payload: MoveSlidesActionPayload;
}

export function moveSlides(
  refId: string,
  where: "above" | "bottom" | string,
  moveIds: string[]
): MoveSlidesAction {
  return {
    type: MOVE_SLIDES,
    payload: { refId, where, moveIds },
    isUndoable: true,
    skipHistory: false,
  };
}

// **** OBJECTS

export const ADD_OBJECT = "Add object";

export interface AddObjectAction extends IUndoableAction<true> {
  type: typeof ADD_OBJECT;
  payload: IObject;
}

export function addNewObject(
  layerId: string,
  type: ObjectType | string,
  objectProps: Partial<IObject>,
  values?: { [key: string]: string }
): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const object = {
      ...createObject(type, objectProps, {
        ...values,
        //text: "Sample test",
      }),
      layerId,
    };

    const nextNameIdx = getState().project.objects.nextObjectId[type] || 1;
    object.name = humanizeSting(type) + " " + nextNameIdx;

    switch (object.type) {
      case BUTTON: {
        postProcessButton(object, getState);
        break;
      }
      case BULLETS: {
        postProcessBullet(object, getState);
        break;
      }
      default: {
        break;
      }
    }

    dispatch(addObject(object));
    dispatch(activateObject(object.id));
    dispatch(selectObjects([object.id]));
    dispatch(selectForProperties({ id: object.id, type: "object" }));
  };
}

export function addObject(object: IObject): AddObjectAction {
  return {
    type: ADD_OBJECT,
    payload: object,
    isUndoable: true,
  };
}

// ***
// ******

export const DELETE_OBJECTS = "Delete objects";

export interface DeleteObjectsAction extends IUndoableAction<true> {
  type: typeof DELETE_OBJECTS;
  payload: string[];
}

export function deleteObjects(objectIds: string[]): DeleteObjectsAction {
  return {
    type: DELETE_OBJECTS,
    payload: objectIds,
    isUndoable: true,
  };
}

// ******

// duplicate objects

export function duplicateObjects(objectIds: string[]) {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const duplicateSlidesSchema: IDuplicateSchema = [];

    const allSlides = getState().project.slides.allSlides;
    allSlides.forEach((allSlideId) => {
      const duplicateLayersSchema: IDuplicateSchema = [];
      const allLayerIds =
        getState().project.slides.slideById[allSlideId].layerIds;
      //const currentLayersIds = intersection(allLayerIds, layerIds);
      allLayerIds.forEach((allLayerId) => {
        const duplicateObjectSchema: IDuplicateSchema = [];
        const allObjectIds =
          getState().project.layers.layerById[allLayerId].objectIds;

        const currentObjectsIds = intersection(allObjectIds, objectIds);

        currentObjectsIds.forEach((objectId) => {
          duplicateObjectSchema.push({
            fromId: objectId,
            toId: uuid(),
            childs: [],
          });
        });

        duplicateLayersSchema.push({
          fromId: allLayerId,
          toId: allLayerId,
          skipCreate: true,
          childs: duplicateObjectSchema,
        });
      });

      duplicateSlidesSchema.push({
        fromId: allSlideId,
        toId: allSlideId,
        skipCreate: true,
        childs: duplicateLayersSchema,
      });
    });

    console.log(duplicateSlidesSchema);

    dispatch(_duplicateSlides(duplicateSlidesSchema));
  };
}

// ****
// TODO: this is object update middleware!!! move somewhere!!!
function handleObjectUpdate(
  object: IObject,
  dispatch: Dispatch,
  getState: () => IStore
) {
  const prevObject = getState().project.objects.objectById[object.id];

  // round to max two decimals
  object.left = roundNumber(object.left!, 2);
  object.width = roundNumber(object.width!, 2);
  object.top = roundNumber(object.top!, 2);
  object.height = roundNumber(object.height!, 2);

  const objDeff = getObjectDefinition(object.type);
  object = !!objDeff?.postProcess
    ? objDeff.postProcess(prevObject, object)
    : object;

  console.log(object);
  console.log(objDeff?.postProcess);

  // TODO: REMOVE TO POSTPROCESS
  switch (object.type) {
    case "text":
    case RICH_TEXT: {
      handleTextUpdate(object, dispatch, getState);
      break;
    }
    case BUTTON: {
      handleButtonUpdate(object, dispatch, getState);
      break;
    }
    case BULLETS: {
      handleBulletsUpdate(object, dispatch, getState);
      break;
    }
    case IMAGE: {
      handleImageUpdate(object, dispatch, getState);
      break;
    }
    default: {
      dispatch(_updateObject(object));
    }
  }
}

function handleImageUpdate(
  object: IObject,
  dispatch: Dispatch,
  getState: () => IStore
): void {
  // only one image object can have useForThumbnail
  const object2 = getObjectThatHaveThumbnailSet(object, getState);
  if (object2) {
    const object2Clone = cloneDeep(object2);
    (object2Clone.definition.values as ImageValues).useForThumbnail = false;
    dispatch(_updateObject(object2Clone));
  }

  dispatch(_updateObject(object));
}

/* This method mutate object*/
function getObjectThatHaveThumbnailSet(
  object: IObject,
  getState: () => IStore
): IObject | undefined {
  if (!(object.definition.values as ImageValues).useForThumbnail) {
    return undefined;
  }

  const layer = getState().project.layers.layerById[object.layerId];
  const slideId = layer.slideId;
  const slide = getState().project.slides.slideById[slideId];
  const layerById = getState().project.layers.layerById;

  let objectIdsInSlide: any[] = [];
  slide.layerIds.forEach((layerId) => {
    objectIdsInSlide = [...objectIdsInSlide, ...layerById[layerId].objectIds];
  });

  let retObj: IObject | undefined;
  const objectById = getState().project.objects.objectById;
  objectIdsInSlide.forEach((objectId) => {
    if (
      objectId !== object.id &&
      (objectById[objectId].definition.values as ImageValues).useForThumbnail
    ) {
      retObj = objectById[objectId];
    }
  });

  return retObj;
}

function handleBulletsUpdate(
  object: IObject,
  dispatch: Dispatch,
  getState: () => IStore
): void {
  postProcessBullet(object, getState);
  dispatch(_updateObject(object));
}

/* This method mutate object*/
function postProcessBullet(object: IObject, getState: () => IStore): void {
  if (object.layout === "absolute" || object.layout === "snap") {
    const breakpointConfig: BreakpointConfiguration | undefined =
      getState().project.settings.breakpoints.breakpointsConfiguration.find(
        (breakpointConfig: any) =>
          breakpointConfig.type === getState().stage.selectedDevice
      );
    // todo: calculate for all not only for one
    const calculatedObjectSize = calculateObjectSize(
      object,
      breakpointConfig!,
      {
        resetPosition: false,
      }
    );
    const html = getBulletsHtml({
      object,
      calculatedObjectSize: {
        ...calculatedObjectSize,
        width: undefined,
        height: undefined,
      },
      isPlayer: false,
      thumbnailHtmlArr: [],
      slidesCounter: getState().project.slides.normalSlides.length,
    });
    const holder = document.createElement("div");
    holder.style.overflow = "visible";
    holder.innerHTML = html;
    const el = holder.querySelector("div")! as HTMLDivElement;
    //el.style.position = "relative";
    document.body.appendChild(holder);
    object.absoluteLayout!.common.width = el.offsetWidth!;
    object.absoluteLayout!.common.height = el.offsetHeight!;
    const snapSizeObj = getSnapLayoutSize(
      object.snapLayout!,
      getState().stage.selectedDevice
    );
    snapSizeObj.width = el.offsetWidth! + "px";
    snapSizeObj.height = el.offsetHeight! + "px";
    document.body.removeChild(holder);
  }
}

/* This method mutate object*/
function postProcessButton(object: IObject, getState: () => IStore): void {
  if (object.layout === "absolute") {
    const breakpointConfig: BreakpointConfiguration | undefined =
      getState().project.settings.breakpoints.breakpointsConfiguration.find(
        (breakpointConfig: any) =>
          breakpointConfig.type === getState().stage.selectedDevice
      );
    // todo: calculate for all not only for one
    const calculatedObjectSize = calculateObjectSize(
      object,
      breakpointConfig!,
      {
        resetPosition: false,
      }
    );
    const html = getButtonHtml({
      object,
      calculatedObjectSize: {
        ...calculatedObjectSize,
        width: undefined,
        height: undefined,
      },
    });
    const holder = document.createElement("div");
    holder.style.overflow = "visible";
    holder.innerHTML = html;
    holder.querySelector("button")!.style.position = "relative";
    document.body.appendChild(holder);
    object.absoluteLayout!.common.width =
      holder.querySelector("button")?.offsetWidth!;
    object.absoluteLayout!.common.height =
      holder.querySelector("button")?.offsetHeight!;
    document.body.removeChild(holder);
  }
}
function handleButtonUpdate(
  object: IObject,
  dispatch: Dispatch,
  getState: () => IStore
): void {
  postProcessButton(object, getState);
  dispatch(_updateObject(object));
}

function handleTextUpdate(
  object: IObject,
  dispatch: Dispatch,
  getState: () => IStore
): void {
  // * handle auto height
  const objectValues = object.definition.values as TextValues;

  if (objectValues.autoHeight === true) {
    // TODO: IMPORTANT hardcoded
    const breakpointConfig: BreakpointConfiguration | undefined =
      getState().project.settings.breakpoints.breakpointsConfiguration.find(
        (breakpointConfig: any) =>
          breakpointConfig.type === getState().stage.selectedDevice
      );
    // todo: calculate for all not only for one
    const calculatedObjectSize = calculateObjectSize(
      object,
      breakpointConfig!,
      {
        resetPosition: false,
      }
    );

    const objDeff = getObjectDefinition(object.type);
    let html = "";
    if (!!objDeff?.getHtml) {
      html = objDeff?.getHtml({ object, calculatedObjectSize, isPlayer: true });
    } else if (object.type === RICH_TEXT) {
      html = getRichTextHtml({ object, calculatedObjectSize });
    }

    const holder = document.createElement("div");
    holder.innerHTML = html;
    const pEl = holder.firstChild! as HTMLElement;
    pEl.style.position = "relative";
    pEl.style.width = `${calculatedObjectSize.width}`;
    pEl.style.height = `auto`;
    document.body.appendChild(holder);
    object.height = pEl.offsetHeight;
    if (object.absoluteLayout) {
      object.absoluteLayout.common.height = pEl.offsetHeight;
    }
    document.body.removeChild(holder);
  }

  // * handle font loading
  const objectPrevState = getState().project.objects.objectById[object.id];
  const { loadedFontFamilies } = getState().fonts;

  const newObjectValues = object.definition.values as TextValues;
  const oldObjectValues = objectPrevState.definition.values as TextValues;

  const newFont = newObjectValues.font.fontFamily;
  const oldFont = oldObjectValues.font.fontFamily;

  // NOTE: update object once. update either after font is loaded or after 500ms
  const updateObjectOnce = once(() => {
    dispatch(_updateObject(object));
  });

  // NOTE: check if we need to load fonts
  if (
    newObjectValues.font.source !== "system" &&
    newFont !== oldFont &&
    loadedFontFamilies.indexOf(newFont) === -1
  ) {
    delay(updateObjectOnce, 500);
    // load font
    load({
      google: {
        families: [newFont],
      },
      classes: false,
      fontloading: (familyName: string, fvd: string) => {},
      fontinactive: (familyName: string, fvd: string) => {
        // TODO: loading font error
        updateObjectOnce();
      },
      fontactive: (familyName: string, fvd: string) => {
        dispatch(setExternalFontLoaded(familyName));
        updateObjectOnce();
      },
    });
  } else {
    updateObjectOnce();
  }
}

export const UPDATE_OBJECT = "Update object";

export interface UpdateObjectAction extends IUndoableAction<true> {
  type: typeof UPDATE_OBJECT;
  payload: IObject;
}

export function updateObject(object: IObject): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    handleObjectUpdate(object, dispatch, getState);
    /*
    const skipUpdateObject = handleObjectUpdate(
      object,
      getState().project.objects.objectById[object.id],
      getState().fonts.loadedFontFamilies,
      dispatch
    );

    if (!skipUpdateObject) dispatch(_updateObject(object));*/
  };
}

export function _updateObject(object: IObject): UpdateObjectAction {
  return {
    type: UPDATE_OBJECT,
    payload: object,
    isUndoable: true,
  };
}

// ******

export const SET_DOCUMENT_SIZE = "Set stage size";

export interface SetDocumentSizeAction extends IUndoableAction<false> {
  type: typeof SET_DOCUMENT_SIZE;
  payload: IDocumentSize;
}

export function setDocumentSize(
  stageSize: IDocumentSize
): SetDocumentSizeAction {
  return {
    type: SET_DOCUMENT_SIZE,
    payload: stageSize,
    isUndoable: false,
  };
}

// ******

export const getZoomScale = () => [
  10, 20, 40, 60, 80, 100, 125, 150, 175, 200, 300, 400, 500, 600, 800, 1000,
];
export const SET_STAGE_ZOOM = "Set stage zoom";

export interface SetStageZoomAction extends IUndoableAction<false> {
  type: typeof SET_STAGE_ZOOM;
  payload: number;
}

export function setStageZoom(zoom: number): SetStageZoomAction {
  return {
    type: SET_STAGE_ZOOM,
    payload: zoom,
    isUndoable: false,
  };
}

export function increaseStageZoom(currZoom?: number): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const compZoom = currZoom ? currZoom : getState().stage.zoom;
    const zoomPerc = getZoomScale().find((item) => item / 100 > compZoom);
    if (zoomPerc) {
      dispatch(setStageZoom(zoomPerc / 100));
    }
  };
}
export function decreaseStageZoom(currZoom?: number): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const compZoom = currZoom ? currZoom : getState().stage.zoom;
    const zoomPerc = getZoomScale()
      .reverse()
      .find((item) => item / 100 < compZoom);
    if (zoomPerc) {
      dispatch(setStageZoom(zoomPerc / 100));
    }
  };
}

// ******

export const ZOOM_FIT = "Set zoom fit";

export interface SetZoomFitAction extends IUndoableAction<false> {
  type: typeof ZOOM_FIT;
  payload: boolean;
}

export function setZoomFit(zoomFit: boolean): SetZoomFitAction {
  return {
    type: ZOOM_FIT,
    payload: zoomFit,
    isUndoable: false,
  };
}
// ******

export const VIEWPORT_SIZE = "Set viewport size";

export interface SetViewportSizeAction extends IUndoableAction<false> {
  type: typeof VIEWPORT_SIZE;
  payload: { w: number; h: number };
}

export function setViewPortSize(viewportSize: {
  w: number;
  h: number;
}): SetViewportSizeAction {
  return {
    type: VIEWPORT_SIZE,
    payload: viewportSize,
    isUndoable: false,
  };
}

// ******

export const FORCE_REFRESH = "Force refresh stage";

export interface ForceRefreshAction extends IUndoableAction<false> {
  type: typeof FORCE_REFRESH;
  payload: void;
}

export function forceRefresh(): ForceRefreshAction {
  return {
    type: FORCE_REFRESH,
    payload: undefined,
    isUndoable: false,
  };
}

// ******

export const SET_STAGE_PREVIEW = "Set stage preview";

export interface SetStagePreviewAction extends IUndoableAction<false> {
  type: typeof SET_STAGE_PREVIEW;
  payload: Partial<IPreviewState>;
}

export function setStagePreview(
  preview: Partial<IPreviewState>
): SetStagePreviewAction {
  return {
    type: SET_STAGE_PREVIEW,
    payload: preview,
    isUndoable: false,
  };
}

// **
export const UPDATE_PROJECT_SETTINGS = "Update project settings";

export interface UpdateProjectSettingsAction extends IUndoableAction<true> {
  type: typeof UPDATE_PROJECT_SETTINGS;
  payload: Partial<ISettings>;
}

export function updateProjectSettings(
  settings: Partial<ISettings>
): UpdateProjectSettingsAction {
  return {
    type: UPDATE_PROJECT_SETTINGS,
    payload: settings,
    isUndoable: true,
  };
}

//** */
export const UPDATE_SLIDE_DURATION = "Update slide duration";

export interface UpdateSlideDurationAction extends IUndoableAction<true> {
  type: typeof UPDATE_SLIDE_DURATION;
  payload: string;
}

export function updateSlideDuration(
  duration: string
): UpdateSlideDurationAction {
  return {
    type: UPDATE_SLIDE_DURATION,
    payload: duration,
    isUndoable: true,
  };
}

// ***

export const UPDATE_SLIDE_BREAKPOINTS = "Update slide breakpoints";

export interface UpdateSlideBreakpointsAction extends IUndoableAction<true> {
  type: typeof UPDATE_SLIDE_BREAKPOINTS;
  payload: Breakpoints;
}

export function updateSlideBreakpoints(
  slideBreakpoints: Breakpoints
): UpdateSlideBreakpointsAction {
  return {
    type: UPDATE_SLIDE_BREAKPOINTS,
    payload: slideBreakpoints,
    isUndoable: true,
  };
}

// ***

export const SET_GLOBALS = "Set globals configuration";

export interface SetGlobalConfigurationAction extends IUndoableAction<false> {
  type: typeof SET_GLOBALS;
  payload: Partial<IAppSettings>;
}

export function updateGlobalConfiguration(
  globals: Partial<IAppSettings>
): SetGlobalConfigurationAction {
  return {
    type: SET_GLOBALS,
    payload: globals,
    isUndoable: false,
  };
}

// ***

export const OPEN_PROJECT = "Open project";

export interface OpenProjectAction extends IUndoableAction<false> {
  type: typeof OPEN_PROJECT;
  payload: {
    slides: ISlides;
    layers: ILayers;
    objects: IObjects;
    selection: ISelection;
    document: IDocument;
    settings: ISettings;
  };
}

export function openProject(project: {
  slides: ISlides;
  layers: ILayers;
  objects: IObjects;
  selection: ISelection;
  document: IDocument;
  settings: ISettings;
}): OpenProjectAction {
  return {
    type: OPEN_PROJECT,
    payload: project,
    isUndoable: false,
  };
}

// ***

export const CREATE_NEW_PROJECT = "Create new project";

export interface CreateNewProjectAction extends IUndoableAction<false> {
  type: typeof CREATE_NEW_PROJECT;
}

export function createNewProject(): CreateNewProjectAction {
  return {
    type: CREATE_NEW_PROJECT,
    isUndoable: false,
  };
}

// *** UNDO - REDO
/*
const ignoreActions = [
  SELECT_SLIDES,
  SELECT_LAYER,
  SELECT_LAYERS,
  SELECT_OBJECTS,
  ACTIVATE_OBJECT,
  ACTIVATE_LAYER,
  ACTIVATE_SLIDE,
];*/

export function doClearHistory(): any {
  return function (dispatch: Dispatch) {
    dispatch(clear());
  };
}

export function doUndo(): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    let counter = 0;
    let jumpIdx: number = 0;

    const prevArr = [...getState().project.diff.prev];
    let diffItem: any;

    do {
      counter++;
      diffItem = prevArr.shift();
      if ((diffItem as IUndoableAction).skipHistory !== true) {
        jumpIdx = counter;
      }
    } while (jumpIdx === 0 && prevArr.length !== 0);

    dispatch(jump(-jumpIdx));
  };
}

export function doRedo(): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    let counter = 0;
    let jumpIdx: number = 0;

    const nextArr = [...getState().project.diff.next];
    let diffItem: any;

    // expected that fist action is regular (not ignorable one)
    nextArr.shift();

    // if there is only one action
    if (nextArr.length === 0) {
      dispatch(jump(1));
      return;
    }

    // if second action is regular (not ignorable one)
    if (
      nextArr.length > 0 &&
      (nextArr[0] as IUndoableAction).skipHistory !== true
    ) {
      dispatch(jump(1));
      return;
    }

    do {
      counter++;
      diffItem = nextArr.shift();
      if ((diffItem as IUndoableAction).skipHistory !== true) {
        jumpIdx = counter;
      }
    } while (jumpIdx === 0 && nextArr.length !== 0);

    if (nextArr.length === 0) {
      jumpIdx = getState().project.diff.next.length;
    }

    dispatch(jump(jumpIdx));
  };
}

export function doJump(jumpIdx: number): any {
  return function (dispatch: Dispatch) {
    dispatch(jump(jumpIdx));
  };
}

// ***
export const SET_STAGE_TOOL = "Set stage tool";

export interface SetStageToolAction extends IUndoableAction<false> {
  type: typeof SET_STAGE_TOOL;
  payload: { tool: StageTools; objectType?: ObjectType };
}

export function setStageTool(
  tool: StageTools,
  objectType?: ObjectType
): SetStageToolAction {
  return {
    type: SET_STAGE_TOOL,
    payload: { tool, objectType },
    isUndoable: false,
  };
}

// ***
export const SET_DEVICE = "Set device";

export interface SetDeviceAction extends IUndoableAction<false> {
  type: typeof SET_DEVICE;
  payload: string;
}

export function setDevice(device: string): SetDeviceAction {
  return {
    type: SET_DEVICE,
    payload: device,
    isUndoable: false,
  };
}
// ***

export const EXTERNAL_FONT_LOADED = "External font loaded";

export interface ExternalFontLoadedAction extends IUndoableAction<false> {
  type: typeof EXTERNAL_FONT_LOADED;
  payload: string;
}

export function setExternalFontLoaded(
  fontFamilyName: string
): ExternalFontLoadedAction {
  return {
    type: EXTERNAL_FONT_LOADED,
    payload: fontFamilyName,
    isUndoable: false,
  };
}

// ***

export const UPDATE_PROJECT_META = "Update project meta";

export interface UpdateProjectMetaAction extends IUndoableAction<false> {
  type: typeof UPDATE_PROJECT_META;
  payload: Partial<IMeta>;
}

export function updateProjectMeta(
  meta: Partial<IMeta>
): UpdateProjectMetaAction {
  return {
    type: UPDATE_PROJECT_META,
    payload: meta,
    isUndoable: false,
  };
}

// ***

export const UPDATE_EDITOR = "Update editor";

export interface UpdateEditorAction extends IUndoableAction<false> {
  type: typeof UPDATE_EDITOR;
  payload: Partial<IEditor>;
}

export function updateEditor(editor: Partial<IEditor>): UpdateEditorAction {
  return {
    type: UPDATE_EDITOR,
    payload: editor,
    isUndoable: false,
  };
}

// ***

// ***

export const SET_FORM_STATE = "Set form state";

export interface SetFormStateAction extends IUndoableAction<false> {
  type: typeof SET_FORM_STATE;
  payload: { formId: string; formState: IFormState };
}

export function setFormState(payload: {
  formId: string;
  formState: IFormState;
}): SetFormStateAction {
  return {
    type: SET_FORM_STATE,
    payload: payload,
    isUndoable: false,
  };
}

// ***
export type ActionTypes =
  // slide
  | AddSlideAction
  | DeleteSlideAction
  | UpdateSlideAction
  | DuplicateSlidesAction

  // layer
  | AddLayerAction
  | DeleteLayersAction
  | UpdateLayerAction

  // object
  | AddObjectAction
  | SelectObjectAction
  | UpdateObjectAction
  | DeleteObjectsAction
  | AddObjectsToSelectionAction
  | RemoveObjectsFromSelectionAction
  | MoveObjectsAction
  | MoveLayersAction
  | MoveSlidesAction

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

  // selection fro properties
  | SelectForPropertiesAction

  //settings
  | UpdateProjectSettingsAction
  | UpdateSlideDurationAction
  | UpdateSlideBreakpointsAction

  //stage
  | SetDocumentSizeAction
  | SetStageZoomAction
  | SetZoomFitAction
  | SetViewportSizeAction
  | SetStagePreviewAction
  | ForceRefreshAction

  //global
  | SetGlobalConfigurationAction

  //tools
  | SetStageToolAction

  //external fonts
  | ExternalFontLoadedAction

  // project metadata
  | UpdateProjectMetaAction

  // open project
  | OpenProjectAction
  | CreateNewProjectAction

  // editor related actions
  | UpdateEditorAction

  // responive device
  | SetDeviceAction

  // form state
  | SetFormStateAction;
