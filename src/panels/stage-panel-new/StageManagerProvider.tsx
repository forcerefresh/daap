import React, { useContext, useEffect, useRef, useState } from "react";
import { StageManager } from "../../utils/selection-manager/StageManager";
import { IStore } from "../../store/store";
import {
  activateObject,
  addObjectsToSelection,
  deactivateObject,
  removeObjectsFromSelection,
  selectForProperties,
  selectForPropertiesProps,
  selectObjects,
  setStagePan,
  updateObject,
} from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { connect } from "react-redux";
import { cloneDeep, remove } from "lodash-es";
import { StageToolEnum } from "../../utils/selection-manager/types";
import {
  StageToolEvent,
  StageToolEventDataUnion,
  StageToolMoveEventData,
  StageToolPanEventData,
  StageToolRotateEventData,
  StageToolScaleEventData,
} from "../../utils/selection-manager/events/StageToolEvent";
import {
  ICorners,
  addCornerMarkers,
  decomposeMatrix2DW3,
  getBottomRightFromCorners,
  getCorners,
  getGroupMatrixFromSelectionPath,
  getLeftTopFromCorners,
  getObjectBBoxRelativeToParent,
  getObjectTransform,
  getUngroupObjectsCalculation,
  removeCornerMarkers,
  screenPointToLocal,
  tmpDrawNewGroup,
} from "./stage-panel-utils";
import { Point, Rect } from "../../webslider-sdk/object/i-tool-class";
import { selection } from "../../store/reducers/selection";
import { populateObjectThreeIds } from "../../store/actions/actions-utils";
import {
  boundsUnion,
  getObjectBoundingBox,
} from "../../store/helpers/objectBoundingBox";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { normalizeGroup } from "./normalize-group-utils";
import { HANDLE_SIZE } from "./WithResizeHandle";
import { setFloatingActionPanelVisibility } from "../floating-actions-panel/utils";
import { ToolsContext } from "../../utils/tools/ToolsProvider";
import { TextValues } from "../../objects/text/text";
import { ILayer } from "../../store/reducers/i-layers";
import { getObjectRotation, getObjectScale } from "../../objects/object-utils";

type StageManagerProviderProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  React.PropsWithChildren<React.ReactNode>;

export interface StageManagerContextInterface {
  stageManager: StageManager;
}

export const StageManagerContext =
  React.createContext<StageManagerContextInterface>({
    stageManager: {} as StageManager,
  });

export const StageManagerProviderInternal = (
  props: StageManagerProviderProps
) => {
  const {
    children,
    objectById,
    layerById,
    selectedObjectIds,
    activeObjectId,
    zoom,
    selectionPath,
    stagePan,
    breakpointConfig,
    activeStageTool,
    _updateObject,
    _activateObject,
    _selectObjects,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _setStagePan,
    _selectForProperties,
  } = props;

  const { activateTool } = useContext(ToolsContext);

  const selectedObjectIdsRef = useRef(selectedObjectIds);
  selectedObjectIdsRef.current = selectedObjectIds;

  const recentlySelectedRef = useRef(false);

  //console.log(objectById);
  const [stageManager] = useState(new StageManager());

  useEffect(() => {
    const startHandler = (e: StageToolEvent) => {
      const eData = e.detail; // TODO: details is empty object; check this?
      switch (eData.eventType) {
        case StageToolEnum.ROTATE:
          processRotateStartEvent(eData, objectById, _updateObject);
          break;
        case StageToolEnum.MOVE:
          processMoveStartEvent(
            eData,
            objectById,
            {
              activeObjectId,
              selectedObjectIdsRef,
              zoom,
              selectionPath,
              recentlySelectedRef,
            },
            {
              _updateObject,
              _activateObject,
              _selectObjects,
              _addObjectsToSelection,
              _removeObjectsFromSelection,
              _deactivateObject,
              _selectForProperties,
            }
          );
          break;
        case StageToolEnum.SCALE:
          processScaleStartEvent(
            eData,
            objectById,
            {
              activeObjectId,
              selectedObjectIdsRef,
              zoom,
              selectionPath,
            },
            {
              _updateObject,
              _activateObject,
              _selectObjects,
              _addObjectsToSelection,
              _removeObjectsFromSelection,
              _deactivateObject,
            }
          );
          break;
      }
      // console.log("CHANGE");
      // console.log(e);
    };

    const changeHandler = (e: StageToolEvent) => {
      const eData = e.detail;
      switch (eData.eventType) {
        case StageToolEnum.ROTATE:
          processRotateChangeEvent(eData, objectById, _updateObject);
          break;
        case StageToolEnum.MOVE:
          processMoveChangeEvent(eData, objectById, layerById, {
            selectedObjectIdsRef,
            zoom,
          });
          break;
        case StageToolEnum.SCALE:
          processScaleChangeEvent(eData, objectById, layerById, {
            selectedObjectIdsRef,
            zoom,
          });
          break;
        case StageToolEnum.PAN:
          processPanChangeEvent(
            eData,
            objectById,
            {
              selectedObjectIdsRef,
              zoom,
            },
            {
              _setStagePan,
            }
          );
          break;
      }
      // console.log("CHANGE");
      // console.log(e);
    };

    const stopHandler = (e: StageToolEvent) => {
      const eData = e.detail;
      switch (eData.eventType) {
        case StageToolEnum.SELECT:
          //processSelectStopEvent(e, objectById, _updateObject);
          break;
        case StageToolEnum.ROTATE:
          processRotateStopEvent(
            eData,
            objectById,
            {
              selectedObjectIdsRef,
              zoom,
              breakpointConfig,
            },
            {
              _updateObject,
              _activateObject,
              _selectObjects,
            }
          );
          break;
        case StageToolEnum.MOVE:
          processMoveStopEvent(
            eData,
            objectById,
            layerById,
            {
              selectedObjectIdsRef,
              zoom,
              breakpointConfig,
              recentlySelectedRef,
            },
            {
              _updateObject,
              _activateObject,
              _selectObjects,
              _selectForProperties,
              activateTool: activateTool,
            }
          );
          break;
        case StageToolEnum.SCALE:
          processScaleStopEvent(
            eData,
            objectById,
            layerById,
            {
              selectedObjectIdsRef,
              zoom,
            },
            { _updateObject }
          );

          break;
        case StageToolEnum.PAN:
          processPanStopEvent(
            eData,
            objectById,
            {
              selectedObjectIdsRef,
              zoom,
              stagePan,
            },
            {
              _setStagePan,
            }
          );
          break;
      }
      console.log("STOP");
      console.log(e);
    };

    stageManager.addEventListener("start", startHandler as any);
    stageManager.addEventListener("change", changeHandler as any);
    stageManager.addEventListener("stop", stopHandler as any);

    return () => {
      stageManager.removeEventListener("start", startHandler as any);
      stageManager.removeEventListener("change", changeHandler as any);
      stageManager.removeEventListener("stop", stopHandler as any);
    };
  }, [
    objectById,
    _updateObject,
    zoom,
    stageManager,
    activeObjectId,
    _activateObject,
    _selectObjects,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    stagePan,
    _setStagePan,
    selectionPath,
    _selectForProperties,
    layerById,
    breakpointConfig,
    activateTool,
    selectedObjectIds, // NOTE:  this do not remove it
  ]);

  return (
    <StageManagerContext.Provider
      value={{
        stageManager: stageManager,
      }}
    >
      {children}
    </StageManagerContext.Provider>
  );
};

