import { IPage, IPages, PageType } from "../reducers/i-pages";
import { ILayer, ILayers } from "../reducers/i-layers";
import { IStore } from "../store";
import { v4 as uuid } from "uuid";
import { Action, AnyAction } from "@reduxjs/toolkit";
import { clear, jump } from "../../3rd-party-libs/undo-redo/actions";
import axios from "axios";

import {
  cloneDeep,
  concat,
  delay,
  difference,
  differenceWith,
  intersection,
  isArray,
  isEqual,
  isUndefined,
  merge,
  once,
  uniq,
  uniqBy,
  uniqWith,
} from "lodash-es";
import { IObject, ItemType } from "webslider-sdk/lib/objects/i-object";
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
import { LayoutChildrenType } from "webslider-sdk/lib/inputs/i-inputs";
import { load } from "webfontloader";
import { ISettings, ITheme } from "../reducers/i-settings";
import {
  BreakpointConfiguration,
  Breakpoints,
} from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IMeta } from "../reducers/meta";
import { IObjects } from "../reducers/i-objects";
import { ISelection } from "../reducers/selection";
import {
  calculateObjectSize,
  getSnapLayoutSize,
} from "../../panels/stage-panel/StagePanelUtils";
import { IEditor } from "../reducers/editor";
import { IFormState } from "../reducers/i-uiforms";
import {
  getAppObjectDefinition,
  getPlayerObjectDefinition,
} from "webslider-sdk/lib/objects/objects-register";
import { TEXT, TextValues } from "../../objects/text/text";
import { humanizeSting } from "../../utils/utils";
import {
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";
import { BUTTON, getButtonHtml } from "../../objects/button/button";
import { getRichTextHtml, RICH_TEXT } from "../../objects/rich-text/rich-text";
import { BULLETS, getBulletsHtml } from "../../objects/bullets/bullets";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import {
  getTransformObjectPropertiesDefinition,
  getTransformPropertiesValues,
} from "webslider-sdk/lib/objects/transform-properties";
import {
  boundsUnion,
  getObjectBoundingBox,
} from "../helpers/objectBoundingBox";
import { getUngroupObjectsCalculation } from "../../panels/stage-panel-new/stage-panel-utils";
import {
  getAncestorLayer,
  isObjectGroup,
  isObjectInGroup,
  populateObjectThreeIds,
} from "./actions-utils";
import { IClipboard } from "../reducers/i-clipboard";
import { clipboard } from "../reducers/clipboard";
import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import { addStyle } from "../../utils/doom-utils/css-utils";
import { getGlobals } from "../../globals";
import { RGBColor } from "react-color";
import { IColors, ImageColors } from "../reducers/i-colors";

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
  slide: IPage;
}

export interface AddSlideAction extends IUndoableAction<true> {
  type: typeof ADD_SLIDE;
  payload: { slide: IPage; position?: number };
}

