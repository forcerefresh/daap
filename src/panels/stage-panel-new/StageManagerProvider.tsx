import React, { useEffect, useRef, useState } from "react";
import { StageManager } from "../../utils/selection-manager/StageManager";
import { IStore } from "../../store/store";
import {
  activateObject,
  addObjectsToSelection,
  deactivateObject,
  removeObjectsFromSelection,
  selectObjects,
  setStagePan,
  updateObject,
} from "../../store/actions/actions";
import { ILayer, IObject } from "webslider-sdk/lib/objects/i-object";
import { connect } from "react-redux";
import { cloneDeep, remove } from "lodash-es";
import { StageToolEnum } from "../../utils/selection-manager/types";
import {
  StageToolEvent,
  StageToolEventDataUnion,
  StageToolMoveEventData,
  StageToolPanEventData,
  StageToolRotateEventData,
} from "../../utils/selection-manager/events/StageToolEvent";
import {
  getGroupMatrixFromSelectionPath,
  getObjectTransform,
  screenPointToLocal,
} from "./stage-panel-utils";
import { Point } from "../../webslider-sdk/object/i-tool-class";
import { selection } from "../../store/reducers/selection";
import { populateObjectThreeIds } from "../../store/actions/actions-utils";

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
    activeStageTool,
    _updateObject,
    _activateObject,
    _selectObjects,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _setStagePan,
  } = props;

  const selectedObjectIdsRef = useRef(selectedObjectIds);
  selectedObjectIdsRef.current = selectedObjectIds;

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
          processRotateStopEvent(eData, objectById, _updateObject);
          break;
        case StageToolEnum.MOVE:
          processMoveStopEvent(
            eData,
            objectById,
            layerById,
            {
              selectedObjectIdsRef,
              zoom,
            },
            {
              _updateObject,
              _activateObject,
              _selectObjects,
            }
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
  const { objects, selection, layers } = state.project;

  return {
    activeStageTool: activeStageTool.tool,
    zoom,
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

  const objectHolder = document.getElementsByClassName(
    `object-holder-${objectId}`
  )[0] as HTMLDivElement;

  if (objectHolder) {
    const currentAngle = object.rotation + angle;
    objectHolder.style.transform = getObjectTransform(object, {
      rotation: currentAngle,
    });

    //   scale(" +
    //   initialScale +
    //   ") translateX(" +
    //   translateX +
    //   "px) translateY(" +
    //   translateY +
    //   "px)";
  }
}

function processRotateStopEvent(
  eData: StageToolRotateEventData,
  objectById: { [key: string]: IObject },
  _updateObject: any
) {
  const objectId = eData.objectId;
  const angle = eData.angle;

  const newObject = cloneDeep(objectById[objectId]);
  newObject.rotation += angle;

  _updateObject(newObject);
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

  if (!selectedObjectIds.includes(objectId) && !hasSelectedParent) {
    selectedObjectIdsRef.current = [objectId];
    _activateObject(objectId);
    _selectObjects([objectId]);
  }
}

function processMoveChangeEvent(
  eData: StageToolMoveEventData,
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
      eData.mouseMove,
      groupsMatrix,
      object.rotation,
      object.scale
    );
    // <<<<<<<<<<<<<<<<

    const objectHolder = document.getElementsByClassName(
      `object-holder-${objectId}`
    )[0] as HTMLDivElement;

    if (objectHolder) {
      console.log(eData);
      //    const currentAngle = object.rotation + angle;
      // objectHolder.style.transform =
      //   "translateX(" + x + "px) translateY(" + y + "px)";

      const left = parseInt(object.absoluteLayout?.common!.left!) + realMove.x;
      const top = parseInt(object.absoluteLayout?.common!.top!) + realMove.y;
      objectHolder.style.left = left + "px";
      objectHolder.style.top = top + "px";

      //   scale(" +
      //   initialScale +
      //   ") translateX(" +
      //   translateX +
      //   "px) translateY(" +
      //   translateY +
      //   "px)";
    }
  });
}

function processMoveStopEvent(
  eData: StageToolMoveEventData,
  objectById: { [key: string]: IObject },
  layerById: { [key: string]: ILayer },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
  },
  storeActions: {
    _updateObject: any;
    _activateObject: any;
    _selectObjects: any;
  }
) {
  const { selectedObjectIdsRef, zoom } = storeProps;
  const selectedObjectIds = selectedObjectIdsRef.current;

  const { _updateObject, _activateObject, _selectObjects } = storeActions;
  const objectId = eData.objectId;
  //const object = objectById[objectId];
  const x = eData.x! / zoom;
  const y = eData.y! / zoom;

  // NOTE: mouseup and down in the same point (no mouse move)
  if (x === 0 && y === 0) {
    // select child element inside group
    if (!eData.originalMouseEvent.shiftKey) {
      _activateObject(objectId);
      _selectObjects([objectId]);
    }
  }

  selectedObjectIds.forEach((objectId) => {
    const object = objectById[objectId];

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
      eData.mouseMove,
      groupsMatrix,
      object.rotation,
      object.scale
    );
    // <<<<<<<<<<<<<<<<

    console.log(realMove);

    const newObject = cloneDeep(object);
    newObject.absoluteLayout!.common!.left! =
      parseInt(newObject.absoluteLayout!.common!.left!) + realMove.x + "px";
    newObject.absoluteLayout!.common!.top! =
      parseInt(newObject.absoluteLayout!.common!.top!) + realMove.y + "px";
    _updateObject(newObject);
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