const mapStateToProps = (state: IStore) => {
  const { zoom, activeStageTool, pan } = state.stage;
  const { objects, selection, layers, settings } = state.project;

  const breakpointConfig: BreakpointConfiguration | undefined =
    settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice
    );

  return {
    activeStageTool: activeStageTool.tool,
    zoom,
    breakpointConfig,
    stagePan: pan,
    selectionPath: selection.selectionPath,
    activeObjectId: selection.activeObjectId,
    objectById: objects.objectById,
    layerById: layers.layerById,
    selectedObjectIds: selection.selectedObjectIds,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
  _activateObject: (objectId: string | null) => activateObject(objectId),
  _deactivateObject: (objectId: string) => deactivateObject(objectId),
  _selectObjects: (objectIds: string[]) => selectObjects(objectIds),
  _addObjectsToSelection: (objectIds: string[]) =>
    addObjectsToSelection(objectIds),
  _removeObjectsFromSelection: (objectIds: string[]) =>
    removeObjectsFromSelection(objectIds),
  _setStagePan: (p: Point) => setStagePan(p),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
};

const StageManagerProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(StageManagerProviderInternal);

export default StageManagerProvider;

// ******************************************************
/** HANDLER functions  */
// ******************************************************

function processRotateStartEvent(
  eData: StageToolRotateEventData,
  objectById: any,
  _updateObject: any
) {
  // do nothing
}

function processRotateChangeEvent(
  eData: StageToolRotateEventData,
  objectById: any,
  _updateObject: any
) {
  const objectId = eData.objectId;
  const object = objectById[objectId];
  const angle = eData.angle;

  // NOTE: LAYOUT CHANGE
  const objectSize: Rect = {
    x: object.left!,
    y: object.top!,
    width: object.width!,
    height: object.height!,
  };

  let left = objectSize.x;
  let top = objectSize.y;

  const m = new DOMMatrix();

  m.translateSelf(objectSize.x, objectSize.y);
  m.rotateSelf(getObjectRotation(object));
  m.translateSelf(
    (objectSize.width / 2) * getObjectScale(object),
    (objectSize.height / 2) * getObjectScale(object)
  );
  m.rotateSelf(angle);
  m.scaleSelf(getObjectScale(object));
  m.translateSelf(-(objectSize.width / 2), -(objectSize.height / 2));

  const d = decomposeMatrix2DW3(m);

  left = d.translateX;
  top = d.translateY;
  const transform = "rotate(" + d.rotateZ + "deg) scale(" + d.scaleX + ")";

  const objectHolder = document.getElementsByClassName(
    `object-holder-${objectId}`
  )[0] as HTMLDivElement;

  if (objectHolder) {
    objectHolder.style.left = left + "px";
    objectHolder.style.top = top + "px";
    objectHolder.style.transform = transform;
  }
}

function processRotateStopEvent(
  eData: StageToolRotateEventData,
  objectById: { [key: string]: IObject },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
    breakpointConfig?: BreakpointConfiguration;
  },
  storeActions: {
    _updateObject: any;
    _activateObject: any;
    _selectObjects: any;
  }
) {
  const { breakpointConfig } = storeProps;
  const { _updateObject } = storeActions;

  const objectId = eData.objectId;
  const object = objectById[objectId];
  const angle = eData.angle;

  // NOTE: LAYOUT CHANGE
  const objectSize: Rect = {
    x: object.left!,
    y: object.top!,
    width: object.width!,
    height: object.height!,
  };

  let left = objectSize.x;
  let top = objectSize.y;

  const m = new DOMMatrix();

  m.translateSelf(objectSize.x, objectSize.y);
  m.rotateSelf(getObjectRotation(object));
  m.translateSelf(
    (objectSize.width / 2) * (getObjectScale(object) ?? 1),
    (objectSize.height / 2) * (getObjectScale(object) ?? 1)
  );
  m.rotateSelf(angle);
  m.scaleSelf(getObjectScale(object));
  m.translateSelf(-(objectSize.width / 2), -(objectSize.height / 2));

  const d = decomposeMatrix2DW3(m);

  left = d.translateX;
  top = d.translateY;
  const transform = "rotate(" + d.rotateZ + "deg) scale(" + d.scaleX + ")";

  const newObject = cloneDeep(object);

  // NOTE: LAYOUT CHANGE
  newObject.rotation = d.rotateZ;
  newObject.left = left;
  newObject.top = top;

  _updateObject(newObject);

  // LOGIC FOR NORMALIZATION
  // const parentGroup =
  //   newObject.objectIds && objectById[newObject.id] ? newObject : undefined;

  // if (parentGroup) {
  //   // normalize >>>>
  //   const { group, objects } = normalizeGroup(parentGroup, [], {
  //     breakpointConfig,
  //     objectById,
  //   });

  //   objects.forEach((object) => _updateObject(object));
  //   _updateObject(group);
  //   // normalize <<<
  // } else {
  //   _updateObject(newObject);
  // }
}

