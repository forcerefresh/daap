import React from "react";
import { cloneDeep } from "lodash-es";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { Bounds, Rect } from "../../../webslider-sdk/object/i-tool-class";
import { ILayer } from "../../../store/reducers/i-layers";
import { StageToolScaleEventData } from "../../../utils/selection-manager/events/StageToolEvent";
import { populateObjectThreeIds } from "../../../store/actions/actions-utils";
import {
  getElementBySelector,
  getGroupMatrixFromSelectionPath,
  getObjectTransform,
  screenPointToLocal,
} from "../stage-panel-utils";
import { getObjectRotation, getObjectScale } from "../../../objects/object-utils";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";
import { objectPointToStageSpace_New } from "../../../utils/transform/transform-utils";
import { computeSnap, SnapTarget } from "../../../utils/snap/snap-engine";
import { clearSnapGuides, renderSnapGuides } from "../../../utils/snap/snap-renderer";

const RESIZE_HANDLES = ["left", "width", "top", "height"] as const;
type ResizeHandle = typeof RESIZE_HANDLES[number];

function isResizeHandle(handle: string): handle is ResizeHandle {
  return (RESIZE_HANDLES as readonly string[]).includes(handle);
}

function mergeSnap(
  a: ReturnType<typeof computeSnap>,
  b: ReturnType<typeof computeSnap>,
  axis: "x" | "y",
) {
  const da = axis === "x" ? a.deltaX : a.deltaY;
  const db = axis === "x" ? b.deltaX : b.deltaY;
  const winner = (da !== 0 && (db === 0 || Math.abs(da) <= Math.abs(db))) ? a : b;
  return {
    deltaX: winner.deltaX,
    deltaY: winner.deltaY,
    guides: [...a.guides, ...b.guides],
    snappedObjectIds: [...new Set([...a.snappedObjectIds, ...b.snappedObjectIds])],
  };
}

