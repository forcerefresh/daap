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
  StageToolMoveEventData,
  StageToolPanEventData,
  StageToolRotateEventData,
  StageToolScaleEventData,
} from "../../utils/selection-manager/events/StageToolEvent";
import {
  decomposeMatrix2DW3,
  getElementByClass,
  getElementBySelector,
  getGroupMatrixFromSelectionPath,
  getObjectTransform,
  screenPointToLocal,
} from "./stage-panel-utils";
import { Bounds, Point, Rect } from "../../webslider-sdk/object/i-tool-class";
import { populateObjectThreeIds } from "../../store/actions/actions-utils";

import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";

import { setFloatingActionPanelVisibility } from "../floating-actions-panel/utils";
import { ToolsContext } from "../../utils/tools/ToolsProvider";
import { ILayer } from "../../store/reducers/i-layers";
import { getObjectRotation, getObjectScale } from "../../objects/object-utils";
import {
  getObjectBounds,
  stagePointToObjectSpace_New,
} from "../../utils/transform/transform-utils";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";

type StageManagerProviderProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  React.PropsWithChildren<React.ReactNode>;

export interface StageManagerContextInterface {
  stageManager: StageManager;
  /** Called by StageManagerProvider immediately after each DOM mutation batch,
   *  so consumers (e.g. StageToolsCanvas) can reposition overlays without any
   *  event-listener ordering uncertainty. */
  afterDomUpdateRef: React.MutableRefObject<(() => void) | null>;
}

export const StageManagerContext =
  React.createContext<StageManagerContextInterface>({
    stageManager: {} as StageManager,
    afterDomUpdateRef: { current: null },
  });

export const StageManagerProviderInternal = (
  props: StageManagerProviderProps,
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
    _updateObject,
    _activateObject,
    _selectObjects,
    _addObjectsToSelection,
    _removeObjectsFromSelection,
    _deactivateObject,
    _setStagePan,
    _selectForProperties,
  } = props;

  const { activateTool, snapBounds } = useContext(ToolsContext);

  const selectedObjectIdsRef = useRef(selectedObjectIds);
  selectedObjectIdsRef.current = selectedObjectIds;

  const recentlySelectedRef = useRef(false);

  /** Consumers register a callback here; we call it after every DOM mutation. */
  const afterDomUpdateRef = useRef<(() => void) | null>(null);

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
            },
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
            },
          );
          break;
      }
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
            snapBounds,
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
            },
          );
          break;
      }
      // All DOM mutations are done — notify StageToolsCanvas so it can
      // reposition selection overlays immediately, in the same call stack.
      afterDomUpdateRef.current?.();
    };

    const stopHandler = (e: StageToolEvent) => {
      const eData = e.detail;
      switch (eData.eventType) {
        case StageToolEnum.SELECT:
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
            },
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
              snapBounds,
            },
            {
              _updateObject,
              _activateObject,
              _selectObjects,
              _selectForProperties,
              activateTool: activateTool,
            },
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
            { _updateObject },
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
            },
          );
          break;
      }
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
    selectedObjectIds,
    snapBounds,
  ]);

  return (
    <StageManagerContext.Provider
      value={{
        stageManager: stageManager,
        afterDomUpdateRef,
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
        breakpointConfig.type === state.stage.selectedDevice,
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
  mapDispatchToProps,
)(StageManagerProviderInternal);

export default StageManagerProvider;

// ******************************************************
/** HANDLER functions  */
// ******************************************************

function processRotateStartEvent(
  eData: StageToolRotateEventData,
  objectById: any,
  _updateObject: any,
) {
  // do nothing
}

function processRotateChangeEvent(
  eData: StageToolRotateEventData,
  objectById: any,
  _updateObject: any,
) {
  const objectId = eData.objectId;
  const object = objectById[objectId];
  const angle = eData.angle;

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
    (objectSize.height / 2) * getObjectScale(object),
  );
  m.rotateSelf(angle);
  m.scaleSelf(getObjectScale(object));
  m.translateSelf(-(objectSize.width / 2), -(objectSize.height / 2));

  const d = decomposeMatrix2DW3(m);

  left = d.translateX;
  top = d.translateY;
  const transform = "rotate(" + d.rotateZ + "deg) scale(" + d.scaleX + ")";

  const objectHolder = document.getElementsByClassName(
    `object-holder-${objectId}`,
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
  },
) {
  const { breakpointConfig } = storeProps;
  const { _updateObject } = storeActions;

  const objectId = eData.objectId;
  const object = objectById[objectId];
  const angle = eData.angle;

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
    (objectSize.height / 2) * (getObjectScale(object) ?? 1),
  );
  m.rotateSelf(angle);
  m.scaleSelf(getObjectScale(object));
  m.translateSelf(-(objectSize.width / 2), -(objectSize.height / 2));

  const d = decomposeMatrix2DW3(m);

  left = d.translateX;
  top = d.translateY;
  const transform = "rotate(" + d.rotateZ + "deg) scale(" + d.scaleX + ")";

  const newObject = cloneDeep(object);

  newObject.rotation = d.rotateZ;
  newObject.left = left;
  newObject.top = top;

  _updateObject(newObject);
}

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
  },
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

  const objectId = eData.objectId;
  const object = objectById[objectId];
  const x = eData.x! / zoom;
  const y = eData.y! / zoom;

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

  recentlySelectedRef.current = false;
  if (!selectedObjectIds.includes(objectId) && !hasSelectedParent) {
    selectedObjectIdsRef.current = [objectId];
    recentlySelectedRef.current = true;
    _activateObject(objectId);
    _selectObjects([objectId]);
    _selectForProperties({ type: "object", id: objectId });
  }
}