// function processSelectStopEvent(
//   e: StageToolChangeEvent,
//   objectById: { [key: string]: IObject },
//   _updateObject: any,
//   orgEvent: MouseEvent
// ) {
//   if (event.shiftKey) {
//     selectedObjectIds.indexOf(objectId) === -1
//       ? _addObjectsToSelection([objectId])
//       : _removeObjectsFromSelection([objectId]);
//     if (activeObjectId === objectId) {
//       _deactivateObject(objectId);
//     }

//     //setSelectionStartPosition(null);
//   } else {
//     if (isOnlyThisObjectSelected) {
//       // NOTE: activate tool editor
//       const deff = getAppObjectDefinition(objectById[objectId].type);
//       if (deff?.meta.isEditable) {
//         activateTool(objectById[objectId].type, objectId);
//       }
//     }
//     _activateObject(objectId);
//     _selectObjects([objectId]);
//     _selectForProperties({ type: "object", id: objectId });
//   }
// }

// ++++++++

function processMoveStartEvent(
  eData: StageToolMoveEventData,
  objectById: { [key: string]: IObject },
  storeProps: {
    activeObjectId: string | null;
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    recentlySelectedRef: React.MutableRefObject<boolean>;
    zoom: number;
    selectionPath: string[];
  },
  storeActions: {
    _updateObject: any;
    _activateObject: any;
    _selectObjects: (objectIds: string[]) => any;
    _selectForProperties: (props: selectForPropertiesProps) => any;
    _addObjectsToSelection: any;
    _removeObjectsFromSelection: any;
    _deactivateObject: any;
  }
) {
  const {
    selectedObjectIdsRef,
    activeObjectId,
    zoom,
    selectionPath,
    recentlySelectedRef,
  } = storeProps;
  const selectedObjectIds = selectedObjectIdsRef.current;

  const {
    _updateObject,
    _activateObject,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _selectObjects,
    _deactivateObject,
    _selectForProperties,
  } = storeActions;

  //const [_, ...selectionPathWithoutLayerId] = selectionPath;

  const objectId = eData.objectId;
  const object = objectById[objectId];
  const x = eData.x! / zoom;
  const y = eData.y! / zoom;

  console.log(selectedObjectIds);
  if (
    selectedObjectIdsRef.current.length > 0 &&
    eData.originalMouseEvent.shiftKey
  ) {
    if (selectedObjectIds.indexOf(objectId) === -1) {
      // is the same parent
      if (
        objectById[objectId].parentId ===
          objectById[selectedObjectIds[0]].parentId ||
        // or object are on the layer/root level
        (objectById[objectId].layerId &&
          objectById[selectedObjectIds[0]].layerId)
      ) {
        _addObjectsToSelection([objectId]);
        selectedObjectIdsRef.current.push(objectId);
      }
    } else {
      _removeObjectsFromSelection([objectId]);
      remove(selectedObjectIdsRef.current, (id) => id === objectId);
    }

    if (activeObjectId === objectId) {
      _deactivateObject(objectId);
    }
    return;
  }

  let hasSelectedParent = false;
  if (object.parentId && selectedObjectIds.length > 0) {
    hasSelectedParent = selectedObjectIds.includes(object.parentId);
  }

  // console.log(selectionPath);
  // console.log(selectionPathWithoutLayerId);
  // console.log(object.parentId);
  // console.log(object.id);

  console.log(hasSelectedParent);

  recentlySelectedRef.current = false;
  if (!selectedObjectIds.includes(objectId) && !hasSelectedParent) {
    selectedObjectIdsRef.current = [objectId];
    recentlySelectedRef.current = true;
    _activateObject(objectId);
    _selectObjects([objectId]);
    _selectForProperties({ type: "object", id: objectId });
  }
}