export function initializeSlideAndLayer(): any {
  return function (dispatch: Dispatch | any, getState: () => IStore) {
    if (getState().project.pages.pages.length === 0) {
      // load
      // const loadSlide = getDefaultSlide(PageType.Load, "Load");
      // dispatch(addSlide(loadSlide));
      // dispatch(addNewLayer(loadSlide.id));
      // back
      // const backSlide = getDefaultSlide(PageType.Back, "Back");
      // dispatch(addSlide(backSlide));
      // dispatch(addNewLayer(backSlide.id));
      // front
      // const frontSlide = getDefaultSlide(PageType.Front, "Front");
      // dispatch(addSlide(frontSlide));
      // dispatch(addNewLayer(frontSlide.id));
      // normal
      const slideName = `Page ${getState().project.pages.nextPageNameNumber}`;
      const slide = getDefaultSlide(PageType.Normal, slideName);
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

export function addNewPage(
  pageType = PageType.Normal,
  addLayer = false,
  position?: number
): any {
  return function (dispatch: Dispatch | any, getState: () => IStore) {
    const slide: IPage = {
      id: uuid(),
      //customId: "",
      name: `Page ${getState().project.pages.nextPageNameNumber}`,
      // duration: {
      //   inheritFrom: "inherit",
      //   customValue: "10s",
      // },
      // exitDuration: {
      //   inheritFrom: "inherit",
      //   customValue: "1s",
      // },
      // moveToTop: true,
      layerIds: [],
      nextLayerNameNumber: 1,
      ...(pageType === PageType.Normal ? {} : { pageType }),
      // transitionEnabled: false,
      // transitionOverlapTime: "1000ms",
      // transitionDurationTime: "1000ms",
      // transitions: getDefaultTransitionsForSlide(),
    };
    dispatch(addSlide(slide, position));
    dispatch(activateSlide(slide.id));
    dispatch(selectSlides([slide.id]));
    if (addLayer) {
      dispatch(addNewLayer(slide.id));
    }
  };
}

export function addSlide(slide: IPage, position?: number): AddSlideAction {
  return {
    type: ADD_SLIDE,
    payload: { slide, position },
    isUndoable: true,
  };
}

// ****

export const DELETE_SLIDE = "Delete slide";

export interface DeleteSlideActionPayload {
  pageId: string;
}

export interface DeleteSlideAction extends IUndoableAction<true> {
  type: typeof DELETE_SLIDE;
  payload: DeleteSlideActionPayload;
}

export function deleteSlideThree(pageId: string) {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const layerIds = getState().project.pages.pageById[pageId].layerIds;
    const objectById = getState().project.objects.objectById;
    const layerById = getState().project.layers.layerById;

    const rootObjectIds = getState().project.objects.allObjects.filter(
      (objectId: string) =>
        layerIds.indexOf(
          getState().project.objects.objectById[objectId].parentId!
        ) !== -1
    );

    const objectIds = rootObjectIds.reduce(
      (acc: string[], objectId: string) => {
        const threeIds: string[] = [];
        populateObjectThreeIds(threeIds, objectId, objectById, layerById);
        return [...acc, ...threeIds];
      },
      []
    );
    dispatch(deleteObjects(objectIds));
    dispatch(deleteLayers(layerIds));
    dispatch(deleteSlide(pageId));
  };
}

export function deleteSlide(pageId: string): DeleteSlideAction {
  return {
    type: DELETE_SLIDE,
    payload: { pageId: pageId },
    isUndoable: true,
  };
}

// update slide

export const UPDATE_SLIDE = "Update slide";

export interface UpdateSlideAction extends IUndoableAction<true> {
  type: typeof UPDATE_SLIDE;
  payload: IPage;
}

export function updateSlide(slide: IPage): UpdateSlideAction {
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
  // if true it will increase x,y slightly
  positionMove?: boolean;
  newObjectIds?: string[];
  newParentId?: string;
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
    const objectById = getState().project.objects.objectById;

    const duplicateSlidesSchema: IDuplicateSchema = [];

    const newObjectIds: string[] = [];

    slideIds.forEach((pageId) => {
      const duplicateLayersSchema: IDuplicateSchema = [];
      const layerIds = getState().project.pages.pageById[pageId].layerIds;
      layerIds.forEach((layerId) => {
        const duplicateObjectSchema: IDuplicateSchema = [];

        const objectIds =
          getState().project.layers.layerById[layerId].objectIds;

        objectIds.forEach((objectId) => {
          const newObjectId = uuid();
          newObjectIds.push(newObjectId);

          // child objects
          const duplicateChildObjectSchema: IDuplicateSchema = [];
          const toChildObjectIds: string[] = [];
          if (isObjectGroup(objectById[objectId])) {
            objectById[objectId].objectIds?.forEach((childObjectId) => {
              const toChildObjectId = uuid();
              duplicateChildObjectSchema.push({
                fromId: childObjectId,
                toId: toChildObjectId,
                childs: [],
                newParentId: newObjectId,
              });
              toChildObjectIds.push(toChildObjectId);
            });
          }

          duplicateObjectSchema.push({
            fromId: objectId,
            toId: newObjectId,
            childs: duplicateChildObjectSchema,
            newObjectIds: toChildObjectIds,
          });
        });

        duplicateLayersSchema.push({
          fromId: layerId,
          toId: uuid(),
          childs: duplicateObjectSchema,
        });
      });

      duplicateSlidesSchema.push({
        fromId: pageId,
        toId: uuid(),
        childs: duplicateLayersSchema,
      });
    });

    dispatch(_duplicateSlides(duplicateSlidesSchema));
    //dispatch(selectObjects(newObjectIds));
  };
}

// **** LAYERS ACTIONS

export const ADD_LAYER = "Add layer";

export interface AddLayerAction extends IUndoableAction<true> {
  type: typeof ADD_LAYER;
  payload: ILayer;
}

export function addNewLayer(pageId: string): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const nextId =
      getState().project.pages.pageById[pageId].nextLayerNameNumber;

    // size fro absolute posstion from breakpoint;
    const breakpointsConfiguration =
      getState().project.settings.breakpoints.breakpointsConfiguration;
    const breakpointConfig = breakpointsConfiguration.find(
      (p: any) => p.type === "device-independent"
    );
    const absoluteSize = breakpointConfig?.normal.maxSliderSize;
    const gridSize = breakpointConfig?.normal.grid;

    const layer: ILayer = {
      id: uuid(),
      // customId: "",
      type: "layer",
      pageId: pageId,
      // isBackground: isBackground,
      // name: isBackground ? `Background layer` : `Layer ${nextId}`,
      name: `Layer ${nextId}`,
      //hasTimeline: true,
      objectIds: [],
      //transitions: getDefaultTransitionsForLayer(),
      //responsiveVisibility: { showAll: true, displayOn: [] },
      // left: 0,
      // top: 0,
      // width: absoluteSize?.width,
      // height: absoluteSize?.height,
      // definition: {
      //   values: {
      //     hasLayoutChildren: false,
      //     layoutChildren: {
      //       type: LayoutChildrenType.Column,
      //       align: "start",
      //       justify: "start",
      //       wrap: "nowrap",
      //       itemsGap: {
      //         commonValue: "",
      //         eachValues: [],
      //         type: "common",
      //       },
      //     },
      //   },
      //   valuesMetadata: {},
      // },
      // commonStyleDefinition: {
      //   properties: [...getCommonObjectPropertiesDefinition(true)],
      //   values: { ...getCommonPropertiesValues() },
      //   valuesMetadata: { ...getCommonPropertiesMetadataValues() },
      // },
      // transformDefinition: {
      //   properties: [...getTransformObjectPropertiesDefinition(true)],
      //   values: { ...getTransformPropertiesValues() },
      //   valuesMetadata: {},
      // },
      // layout: "none",
      // supportedLayout: {
      //   none: true,
      //   absolute: true,
      //   snap: true,
      //   fit: true,
      //   grid: true,
      //   inset: true,
      //   // anchor: true,
      // },
      // selfSize: false,
      // fitLayout: {
      //   type: "common",
      //   common: { deviceType: "common", relativeTo: "page" },
      //   perDevice: [],
      // },
      // absoluteLayout: {
      //   type: "common",
      //   perDevice: [],
      //   relativeTo: "stage",
      //   common: {
      //     deviceType: "common",
      //     left: "0px",
      //     top: "0px",
      //     width: `${absoluteSize?.width}px`,
      //     height: `${absoluteSize?.height}px`,
      //   },
      // },
      // gridLayout: {
      //   type: "common",
      //   perDevice: [],
      //   common: {
      //     deviceType: "common",
      //     left: 0,
      //     width: gridSize?.horizontal!,
      //     top: 0,
      //     height: gridSize?.vertical!,
      //   },
      // },
      // snapLayout: {
      //   type: "common",
      //   relativeTo: "stage",
      //   perDevice: [],
      //   common: {
      //     deviceType: "common",
      //     width: "200px",
      //     height: "200px",
      //     edge: "left",
      //     offsetX: "0px",
      //     offsetY: "0px",
      //   },
      // },
      // insetLayout: {
      //   type: "common",
      //   perDevice: [],
      //   relativeTo: "stage",
      //   common: {
      //     deviceType: "common",
      //     top: "0px",
      //     left: "0px",
      //     bottom: "0px",
      //     right: "0px",
      //   },
      // },
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
    const objectById = getState().project.objects.objectById;

    const duplicateSlidesSchema: IDuplicateSchema = [];

    const pages = getState().project.pages;
    const allSlides = [
      ...pages.pages,
      ...(pages.frontPages ?? []),
      ...(pages.backPages ?? []),
      ...(pages.loadPages ?? []),
    ];

    allSlides.forEach((allSlideId) => {
      const duplicateLayersSchema: IDuplicateSchema = [];
      const allLayerIds =
        getState().project.pages.pageById[allSlideId].layerIds;
      const currentLayersIds = intersection(allLayerIds, layerIds);

      currentLayersIds.forEach((currentLayerId) => {
        const duplicateObjectSchema: IDuplicateSchema = [];

        const objectIds =
          getState().project.layers.layerById[currentLayerId].objectIds;

        objectIds.forEach((objectId) => {
          const newObjectId = uuid();
          //newObjectIds.push(newObjectId);

          // child objects
          const duplicateChildObjectSchema: IDuplicateSchema = [];
          const toChildObjectIds: string[] = [];
          if (isObjectGroup(objectById[objectId])) {
            objectById[objectId].objectIds?.forEach((childObjectId) => {
              const toChildObjectId = uuid();
              duplicateChildObjectSchema.push({
                fromId: childObjectId,
                toId: toChildObjectId,
                childs: [],
                newParentId: newObjectId,
              });
              toChildObjectIds.push(toChildObjectId);
            });
          }

          duplicateObjectSchema.push({
            fromId: objectId,
            toId: newObjectId,
            childs: duplicateChildObjectSchema,
            newObjectIds: toChildObjectIds,
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

function _activateSlide(pageId: string): ActivateSlideAction {
  return {
    type: ACTIVATE_SLIDE,
    payload: pageId,
    isUndoable: true,
    skipHistory: true,
  };
}

export function activateSlide(pageId: string) {
  return function (dispatch: Dispatch, getState: () => IStore) {
    if (getState().project.selection.activeSlideId === pageId) {
      return;
    }
    dispatch(_activateSlide(pageId));
    // activate first layer (BY DESING)
    const firstLayerId = getState().project.pages.pageById[pageId].layerIds[0];
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
      logger.app.debug(`Layer '${layerId}' is already active.`);
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
      logger.app.debug(
        `Layer '${payload.id}' is already selected for properties.`
      );
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
      logger.app.debug(`Object '${objectId}' is already active.`);
      return;
    }

    dispatch(_activateObject(objectId));

    setTimeout(() => {
      const layerId =
        getState().project.objects.objectById[objectId as string].layerId;

      // dispatch(_activateLayer(layerId));
      // dispatch(_selectLayers([layerId]));
      // dispatch(_activateObject(objectId));
    }, 2);
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

export const NORMALIZE_OBJECT_GROUP = "Normalize object group";

export interface NormalizeObjectGroupAction
  extends IUndoableAction<true, true> {
  type: typeof NORMALIZE_OBJECT_GROUP;
  payload: {
    objects: IObject[];
    breakpointConfiguration: BreakpointConfiguration;
    layerById: { [key: string]: ILayer };
  };
}

export function _normalizeObjectGroups(
  objects: IObject[],
  breakpointConfiguration: BreakpointConfiguration,
  layerById: { [key: string]: ILayer }
): NormalizeObjectGroupAction {
  return {
    type: NORMALIZE_OBJECT_GROUP,
    payload: { objects, breakpointConfiguration, layerById },
    isUndoable: true,
    skipHistory: true,
  };
}

export function normalizeObjectGroups(objects: IObject[]): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const { stage, project } = getState();

    const breakpointConfig: BreakpointConfiguration | undefined =
      project.settings.breakpoints.breakpointsConfiguration.find(
        (breakpointConfig: any) =>
          breakpointConfig.type === stage.selectedDevice
      );

    dispatch(
      _normalizeObjectGroups(
        objects,
        breakpointConfig ??
          project.settings.breakpoints.breakpointsConfiguration[0],
        project.layers.layerById
      )
    );
  };
}
// *****

export const SELECT_OBJECTS = "Select objects";

export interface SelectObjectAction extends IUndoableAction<true, true> {
  type: typeof SELECT_OBJECTS;
  payload: { selectedObjectIds: string[]; selectionPath: string[] };
}

export function _selectObjects(
  selectedObjectIds: string[],
  selectionPath: string[]
): SelectObjectAction {
  return {
    type: SELECT_OBJECTS,
    payload: { selectedObjectIds, selectionPath },
    isUndoable: true,
    skipHistory: true,
  };
}

// function populateObjectPathArr(
//   path: string[],
//   objectId: string,
//   objectById: {
//     [id: string]: IObject;
//   }
// ) {
//   const object = objectById[objectId];

//   if (object) {
//     path.push(object.id);
//     if (object.parentId) {
//       populateObjectPathArr(path, object.parentId, objectById);
//     }
//   }
// }

export function selectObjects(selectedObjectIds: string[]): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const objectById = getState().project.objects.objectById;
    const layerById = getState().project.layers.layerById;

    // // >>> Normalize group on unselect - START
    // const prevSelectedObjectIds =
    //   getState().project.selection.selectedObjectIds;

    // const unselectedObjectIds = difference(
    //   prevSelectedObjectIds,
    //   selectedObjectIds
    // );
    // const unselectedObject = unselectedObjectIds.map((id) => {
    //   return objectById[id];
    // });

    // const unselectedObjectGroup = unselectedObject.filter((object) => {
    //   return isObjectGroup(object);
    // });

    // dispatch(normalizeObjectGroups(unselectedObjectGroup));
    // // >>> Normalize group on unselect - END

    const selectionPath: string[] = [];
    // use first one to get selection path (selectedObjectIds[0])
    populateObjectThreeIds(
      selectionPath,
      selectedObjectIds[0],
      objectById,
      layerById
    );

    dispatch(_selectObjects(selectedObjectIds, selectionPath));
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
        getState().project.layers.layerById[object.layerId],
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

// move slides
export const REORDER_SLIDES = "Reorder slides";

export interface ReorderSlidesActionPayload {
  pageIds: string[];
}

export interface ReorderSlidesAction extends IUndoableAction<true, false> {
  type: typeof REORDER_SLIDES;
  payload: ReorderSlidesActionPayload;
}

export function reorderPages(pageIds: string[]): ReorderSlidesAction {
  return {
    type: REORDER_SLIDES,
    payload: { pageIds },
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
  type: string,
  objectProps: Partial<IObject>,
  values?: { [key: string]: string }
): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    let object: IObject = {
      ...createObject(type, objectProps, {
        ...values,
        //text: "Sample test",
      }),
      layerId,
      parentId: layerId,
    };

    const nextNameIdx =
      getState().project.objects.nextObjectNameNumber[type] || 1;
    object.name = humanizeSting(type, true) + " " + nextNameIdx;

    switch (object.type) {
      case TEXT:
      case RICH_TEXT: {
        handleTextUpdate(object, dispatch, getState, true);
        break;
      }
      case BUTTON: {
        postProcessButton(object, getState);
        break;
      }
      // case BULLETS: {
      //   postProcessBullet(object, getState);
      //   break;
      // }
      default: {
        const objDeff = getAppObjectDefinition(object.type);
        object = !!objDeff?.postProcess
          ? objDeff.postProcess({ prevObject: object, object })
          : object;
        break;
      }
    }

    if (!object.parentId) object.parentId = object.layerId;

    dispatch(addObject(object));
    dispatch(activateObject(object.id));
    dispatch(selectObjects([object.id]));
    dispatch(selectForProperties({ id: object.id, type: "object" }));
    if (object.type !== "text") {
      dispatch(setNextTextPosition(100));
    }

    // if (object.type === "io.forcerefresh.image.object") {
    //   dispatch(colorFromImages());
    // }
    // dispatch(collectColors());
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

export const REPLACE_OBJECT = "Replace object";

export interface ReplaceObjectAction extends IUndoableAction<true> {
  type: typeof REPLACE_OBJECT;
  payload: { replaceObjectId: string; object: IObject };
}

export function replaceObject(
  replaceObjectId: string,
  type: string,
  objectProps: Partial<IObject>,
  values?: { [key: string]: any }
): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const layerId =
      getState().project.objects.objectById[replaceObjectId].layerId;

    let object: IObject = {
      ...createObject(type, objectProps, {
        ...values,
        //text: "Sample test",
      }),
      layerId,
      parentId: layerId,
    };

    const nextNameIdx =
      getState().project.objects.nextObjectNameNumber[type] || 1;
    object.name = humanizeSting(type, true) + " " + nextNameIdx;

    switch (object.type) {
      case TEXT:
      case RICH_TEXT: {
        handleTextUpdate(object, dispatch, getState, true, false, false);
        break;
      }
      case BUTTON: {
        postProcessButton(object, getState);
        break;
      }
      // case BULLETS: {
      //   postProcessBullet(object, getState);
      //   break;
      // }
      default: {
        const objDeff = getAppObjectDefinition(object.type);
        object = !!objDeff?.postProcess
          ? objDeff.postProcess({ prevObject: object, object })
          : object;
        break;
      }
    }

    if (!object.parentId) object.parentId = object.layerId;

    dispatch(_replaceObject(replaceObjectId, object));
    dispatch(activateObject(object.id));
    dispatch(selectObjects([object.id]));
    dispatch(selectForProperties({ id: object.id, type: "object" }));
    if (object.type !== "text") {
      dispatch(setNextTextPosition(100));
    }

    // if (object.type === "io.forcerefresh.image.object") {
    //   dispatch(colorFromImages());
    // }
    // dispatch(collectColors());
  };
}

export function _replaceObject(
  replaceObjectId: string,
  object: IObject
): ReplaceObjectAction {
  return {
    type: REPLACE_OBJECT,
    payload: { replaceObjectId, object },
    isUndoable: true,
  };
}

// ******

export const DELETE_OBJECTS = "Delete objects";

export interface DeleteObjectsAction extends IUndoableAction<true> {
  type: typeof DELETE_OBJECTS;
  payload: string[];
}

export function _deleteObjects(objectIds: string[]): DeleteObjectsAction {
  return {
    type: DELETE_OBJECTS,
    payload: objectIds,
    isUndoable: true,
  };
}

export function deleteObjects(objectToDeleteIds: string[]) {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const objectById = getState().project.objects.objectById;

    let hasImage = false;

    const finalObjectToDeleteIds = objectToDeleteIds.map((objectToDeleteId) => {
      const objectToDelete = objectById[objectToDeleteId];

      hasImage =
        hasImage || objectToDelete.type === "io.forcerefresh.image.object";

      if (isObjectInGroup(objectToDelete, objectById)) {
        // check if after delete group will be empty
        const group = objectById[objectToDelete.parentId!];
        const newIds = group.objectIds?.filter(
          (objId) => !objectToDeleteIds.includes(objId)
        );

        // if group will be empty return group id - we are deleting group as well
        if (newIds?.length === 0) return group.id;
      }
      return objectToDeleteId;
    });

    dispatch(_deleteObjects(finalObjectToDeleteIds));
    // dispatch(collectColors());
    // if (hasImage) {
    //   dispatch(colorFromImages());
    // }
  };
}

// ******

// duplicate objects

export function duplicateObjects(objectIds: string[]) {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const objectById = getState().project.objects.objectById;

    const duplicateSlidesSchema: IDuplicateSchema = [];

    const newObjectIds: string[] = [];

    const pages = getState().project.pages;
    const allSlides = [
      ...pages.pages,
      ...(pages.frontPages ?? []),
      ...(pages.backPages ?? []),
      ...(pages.loadPages ?? []),
    ];

    allSlides.forEach((allSlideId) => {
      const duplicateLayersSchema: IDuplicateSchema = [];
      const allLayerIds =
        getState().project.pages.pageById[allSlideId].layerIds;
      //const currentLayersIds = intersection(allLayerIds, layerIds);
      allLayerIds.forEach((allLayerId) => {
        const duplicateObjectSchema: IDuplicateSchema = [];
        const allObjectIds =
          getState().project.layers.layerById[allLayerId].objectIds;

        const currentObjectsIds = intersection(allObjectIds, objectIds);

        currentObjectsIds.forEach((objectId) => {
          const newObjectId = uuid();
          newObjectIds.push(newObjectId);

          // child objects
          const duplicateChildObjectSchema: IDuplicateSchema = [];
          const toChildObjectIds: string[] = [];
          if (isObjectGroup(objectById[objectId])) {
            objectById[objectId].objectIds?.forEach((childObjectId) => {
              const toChildObjectId = uuid();
              duplicateChildObjectSchema.push({
                fromId: childObjectId,
                toId: toChildObjectId,
                childs: [],
                newParentId: newObjectId,
              });
              toChildObjectIds.push(toChildObjectId);
            });
          }

          duplicateObjectSchema.push({
            fromId: objectId,
            toId: newObjectId,
            childs: duplicateChildObjectSchema,
            positionMove: true,
            newObjectIds: toChildObjectIds,
          });

          //
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

    dispatch(_duplicateSlides(duplicateSlidesSchema));

    dispatch(activateObject(newObjectIds[0]));
    dispatch(selectObjects(newObjectIds));
    dispatch(selectForProperties({ id: newObjectIds[0], type: "object" }));
  };
}

export const UNGROUP_OBJECTS = "Ungroup objects";

export interface UngroupObjectAction extends IUndoableAction<true> {
  type: typeof UNGROUP_OBJECTS;
  payload: {
    groupId: string;
    objectIds: string[];
    parentId: string;
    transformPerObject: any;
  };
}

export function _ungroupObject(
  groupId: string,
  objectIds: string[],
  parentId: string,
  transformPerObject: any
): UngroupObjectAction {
  return {
    type: UNGROUP_OBJECTS,
    payload: { groupId, objectIds, parentId, transformPerObject },
    isUndoable: true,
  };
}

export function ungroupObject(objectId: string): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const state = getState();
    const { settings, layers } = state.project;

    const objectById = getState().project.objects.objectById;
    const layerById = getState().project.layers.layerById;
    const groupObject = objectById[objectId];
    const parentId = groupObject.parentId;
    const groupId = groupObject.id;
    const objectIds = groupObject.objectIds;

    const breakpointConfig: BreakpointConfiguration | undefined =
      settings.breakpoints.breakpointsConfiguration.find(
        (breakpointConfig: any) =>
          breakpointConfig.type === state.stage.selectedDevice
      );

    const transformPerObject = getUngroupObjectsCalculation({
      group: groupObject,
      objects: groupObject.objectIds!.map((objectId) => objectById[objectId]),
      breakpointConfig: breakpointConfig!,
      parentLayer: getAncestorLayer(groupObject, layerById, objectById),
    });

    if (objectIds && parentId) {
      dispatch(
        _ungroupObject(groupId, objectIds, parentId, transformPerObject)
      );

      dispatch(activateObject(objectIds[0]));
      dispatch(selectObjects(objectIds));
      dispatch(selectForProperties({ id: objectIds[0], type: "object" }));
    }
  };
}
// ***
// ******

export const GROUP_OBJECTS = "Group objects";

export interface GroupObjectsAction extends IUndoableAction<true> {
  type: typeof GROUP_OBJECTS;
  payload: {
    objectIds: string[];
    updatedObjectsById: { [id: string]: IObject<{}> };
    group: IObject;
    groupIdsForRemoval: string[];
  };
}

export function _groupObjects(
  group: IObject,
  objectIds: string[],
  updatedObjectsById: { [id: string]: IObject<{}> },
  groupIdsForRemoval: string[]
): GroupObjectsAction {
  return {
    type: GROUP_OBJECTS,
    payload: { group, objectIds, groupIdsForRemoval, updatedObjectsById },
    isUndoable: true,
  };
}

export function groupObjects(objectIds: string[]): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const objectById = getState().project.objects.objectById;
    const settings = getState().project.settings;
    const layerById = getState().project.layers.layerById;
    const { selectedDevice } = getState().stage;

    // ***********
    // 1. UNGROUP
    // ***********
    let allObjectsIds: string[] = [];
    const allObjectsById: { [id: string]: IObject<{}> } = {};
    const groupIdsForRemoval: string[] = [];
    objectIds.forEach((objectId) => {
      const object = objectById[objectId];
      if (isObjectGroup(object)) {
        const groupObject = objectById[objectId];
        const parentLayerId = groupObject.parentId;
        const groupId = groupObject.id;
        const objectIds = groupObject.objectIds;

        const breakpointConfig: BreakpointConfiguration | undefined =
          settings.breakpoints.breakpointsConfiguration.find(
            (breakpointConfig: any) => breakpointConfig.type === selectedDevice
          );

        const transformPerObject = getUngroupObjectsCalculation({
          group: groupObject,
          objects: groupObject.objectIds!.map(
            (objectId) => objectById[objectId]
          ),
          breakpointConfig: breakpointConfig!,
          parentLayer: getAncestorLayer(groupObject, layerById, objectById),
        });

        //////
        objectIds?.forEach((objId: string) => {
          const obj = cloneDeep(objectById[objId]);
          //const obj: IObject = {
          //  ...objectById[objId],
          obj.scale = transformPerObject[objId].scale;
          obj.rotation = transformPerObject[objId].rotation;

          // NOTE: LAYOUT CHANGE
          obj.left = transformPerObject[objId].left;
          obj.top = transformPerObject[objId].top;

          obj.parentId = groupObject.parentId;
          obj.layerId = groupObject.layerId;
          // obj.absoluteLayout!.common.left =
          //   parseInt(obj.absoluteLayout!.common.left) +
          //   parseInt(groupObject.absoluteLayout!.common.left) +
          //   "px";
          // obj.absoluteLayout!.common.top =
          //   parseInt(obj.absoluteLayout!.common.top) +
          //   parseInt(groupObject.absoluteLayout!.common.top) +
          //   "px";
          allObjectsById[objId] = obj;

          allObjectsIds.push(objId);
        });
        // ///
        //
        groupIdsForRemoval.push(objectId);

        //if (objectIds && parentId) {
        //dispatch(
        //   _ungroupObject(
        //     groupId,
        //     objectIds,
        //     parentLayerId,
        //     transformPerObject
        //   )
        // );

        // dispatch(activateObject(objectIds[0]));
        // dispatch(selectObjects(objectIds));
        // dispatch(selectForProperties({ id: objectIds[0], type: "object" }));
        // }
        // TODO
        //
        //allObjectsIds = [...allObjectsIds];
      } else {
        allObjectsIds.push(objectId);
        allObjectsById[objectId] = cloneDeep(objectById[objectId]);
      }
    });

    // ***********
    // 2. GROUP
    // ***********

    const firstObject = allObjectsById[allObjectsIds[0]];

    // get group bounds (TODO: duplicate)
    let groupBounds = getObjectBoundingBox(firstObject);
    allObjectsIds.forEach((objectId) => {
      const object = allObjectsById[objectId];
      const bounds = getObjectBoundingBox(object);
      groupBounds = boundsUnion(groupBounds, bounds);
    });

    //const objects: IObject[] = [];
    //  normalize object pos
    const layerId = firstObject.layerId;
    allObjectsIds.forEach((objectId) => {
      // TODO: why we are mutating ???
      const object = allObjectsById[objectId];
      // NOTE: LAYOUT CHANGE
      object.top = object.top! - groupBounds.y;
      object.left = object.left! - groupBounds.x;

      //delete object.layerId;
      //objects.push(object);
    });

    const groupObject: IObject = {
      ...createObject("group", {}, {}),
      left: groupBounds.x,
      top: groupBounds.y,
      width: groupBounds.width,
      height: groupBounds.height,
      name: "Group",
      //layout: "absolute",
      // absoluteLayout: {
      //   relativeTo: "page",
      //   perDevice: [],
      //   type: "common",
      //   common: {
      //     deviceType: "common",
      //     left: groupBounds.x + "px",
      //     top: groupBounds.y + "px",
      //     width: groupBounds.width + "px",
      //     height: groupBounds.height + "px",
      //   },
      // },
      parentId: firstObject.parentId,
      objectIds: allObjectsIds,
      layerId,
    };

    const nextNameIdx =
      getState().project.objects.nextObjectNameNumber["group"] || 1;
    groupObject.name = humanizeSting("group", true) + " " + nextNameIdx;

    // objects.forEach((object) => {
    //   object.parentId = groupObject.id;
    //   dispatch(_updateObject(object));
    // });

    dispatch(
      _groupObjects(
        groupObject,
        allObjectsIds,
        allObjectsById,
        groupIdsForRemoval
      )
    );
    dispatch(activateObject(groupObject.id));
    dispatch(selectObjects([groupObject.id]));
    dispatch(selectForProperties({ id: groupObject.id, type: "object" }));
  };
}

// ****
// TODO: this is object update middleware!!! move somewhere!!!
function handleObjectUpdate(
  object: IObject,
  dispatch: Dispatch,
  getState: () => IStore,
  isPreview = false
) {
  const state = getState();

  const prevObject = state.project.objects.objectById[object.id];

  // round to max two decimals
  object.left = roundNumber(object.left!, 2);
  object.width = roundNumber(object.width!, 2);
  object.top = roundNumber(object.top!, 2);
  object.height = roundNumber(object.height!, 2);

  const objDeff = getAppObjectDefinition(object.type);
  object = !!objDeff?.postProcess
    ? objDeff.postProcess({ prevObject, object })
    : object;

  // TODO: REMOVE TO POSTPROCESS
  switch (object.type) {
    case TEXT:
    case RICH_TEXT: {
      handleTextUpdate(object, dispatch, getState, undefined, !isPreview);
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
    // case IMAGE: {
    //   handleImageUpdate(object, dispatch, getState);
    //   break;
    // }
    default: {
      dispatch(_updateObject(object, !isPreview));
      if (object.type === "io.forcerefresh.image.object") {
        dispatch(colorFromImages());
      }
    }
  }
}

// function handleImageUpdate(
//   object: IObject,
//   dispatch: Dispatch,
//   getState: () => IStore
// ): void {
//   // only one image object can have useForThumbnail
//   const object2 = getObjectThatHaveThumbnailSet(object, getState);
//   if (object2) {
//     const object2Clone = cloneDeep(object2);
//     (object2Clone.definition.values as ImageValues).useForThumbnail = false;
//     dispatch(_updateObject(object2Clone));
//   }

//   dispatch(_updateObject(object));
// }

/* This method mutate object*/
// function getObjectThatHaveThumbnailSet(
//   object: IObject,
//   getState: () => IStore
// ): IObject | undefined {
//   if (!(object.definition.values as ImageValues).useForThumbnail) {
//     return undefined;
//   }

//   const layer = getState().project.layers.layerById[object.layerId];
//   const pageId = layer.pageId;
//   const slide = getState().project.pages.pageById[pageId];
//   const layerById = getState().project.layers.layerById;

//   let objectIdsInSlide: any[] = [];
//   slide.layerIds.forEach((layerId) => {
//     objectIdsInSlide = [...objectIdsInSlide, ...layerById[layerId].objectIds];
//   });

//   let retObj: IObject | undefined;
//   const objectById = getState().project.objects.objectById;
//   objectIdsInSlide.forEach((objectId) => {
//     if (
//       objectId !== object.id &&
//       (objectById[objectId].definition.values as ImageValues).useForThumbnail
//     ) {
//       retObj = objectById[objectId];
//     }
//   });

//   return retObj;
// }

function handleBulletsUpdate(
  object: IObject,
  dispatch: Dispatch,
  getState: () => IStore
): void {
  //postProcessBullet(object, getState);
  dispatch(_updateObject(object));
  dispatch(forceRefresh());
}

/* This method mutate object*/
// function postProcessBullet(object: IObject, getState: () => IStore): void {
//   if (object.layout === "absolute" || object.layout === "snap") {
//     const breakpointConfig: BreakpointConfiguration | undefined =
//       getState().project.settings.breakpoints.breakpointsConfiguration.find(
//         (breakpointConfig: any) =>
//           breakpointConfig.type === getState().stage.selectedDevice
//       );
//     // todo: calculate for all not only for one
//     const calculatedObjectSize = calculateObjectSize(
//       object,
//       getState().project.layers.layerById[object.layerId],
//       breakpointConfig!,
//       {
//         resetPosition: false,
//       }
//     );
//     const html = getBulletsHtml({
//       object,
//       calculatedObjectSize: {
//         ...calculatedObjectSize,
//         width: undefined,
//         height: undefined,
//       },
//       isPlayer: false,
//       // calculateSize: () => 0,
//     });
//     const holder = document.createElement("div");
//     holder.style.overflow = "visible";
//     holder.innerHTML = html;
//     const el = holder.querySelector("div")! as HTMLDivElement;
//     //el.style.position = "relative";
//     document.body.appendChild(holder);
//     // NOTE: LAYOUT CHANGE
//     object.width = el.offsetWidth!;
//     object.height = el.offsetHeight!;
//     const snapSizeObj = getSnapLayoutSize(
//       object.snapLayout!,
//       getState().stage.selectedDevice
//     );
//     snapSizeObj.width = el.offsetWidth! + "px";
//     snapSizeObj.height = el.offsetHeight! + "px";
//     document.body.removeChild(holder);
//   }
// }

/* This method mutate object*/
function postProcessButton(object: IObject, getState: () => IStore): void {
  //if (object.layout === "absolute") {
  // const breakpointConfig: BreakpointConfiguration | undefined =
  //   getState().project.settings.breakpoints.breakpointsConfiguration.find(
  //     (breakpointConfig: any) =>
  //       breakpointConfig.type === getState().stage.selectedDevice
  //   );
  // todo: calculate for all not only for one
  // const calculatedObjectSize = calculateObjectSize(
  //   object,
  //   getState().project.layers.layerById[object.layerId],
  //   breakpointConfig!,
  //   {
  //     resetPosition: false,
  //   }
  // );
  const html = getButtonHtml({
    object,
    // calculatedObjectSize: {
    //   ...calculatedObjectSize,
    //   width: undefined,
    //   height: undefined,
    // },
  });
  const holder = document.createElement("div");
  holder.style.overflow = "visible";
  holder.innerHTML = html;
  holder.querySelector("button")!.style.position = "relative";
  document.body.appendChild(holder);
  // NOTE: LAYOUT CHANGE
  object.width = holder.querySelector("button")?.offsetWidth!;
  object.height = holder.querySelector("button")?.offsetHeight!;
  document.body.removeChild(holder);
  //}
}

function handleButtonUpdate(
  object: IObject,
  dispatch: Dispatch,
  getState: () => IStore
): void {
  postProcessButton(object, getState);
  dispatch(_updateObject(object));
  dispatch(forceRefresh());
}

function processTextObjectAutoSize(
  object: IObject,
  isAdd: boolean,
  getState: any
) {
  const objectValues = object.properties as any;
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
      getState().project.layers.layerById[object.layerId],
      breakpointConfig!,
      {
        resetPosition: false,
      }
    );

    // Note: We are using getPlayerObjectDefinition in order to get html form player object
    const objDeff = getPlayerObjectDefinition(object.type);
    let html = "";
    if (!!objDeff?.getHtml) {
      html = objDeff?.getHtml({
        object,
        calculatedObjectSize,
        isPlayer: true,
        //calculateSize: () => 0,
      });
    } else if (object.type === RICH_TEXT) {
      html = getRichTextHtml({ object, calculatedObjectSize });
    }

    const holder = document.createElement("div");
    holder.innerHTML = html;
    console.log(html);
    const pEl = holder.firstChild! as HTMLElement;
    pEl.style.position = "relative";
    pEl.style.display = "inline-block";
    pEl.style.width = objectValues.initialAutoWidth
      ? "auto"
      : `${calculatedObjectSize.width}`;
    pEl.style.height = `auto`;
    document.body.appendChild(holder);
    object.height = pEl.offsetHeight;
    // NOTE: LAYOUT CHANGE
    //if (object.absoluteLayout) {
    object.height = pEl.offsetHeight;

    if (isAdd) {
      if (objectValues.initialAutoWidth === true) {
        // autoWidthValue = pEl.offsetWidth + 5;
        object.width = pEl.offsetWidth + 5;
        // delete objectValues.initialAutoWidth;
      }

      // if (reposition) {
      //   const nextTextPositionY = getState().stage.nextTextPositionY;
      //   object.top = nextTextPositionY;

      //   dispatch(setNextTextPosition(nextTextPositionY + pEl.offsetHeight));
      // }
    }
    //}

    document.body.removeChild(holder);
  }
}

function handleTextUpdate(
  object: IObject,
  dispatch: Dispatch,
  getState: () => IStore,
  isAdd = false,
  isUndoable = true,
  reposition = true
): void {
  // * handle auto height
  const objectValues = object.properties as TextValues;

  // if (objectValues.autoHeight === true) {
  //   // TODO: IMPORTANT hardcoded
  //   const breakpointConfig: BreakpointConfiguration | undefined =
  //     getState().project.settings.breakpoints.breakpointsConfiguration.find(
  //       (breakpointConfig: any) =>
  //         breakpointConfig.type === getState().stage.selectedDevice
  //     );
  //   // todo: calculate for all not only for one
  //   const calculatedObjectSize = calculateObjectSize(
  //     object,
  //     getState().project.layers.layerById[object.layerId],
  //     breakpointConfig!,
  //     {
  //       resetPosition: false,
  //     }
  //   );

  //   // Note: We are using getPlayerObjectDefinition in order to get html form player object
  //   const objDeff = getPlayerObjectDefinition(object.type);
  //   let html = "";
  //   if (!!objDeff?.getHtml) {
  //     html = objDeff?.getHtml({
  //       object,
  //       calculatedObjectSize,
  //       isPlayer: true,
  //       //calculateSize: () => 0,
  //     });
  //   } else if (object.type === RICH_TEXT) {
  //     html = getRichTextHtml({ object, calculatedObjectSize });
  //   }

  //   const holder = document.createElement("div");
  //   holder.innerHTML = html;
  //   const pEl = holder.firstChild! as HTMLElement;
  //   pEl.style.position = "relative";
  //   pEl.style.display = "inline-block";
  //   pEl.style.width = objectValues.initialAutoWidth
  //     ? "auto"
  //     : `${calculatedObjectSize.width}`;
  //   pEl.style.height = `auto`;
  //   document.body.appendChild(holder);
  //   object.height = pEl.offsetHeight;
  //   // NOTE: LAYOUT CHANGE
  //   //if (object.absoluteLayout) {
  //   object.height = pEl.offsetHeight;

  //   if (isAdd) {
  //     if (objectValues.initialAutoWidth === true) {
  //       object.width = pEl.offsetWidth + 5;
  //       delete objectValues.initialAutoWidth;
  //     }

  //     // if (reposition) {
  //     //   const nextTextPositionY = getState().stage.nextTextPositionY;
  //     //   object.top = nextTextPositionY;

  //     //   dispatch(setNextTextPosition(nextTextPositionY + pEl.offsetHeight));
  //     // }
  //   }
  //   //}

  //   document.body.removeChild(holder);
  // }

  // * handle font loading
  const objectPrevState = getState().project.objects.objectById[object.id];
  const { loadedFontFamilies } = getState().fonts;

  const newObjectValues = object.properties as TextValues;
  const oldObjectValues = (objectPrevState?.properties ?? {
    font: {},
  }) as TextValues;

  const newFont = newObjectValues.font.fontFamily;
  const oldFont = oldObjectValues.font.fontFamily;

  // NOTE: update object once. update either after font is loaded or after 500ms
  const updateObjectOnce = once(() => {
    processTextObjectAutoSize(object, isAdd, getState);
    dispatch(_updateObject(object, isUndoable));
    // dispatch(forceRefresh());
  });

  // NOTE: check if we need to load fonts
  if (
    newObjectValues.font.source !== "system" &&
    (newFont !== oldFont ||
      newObjectValues.font.weight !== oldObjectValues.font.weight) &&
    loadedFontFamilies.indexOf(newFont + ":" + newObjectValues.font.weight) ===
      -1
  ) {
    delay(updateObjectOnce, 1500);

    // load font
    if (newObjectValues.font.source === "my-fonts") {
      const fontObj = getGlobals()
        .getMyFonts()
        .find((font) => font.name === newObjectValues.font.fontFamily);

      if (fontObj) {
        const fontFileName = fontObj.mediaSizes.find(
          (size) => size.sizeType === "original"
        )?.sourceFilename;

        const fontUrl = `/api/v1/media/${fontFileName}`;

        // add css first
        addStyle(`
        @font-face{
          font-family: "${newObjectValues.font.fontFamily}";
          src: url("${fontUrl}");
        }
      `);
      }
    }

    const loadSource =
      newObjectValues.font.source === "my-fonts" ? "custom" : "google";

    load({
      [loadSource]: {
        families: [newFont + ":" + newObjectValues.font.weight],
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

export function getFVD(weight: string) {
  return "n" + weight.substring(0, 1);
}

export const UPDATE_OBJECT = "Update object";

export interface UpdateObjectAction extends IUndoableAction<true | false> {
  type: typeof UPDATE_OBJECT;
  payload: IObject;
}

export function updateObjectForPreview(object: IObject): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    handleObjectUpdate(object, dispatch, getState, true);
  };
}

export function updateObject(object: IObject): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    handleObjectUpdate(object, dispatch, getState);

    // dispatch(collectColors());

    // const { objectById } = getState().project.objects;
    // const parent = objectById[object.parentId!];
    // if(object.parentId && objectById[object.parentId]){
    // if (isObjectGroup(parent)) {
    //   dispatch(normalizeObjectGroups([parent]));
    // }

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

export function _updateObject(
  object: IObject,
  isUndoable = true
): UpdateObjectAction {
  return {
    type: UPDATE_OBJECT,
    payload: object,
    isUndoable,
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

export const SET_STAGE_PAN = "Set stage pan";

export interface SetPanFitAction extends IUndoableAction<false> {
  type: typeof SET_STAGE_PAN;
  payload: { x: number; y: number };
}

export function setStagePan(pan: { x: number; y: number }): SetPanFitAction {
  return {
    type: SET_STAGE_PAN,
    payload: pan,
    isUndoable: false,
  };
}
// ******

// ******

export const AI_ENABLE = "AI enable";

export interface AIEnableAction extends IUndoableAction<false> {
  type: typeof AI_ENABLE;
  payload: { objectType: string; enabled: boolean }[];
}

export function setAIEnabled(
  payload: {
    objectType: string;
    enabled: boolean;
  }[]
): AIEnableAction {
  return {
    type: AI_ENABLE,
    payload,
    isUndoable: false,
  };
}
// ******

export const AI_REQUEST_LOADING = "AI request loading";

export interface AIRequestLoadingAction extends IUndoableAction<false> {
  type: typeof AI_REQUEST_LOADING;
  payload: { objectId: string; loading: boolean };
}

export function setAIRequestLoading(payload: {
  objectId: string;
  loading: boolean;
}): AIRequestLoadingAction {
  return {
    type: AI_REQUEST_LOADING,
    payload,
    isUndoable: false,
  };
}
// ******

// ******

export const NEXT_TEXT_POSITION = "Next text position";

export interface NextTextPositionAction extends IUndoableAction<false> {
  type: typeof NEXT_TEXT_POSITION;
  payload: number;
}

export function setNextTextPosition(yPos: number): NextTextPositionAction {
  return {
    type: NEXT_TEXT_POSITION,
    payload: yPos,
    isUndoable: false,
  };
}
// ******

export const SHOW_SIMPLIFIED_LAYERS = "Show simplified layer";

export interface ShowSimplifiedLayersAction extends IUndoableAction<false> {
  type: typeof SHOW_SIMPLIFIED_LAYERS;
  payload: boolean;
}

export function showSimplifiedLayers(
  show: boolean
): ShowSimplifiedLayersAction {
  return {
    type: SHOW_SIMPLIFIED_LAYERS,
    payload: show,
    isUndoable: false,
  };
}
// ******

// ******

export const SHOW_SIMPLIFIED_PAGES = "Show simplified pages";

export interface ShowSimplifiedPagesAction extends IUndoableAction<false> {
  type: typeof SHOW_SIMPLIFIED_PAGES;
  payload: boolean;
}

export function showSimplifiedPages(show: boolean): ShowSimplifiedPagesAction {
  return {
    type: SHOW_SIMPLIFIED_PAGES,
    payload: show,
    isUndoable: false,
  };
}
// ******

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

export const CLIPBOARD_CLEAR = "Clear clipboard";

export interface ClearClipboardAction extends IUndoableAction<false> {
  type: typeof CLIPBOARD_CLEAR;
}

export function clearClipboard(): ClearClipboardAction {
  return {
    type: CLIPBOARD_CLEAR,
    isUndoable: false,
  };
}

// *******

export const CLIPBOARD_CUT = "Cut to clipboard";

export interface CutToClipboardAction extends IUndoableAction<false> {
  type: typeof CLIPBOARD_CUT;
  payload: IClipboard;
}

export function cutToClipboard(
  payload: Pick<IClipboard, "entityType" | "entityIds">
): CutToClipboardAction {
  return {
    type: CLIPBOARD_CUT,
    payload: { ...payload, operation: "cut" },
    isUndoable: false,
  };
}

// ******

export const CLIPBOARD_COPY = "Copy to clipboard";

export interface CopyToClipboardAction extends IUndoableAction<false> {
  type: typeof CLIPBOARD_COPY;
  payload: IClipboard;
}

export function copyToClipboard(
  payload: Pick<IClipboard, "entityType" | "entityIds">
): CopyToClipboardAction {
  return {
    type: CLIPBOARD_COPY,
    payload: { ...payload, operation: "copy" },
    isUndoable: false,
  };
}

// ******

// ******

export const CLIPBOARD_PASTE_OBJECTS = "Paste objects from clipboard";

export interface PasteObjectsFromClipboardAction
  extends IUndoableAction<false> {
  type: typeof CLIPBOARD_PASTE_OBJECTS;
  payload: {
    objectIds: string[];
    newObjectMapping: {
      objectId: string;
      newObjectId: string;
      fromLayer?: string;
      fromParent?: string;
      toLayerId: string;
      child:
        | {
            objectId: string;
            newObjectId: string;
            fromLayer: string | undefined;
            fromParent: string | undefined;
            toLayerId: string;
            toParentId: string;
          }[]
        | undefined;
    }[];
    operation: "copy" | "cut";
  };
}

export function pasteObjectsFromClipboard(toLayerId: string): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    const state = getState();
    const { clipboard, objects } = state.project;

    const getChildMapping = (objectId: string, newObjectId: string) => {
      const object = objects.objectById[objectId];
      if (object.objectIds && object.objectIds.length > 0) {
        return object.objectIds.map((childObjectId) => {
          return {
            objectId: childObjectId,
            newObjectId: uuid(),
            fromLayer: objects.objectById[childObjectId].layerId,
            fromParent: objects.objectById[childObjectId].parentId,
            toLayerId,
            toParentId: newObjectId,
          };
        });
      }
      return undefined;
    };

    if (clipboard.entityIds && clipboard.operation) {
      const objectIds = clipboard.entityIds;
      const newObjectMapping = objectIds.map((objectId) => {
        const newObjectId = uuid();
        return {
          objectId,
          newObjectId,
          fromLayer: objects.objectById[objectId].layerId,
          fromParent: objects.objectById[objectId].parentId,
          toLayerId,
          child: getChildMapping(objectId, newObjectId),
        };
      });

      const newObjectIds = newObjectMapping.map((item) => item.newObjectId);

      dispatch(
        _pasteObjectsFromClipboard(
          objectIds,
          newObjectMapping,
          clipboard.operation
        )
      );

      dispatch(activateObject(newObjectIds[0]));
      dispatch(selectObjects(newObjectIds));
      dispatch(selectForProperties({ type: "object", id: newObjectIds[0] }));
    }
  };
}

export function _pasteObjectsFromClipboard(
  objectIds: string[],
  newObjectMapping: {
    objectId: string;
    newObjectId: string;
    fromLayer?: string;
    fromParent?: string;
    toLayerId: string;
    child:
      | {
          objectId: string;
          newObjectId: string;
          fromLayer: string | undefined;
          fromParent: string | undefined;
          toLayerId: string;
          toParentId: string;
        }[]
      | undefined;
  }[],
  operation: "cut" | "copy"
): PasteObjectsFromClipboardAction {
  return {
    type: CLIPBOARD_PASTE_OBJECTS,
    payload: { objectIds, newObjectMapping, operation },
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
    pages: IPages;
    layers: ILayers;
    objects: IObjects;
    selection: ISelection;
    document: IDocument;
    settings: ISettings;
  };
}

export function openProject(project: {
  pages: IPages;
  layers: ILayers;
  objects: IObjects;
  selection: ISelection;
  document: IDocument;
  settings: ISettings;
}): any {
  return function (dispatch: Dispatch, _getState: () => IStore) {
    dispatch(_openProject(project));
    // dispatch(collectColors());
    // dispatch(colorFromImages());
  };
}

export function _openProject(project: {
  pages: IPages;
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

export interface CreateNewProjectActionPayload {
  width: string;
  height: string;
  name: string;
  margins: { left: number; top: number; right: number; bottom: number };
}

export const CREATE_NEW_PROJECT = "Create new project";

export interface CreateNewProjectAction extends IUndoableAction<false> {
  type: typeof CREATE_NEW_PROJECT;
  payload: CreateNewProjectActionPayload;
}

export function createNewProject(
  payload: CreateNewProjectActionPayload
): CreateNewProjectAction {
  return {
    type: CREATE_NEW_PROJECT,
    isUndoable: false,
    payload,
  };
}

// ***

export const CREATE_NEW_PROJECT_FROM_EXISTING =
  "Create new project from existing";

export interface CreateNewProjectFromExistingAction
  extends IUndoableAction<false> {
  type: typeof CREATE_NEW_PROJECT_FROM_EXISTING;
  payload: CreateNewProjectActionPayload;
}

export function createNewProjectFromExisting(
  payload: CreateNewProjectActionPayload
): CreateNewProjectFromExistingAction {
  return {
    type: CREATE_NEW_PROJECT_FROM_EXISTING,
    isUndoable: false,
    payload,
  };
}

// ***

export const SET_THEME = "Set theme";

export interface SetThemeAction extends IUndoableAction<false> {
  type: typeof SET_THEME;
  payload: ITheme;
}

export function setTheme(theme: ITheme): SetThemeAction {
  return {
    type: SET_THEME,
    payload: theme,
    isUndoable: false,
  };
}

export const ADD_RECENT_COLOR = "Add recent color";

export interface AddRecentColor extends IUndoableAction<false> {
  type: typeof ADD_RECENT_COLOR;
  payload: RGBColor;
}

export function addRecentColor(color: RGBColor): AddRecentColor {
  return {
    type: ADD_RECENT_COLOR,
    payload: color,
    isUndoable: false,
  };
}

// ___

export const UPDATE_COLORS_STATE = "Update colors store";

export interface UpdateColorsStateAction extends IUndoableAction<false> {
  type: typeof UPDATE_COLORS_STATE;
  payload: Partial<IColors>;
}

export function updateColorsState(
  colorsState: Partial<IColors>
): UpdateColorsStateAction {
  return {
    type: UPDATE_COLORS_STATE,
    payload: colorsState,
    isUndoable: false,
  };
}
// ++++

// ___

export const UPDATE_BRAND_COLORS = "Update brand colors";

export interface UpdateBrandColorsAction extends IUndoableAction<false> {
  type: typeof UPDATE_BRAND_COLORS;
  payload: { name: string; colors: RGBColor[] }[];
}

export function _updateBrandColors(
  brandColors: { name: string; colors: RGBColor[] }[]
): UpdateBrandColorsAction {
  return {
    type: UPDATE_BRAND_COLORS,
    payload: brandColors,
    isUndoable: false,
  };
}

export function updateBrandColors(
  brandColors: { name: string; colors: RGBColor[] }[]
): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    dispatch(_updateBrandColors(brandColors));
    dispatch(updateEditor({ sliderChanged: true }));
  };
}

// ++++

export const COLORS_FROM_IMAGES = "Colors from images";

export interface ColorsFromImagesAction extends IUndoableAction<false> {
  type: typeof COLORS_FROM_IMAGES;
  payload: ImageColors[];
}

function _colorFromImages(imagesColors: ImageColors[]): ColorsFromImagesAction {
  return {
    type: COLORS_FROM_IMAGES,
    payload: imagesColors,
    isUndoable: false,
  };
}

export function colorFromImages(imagesColors: ImageColors[]): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    dispatch(_colorFromImages(imagesColors));
  };
}

// ++++

export const COLLECT_COLORS = "Collect Colors";

export interface CollectColorsAction extends IUndoableAction<false> {
  type: typeof COLLECT_COLORS;
  payload: RGBColor[];
}

function _collectColors(colors: RGBColor[]): CollectColorsAction {
  return {
    type: COLLECT_COLORS,
    payload: colors,
    isUndoable: false, // Srki check should be false or what
  };
}

function getColorFromColorOrGradient(
  color: RGBColor | { points: { color: RGBColor }[] }
) {
  const colorPoints: { points: { color: RGBColor }[] } = color as any;
  const colorRGB: RGBColor = color as any;

  if (colorPoints.points) {
    return [colorPoints.points[0].color, colorPoints.points[0].color];
  }
  if (typeof colorRGB.r === "number") {
    return [colorRGB];
  }

  return [];
}

export function collectColors(): any {
  return function (dispatch: Dispatch, getState: () => IStore) {
    let colors: RGBColor[] = [];
    const allObjectById = getState().project.objects.objectById;

    Object.values(allObjectById).forEach((obj: IObject) => {
      if (obj.properties) {
        const { color, strokeColor, fill } = obj.properties;

        if (color) {
          colors = concat(colors, getColorFromColorOrGradient(color));
        }
        if (strokeColor) {
          colors = concat(colors, getColorFromColorOrGradient(strokeColor));
        }
        if (fill) {
          colors = concat(colors, getColorFromColorOrGradient(fill));
        }
      }
    });

    dispatch(_collectColors(uniqWith(colors, isEqual)));
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
// selected tool
export const SET_STAGE_TOOL = "Set stage tool";

export interface SetStageToolAction extends IUndoableAction<false> {
  type: typeof SET_STAGE_TOOL;
  payload: { tool: StageTools; objectType?: string };
}

export function setStageTool(
  tool: StageTools,
  objectType?: string
): SetStageToolAction {
  return {
    type: SET_STAGE_TOOL,
    payload: { tool, objectType },
    isUndoable: false,
  };
}

// we have shortcuts e.g. SPACE that change to PAN tool
export const OVERRIDE_STAGE_TOOL = "Override stage tool";

export interface OverrideStageToolAction extends IUndoableAction<false> {
  type: typeof OVERRIDE_STAGE_TOOL;
  payload: { tool: StageTools; objectType?: string };
}

export function overrideStageTool(
  tool: StageTools,
  objectType?: string
): OverrideStageToolAction {
  return {
    type: OVERRIDE_STAGE_TOOL,
    payload: { tool, objectType },
    isUndoable: false,
  };
}

export const CANCEL_OVERRIDE_STAGE_TOOL = "Cancel override stage tool";

export interface CancelOverrideStageToolAction extends IUndoableAction<false> {
  type: typeof CANCEL_OVERRIDE_STAGE_TOOL;
}

export function cancelOverrideStageTool(): CancelOverrideStageToolAction {
  return {
    type: CANCEL_OVERRIDE_STAGE_TOOL,
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

export const SET_MY_FONTS = "Set my fonts";

export interface SetMyFontsAction extends IUndoableAction<false> {
  type: typeof SET_MY_FONTS;
  payload: SaaSMediaData[];
}

export function setMyFonts(myFonts: SaaSMediaData[]): SetMyFontsAction {
  return {
    type: SET_MY_FONTS,
    payload: myFonts,
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

// ***

export const UPDATE_USER_DATA = "Update user data";

export interface UpdateUserDataAction extends IUndoableAction<false> {
  type: typeof UPDATE_USER_DATA;
  payload: {
    userData?: { displayName: string; profilePhoto?: string };
    error?: { error: string; errorMessage: string };
  };
}

export function updateUserData(userData?: {
  displayName: string;
  profilePhoto?: string;
}): UpdateUserDataAction {
  return {
    type: UPDATE_USER_DATA,
    payload: { userData, error: undefined },
    isUndoable: false,
  };
}

export function updateUserDataError(error?: {
  error: string;
  errorMessage: string;
  displayError?: string;
}): UpdateUserDataAction {
  return {
    type: UPDATE_USER_DATA,
    payload: { userData: undefined, error },
    isUndoable: false,
  };
}

export function loadUserData(): any {
  return function (dispatch: Dispatch | any, _getState: () => IStore) {
    axios
      .get("/api/v1/me")
      .then(function (response) {
        if (response?.data?.error) {
          dispatch(updateUserDataError(response?.data));
        } else {
          dispatch(updateUserData(response?.data));
        }

        const displayMessages = response?.data?.displayMessages;

        if (displayMessages && isArray(displayMessages)) {
          const event = new CustomEvent("GLOBAL_ERROR", {
            detail: { message: displayMessages.join(", ") },
          });
          window.dispatchEvent(event);
        }
      })
      .catch(function (error) {
        dispatch(
          updateUserDataError({
            error: "USER_DATA_ERROR_1",
            errorMessage: "User authentication has API has failed.",
          })
        );

        console.log(error);
      });
  };
}

// ***

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
  | ReplaceObjectAction
  | SelectObjectAction
  | UpdateObjectAction
  | DeleteObjectsAction
  | AddObjectsToSelectionAction
  | RemoveObjectsFromSelectionAction
  | MoveObjectsAction
  | MoveLayersAction
  | MoveSlidesAction
  | ReorderSlidesAction
  | GroupObjectsAction
  | UngroupObjectAction

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
  | SetThemeAction

  //colors
  | AddRecentColor
  | CollectColorsAction
  | ColorsFromImagesAction
  | UpdateColorsStateAction
  | UpdateBrandColorsAction

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
  | OverrideStageToolAction
  | CancelOverrideStageToolAction

  //external fonts
  | ExternalFontLoadedAction
  | SetMyFontsAction

  // project metadata
  | UpdateProjectMetaAction

  // open project
  | OpenProjectAction
  | CreateNewProjectAction
  | CreateNewProjectFromExistingAction

  // editor related actions
  | UpdateEditorAction

  // responive device
  | SetDeviceAction

  // form state
  | SetFormStateAction
  //
  | NextTextPositionAction
  | SetPanFitAction
  //
  | NormalizeObjectGroupAction
  //
  | CutToClipboardAction
  | CopyToClipboardAction
  | PasteObjectsFromClipboardAction
  | ClearClipboardAction
  | UpdateUserDataAction
  | ShowSimplifiedLayersAction
  | ShowSimplifiedPagesAction
  | AIRequestLoadingAction
  | AIEnableAction;