function processMoveChangeEvent(
  eData: StageToolMoveEventData,
  objectById: { [key: string]: IObject },
  layerById: { [key: string]: ILayer },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
    snapBounds: {
      bounds: Bounds;
      objectId: string;
    }[];
  },
) {
  setFloatingActionPanelVisibility(false);

  const { selectedObjectIdsRef, zoom, snapBounds } = storeProps;
  const selectedObjectIds = selectedObjectIdsRef.current;

  const x = eData.x! / zoom;
  const y = eData.y! / zoom;

  let selectedObjectIdsClone = [...selectedObjectIds];

  let snapDeltaGlobal = { x: 0, y: 0 };
  const objectByIdClone: any = {};

  while (selectedObjectIdsClone.length > 0) {
    const objectId = selectedObjectIdsClone.shift()!;
    const object = objectById[objectId];

    if (object.isLocked) return;

    // >>>>>>>>>>>>>>>>
    const objectPath: string[] = [];
    populateObjectThreeIds(objectPath, objectId, objectById, layerById);

    const groupsMatrix = getGroupMatrixFromSelectionPath(
      [...objectPath, objectId],
      objectById,
    );
    // <<<<<<<<<<<<<<<<

    // >>>>>>>>>>>>>>>>
    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      groupsMatrix,
      getObjectRotation(object),
      getObjectScale(object),
    );
    // <<<<<<<<<<<<<<<<

    // NOTE: create object clone for transform calc
    const objectClone = cloneDeep(object);
    objectClone.left = object.left! + realMove.x;
    objectClone.top = object.top! + realMove.y;

    objectByIdClone[objectClone.id] = objectClone;

    const newObjectBounds = getObjectBounds([objectClone]);

    if (objectId === eData.objectId) {
      if (snapDeltaGlobal.x === 0 && snapDeltaGlobal.y === 0) {
        const snapDelta = renderSnapLines(
          newObjectBounds,
          snapBounds,
          selectedObjectIds,
          zoom,
          object.scale ?? 1,
        );

        if (snapDelta.x !== 0 || snapDelta.y !== 0) {
          snapDeltaGlobal = snapDelta;
        }
      }
    }
  }

  selectedObjectIds.map((objectId) => {
    const object = objectById[objectId];

    if (object.isLocked) return;

    const objectHolder = document.getElementsByClassName(
      `object-holder-${objectId}`,
    )[0] as HTMLDivElement;

    if (objectHolder) {
      const objSnapDelta = stagePointToObjectSpace_New(
        [object],
        snapDeltaGlobal,
        1,
      );

      const left = objectByIdClone[objectId].left! + objSnapDelta.x;
      const top = objectByIdClone[objectId].top! + objSnapDelta.y;

      objectHolder.style.left = left + "px";
      objectHolder.style.top = top + "px";
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
    snapBounds: {
      bounds: Bounds;
      objectId: string;
    }[];
  },
  storeActions: {
    _updateObject: any;
    _activateObject: any;
    _selectObjects: any;
    _selectForProperties: any;
    activateTool: (
      tool: string,
      version?: string,
      objectId?: string | undefined,
    ) => void;
  },
) {
  clearSnapHolder();

  const {
    selectedObjectIdsRef,
    zoom,
    breakpointConfig,
    recentlySelectedRef,
    snapBounds,
  } = storeProps;
  const selectedObjectIds = selectedObjectIdsRef.current;

  const {
    _updateObject,
    _activateObject,
    _selectObjects,
    _selectForProperties,
    activateTool,
  } = storeActions;
  const objectId = eData.objectId;
  const x = eData.x! / zoom;
  const y = eData.y! / zoom;

  // NOTE: mouseup and down in the same point (no mouse move)
  if (x === 0 && y === 0) {
    if (selectedObjectIds.length === 1 && selectedObjectIds[0] === objectId) {
      // TODO
      if (
        (objectById[objectId].type === "io.forcerefresh.layout.object" ||
          objectById[objectId].type === "io.forcerefresh.text.object" ||
          objectById[objectId].type === "io.forcerefresh.line.object") &&
        !recentlySelectedRef.current
      ) {
        activateTool(objectById[objectId].type, "latest", objectId);
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

  const selectedObjectIdsClone = [...selectedObjectIds];

  let snapDeltaGlobal = { x: 0, y: 0 };
  const objectByIdClone: any = {};

  while (selectedObjectIdsClone.length > 0) {
    const objectId = selectedObjectIdsClone.shift()!;
    const object = objectById[objectId];

    if (object.isLocked) return;

    // >>>>>>>>>>>>>>>>>>
    const objectPath: string[] = [];
    populateObjectThreeIds(objectPath, objectId, objectById, layerById);

    const groupsMatrix = getGroupMatrixFromSelectionPath(
      [...objectPath, objectId],
      objectById,
    );
    // <<<<<<<<<<<<<<<<

    // >>>>>>>>>>>>>>>>
    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      groupsMatrix,
      getObjectRotation(object),
      getObjectScale(object),
    );
    // <<<<<<<<<<<<<<<<

    // NOTE: create object clone for transform calc
    const objectClone = cloneDeep(object);
    objectClone.left = object.left! + realMove.x;
    objectClone.top = object.top! + realMove.y;

    objectByIdClone[objectClone.id] = objectClone;

    const newObjectBounds = getObjectBounds([objectClone]);

    if (objectId === eData.objectId) {
      if (snapDeltaGlobal.x === 0 && snapDeltaGlobal.y === 0) {
        const snapDelta = renderSnapLines(
          newObjectBounds,
          snapBounds,
          selectedObjectIds,
          zoom,
          object.scale ?? 1,
        );

        if (snapDelta.x !== 0 || snapDelta.y !== 0) {
          snapDeltaGlobal = snapDelta;
        }
      }
    }
  }

  const objectToUpdate: IObject[] = [];
  const objectToUpdateById: { [key: string]: IObject } = {};

  selectedObjectIds.map((objectId) => {
    const object = objectById[objectId];

    if (object.isLocked) return;

    const objSnapDelta = stagePointToObjectSpace_New(
      [object],
      snapDeltaGlobal,
      1,
    );

    const left = objectByIdClone[objectId].left! + objSnapDelta.x;
    const top = objectByIdClone[objectId].top! + objSnapDelta.y;

    const newObject = cloneDeep(object);
    newObject.left = left;
    newObject.top = top;

    objectToUpdate.push(newObject);
    objectToUpdateById[newObject.id] = newObject;
  });

  if (objectToUpdate.length === 0) return;

  objectToUpdate.forEach((object) => _updateObject(cloneDeep(object)));

  if (parentGroup) {
    _updateObject(cloneDeep(parentGroup));
  }

  clearSnapHolder();

  const els = document.getElementsByClassName("snap-highlight-object");
  Array.from(els).forEach((el) => {
    el.classList.remove("snap-highlight-object");
  });
}

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
  },
) {
  // do nothing
}

function processScaleChangeEvent(
  eData: StageToolScaleEventData,
  objectById: { [key: string]: IObject },
  layerById: { [key: string]: ILayer },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
  },
) {
  const { selectedObjectIdsRef, zoom } = storeProps;
  const selectedObjectIds = selectedObjectIdsRef.current;

  selectedObjectIds.forEach((objectId) => {
    const object = objectById[objectId];

    const objectPath: string[] = [];
    populateObjectThreeIds(objectPath, objectId, objectById, layerById);
    const parentGroupsMatrix = getGroupMatrixFromSelectionPath(
      objectPath,
      objectById,
    );
    parentGroupsMatrix.e = parentGroupsMatrix.f = 0;
    const objectOwnMatrix = new DOMMatrix(getObjectTransform(object));
    const fullContextMatrix = parentGroupsMatrix.multiply(objectOwnMatrix);

    const mouseMoveX = eData.mouseMove.x / zoom;
    const mouseMoveY = eData.mouseMove.y / zoom;

    // >>>>>>>>>>>>>>>>
    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      fullContextMatrix,
      0,
      getObjectScale(object),
    );
    // <<<<<<<<<<<<<<<<

    const objectHolder = document.getElementsByClassName(
      `object-holder-${objectId}`,
    )[0] as HTMLDivElement;

    if (objectHolder) {
      let newWidth: string | undefined = undefined;
      let newLeft: string | undefined = undefined;
      let newTop: string | undefined = undefined;

      let newHeight: string | undefined = undefined;

      const realMoveXY = realMove.x;

      const objectSize: Rect = {
        x: object.left!,
        y: object.top!,
        width: object.width!,
        height: object.height!,
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
          0,
          objectSize.height * (getObjectScale(object) ?? 1) - objectSize.height,
        );

        m.scaleSelf(scale);
        m.translateSelf(
          0,
          -(objectSize.height * scale - objectSize.height) / scale,
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
          0,
        );

        m.scaleSelf(scale);
        m.translateSelf(
          -(objectSize.width * scale - objectSize.width) / scale,
          0,
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
          objectSize.height * (getObjectScale(object) ?? 1) - objectSize.height,
        );

        m.scaleSelf(scale);
        m.translateSelf(
          -(objectSize.width * scale - objectSize.width) / scale,
          -(objectSize.height * scale - objectSize.height) / scale,
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
      if (eData.handle === "left" || eData.handle === "width") {
        if (eData.handle === "left") {
          newLeft =
            objectSize.x + realMove.x / (getObjectScale(object) ?? 1) + "px";
          objectHolder.style.left = newLeft;
        }

        const widthDirection = eData.handle === "left" ? -1 : 1;

        newWidth =
          objectSize.width +
          widthDirection * (realMove.x / (getObjectScale(object) ?? 1)) +
          "px";
        objectHolder.style.width = newWidth;

        const contentEl = objectHolder.getElementsByClassName(
          "object-content",
        )[0] as HTMLElement;
        if (contentEl) contentEl.style.width = newWidth;

        const resizeHolderEl = objectHolder.getElementsByClassName(
          "resize-handle-holder-" + objectId,
        )[0] as HTMLElement;
        if (resizeHolderEl) resizeHolderEl.style.width = newWidth;
      } else if (eData.handle === "top" || eData.handle === "height") {
        if (eData.handle === "top") {
          newTop =
            objectSize.y + realMove.y / (getObjectScale(object) ?? 1) + "px";
          objectHolder.style.top = newTop;
        }

        const widthDirection = eData.handle === "top" ? -1 : 1;

        newHeight =
          objectSize.height +
          widthDirection * (realMove.y / (getObjectScale(object) ?? 1)) +
          "px";
        objectHolder.style.height = newHeight;

        const contentEl = objectHolder.getElementsByClassName(
          "object-content",
        )[0] as HTMLElement;
        if (contentEl) contentEl.style.height = newHeight;

        const resizeHolderEl = objectHolder.getElementsByClassName(
          "resize-handle-holder-" + objectId,
        )[0] as HTMLElement;
        if (resizeHolderEl) resizeHolderEl.style.height = newHeight;
      } else {
        objectHolder.style.left = left + "px";
        objectHolder.style.top = top + "px";
        objectHolder.style.transform = transform;

        // HANDLES
        const handlesEls = Array.from(
          document.getElementsByClassName(`resize-handle-${objectId}`),
        ) as HTMLDivElement[];

        handlesEls.forEach((handleEL) => {
          handleEL.style.scale = `${(getObjectScale(object) ?? 1) / scale}`;
        });

        const selEl = objectHolder.getElementsByClassName(
          "object-selection",
        )?.[0] as HTMLDivElement | undefined;
        if (selEl) {
          selEl.style.boxShadow = `0 0 0 ${1 / scale / zoom}px ${
            object.objectIds ? "#444444" : "#48aff0"
          }`;
        }
      }

      const html = getAppObjectDefinition(object.type, "latest")?.getHtml?.({
        calculatedObjectSize: {
          width: newWidth ?? object.width,
          height: newHeight ?? object.height,
        },
        object: {
          ...object,
          width: newWidth ? parseInt(newWidth) : object.width,
          height: newHeight ? parseInt(newHeight) : object.height,
        },
        deviceType: "device-independent",
      });

      const el = objectHolder.querySelector(`.object-content-${object.id}`);

      if (el?.parentElement && html) {
        el.parentElement.style.height = newHeight ?? object.height + "px";
        el.parentElement.style.width = newWidth ?? object.width + "px";

        el.parentElement.innerHTML = html;

        const objectSelectorEl = getElementBySelector(
          ".object-holder-" + object.id + " > .object-selection",
        ) as HTMLElement;

        if (objectSelectorEl) {
          objectSelectorEl.style.width = newWidth ?? object.width + "px";
          objectSelectorEl.style.height = newHeight ?? object.height + "px";
        }
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
  },
) {
  const { selectedObjectIdsRef, zoom } = storeProps;
  const { _updateObject } = storeActions;

  const selectedObjectIds = selectedObjectIdsRef.current;

  const x = eData.x! / zoom;
  const y = eData.y! / zoom;

  selectedObjectIds.forEach((objectId) => {
    const object = objectById[objectId];
    const objectClone = cloneDeep(object);

    // >>>>>>>>>>>>>>>>>>
    const objectPath: string[] = [];
    populateObjectThreeIds(objectPath, objectId, objectById, layerById);
    const parentGroupsMatrix = getGroupMatrixFromSelectionPath(
      objectPath,
      objectById,
    );
    parentGroupsMatrix.e = parentGroupsMatrix.f = 0;
    const objectOwnMatrix = new DOMMatrix(getObjectTransform(object));
    const fullContextMatrix = parentGroupsMatrix.multiply(objectOwnMatrix);
    // <<<<<<<<<<<<<<<<

    // >>>>>>>>>>>>>>>>
    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      fullContextMatrix,
      0,
      getObjectScale(object),
    );
    // <<<<<<<<<<<<<<<<

    const realMoveX = realMove.x; // Math.max(realMove.x, realMove.y);
    const realMoveY = realMove.y; // Math.max(realMove.x, realMove.y);

    const objectSize: Rect = {
      x: object.left!,
      y: object.top!,
      width: object.width!,
      height: object.height!,
    };

    const dir = eData.handle === "br" || eData.handle === "tr" ? -1 : 1;

    let scale =
      ((getObjectScale(object) ?? 1) * objectSize.width - dir * realMoveX) /
      objectSize.width;

    let left = objectSize.x;
    let top = objectSize.y;

    let transform = "";
    const m = new DOMMatrix();
    if (eData.handle === "tr") {
      m.rotateSelf(getObjectRotation(object));
      m.translateSelf(
        0,
        objectSize.height * (getObjectScale(object) ?? 1) - objectSize.height,
      );

      m.scaleSelf(scale);
      m.translateSelf(
        0,
        -(objectSize.height * scale - objectSize.height) / scale,
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
        0,
      );

      m.scaleSelf(scale);
      m.translateSelf(
        -(objectSize.width * scale - objectSize.width) / scale,
        0,
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
        objectSize.height * (getObjectScale(object) ?? 1) - objectSize.height,
      );

      m.scaleSelf(scale);
      m.translateSelf(
        -(objectSize.width * scale - objectSize.width) / scale,
        -(objectSize.height * scale - objectSize.height) / scale,
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

    if (eData.handle === "left" || eData.handle === "width") {
      if (eData.handle === "left") {
        objectClone.left =
          objectSize.x + realMoveX / (getObjectScale(object) ?? 1);
      }

      const widthDirection = eData.handle === "left" ? -1 : 1;

      objectClone.width =
        objectSize.width +
        widthDirection * (realMoveX / (getObjectScale(object) ?? 1));
    } else if (eData.handle === "top" || eData.handle === "height") {
      if (eData.handle === "top") {
        objectClone.top =
          objectSize.y + realMoveY / (getObjectScale(object) ?? 1);
      }

      const widthDirection = eData.handle === "top" ? -1 : 1;

      objectClone.height =
        objectSize.height +
        widthDirection * (realMoveY / (getObjectScale(object) ?? 1));
    } else {
      objectClone.left = left;
      objectClone.top = top;
      objectClone.scale = scale;
    }

    _updateObject(objectClone);
  });
}

function processPanChangeEvent(
  eData: StageToolPanEventData,
  objectById: { [key: string]: IObject },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
  },
  storeActions: {
    _setStagePan: any;
  },
) {
  const { zoom } = storeProps;
  const { _setStagePan } = storeActions;

  const x = eData.x!;
  const y = eData.y!;

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
  },
) {
  const { zoom, stagePan } = storeProps;
  const { _setStagePan } = storeActions;

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
  var pi = Math.PI;
  return degrees * (pi / 180);
}

export function getLayerIdRec(objectsById: any, id: string): string {
  if (objectsById[id].layerId) return objectsById[id].layerId;

  return getLayerIdRec(objectsById, objectsById[id].parentId);
}

export function clearSnapHolder() {
  const snapHolderEl = getElementByClass("StagePanel-SnapHolder");
  snapHolderEl.innerHTML = "";

  return snapHolderEl;
}

function renderSnapLines(
  newObjectBounds: Bounds,
  snapBounds: {
    bounds: Bounds;
    objectId: string;
  }[],
  skipObjectIds: string[],
  stageScale: number,
  objectScale: number,
) {
  const snapHolderEl = clearSnapHolder();

  const snapDelta = { x: 0, y: 0 };

  snapBounds.forEach((snapBound) => {
    if (skipObjectIds.includes(snapBound.objectId)) return;

    const objectSelectorEl = getElementBySelector(
      ".object-holder-" + snapBound.objectId + " > .object-selection",
    ) as HTMLDivElement;
    if (objectSelectorEl) {
      objectSelectorEl.style.setProperty(
        "--snap-border-width",
        `${1.2 / objectScale}px`,
      );

      objectSelectorEl.classList.remove("snap-highlight-object");
    }

    renderSnapLine(
      newObjectBounds,
      snapBound,
      true,
      ["left", "right"],
      "left",
      snapDelta,
      stageScale,
      snapHolderEl,
    );
    renderSnapLine(
      newObjectBounds,
      snapBound,
      false,
      ["top", "bottom"],
      "top",
      snapDelta,
      stageScale,
      snapHolderEl,
    );
    renderSnapLine(
      newObjectBounds,
      snapBound,
      true,
      ["left", "right"],
      "right",
      snapDelta,
      stageScale,
      snapHolderEl,
    );
    renderSnapLine(
      newObjectBounds,
      snapBound,
      false,
      ["top", "bottom"],
      "bottom",
      snapDelta,
      stageScale,
      snapHolderEl,
    );

    renderSnapLine(
      newObjectBounds,
      snapBound,
      true,
      ["vcenter"],
      "vcenter",
      snapDelta,
      stageScale,
      snapHolderEl,
    );
    renderSnapLine(
      newObjectBounds,
      snapBound,
      false,
      ["hcenter"],
      "hcenter",
      snapDelta,
      stageScale,
      snapHolderEl,
    );
  });

  return snapDelta;
}

type SideType = "left" | "top" | "right" | "bottom" | "vcenter" | "hcenter";

function renderSnapLine(
  newObjectBounds: Bounds,
  snapBounds: {
    bounds: Bounds;
    objectId: string;
    snapThreshold: number;
  },
  isHorizontal: boolean,
  sides: SideType[],
  propertyName: SideType,
  snapDelta: {
    x: number;
    y: number;
  },
  stageScale: number,
  snapHolderEl: HTMLElement,
) {
  sides.forEach((side) => {
    // TODO
    if (
      snapDelta.x &&
      (side === "left" || side === "right" || side === "vcenter")
    ) {
      return;
    }
    // TODO
    if (
      snapDelta.y &&
      (side === "top" || side === "bottom" || side === "hcenter")
    ) {
      return;
    }

    if (
      isNear(
        newObjectBounds[propertyName],
        snapBounds.bounds[side],
        snapBounds.snapThreshold / stageScale,
      )
    ) {
      if (isHorizontal) {
        snapHolderEl.innerHTML += `
          <div
            style="
              position: absolute;
              top: -10000px;
              left: ${snapBounds.bounds[side]}px;
              bottom: -10000px;
              width: 0px;
              border-left: ${1 / stageScale}px solid #ce58d1;
              overflow: visible;
            "
          ></div>
        `;
      } else {
        snapHolderEl.innerHTML += `
          <div
            style="
              position: absolute;
              left: -10000px;
              top: ${snapBounds.bounds[side]}px;
              right: -10000px;
              height: 0px;
                border-top: ${1 / stageScale}px solid #ce58d1;
              overflow: visible;
            "
          ></div>
        `;
      }

      const objectSelectorEl = getElementBySelector(
        ".object-holder-" + snapBounds.objectId + " > .object-selection",
      );
      objectSelectorEl?.classList.add("snap-highlight-object");

      const deltaProp =
        side == "left" || side == "right" || side === "vcenter" ? "x" : "y";

      snapDelta[deltaProp] =
        snapBounds.bounds[side] - newObjectBounds[propertyName];
    }
  });

  return snapDelta;
}

export function isNear(value: number, refValue: number, threshold: number) {
  return value > refValue - threshold && value < refValue + threshold;
}