//let latestRect: Rect;
function processMoveChangeEvent(
  eData: StageToolMoveEventData,
  objectById: { [key: string]: IObject },
  layerById: { [key: string]: ILayer },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
  }
) {
  setFloatingActionPanelVisibility(false);

  const { selectedObjectIdsRef, zoom } = storeProps;
  const selectedObjectIds = selectedObjectIdsRef.current;
  //const objectId = eData.objectId;

  console.log(zoom);

  const x = eData.x! / zoom;
  const y = eData.y! / zoom;

  // // >>>>>>>>>>>>>>>>>>
  // const objectPath: string[] = [];
  // const firstObjectId = selectedObjectIdsRef.current![0];
  // populateObjectThreeIds(objectPath, firstObjectId, objectById, layerById);

  // const groupsMatrix = getGroupMatrixFromSelectionPath(
  //   [...objectPath, firstObjectId],
  //   objectById
  // );
  // // <<<<<<<<<<<<<<<<

  removeCornerMarkers(objectById[selectedObjectIds[0]]?.parentId ?? ""); // TODO: check ""

  let parentGroup: IObject;
  let parentLayer: ILayer;

  selectedObjectIds.forEach((objectId) => {
    const object = objectById[objectId];

    if (object.isLocked) return;

    parentGroup = objectById[object.parentId!];
    parentLayer = layerById[parentGroup?.layerId ?? object.layerId ?? ""];

    // >>>>>>>>>>>>>>>>>>
    const objectPath: string[] = [];

    populateObjectThreeIds(objectPath, objectId, objectById, layerById);

    const groupsMatrix = getGroupMatrixFromSelectionPath(
      [...objectPath, objectId],
      objectById
    );
    // <<<<<<<<<<<<<<<<

    // >>>>>>>>>>>>>>>>
    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      groupsMatrix,
      getObjectRotation(object),
      getObjectScale(object)
    );
    // <<<<<<<<<<<<<<<<

    const objectHolder = document.getElementsByClassName(
      `object-holder-${objectId}`
    )[0] as HTMLDivElement;

    if (objectHolder) {
      console.log(eData, "updateObject");
      //    const currentAngle = getObjectRotation(object) + angle;
      // objectHolder.style.transform =
      //   "translateX(" + x + "px) translateY(" + y + "px)";

      // NOTE: LAYOUT CHANGE
      const left = object.left! + realMove.x;
      const top = object.top! + realMove.y;
      objectHolder.style.left = left + "px";
      objectHolder.style.top = top + "px";

      //   scale(" +
      //   initialScale +
      //   ") translateX(" +
      //   translateX +
      //   "px) translateY(" +
      //   translateY +
      //   "px)";

      const corners = getCorners(
        left,
        top,
        object.width!,
        object.height!,
        getObjectRotation(object) ?? 0,
        getObjectScale(object) ?? 1
      );

      // addCornerMarkers(object.parentId!, corners);
      // console.log(corners);

      // const newLeftTop = getLeftTopFromCorners(corners);
      // const newBottomRight = getBottomRightFromCorners(corners);

      // addCornerMarkers(
      //   object.parentId!,
      //   { tl: newLeftTop } as ICorners,
      //   "yellow"
      // );

      // const rect = tmpDrawNewGroup(
      //   parentGroup,
      //   parentLayer,
      //   object,
      //   newLeftTop,
      //   newBottomRight.x - newLeftTop.x,
      //   newBottomRight.y - newLeftTop.y
      // );

      //latestRect = rect;
    }
  });
}

