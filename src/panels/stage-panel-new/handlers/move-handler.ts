import React from "react";
import { cloneDeep, remove } from "lodash-es";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { Bounds } from "../../../webslider-sdk/object/i-tool-class";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { ILayer } from "../../../store/reducers/i-layers";
import {
  StageToolMoveEventData,
} from "../../../utils/selection-manager/events/StageToolEvent";
import { selectForPropertiesProps } from "../../../store/actions/actions";
import { populateObjectThreeIds } from "../../../store/actions/actions-utils";
import {
  getGroupMatrixFromSelectionPath,
  screenPointToLocal,
} from "../stage-panel-utils";
import { getObjectRotation, getObjectScale } from "../../../objects/object-utils";
import {
  getObjectBounds,
  stagePointToObjectSpace_New,
} from "../../../utils/transform/transform-utils";
import { setFloatingActionPanelVisibility } from "../../floating-actions-panel/utils";
import { computeSnap } from "../../../utils/snap/snap-engine";
import { clearSnapGuides, renderSnapGuides } from "../../../utils/snap/snap-renderer";

export function processMoveStartEvent(
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

export function processMoveChangeEvent(
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

    const objectPath: string[] = [];
    populateObjectThreeIds(objectPath, objectId, objectById, layerById);

    const groupsMatrix = getGroupMatrixFromSelectionPath(
      [...objectPath, objectId],
      objectById,
    );

    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      groupsMatrix,
      getObjectRotation(object),
      getObjectScale(object),
    );

    // NOTE: create object clone for transform calc
    const objectClone = cloneDeep(object);
    objectClone.left = object.left! + realMove.x;
    objectClone.top = object.top! + realMove.y;

    objectByIdClone[objectClone.id] = objectClone;

    const newObjectBounds = getObjectBounds([objectClone]);

    if (objectId === eData.objectId) {
      if (snapDeltaGlobal.x === 0 && snapDeltaGlobal.y === 0) {
        clearSnapGuides();
        const snapResult = computeSnap(newObjectBounds, snapBounds, selectedObjectIds, zoom);
        renderSnapGuides(snapResult.guides, snapResult.snappedObjectIds, zoom, object.scale ?? 1);

        if (snapResult.deltaX !== 0 || snapResult.deltaY !== 0) {
          snapDeltaGlobal = { x: snapResult.deltaX, y: snapResult.deltaY };
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

export function processMoveStopEvent(
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
  clearSnapGuides();

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
      if (
        (objectById[objectId].type === "io.forcerefresh.layout.object" ||
          objectById[objectId].type === "io.forcerefresh.text.object") &&
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

    const objectPath: string[] = [];
    populateObjectThreeIds(objectPath, objectId, objectById, layerById);

    const groupsMatrix = getGroupMatrixFromSelectionPath(
      [...objectPath, objectId],
      objectById,
    );

    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      groupsMatrix,
      getObjectRotation(object),
      getObjectScale(object),
    );

    // NOTE: create object clone for transform calc
    const objectClone = cloneDeep(object);
    objectClone.left = object.left! + realMove.x;
    objectClone.top = object.top! + realMove.y;

    objectByIdClone[objectClone.id] = objectClone;

    const newObjectBounds = getObjectBounds([objectClone]);

    if (objectId === eData.objectId) {
      if (snapDeltaGlobal.x === 0 && snapDeltaGlobal.y === 0) {
        const snapResult = computeSnap(newObjectBounds, snapBounds, selectedObjectIds, zoom);

        if (snapResult.deltaX !== 0 || snapResult.deltaY !== 0) {
          snapDeltaGlobal = { x: snapResult.deltaX, y: snapResult.deltaY };
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

  clearSnapGuides();
}