export function processResizeStartEvent(
  _eData: StageToolScaleEventData,
  _objectById: { [key: string]: IObject },
  _storeProps: {
    activeObjectId: string | null;
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
    selectionPath: string[];
  },
  _storeActions: {
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

export function processResizeChangeEvent(
  eData: StageToolScaleEventData,
  objectById: { [key: string]: IObject },
  layerById: { [key: string]: ILayer },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
    snapBounds: SnapTarget[];
  },
) {
  if (!isResizeHandle(eData.handle)) return;

  const { selectedObjectIdsRef, zoom, snapBounds } = storeProps;
  const selectedObjectIds = selectedObjectIdsRef.current;

  selectedObjectIds.forEach((objectId) => {
    const object = objectById[objectId];

    const objectPath: string[] = [];
    populateObjectThreeIds(objectPath, objectId, objectById, layerById);
    const parentGroupsMatrix = getGroupMatrixFromSelectionPath(objectPath, objectById);
    parentGroupsMatrix.e = parentGroupsMatrix.f = 0;
    const objectOwnMatrix = new DOMMatrix(getObjectTransform(object));
    const fullContextMatrix = parentGroupsMatrix.multiply(objectOwnMatrix);

    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      fullContextMatrix,
      0,
      getObjectScale(object),
    );

    const objectHolder = document.getElementsByClassName(`object-holder-${objectId}`)[0] as HTMLDivElement;
    if (!objectHolder) return;

    const objectSize: Rect = {
      x: object.left!,
      y: object.top!,
      width: object.width!,
      height: object.height!,
    };

    const objScaleVal = getObjectScale(object) ?? 1;
    const LARGE = 1e9;

    let newWidth: string | undefined;
    let newHeight: string | undefined;

    if (eData.handle === "left" || eData.handle === "width") {
      const widthDir = eData.handle === "left" ? -1 : 1;
      let numLeft = objectSize.x;

      if (eData.handle === "left") {
        numLeft = objectSize.x + realMove.x / objScaleVal;
        objectHolder.style.left = numLeft + "px";
      }

      const numWidth = objectSize.width + widthDir * (realMove.x / objScaleVal);
      newWidth = numWidth + "px";
      objectHolder.style.width = newWidth;

      const contentEl = objectHolder.getElementsByClassName("object-content")[0] as HTMLElement | undefined;
      if (contentEl) contentEl.style.width = newWidth;
      const resizeHolderEl = objectHolder.getElementsByClassName(`resize-handle-holder-${objectId}`)[0] as HTMLElement | undefined;
      if (resizeHolderEl) resizeHolderEl.style.width = newWidth;

      // Snap: check both corners of the moving edge
      const modObj = { ...object, left: numLeft, width: numWidth };
      const edgeX = eData.handle === "width" ? numWidth : 0;
      const p1 = objectPointToStageSpace_New([modObj], { x: edgeX, y: 0 }, 1);
      const p2 = objectPointToStageSpace_New([modObj], { x: edgeX, y: object.height! }, 1);
      const side = eData.handle === "width" ? "right" : "left";
      const sr1 = computeSnap(
        { left: side === "left" ? p1.x : LARGE, right: side === "right" ? p1.x : LARGE, top: p1.y, bottom: LARGE, vcenter: LARGE, hcenter: LARGE } as unknown as Bounds,
        snapBounds, selectedObjectIds, zoom,
      );
      const sr2 = computeSnap(
        { left: side === "left" ? p2.x : LARGE, right: side === "right" ? p2.x : LARGE, top: LARGE, bottom: p2.y, vcenter: LARGE, hcenter: LARGE } as unknown as Bounds,
        snapBounds, selectedObjectIds, zoom,
      );
      const sr = mergeSnap(sr1, sr2, "x");
      clearSnapGuides();
      renderSnapGuides(sr.guides, sr.snappedObjectIds, zoom, objScaleVal);
      if (eData.handle === "left") {
        if (sr.deltaX !== 0) {
          const localDelta = sr.deltaX / objScaleVal;
          objectHolder.style.left = (numLeft + sr.deltaX) + "px";
          newWidth = (numWidth - localDelta) + "px";
          objectHolder.style.width = newWidth;
          if (contentEl) contentEl.style.width = newWidth;
          if (resizeHolderEl) resizeHolderEl.style.width = newWidth;
        }
      } else {
        // WIDTH handle — rotation-aware: d(right_edge.x)/d(w) = S*cos(R), d(right_edge.y)/d(w) = S*sin(R)
        const S = objScaleVal;
        const R_rad = getObjectRotation(object) * Math.PI / 180;
        const cosR = Math.cos(R_rad);
        const sinR = Math.sin(R_rad);
        const EPS = 1e-6;
        const wCands: number[] = [];
        if (sr1.deltaX !== 0 && Math.abs(cosR) > EPS) wCands.push(numWidth + sr1.deltaX / (S * cosR));
        if (sr1.deltaY !== 0 && Math.abs(sinR) > EPS) wCands.push(numWidth + sr1.deltaY / (S * sinR));
        if (sr2.deltaX !== 0 && Math.abs(cosR) > EPS) wCands.push(numWidth + sr2.deltaX / (S * cosR));
        if (sr2.deltaY !== 0 && Math.abs(sinR) > EPS) wCands.push(numWidth + sr2.deltaY / (S * sinR));
        if (wCands.length > 0) {
          const snapW = wCands.reduce((best, c) => Math.abs(c - numWidth) < Math.abs(best - numWidth) ? c : best);
          newWidth = snapW + "px";
          objectHolder.style.width = newWidth;
          if (contentEl) contentEl.style.width = newWidth;
          if (resizeHolderEl) resizeHolderEl.style.width = newWidth;
        }
      }
    } else {
      // top / height
      const heightDir = eData.handle === "top" ? -1 : 1;
      let numTop = objectSize.y;

      if (eData.handle === "top") {
        numTop = objectSize.y + realMove.y / objScaleVal;
        objectHolder.style.top = numTop + "px";
      }

      const numHeight = objectSize.height + heightDir * (realMove.y / objScaleVal);
      newHeight = numHeight + "px";
      objectHolder.style.height = newHeight;

      const contentEl = objectHolder.getElementsByClassName("object-content")[0] as HTMLElement | undefined;
      if (contentEl) contentEl.style.height = newHeight;
      const resizeHolderEl = objectHolder.getElementsByClassName(`resize-handle-holder-${objectId}`)[0] as HTMLElement | undefined;
      if (resizeHolderEl) resizeHolderEl.style.height = newHeight;

      // Snap: check both corners of the moving edge
      const modObj = { ...object, top: numTop, height: numHeight };
      const edgeY = eData.handle === "height" ? numHeight : 0;
      const p1 = objectPointToStageSpace_New([modObj], { x: 0, y: edgeY }, 1);
      const p2 = objectPointToStageSpace_New([modObj], { x: object.width!, y: edgeY }, 1);
      const side = eData.handle === "height" ? "bottom" : "top";
      const sr1 = computeSnap(
        { left: p1.x, right: LARGE, vcenter: LARGE, top: side === "top" ? p1.y : LARGE, bottom: side === "bottom" ? p1.y : LARGE, hcenter: LARGE } as unknown as Bounds,
        snapBounds, selectedObjectIds, zoom,
      );
      const sr2 = computeSnap(
        { left: LARGE, right: p2.x, vcenter: LARGE, top: side === "top" ? p2.y : LARGE, bottom: side === "bottom" ? p2.y : LARGE, hcenter: LARGE } as unknown as Bounds,
        snapBounds, selectedObjectIds, zoom,
      );
      const sr = mergeSnap(sr1, sr2, "y");
      clearSnapGuides();
      renderSnapGuides(sr.guides, sr.snappedObjectIds, zoom, objScaleVal);
      if (eData.handle === "top") {
        if (sr.deltaY !== 0) {
          const localDelta = sr.deltaY / objScaleVal;
          objectHolder.style.top = (numTop + sr.deltaY) + "px";
          newHeight = (numHeight - localDelta) + "px";
          objectHolder.style.height = newHeight;
          if (contentEl) contentEl.style.height = newHeight;
          if (resizeHolderEl) resizeHolderEl.style.height = newHeight;
        }
      } else {
        // HEIGHT handle — rotation-aware: d(bottom_edge.x)/d(h) = -S*sin(R), d(bottom_edge.y)/d(h) = S*cos(R)
        const S = objScaleVal;
        const R_rad = getObjectRotation(object) * Math.PI / 180;
        const cosR = Math.cos(R_rad);
        const sinR = Math.sin(R_rad);
        const EPS = 1e-6;
        const hCands: number[] = [];
        if (sr1.deltaX !== 0 && Math.abs(sinR) > EPS) hCands.push(numHeight + sr1.deltaX / (-S * sinR));
        if (sr1.deltaY !== 0 && Math.abs(cosR) > EPS) hCands.push(numHeight + sr1.deltaY / (S * cosR));
        if (sr2.deltaX !== 0 && Math.abs(sinR) > EPS) hCands.push(numHeight + sr2.deltaX / (-S * sinR));
        if (sr2.deltaY !== 0 && Math.abs(cosR) > EPS) hCands.push(numHeight + sr2.deltaY / (S * cosR));
        if (hCands.length > 0) {
          const snapH = hCands.reduce((best, c) => Math.abs(c - numHeight) < Math.abs(best - numHeight) ? c : best);
          newHeight = snapH + "px";
          objectHolder.style.height = newHeight;
          if (contentEl) contentEl.style.height = newHeight;
          if (resizeHolderEl) resizeHolderEl.style.height = newHeight;
        }
      }
    }

    // Update object HTML for content-aware resize
    const html = getAppObjectDefinition(object.type, "latest")?.getHtml?.({
      calculatedObjectSize: {
        left: (object.left ?? 0) + "px",
        top: (object.top ?? 0) + "px",
        width: newWidth ?? (object.width ?? 0) + "px",
        height: newHeight ?? (object.height ?? 0) + "px",
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
  });
}

export function processResizeStopEvent(
  eData: StageToolScaleEventData,
  objectById: { [key: string]: IObject },
  layerById: { [key: string]: ILayer },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
    snapBounds: SnapTarget[];
  },
  storeActions: {
    _updateObject: any;
  },
) {
  if (!isResizeHandle(eData.handle)) return;

  const { selectedObjectIdsRef, zoom, snapBounds } = storeProps;
  const { _updateObject } = storeActions;
  const selectedObjectIds = selectedObjectIdsRef.current;

  selectedObjectIds.forEach((objectId) => {
    const object = objectById[objectId];
    const objectClone = cloneDeep(object);

    const objectPath: string[] = [];
    populateObjectThreeIds(objectPath, objectId, objectById, layerById);
    const parentGroupsMatrix = getGroupMatrixFromSelectionPath(objectPath, objectById);
    parentGroupsMatrix.e = parentGroupsMatrix.f = 0;
    const objectOwnMatrix = new DOMMatrix(getObjectTransform(object));
    const fullContextMatrix = parentGroupsMatrix.multiply(objectOwnMatrix);

    const realMove = screenPointToLocal(
      { x: eData.mouseMove.x / zoom, y: eData.mouseMove.y / zoom },
      fullContextMatrix,
      0,
      getObjectScale(object),
    );

    const objectSize: Rect = {
      x: object.left!,
      y: object.top!,
      width: object.width!,
      height: object.height!,
    };

    const LARGE = 1e9;

    const mergeSnapStop = (
      a: ReturnType<typeof computeSnap>,
      b: ReturnType<typeof computeSnap>,
      axis: "x" | "y",
    ) => {
      const da = axis === "x" ? a.deltaX : a.deltaY;
      const db = axis === "x" ? b.deltaX : b.deltaY;
      const winner = (da !== 0 && (db === 0 || Math.abs(da) <= Math.abs(db))) ? a : b;
      return { deltaX: winner.deltaX, deltaY: winner.deltaY };
    };

    if (eData.handle === "left" || eData.handle === "width") {
      const objScale = getObjectScale(object) ?? 1;
      const widthDirection = eData.handle === "left" ? -1 : 1;
      if (eData.handle === "left") {
        objectClone.left = objectSize.x + realMove.x / objScale;
      }
      objectClone.width = objectSize.width + widthDirection * (realMove.x / objScale);

      const cl = objectClone.left ?? objectSize.x;
      const cw = objectClone.width!;
      const modObj = { ...object, left: cl, width: cw };
      const edgeX = eData.handle === "width" ? cw : 0;
      const p1 = objectPointToStageSpace_New([modObj], { x: edgeX, y: 0 }, 1);
      const p2 = objectPointToStageSpace_New([modObj], { x: edgeX, y: object.height! }, 1);
      const side = eData.handle === "width" ? "right" : "left";
      const sr1 = computeSnap(
        { left: side === "left" ? p1.x : LARGE, right: side === "right" ? p1.x : LARGE, top: p1.y, bottom: LARGE, vcenter: LARGE, hcenter: LARGE } as unknown as Bounds,
        snapBounds, selectedObjectIds, zoom,
      );
      const sr2 = computeSnap(
        { left: side === "left" ? p2.x : LARGE, right: side === "right" ? p2.x : LARGE, top: LARGE, bottom: p2.y, vcenter: LARGE, hcenter: LARGE } as unknown as Bounds,
        snapBounds, selectedObjectIds, zoom,
      );
      if (eData.handle === "left") {
        const snapResult = mergeSnapStop(sr1, sr2, "x");
        if (snapResult.deltaX !== 0) {
          const localDelta = snapResult.deltaX / objScale;
          objectClone.left = cl + snapResult.deltaX;
          objectClone.width = cw - localDelta;
        }
      } else {
        // WIDTH handle — rotation-aware: d(right_edge.x)/d(w) = S*cos(R), d(right_edge.y)/d(w) = S*sin(R)
        const S = objScale;
        const R_rad = getObjectRotation(object) * Math.PI / 180;
        const cosR = Math.cos(R_rad);
        const sinR = Math.sin(R_rad);
        const EPS = 1e-6;
        const wCands: number[] = [];
        if (sr1.deltaX !== 0 && Math.abs(cosR) > EPS) wCands.push(cw + sr1.deltaX / (S * cosR));
        if (sr1.deltaY !== 0 && Math.abs(sinR) > EPS) wCands.push(cw + sr1.deltaY / (S * sinR));
        if (sr2.deltaX !== 0 && Math.abs(cosR) > EPS) wCands.push(cw + sr2.deltaX / (S * cosR));
        if (sr2.deltaY !== 0 && Math.abs(sinR) > EPS) wCands.push(cw + sr2.deltaY / (S * sinR));
        if (wCands.length > 0) {
          objectClone.width = wCands.reduce((best, c) => Math.abs(c - cw) < Math.abs(best - cw) ? c : best);
        }
      }
    } else {
      // top / height
      const objScale = getObjectScale(object) ?? 1;
      const heightDirection = eData.handle === "top" ? -1 : 1;
      if (eData.handle === "top") {
        objectClone.top = objectSize.y + realMove.y / objScale;
      }
      objectClone.height = objectSize.height + heightDirection * (realMove.y / objScale);

      const ct = objectClone.top ?? objectSize.y;
      const ch = objectClone.height!;
      const modObj = { ...object, top: ct, height: ch };
      const edgeY = eData.handle === "height" ? ch : 0;
      const p1 = objectPointToStageSpace_New([modObj], { x: 0, y: edgeY }, 1);
      const p2 = objectPointToStageSpace_New([modObj], { x: object.width!, y: edgeY }, 1);
      const side = eData.handle === "height" ? "bottom" : "top";
      const sr1 = computeSnap(
        { left: p1.x, right: LARGE, vcenter: LARGE, top: side === "top" ? p1.y : LARGE, bottom: side === "bottom" ? p1.y : LARGE, hcenter: LARGE } as unknown as Bounds,
        snapBounds, selectedObjectIds, zoom,
      );
      const sr2 = computeSnap(
        { left: LARGE, right: p2.x, vcenter: LARGE, top: side === "top" ? p2.y : LARGE, bottom: side === "bottom" ? p2.y : LARGE, hcenter: LARGE } as unknown as Bounds,
        snapBounds, selectedObjectIds, zoom,
      );
      if (eData.handle === "top") {
        const snapResult = mergeSnapStop(sr1, sr2, "y");
        if (snapResult.deltaY !== 0) {
          const localDelta = snapResult.deltaY / objScale;
          objectClone.top = ct + snapResult.deltaY;
          objectClone.height = ch - localDelta;
        }
      } else {
        // HEIGHT handle — rotation-aware: d(bottom_edge.x)/d(h) = -S*sin(R), d(bottom_edge.y)/d(h) = S*cos(R)
        const S = objScale;
        const R_rad = getObjectRotation(object) * Math.PI / 180;
        const cosR = Math.cos(R_rad);
        const sinR = Math.sin(R_rad);
        const EPS = 1e-6;
        const hCands: number[] = [];
        if (sr1.deltaX !== 0 && Math.abs(sinR) > EPS) hCands.push(ch + sr1.deltaX / (-S * sinR));
        if (sr1.deltaY !== 0 && Math.abs(cosR) > EPS) hCands.push(ch + sr1.deltaY / (S * cosR));
        if (sr2.deltaX !== 0 && Math.abs(sinR) > EPS) hCands.push(ch + sr2.deltaX / (-S * sinR));
        if (sr2.deltaY !== 0 && Math.abs(cosR) > EPS) hCands.push(ch + sr2.deltaY / (S * cosR));
        if (hCands.length > 0) {
          objectClone.height = hCands.reduce((best, c) => Math.abs(c - ch) < Math.abs(best - ch) ? c : best);
        }
      }
    }

    _updateObject(objectClone);
  });

  clearSnapGuides();
}