function processMoveStopEvent(
  eData: StageToolMoveEventData,
  objectById: { [key: string]: IObject },
  layerById: { [key: string]: ILayer },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    recentlySelectedRef: React.MutableRefObject<boolean>;
    zoom: number;
    breakpointConfig?: BreakpointConfiguration;
  },
  storeActions: {
    _updateObject: any;
    _activateObject: any;
    _selectObjects: any;
    _selectForProperties: any;
    activateTool: (tool: string, objectId?: string | undefined) => void;
  }
) {
  // setFloatingActionPanelVisibility(true);

  const { selectedObjectIdsRef, zoom, breakpointConfig, recentlySelectedRef } =
    storeProps;
  const selectedObjectIds = selectedObjectIdsRef.current;

  const {
    _updateObject,
    _activateObject,
    _selectObjects,
    _selectForProperties,
    activateTool,
  } = storeActions;
  const objectId = eData.objectId;
  //const object = objectById[objectId];
  const x = eData.x! / zoom;
  const y = eData.y! / zoom;

  // NOTE: mouseup and down in the same point (no mouse move)
  if (x === 0 && y === 0) {
    if (selectedObjectIds.length === 1 && selectedObjectIds[0] === objectId) {
      // TODO
      if (
        objectById[objectId].type === "text" &&
        !recentlySelectedRef.current
      ) {
        activateTool(objectById[objectId].type, objectId);
      }
    }

    // select child element inside group
    if (!eData.originalMouseEvent.shiftKey) {
      _activateObject(objectId);
      _selectObjects([objectId]);
      _selectForProperties({ type: "object", id: objectId });
    }
    return;
  }

  const parentGroup = objectById[selectedObjectIds[0]].parentId
    ? objectById[objectById[selectedObjectIds[0]].parentId!]
    : undefined;

  let prevBounds: Rect = { x: 0, y: 0, width: 1, height: 1 };
  if (parentGroup) {
    // const groupObjects =
    //   parentGroup.objectIds?.map((objectId) => {
    //     return objectById[objectId];
    //   }) ?? [];
    // prevBounds = getObjectBoundingBox(groupObjects[0]);
    // groupObjects.forEach((object) => {
    //   const bounds = getObjectBoundingBox(object);
    //   prevBounds = boundsUnion(prevBounds, bounds);
    // });
    // const newParentGroup = cloneDeep(parentGroup);
    // newParentGroup.absoluteLayout!.common!.left = latestRect.x + "px";
    // newParentGroup.absoluteLayout!.common!.top = latestRect.y + "px";
    // newParentGroup.absoluteLayout!.common!.width = latestRect.width + "px";
    // newParentGroup.absoluteLayout!.common!.height = latestRect.height + "px";
    // _updateObject(newParentGroup);
  }

  const objectToUpdate: IObject[] = [];

  const objectToUpdateById: { [key: string]: IObject } = {};

  selectedObjectIds.forEach((objectId) => {
    const object = objectById[objectId];

    if (object.isLocked) return;

    // >>>>>>>>>>>>>>>>>>
    const objectPath: string[] = [];

    populateObjectThreeIds(objectPath, objectId, objectById, layerById);

    const groupsMatrix = getGroupMatrixFromSelectionPath(
      [...objectPath, objectId],
      objectById
    );
    // <<<<<<<<<<<<<<<<

    // >>>>>>>>>>>>>>>>
    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      groupsMatrix,
      getObjectRotation(object),
      getObjectScale(object)
    );
    // <<<<<<<<<<<<<<<<

    console.log(realMove);

    // NOTE: LAYOUT CHANGE
    const newObject = cloneDeep(object);
    newObject.left = newObject.left! + realMove.x;
    newObject.top = newObject.top! + realMove.y;

    objectToUpdate.push(newObject);

    objectToUpdateById[newObject.id] = newObject;
  });

  if (objectToUpdate.length === 0) return;

  // objectToUpdate.forEach((object) => {
  //   _updateObject(object);
  // });

  //return;

  // if parent is a group
  // const parentGroup = objectToUpdate[0].parentId
  //   ? objectById[objectToUpdate[0].parentId]
  //   : undefined;

  let calc: ReturnType<typeof getUngroupObjectsCalculation> = {};

  objectToUpdate.forEach((object) => _updateObject(cloneDeep(object)));

  if (parentGroup) {
    _updateObject(cloneDeep(parentGroup));
  }
  // return;

  // if (parentGroup) {
  //   const { group, objects } = normalizeGroup(parentGroup, objectToUpdateById, {
  //     breakpointConfig,
  //     objectById,
  //   });

  //   objects.forEach((object) => _updateObject(cloneDeep(object)));
  //   _updateObject(cloneDeep(group));

  //   return;
  //   const groupRotation = parentGroup.rotation;

  //   const groupObjectsToUpdate =
  //     parentGroup.objectIds?.map((objectId) => {
  //       return objectToUpdateById[objectId] ?? cloneDeep(objectById[objectId]);
  //     }) ?? [];
  //   //1. "UNGROUP"
  //   calc = getUngroupObjectsCalculation({
  //     group: { ...parentGroup }, //, rotation: 0 },
  //     objects: groupObjectsToUpdate,
  //     breakpointConfig: breakpointConfig!,
  //     parentLayer: getLayerIdRec(objectById, parentGroup.id),
  //   });

  //   groupObjectsToUpdate.forEach((object: IObject) => {
  //     object.absoluteLayout!.common.left = calc[object.id].left + "px";
  //     object.absoluteLayout!.common.top = calc[object.id].top + "px";
  //     getObjectRotation(object) = calc[object.id].rotation;
  //     getObjectScale(object) = calc[object.id].scale;
  //   });

  //   //2. "GROUP"
  //   const firstObject = groupObjectsToUpdate[0];

  //   // get group bounds (TODO: duplicate)
  //   let groupBounds = getObjectBoundingBox(firstObject);
  //   groupObjectsToUpdate.forEach((object) => {
  //     const bounds = getObjectBoundingBox(object);
  //     groupBounds = boundsUnion(groupBounds, bounds);
  //   });

  //   console.log(prevBounds);
  //   console.log(groupBounds);

  //   //const objects: IObject[] = [];
  //   //  normalize object pos
  //   groupObjectsToUpdate.forEach((object) => {
  //     object.absoluteLayout!.common.top =
  //       parseFloat(object.absoluteLayout!.common.top) - groupBounds.y + "px";
  //     object.absoluteLayout!.common.left =
  //       parseFloat(object.absoluteLayout!.common.left) - groupBounds.x + "px";

  //     _updateObject(object);
  //   });

  //   const parentGroupClone = cloneDeep(parentGroup);

  //   parentGroupClone.absoluteLayout!.common.left = groupBounds.x + "px";
  //   parentGroupClone.absoluteLayout!.common.top = groupBounds.y + "px";
  //   parentGroupClone.absoluteLayout!.common.width = groupBounds.width + "px";
  //   parentGroupClone.absoluteLayout!.common.height = groupBounds.height + "px";
  //   parentGroupClone.rotation = 0; //groupRotation;
  //   parentGroupClone.scale = 1; //groupRotation;

  //   //parentGroupClone.rotation = groupRotation;
  //   _updateObject(parentGroupClone);

  //   // +++++
  // } else {
  //   objectToUpdate.forEach((object) => {
  //     _updateObject(object);
  //   });
  // }
}

// ++++++++++++++++++=

function processScaleStartEvent(
  eData: StageToolScaleEventData,
  objectById: { [key: string]: IObject },
  storeProps: {
    activeObjectId: string | null;
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
    selectionPath: string[];
  },
  storeActions: {
    _updateObject: any;
    _activateObject: any;
    _selectObjects: (objectIds: string[]) => any;
    _addObjectsToSelection: any;
    _removeObjectsFromSelection: any;
    _deactivateObject: any;
  }
) {
  const { selectedObjectIdsRef, activeObjectId, zoom, selectionPath } =
    storeProps;
  const selectedObjectIds = selectedObjectIdsRef.current;

  const {
    _updateObject,
    _activateObject,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _selectObjects,
    _deactivateObject,
  } = storeActions;

  //const [_, ...selectionPathWithoutLayerId] = selectionPath;

  const objectId = eData.objectId;
  const object = objectById[objectId];

  // let hasSelectedParent = false;
  // if (object.parentId && selectedObjectIds.length > 0) {
  //   hasSelectedParent = selectedObjectIds.includes(object.parentId);
  // }

  // console.log(selectionPath);
  // console.log(selectionPathWithoutLayerId);
  // console.log(object.parentId);
  // console.log(object.id);
}

