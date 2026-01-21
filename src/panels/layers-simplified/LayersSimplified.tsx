import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import update from "immutability-helper";
import {
  addNewLayer,
  addLayersToSelection,
  deleteLayersThree,
  activateLayer,
  selectLayers,
  addNewObject,
  activateObject,
  removeLayersFromSelection,
  deleteObjects,
  updateObject,
  selectObjects,
  addObjectsToSelection,
  removeObjectsFromSelection,
  deactivateObject,
  updateLayer,
  selectForProperties,
  selectForPropertiesProps,
  moveObjects,
  moveLayers,
  duplicateLayers,
  duplicateObjects,
  activateSlide,
  selectSlides,
  _updateObject,
} from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/i-layers";
import css from "./LayersSimplified.module.scss";
import { IPage } from "../../store/reducers/i-pages";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { ObjectRow } from "./ObjectRow";
import { cloneDeep, last } from "lodash-es";
import { Button, Text } from "@blueprintjs/core";
import withScrolling, {
  createVerticalStrength,
  useDndScrolling,
} from "react-dnd-scrolling";
import { LayerButton } from "./LayerButton";
import { isObjectInGroup } from "../../store/actions/actions-utils";
import LayerSimplified_GroupObjects from "./LayerSimplified_GroupObjects";
import LayerSimplified_AllLayers from "./LayerSimplified_AllLayers";

type ObjectForDND = {
  parentType: "layer" | "type";
  parentId: string;
  parentName?: string;
  layerId: string;
  layerName?: string;
  objectId: string;
};

const ScrollingComponent = withScrolling("div");

//import { DragLayerComponent } from "./CustomDragLayer";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const LayersSimplifiedPanel: React.FC<ISlidesPanel> = (props) => {
  const {
    page,
    layerArr,
    objectById,
    activeObjectId,
    activeLayerId,
    layerById,
    breakpointConfig,
    selectedObjectIds,
    selectionPath,
    activeSlideId,
    selectionForProperties,
    pageById,
    _moveObjects,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _activateObject,
    _selectObjects,
    _selectForProperties,
    _activateLayer,
    _selectLayers,
    _activateSlide,
    _selectSlides,
    _updateLayer,
    _addNewLayer,
  } = props;

  const firstSelObjId = selectedObjectIds?.[0];
  if (firstSelObjId && isObjectInGroup(objectById[firstSelObjId], objectById)) {
    return <LayerSimplified_GroupObjects />;
  }

  return <LayerSimplified_AllLayers />;
};

const mapStateToProps = (state: IStore) => {
  const { pages, layers, objects, selection } = state.project;
  //const { layoutType } = state.globals;
  let layerArr: ILayer[] | null = null;
  let page: IPage | null = null;

  if (selection.activeSlideId) {
    const layerIds = pages.pageById[selection.activeSlideId].layerIds;
    layerArr = layerIds.map((layerId: string) => layers.layerById[layerId]);
    page = pages.pageById[selection.activeSlideId];
  }

  const breakpointConfig: BreakpointConfiguration | undefined = last(
    state.project.settings.breakpoints.breakpointsConfiguration.filter(
      (bc) => bc.enabled
    )
  );

  return {
    layerArr,
    page,
    objectById: objects.objectById,
    layerById: layers.layerById,
    pageById: pages.pageById,
    activeSlideId: selection.activeSlideId,
    activeLayerId: selection.activeLayerId,
    activeObjectId: selection.activeObjectId,
    selectedLayerIds: selection.selectedLayerIds,
    selectedObjectIds: selection.selectedObjectIds,
    selectionForProperties: selection.selectionForProperties,
    selectionPath: selection.selectionPath,
    selectedDevice: state.stage.selectedDevice,
    //layoutStaticAnimationsPanel: layoutType === "default-layers",
    breakpointsConfiguration: state.project.settings.breakpoints,
    breakpointConfig,
  };
};

const mapDispatchToProps = {
  _addNewLayer: (pageId: string) => addNewLayer(pageId),
  _addLayersToSelection: (layerIds: string[]) => addLayersToSelection(layerIds),
  _removeLayersFromSelection: (layerIds: string[]) =>
    removeLayersFromSelection(layerIds),
  _deleteLayersThree: (layerIds: string[]): any => deleteLayersThree(layerIds),
  _activateLayer: (layerId: string) => activateLayer(layerId),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _selectLayers: (layerIds: string[]) => selectLayers(layerIds),
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>
  ) => addNewObject(layerId, type, objectProps),
  _activateObject: (objectId: string) => activateObject(objectId),
  _selectObjects: (objectIds: string[]) => selectObjects(objectIds),
  _addObjectsToSelection: (objectIds: string[]) =>
    addObjectsToSelection(objectIds),
  _removeObjectsFromSelection: (objectIds: string[]) =>
    removeObjectsFromSelection(objectIds),
  _deleteObjects: (objectIds: string[]) => deleteObjects(objectIds),
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
  _deactivateObject: (objectId: string) => deactivateObject(objectId),
  _moveObjects: (
    refId: string,
    where: "above" | "below" | "layer" | "slide" | "bottom",
    moveIds: string[]
  ) => moveObjects(refId, where, moveIds),

  _duplicateLayers: (ids: string[]): any => duplicateLayers(ids),
  _duplicateObjects: (ids: string[]): any => duplicateObjects(ids),
  _moveLayers: (
    refId: string,
    where: "above" | "below" | "layer" | "slide" | "bottom",
    moveIds: string[]
  ) => moveLayers(refId, where, moveIds),
  _activateSlide: (id: string): any => activateSlide(id),
  _selectSlides: (ids: string[]): any => selectSlides(ids),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LayersSimplifiedPanel);
