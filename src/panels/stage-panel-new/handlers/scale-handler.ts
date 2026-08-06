import React from "react";
import { cloneDeep } from "lodash-es";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { Bounds, Rect } from "../../../webslider-sdk/object/i-tool-class";
import { ILayer } from "../../../store/reducers/i-layers";
import {
  StageToolScaleEventData,
} from "../../../utils/selection-manager/events/StageToolEvent";
import { populateObjectThreeIds, computeGroupChildrenBounds } from "../../../store/actions/actions-utils";
import {
  getGroupMatrixFromSelectionPath,
  getObjectTransform,
  screenPointToLocal,
} from "../stage-panel-utils";
import { getObjectRotation, getObjectScale } from "../../../objects/object-utils";
import { objectPointToStageSpace_New } from "../../../utils/transform/transform-utils";
import { computeSnap, SnapTarget } from "../../../utils/snap/snap-engine";
import { clearSnapGuides, renderSnapGuides } from "../../../utils/snap/snap-renderer";

/**
 * For corner scale handles, returns the fixed corner (in object LOCAL coords)
 * and the reference width to use in the scale formula.
 * For groups, uses children bounds so the visual opposite corner stays fixed.
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
 * Given old/new scale, rotation, and fixed-corner local coords,
 * returns the Δleft/Δtop needed to keep that corner stationary in parent space.
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

export function processScaleStartEvent(
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

export function processScaleChangeEvent(
  eData: StageToolScaleEventData,
  objectById: { [key: string]: IObject },
  layerById: { [key: string]: ILayer },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
    snapBounds: SnapTarget[];
    altKeyRef: React.MutableRefObject<boolean>;
  },
) {
  const { selectedObjectIdsRef, zoom, snapBounds, altKeyRef } = storeProps;
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

    let left = objectSize.x;
    let top = objectSize.y;

    const oldScale = getObjectScale(object) ?? 1;
    const { px, py, refW } = getCornerScaleParams(eData.handle, object, objectById);
    const dir = eData.handle === "br" || eData.handle === "tr" ? -1 : 1;
    const scale = (oldScale * refW - dir * realMove.x) / refW;

    const { dLeft, dTop } = fixedCornerDelta(oldScale, scale, getObjectRotation(object), px, py);
    left += dLeft;
    top += dTop;

    objectHolder.style.left = left + "px";
    objectHolder.style.top = top + "px";
    objectHolder.style.transform = `rotate(${getObjectRotation(object)}deg) scale(${scale})`;

    const handlesEls = Array.from(
      document.getElementsByClassName(`resize-handle-${objectId}`),
    ) as HTMLDivElement[];
    handlesEls.forEach((handleEl) => {
      handleEl.style.scale = `${oldScale / scale}`;
    });

    const selEl = objectHolder.getElementsByClassName("object-selection")?.[0] as HTMLDivElement | undefined;
    if (selEl) {
      selEl.style.boxShadow = `0 0 0 ${1 / scale / zoom}px ${object.objectIds ? "#444444" : "#48aff0"}`;
    }

    // Corner snap: check both corners of each moving edge
    if (altKeyRef.current) {
      clearSnapGuides();
      return;
    }
    const LARGE = 1e9;
    const movingRight = eData.handle === "br" || eData.handle === "tr";
    const movingBottom = eData.handle === "br" || eData.handle === "bl";

    const modObj = { ...object, left, top, scale };
    const tlPos = objectPointToStageSpace_New([modObj], { x: 0, y: 0 }, 1);
    const trPos = objectPointToStageSpace_New([modObj], { x: object.width!, y: 0 }, 1);
    const blPos = objectPointToStageSpace_New([modObj], { x: 0, y: object.height! }, 1);
    const brPos = objectPointToStageSpace_New([modObj], { x: object.width!, y: object.height! }, 1);

    const [xC1, xC2] = movingRight ? [trPos, brPos] : [tlPos, blPos];
    const xSide = movingRight ? "right" : "left";
    const srX1 = computeSnap({
      left: xSide === "left" ? xC1.x : LARGE, right: xSide === "right" ? xC1.x : LARGE,
      top: LARGE, bottom: LARGE, vcenter: LARGE, hcenter: LARGE,
    } as unknown as Bounds, snapBounds, selectedObjectIds, zoom);
    const srX2 = computeSnap({
      left: xSide === "left" ? xC2.x : LARGE, right: xSide === "right" ? xC2.x : LARGE,
      top: LARGE, bottom: LARGE, vcenter: LARGE, hcenter: LARGE,
    } as unknown as Bounds, snapBounds, selectedObjectIds, zoom);
    const srX = mergeSnap(srX1, srX2, "x");

    const [yC1, yC2] = movingBottom ? [blPos, brPos] : [tlPos, trPos];
    const ySide = movingBottom ? "bottom" : "top";
    const srY1 = computeSnap({
      left: LARGE, right: LARGE, vcenter: LARGE, hcenter: LARGE,
      top: ySide === "top" ? yC1.y : LARGE, bottom: ySide === "bottom" ? yC1.y : LARGE,
    } as unknown as Bounds, snapBounds, selectedObjectIds, zoom);
    const srY2 = computeSnap({
      left: LARGE, right: LARGE, vcenter: LARGE, hcenter: LARGE,
      top: ySide === "top" ? yC2.y : LARGE, bottom: ySide === "bottom" ? yC2.y : LARGE,
    } as unknown as Bounds, snapBounds, selectedObjectIds, zoom);
    const srY = mergeSnap(srY1, srY2, "y");

    clearSnapGuides();
    renderSnapGuides(
      [...srX.guides, ...srY.guides],
      [...new Set([...srX.snappedObjectIds, ...srY.snappedObjectIds])],
      zoom, scale,
    );

    // Rotation-aware snap: sensitivity of each corner's stage position to scale change
    // = (localX - fixedPx)*cos(R) - (localY - fixedPy)*sin(R)  [X axis]
    // = (localX - fixedPx)*sin(R) + (localY - fixedPy)*cos(R)  [Y axis]
    const R_rad = (getObjectRotation(object) * Math.PI) / 180;
    const cosR = Math.cos(R_rad);
    const sinR = Math.sin(R_rad);
    const EPS = 1e-6;
    const w = object.width!;
    const h = object.height!;
    const xLX = movingRight ? w : 0;   // local X of both X-snap corners
    const yLY = movingBottom ? h : 0;  // local Y of both Y-snap corners

    const snapCandidates: number[] = [];

    // X snap — corners at (xLX, 0) and (xLX, h)
    if (srX1.deltaX !== 0) {
      const s = (xLX - px) * cosR - (0 - py) * sinR;
      if (Math.abs(s) > EPS) snapCandidates.push(scale + srX1.deltaX / s);
    }
    if (srX2.deltaX !== 0) {
      const s = (xLX - px) * cosR - (h - py) * sinR;
      if (Math.abs(s) > EPS) snapCandidates.push(scale + srX2.deltaX / s);
    }

    // Y snap — corners at (0, yLY) and (w, yLY)
    if (srY1.deltaY !== 0) {
      const s = (0 - px) * sinR + (yLY - py) * cosR;
      if (Math.abs(s) > EPS) snapCandidates.push(scale + srY1.deltaY / s);
    }
    if (srY2.deltaY !== 0) {
      const s = (w - px) * sinR + (yLY - py) * cosR;
      if (Math.abs(s) > EPS) snapCandidates.push(scale + srY2.deltaY / s);
    }

    if (snapCandidates.length > 0) {
      const snapScale = snapCandidates.reduce((best, c) =>
        Math.abs(c - scale) < Math.abs(best - scale) ? c : best
      );
      const { dLeft: sdL, dTop: sdT } = fixedCornerDelta(oldScale, snapScale, getObjectRotation(object), px, py);
      objectHolder.style.left = (objectSize.x + sdL) + "px";
      objectHolder.style.top = (objectSize.y + sdT) + "px";
      objectHolder.style.transform = `rotate(${getObjectRotation(object)}deg) scale(${snapScale})`;
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
    snapBounds: SnapTarget[];
    altKeyRef: React.MutableRefObject<boolean>;
  },
  storeActions: {
    _updateObject: any;
  },
) {
  const { selectedObjectIdsRef, zoom, snapBounds, altKeyRef } = storeProps;
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

    const oldScale = getObjectScale(object) ?? 1;
    const { px, py, refW } = getCornerScaleParams(eData.handle, object, objectById);
    const dir = eData.handle === "br" || eData.handle === "tr" ? -1 : 1;
    const scale = (oldScale * refW - dir * realMove.x) / refW;

    let left = objectSize.x;
    let top = objectSize.y;
    const { dLeft, dTop } = fixedCornerDelta(oldScale, scale, getObjectRotation(object), px, py);
    left += dLeft;
    top += dTop;

    clearSnapGuides();

    if (altKeyRef.current) {
      objectClone.left = left;
      objectClone.top = top;
      objectClone.scale = scale;
      _updateObject(objectClone);
      return;
    }

    const LARGE = 1e9;
    const movingRight = eData.handle === "br" || eData.handle === "tr";
    const movingBottom = eData.handle === "br" || eData.handle === "bl";

    const modObj = { ...object, left, top, scale };
    const tlPos = objectPointToStageSpace_New([modObj], { x: 0, y: 0 }, 1);
    const trPos = objectPointToStageSpace_New([modObj], { x: object.width!, y: 0 }, 1);
    const blPos = objectPointToStageSpace_New([modObj], { x: 0, y: object.height! }, 1);
    const brPos = objectPointToStageSpace_New([modObj], { x: object.width!, y: object.height! }, 1);

    const [xC1, xC2] = movingRight ? [trPos, brPos] : [tlPos, blPos];
    const xSide = movingRight ? "right" : "left";
    const srX1 = computeSnap({
      left: xSide === "left" ? xC1.x : LARGE, right: xSide === "right" ? xC1.x : LARGE,
      top: LARGE, bottom: LARGE, vcenter: LARGE, hcenter: LARGE,
    } as unknown as Bounds, snapBounds, selectedObjectIds, zoom);
    const srX2 = computeSnap({
      left: xSide === "left" ? xC2.x : LARGE, right: xSide === "right" ? xC2.x : LARGE,
      top: LARGE, bottom: LARGE, vcenter: LARGE, hcenter: LARGE,
    } as unknown as Bounds, snapBounds, selectedObjectIds, zoom);

    const [yC1, yC2] = movingBottom ? [blPos, brPos] : [tlPos, trPos];
    const ySide = movingBottom ? "bottom" : "top";
    const srY1 = computeSnap({
      left: LARGE, right: LARGE, vcenter: LARGE, hcenter: LARGE,
      top: ySide === "top" ? yC1.y : LARGE, bottom: ySide === "bottom" ? yC1.y : LARGE,
    } as unknown as Bounds, snapBounds, selectedObjectIds, zoom);
    const srY2 = computeSnap({
      left: LARGE, right: LARGE, vcenter: LARGE, hcenter: LARGE,
      top: ySide === "top" ? yC2.y : LARGE, bottom: ySide === "bottom" ? yC2.y : LARGE,
    } as unknown as Bounds, snapBounds, selectedObjectIds, zoom);

    const R_rad = (getObjectRotation(object) * Math.PI) / 180;
    const cosR = Math.cos(R_rad);
    const sinR = Math.sin(R_rad);
    const EPS = 1e-6;
    const w = object.width!;
    const h = object.height!;
    const xLX = movingRight ? w : 0;
    const yLY = movingBottom ? h : 0;

    const snapCandidates: number[] = [];
    if (srX1.deltaX !== 0) {
      const s = (xLX - px) * cosR - (0 - py) * sinR;
      if (Math.abs(s) > EPS) snapCandidates.push(scale + srX1.deltaX / s);
    }
    if (srX2.deltaX !== 0) {
      const s = (xLX - px) * cosR - (h - py) * sinR;
      if (Math.abs(s) > EPS) snapCandidates.push(scale + srX2.deltaX / s);
    }
    if (srY1.deltaY !== 0) {
      const s = (0 - px) * sinR + (yLY - py) * cosR;
      if (Math.abs(s) > EPS) snapCandidates.push(scale + srY1.deltaY / s);
    }
    if (srY2.deltaY !== 0) {
      const s = (w - px) * sinR + (yLY - py) * cosR;
      if (Math.abs(s) > EPS) snapCandidates.push(scale + srY2.deltaY / s);
    }

    let snapScale = scale;
    if (snapCandidates.length > 0) {
      snapScale = snapCandidates.reduce((best, c) =>
        Math.abs(c - scale) < Math.abs(best - scale) ? c : best
      );
    }

    const { dLeft: sdL, dTop: sdT } = fixedCornerDelta(oldScale, snapScale, getObjectRotation(object), px, py);
    objectClone.left = objectSize.x + sdL;
    objectClone.top = objectSize.y + sdT;
    objectClone.scale = snapScale;

    _updateObject(objectClone);
  });
}