function processScaleChangeEvent(
  eData: StageToolScaleEventData,
  objectById: { [key: string]: IObject },
  layerById: { [key: string]: ILayer },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
  }
) {
  const { selectedObjectIdsRef, zoom } = storeProps;
  const selectedObjectIds = selectedObjectIdsRef.current;
  //const objectId = eData.objectId;

  console.log(zoom);

  // asd
  // // const x = eData.x! / zoom;
  // // const y = eData.y! / zoom;

  // // // >>>>>>>>>>>>>>>>>>
  // // const objectPath: string[] = [];
  // // const firstObjectId = selectedObjectIdsRef.current![0];
  // // populateObjectThreeIds(objectPath, firstObjectId, objectById, layerById);

  // // const groupsMatrix = getGroupMatrixFromSelectionPath(
  // //   [...objectPath, firstObjectId],
  // //   objectById
  // // );
  // // // <<<<<<<<<<<<<<<<

  selectedObjectIds.forEach((objectId) => {
    const object = objectById[objectId];

    // >>>>>>>>>>>>>>>>>>
    const objectPath: string[] = [];

    // populateObjectThreeIds(objectPath, objectId, objectById, layerById);

    // const groupsMatrix = getGroupMatrixFromSelectionPath(
    //   [...objectPath, objectId],
    //   objectById
    // );
    // <<<<<<<<<<<<<<<<

    const groupsMatrix = new DOMMatrix(getObjectTransform(object));

    const mouseMoveX = eData.mouseMove.x / zoom;
    const mouseMoveY = eData.mouseMove.y / zoom;

    // >>>>>>>>>>>>>>>>
    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      groupsMatrix,
      0, //getObjectRotation(object),
      getObjectScale(object)
    );
    console.log(realMove);
    // <<<<<<<<<<<<<<<<

    const objectHolder = document.getElementsByClassName(
      `object-holder-${objectId}`
    )[0] as HTMLDivElement;

    if (objectHolder) {
      console.log(eData);
      //       //    const currentAngle = getObjectRotation(object) + angle;
      //       // objectHolder.style.transform =
      //       //   "translateX(" + x + "px) translateY(" + y + "px)";
      // sd
      const realMoveXY = realMove.x; // Math.max(realMove.x, realMove.y);

      //       // var s = Math.sin(degrees_to_radians(getObjectRotation(object)));
      //       // var c = Math.cos(degrees_to_radians(getObjectRotation(object)));
      //       // var mouseLocalX = c * realMoveXY + s * realMoveXY;
      //       // var mouseLocalY = -s * realMoveXY + c * realMoveXY;
      // sf
      // NOTE: LAYOUT CHANGE
      const objectSize: Rect = {
        x: object.left!,
        y: object.top!,
        width: object.width!, //* getObjectScale(object),
        height: object.height!, //* getObjectScale(object),
      };

      let left = objectSize.x;
      let top = objectSize.y;
      let scale = getObjectScale(object) ?? 1;

      const dir = eData.handle === "br" || eData.handle === "tr" ? -1 : 1;

      scale =
        ((getObjectScale(object) ?? 1) * objectSize.width - dir * realMoveXY) /
        objectSize.width;

      let m = new DOMMatrix();

      let transform = "";

      if (eData.handle === "tr") {
        m.rotateSelf(getObjectRotation(object));
        m.translateSelf(
          0, //objectSize.width * getObjectScale(object) - objectSize.width,
          objectSize.height * (getObjectScale(object) ?? 1) - objectSize.height
        ); // old scale here

        m.scaleSelf(scale); // new scale here
        m.translateSelf(
          0, //-(objectSize.width * scale - objectSize.width) / scale,
          -(objectSize.height * scale - objectSize.height) / scale
        );

        const d = decomposeMatrix2DW3(m);

        left = left + d.translateX;
        top = top + d.translateY;
        transform =
          "rotate(" +
          getObjectRotation(object) +
          "deg) scale(" +
          d.scaleX +
          ")";
      }
      if (eData.handle === "bl") {
        m.rotateSelf(getObjectRotation(object));
        m.translateSelf(
          objectSize.width * (getObjectScale(object) ?? 1) - objectSize.width,
          0 //objectSize.height * getObjectScale(object) - objectSize.height
        ); // old scale here

        m.scaleSelf(scale); // new scale here
        m.translateSelf(
          -(objectSize.width * scale - objectSize.width) / scale,
          0 //-(objectSize.height * scale - objectSize.height) / scale
        );

        const d = decomposeMatrix2DW3(m);

        left = left + d.translateX;
        top = top + d.translateY;
        transform =
          "rotate(" +
          getObjectRotation(object) +
          "deg) scale(" +
          d.scaleX +
          ")";
      }
      if (eData.handle === "tl") {
        m.rotateSelf(getObjectRotation(object));
        m.translateSelf(
          objectSize.width * (getObjectScale(object) ?? 1) - objectSize.width,
          objectSize.height * (getObjectScale(object) ?? 1) - objectSize.height
        ); // old scale here

        m.scaleSelf(scale); // new scale here
        m.translateSelf(
          -(objectSize.width * scale - objectSize.width) / scale,
          -(objectSize.height * scale - objectSize.height) / scale
        );

        const d = decomposeMatrix2DW3(m);

        left = left + d.translateX;
        top = top + d.translateY;
        transform =
          "rotate(" +
          getObjectRotation(object) +
          "deg) scale(" +
          d.scaleX +
          ")";
      } else if (eData.handle === "br") {
        transform =
          "rotate(" + getObjectRotation(object) + "deg) scale(" + scale + ")";
      }

      // WIDTH
      if (eData.handle === "width") {
        const newWidth =
          objectSize.width + mouseMoveX / (getObjectScale(object) ?? 1) + "px";
        objectHolder.style.width = newWidth;

        const contentEl = objectHolder.getElementsByClassName(
          "object-content"
        )[0] as HTMLElement;
        if (contentEl) contentEl.style.width = newWidth;

        const resizeHolderEl = objectHolder.getElementsByClassName(
          "resize-handle-holder-" + objectId
        )[0] as HTMLElement;
        if (resizeHolderEl) resizeHolderEl.style.width = newWidth; //+ 0.001; // NOTE:  0.001 is to trigger change

        // objectHolder.style.boxShadow = `0 0 0 ${1 / getObjectScale(object) / zoom}px ${
        //   object.objectIds ? "#444444" : "#48aff0"
        // }`;
      } else if (eData.handle === "height") {
        const newHeight =
          objectSize.height + mouseMoveY / (getObjectScale(object) ?? 1) + "px";
        objectHolder.style.height = newHeight;

        const contentEl = objectHolder.getElementsByClassName(
          "object-content"
        )[0] as HTMLElement;
        if (contentEl) contentEl.style.height = newHeight;

        const resizeHolderEl = objectHolder.getElementsByClassName(
          "resize-handle-holder-" + objectId
        )[0] as HTMLElement;
        if (resizeHolderEl) resizeHolderEl.style.height = newHeight; //+ 0.001; // NOTE:  0.001 is to trigger change

        // objectHolder.style.boxShadow = `0 0 0 ${1 / getObjectScale(object) / zoom}px ${
        //   object.objectIds ? "#444444" : "#48aff0"
        // }`;
      } else {
        objectHolder.style.left = left + "px";
        objectHolder.style.top = top + "px";
        objectHolder.style.transform = transform;

        // HANDLES
        const handlesEls = Array.from(
          document.getElementsByClassName(`resize-handle-${objectId}`)
        ) as HTMLDivElement[];

        handlesEls.forEach((handleEL) => {
          handleEL.style.scale = `${(getObjectScale(object) ?? 1) / scale}`;
        });

        objectHolder.style.boxShadow = `0 0 0 ${1 / scale / zoom}px ${
          object.objectIds ? "#444444" : "#48aff0"
        }`;
      }
    }
  });
}

