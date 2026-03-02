import React from "react";
import { cloneDeep } from "lodash-es";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { Rect } from "../../../webslider-sdk/object/i-tool-class";
import { ILayer } from "../../../store/reducers/i-layers";
import {
  StageToolScaleEventData,
} from "../../../utils/selection-manager/events/StageToolEvent";
import { populateObjectThreeIds, computeGroupChildrenBounds } from "../../../store/actions/actions-utils";
import {
  getElementBySelector,
  getGroupMatrixFromSelectionPath,
  getObjectTransform,
  screenPointToLocal,
} from "../stage-panel-utils";
import { getObjectRotation, getObjectScale } from "../../../objects/object-utils";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";

/**
 * For corner scale handles, returns the fixed corner (in object LOCAL coords)
 * and the reference width/height to use in the scale formula.
 * For groups, uses children bounds so the visual opposite corner stays fixed.
 * For non-groups, falls back to stored bounds (identical to previous behaviour).
 */
function getCornerScaleParams(
  handle: string,
  object: IObject,
  objectById: { [key: string]: IObject },
): { px: number; py: number; refW: number } {
  let bx = 0;
  let by = 0;
  let bw = object.width ?? 0;
  let bh = object.height ?? 0;

  if (object.type === "group") {
    const bounds = computeGroupChildrenBounds(object.id, objectById);
    if (bounds) {
      bx = bounds.x;
      by = bounds.y;
      bw = bounds.w;
      bh = bounds.h;
    }
  }

  switch (handle) {
    case "br": return { px: bx,      py: by,      refW: bw };
    case "tr": return { px: bx,      py: by + bh, refW: bw };
    case "bl": return { px: bx + bw, py: by,      refW: bw };
    case "tl": return { px: bx + bw, py: by + bh, refW: bw };
    default:   return { px: 0,       py: 0,        refW: object.width ?? 0 };
  }
}

/**
 * Given the old scale, new scale, rotation, and the fixed-corner local coords,
 * returns the Δleft / Δtop required to keep that corner stationary in parent space.
 */
function fixedCornerDelta(
  oldScale: number,
  newScale: number,
  rotationDeg: number,
  px: number,
  py: number,
): { dLeft: number; dTop: number } {
  const r = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  const ds = oldScale - newScale;
  return {
    dLeft: ds * (px * cos - py * sin),
    dTop:  ds * (px * sin + py * cos),
  };
}

export function processScaleStartEvent(
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

export function processScaleChangeEvent(
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

    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      fullContextMatrix,
      0,
      getObjectScale(object),
    );

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

      const oldScale = getObjectScale(object) ?? 1;
      const { px, py, refW } = getCornerScaleParams(eData.handle, object, objectById);
      const dir = eData.handle === "br" || eData.handle === "tr" ? -1 : 1;

      const scale = (oldScale * refW - dir * realMoveXY) / refW;

      let transform = "";

      if (["tr", "bl", "tl", "br"].includes(eData.handle)) {
        const { dLeft, dTop } = fixedCornerDelta(
          oldScale,
          scale,
          getObjectRotation(object),
          px,
          py,
        );
        left += dLeft;
        top += dTop;
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

export function processScaleStopEvent(
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

    const objectPath: string[] = [];
    populateObjectThreeIds(objectPath, objectId, objectById, layerById);
    const parentGroupsMatrix = getGroupMatrixFromSelectionPath(
      objectPath,
      objectById,
    );
    parentGroupsMatrix.e = parentGroupsMatrix.f = 0;
    const objectOwnMatrix = new DOMMatrix(getObjectTransform(object));
    const fullContextMatrix = parentGroupsMatrix.multiply(objectOwnMatrix);

    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      fullContextMatrix,
      0,
      getObjectScale(object),
    );

    const realMoveX = realMove.x;
    const realMoveY = realMove.y;

    const objectSize: Rect = {
      x: object.left!,
      y: object.top!,
      width: object.width!,
      height: object.height!,
    };

    const oldScale = getObjectScale(object) ?? 1;
    const { px, py, refW } = getCornerScaleParams(eData.handle, object, objectById);
    const dir = eData.handle === "br" || eData.handle === "tr" ? -1 : 1;

    const scale = (oldScale * refW - dir * realMoveX) / refW;

    let left = objectSize.x;
    let top = objectSize.y;
    let transform = "";

    if (["tr", "bl", "tl", "br"].includes(eData.handle)) {
      const { dLeft, dTop } = fixedCornerDelta(
        oldScale,
        scale,
        getObjectRotation(object),
        px,
        py,
      );
      left += dLeft;
      top += dTop;
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
