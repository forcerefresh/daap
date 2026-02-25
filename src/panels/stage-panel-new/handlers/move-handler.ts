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
  getElementByClass,
  getElementBySelector,
  getGroupMatrixFromSelectionPath,
  screenPointToLocal,
} from "../stage-panel-utils";
import { getObjectRotation, getObjectScale } from "../../../objects/object-utils";
import {
  getObjectBounds,
  stagePointToObjectSpace_New,
} from "../../../utils/transform/transform-utils";
import { setFloatingActionPanelVisibility } from "../../floating-actions-panel/utils";

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

// ── Snap utilities ────────────────────────────────────────────────────────────

export function clearSnapHolder() {
  const snapHolderEl = getElementByClass("StagePanel-SnapHolder") as HTMLElement;
  snapHolderEl.innerHTML = "";

  return snapHolderEl;
}

export function isNear(value: number, refValue: number, threshold: number) {
  return value > refValue - threshold && value < refValue + threshold;
}

type SideType = "left" | "top" | "right" | "bottom" | "vcenter" | "hcenter";

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

function renderSnapLine(
  newObjectBounds: Bounds,
  snapBounds: {
    bounds: Bounds;
    objectId: string;
    snapThreshold?: number;
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

    const boundsAny = snapBounds.bounds as any;
    const newBoundsAny = newObjectBounds as any;

    if (
      isNear(
        newBoundsAny[propertyName],
        boundsAny[side],
        (snapBounds.snapThreshold ?? 5) / stageScale,
      )
    ) {
      if (isHorizontal) {
        snapHolderEl.innerHTML += `
          <div
            style="
              position: absolute;
              top: -10000px;
              left: ${boundsAny[side]}px;
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
              top: ${boundsAny[side]}px;
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

      snapDelta[deltaProp] = boundsAny[side] - newBoundsAny[propertyName];
    }
  });

  return snapDelta;
}