function processScaleStopEvent(
  eData: StageToolScaleEventData,
  objectById: { [key: string]: IObject },
  layerById: { [key: string]: ILayer },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
  },
  storeActions: {
    _updateObject: any;
  }
) {
  const { selectedObjectIdsRef, zoom } = storeProps;
  const { _updateObject } = storeActions;

  const selectedObjectIds = selectedObjectIdsRef.current;
  //const objectId = eData.objectId;

  console.log(zoom);

  const x = eData.x! / zoom;
  const y = eData.y! / zoom;

  // // >>>>>>>>>>>>>>>>>>
  // const objectPath: string[] = [];
  // const firstObjectId = selectedObjectIdsRef.current![0];
  // populateObjectThreeIds(objectPath, firstObjectId, objectById, layerById);

  // const groupsMatrix = getGroupMatrixFromSelectionPath(
  //   [...objectPath, firstObjectId],
  //   objectById
  // );
  // // <<<<<<<<<<<<<<<<

  selectedObjectIds.forEach((objectId) => {
    const object = objectById[objectId];
    const objectClone = cloneDeep(object);

    // >>>>>>>>>>>>>>>>>>
    const objectPath: string[] = [];

    populateObjectThreeIds(objectPath, objectId, objectById, layerById);

    // const groupsMatrix = getGroupMatrixFromSelectionPath(
    //   [...objectPath, objectId],
    //   objectById
    // );

    const groupsMatrix = new DOMMatrix(getObjectTransform(object));

    // <<<<<<<<<<<<<<<<

    // >>>>>>>>>>>>>>>>
    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      groupsMatrix,
      0, //getObjectRotation(object),
      getObjectScale(object)
    );
    // <<<<<<<<<<<<<<<<

    // const objectHolder = document.getElementsByClassName(
    //   `object-holder-${objectId}`
    // )[0] as HTMLDivElement;

    console.log(eData);
    //    const currentAngle = getObjectRotation(object) + angle;
    // objectHolder.style.transform =
    //   "translateX(" + x + "px) translateY(" + y + "px)";

    const realMoveX = realMove.x; // Math.max(realMove.x, realMove.y);
    const realMoveY = realMove.y; // Math.max(realMove.x, realMove.y);

    // var s = Math.sin(degrees_to_radians(getObjectRotation(object)));
    // var c = Math.cos(degrees_to_radians(getObjectRotation(object)));
    // var mouseLocalX = c * realMoveXY + s * realMoveXY;
    // var mouseLocalY = -s * realMoveXY + c * realMoveXY;

    // NOTE: LAYOUT CHANGE
    const objectSize: Rect = {
      x: object.left!,
      y: object.top!,
      width: object.width!, // * getObjectScale(object),
      height: object.height!, //* getObjectScale(object),
    };

    // var len = Math.sqrt(Math.pow(realMoveXY, 2) + Math.pow(realMoveXY, 2));
    // var hDif = Math.sin(degrees_to_radians(getObjectRotation(object))) * len;
    // var wDif = Math.cos(degrees_to_radians(getObjectRotation(object))) * len;

    // const dir = eData.handle === "br" || eData.handle === "tr" ? -1 : 1;
    // let scale =
    //   (objectSize.width * getObjectScale(object) - dir * realMoveXY * getObjectScale(object)) /
    //   objectSize.width; //(realMoveXY + objectSize.x);

    const dir = eData.handle === "br" || eData.handle === "tr" ? -1 : 1;

    let scale =
      ((getObjectScale(object) ?? 1) * objectSize.width - dir * realMoveX) /
      objectSize.width;

    let left = objectSize.x;
    let top = objectSize.y;

    // const bb = getObjectBoundingBox(object);
    // const scaledBB = getObjectBoundingBox(object);

    // // if (eData.handle === "tl") {
    // //   const diff = {
    // //     x: scaledBB.width - bb.width,
    // //     y: scaledBB.height - bb.height,
    // //   };

    // //   console.log(diff);
    // //   left = objectSize.x + diff.x; //(scale * hDif) / 2; //
    // //   // (realMoveXY / 2) * Math.cos(degrees_to_radians(getObjectRotation(object)));
    // //   top = objectSize.y + diff.y;
    // //   //  ((scale * wDif) / 2) * (objectSize.height / objectSize.width);
    // //   //   Math.cos(degrees_to_radians(getObjectRotation(object)));
    // // }
    // lk
    // if (!getObjectRotation(object)) {
    //   if (eData.handle === "tl") {
    //     left = objectSize.x + realMoveXY / 2; //
    //     // (realMoveXY / 2) * Math.cos(degrees_to_radians(getObjectRotation(object)));
    //     top =
    //       objectSize.y +
    //       (realMoveXY / 2) * (objectSize.height / objectSize.width);
    //     //   Math.cos(degrees_to_radians(getObjectRotation(object)));
    //   }
    //   if (eData.handle === "bl") {
    //     left = objectSize.x + realMoveXY / 2; //
    //     // (realMoveXY / 2) * Math.cos(degrees_to_radians(getObjectRotation(object)));
    //     top =
    //       objectSize.y -
    //       (realMoveXY / 2) * (objectSize.height / objectSize.width);
    //     // Math.cos(degrees_to_radians(getObjectRotation(object)));
    //   }
    //   if (eData.handle === "br") {
    //     left = objectSize.x + realMoveXY / 2; //
    //     // (realMoveXY / 2) * Math.cos(degrees_to_radians(getObjectRotation(object)));
    //     top =
    //       objectSize.y +
    //       (realMoveXY / 2) * (objectSize.height / objectSize.width);
    //     // Math.cos(degrees_to_radians(getObjectRotation(object)));
    //   }
    //   if (eData.handle === "tr") {
    //     left = objectSize.x + realMoveXY / 2; //
    //     // (realMoveXY / 2) * Math.cos(degrees_to_radians(getObjectRotation(object)));
    //     top =
    //       objectSize.y -
    //       (realMoveXY / 2) * (objectSize.height / objectSize.width);
    //     // Math.cos(degrees_to_radians(getObjectRotation(object)));
    //   }
    // }

    let transform = "";
    const m = new DOMMatrix();
    if (eData.handle === "tr") {
      m.rotateSelf(getObjectRotation(object));
      m.translateSelf(
        0, //objectSize.width * getObjectScale(object) - objectSize.width,
        objectSize.height * (getObjectScale(object) ?? 1) - objectSize.height
      ); // old scale here

      m.scaleSelf(scale); // new scale here
      m.translateSelf(
        0, //-(objectSize.width * scale - objectSize.width) / scale,
        -(objectSize.height * scale - objectSize.height) / scale
      );

      const d = decomposeMatrix2DW3(m);

      left = left + d.translateX;
      top = top + d.translateY;
      transform =
        "rotate(" + getObjectRotation(object) + "deg) scale(" + d.scaleX + ")";
    }
    if (eData.handle === "bl") {
      m.rotateSelf(getObjectRotation(object));
      m.translateSelf(
        objectSize.width * (getObjectScale(object) ?? 1) - objectSize.width,
        0 //objectSize.height * getObjectScale(object) - objectSize.height
      ); // old scale here

      m.scaleSelf(scale); // new scale here
      m.translateSelf(
        -(objectSize.width * scale - objectSize.width) / scale,
        0 //-(objectSize.height * scale - objectSize.height) / scale
      );

      const d = decomposeMatrix2DW3(m);

      left = left + d.translateX;
      top = top + d.translateY;
      transform =
        "rotate(" + getObjectRotation(object) + "deg) scale(" + d.scaleX + ")";
    }
    if (eData.handle === "tl") {
      m.rotateSelf(getObjectRotation(object));
      m.translateSelf(
        objectSize.width * (getObjectScale(object) ?? 1) - objectSize.width,
        objectSize.height * (getObjectScale(object) ?? 1) - objectSize.height
      ); // old scale here

      m.scaleSelf(scale); // new scale here
      m.translateSelf(
        -(objectSize.width * scale - objectSize.width) / scale,
        -(objectSize.height * scale - objectSize.height) / scale
      );

      const d = decomposeMatrix2DW3(m);

      left = left + d.translateX;
      top = top + d.translateY;
      transform =
        "rotate(" + getObjectRotation(object) + "deg) scale(" + d.scaleX + ")";
    } else if (eData.handle === "br") {
      transform =
        "rotate(" + getObjectRotation(object) + "deg) scale(" + scale + ")";
    }

    // NOTE: LAYOUT CHANGE
    if (eData.handle === "width") {
      objectClone.width =
        objectSize.width + realMoveX / (getObjectScale(object) ?? 1);
    } else if (eData.handle === "height") {
      objectClone.height =
        objectSize.height + realMoveY / (getObjectScale(object) ?? 1);
    } else {
      objectClone.left = left;
      objectClone.top = top;
      objectClone.scale = scale;
    }

    _updateObject(objectClone);
  });
}

// ++++++++++++++++++

function processPanChangeEvent(
  eData: StageToolPanEventData,
  objectById: { [key: string]: IObject },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
  },
  storeActions: {
    _setStagePan: any;
  }
) {
  const { zoom } = storeProps;
  const { _setStagePan } = storeActions;
  console.log(zoom);

  const x = eData.x!; //* zoom;
  const y = eData.y!; //* zoom;

  _setStagePan({ currentX: x, currentY: y });
}

function processPanStopEvent(
  eData: StageToolPanEventData,
  objectById: { [key: string]: IObject },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
    stagePan: any;
  },
  storeActions: {
    _setStagePan: any;
  }
) {
  const { zoom, stagePan } = storeProps;
  const { _setStagePan } = storeActions;
  console.log(zoom);

  const x = eData.x!; //* zoom;
  const y = eData.y!; //* zoom;

  _setStagePan({
    x: stagePan.x + x,
    y: stagePan.y + y,
    currentX: 0,
    currentY: 0,
  });
}

export function degrees_to_radians(degrees: number) {
  // Store the value of pi.
  var pi = Math.PI;
  // Multiply degrees by pi divided by 180 to convert to radians.
  return degrees * (pi / 180);
}

export function getLayerIdRec(objectsById: any, id: string): string {
  if (objectsById[id].layerId) return objectsById[id].layerId;

  return getLayerIdRec(objectsById, objectsById[id].parentId);
}
