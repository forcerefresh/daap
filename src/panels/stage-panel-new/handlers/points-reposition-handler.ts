import { IObject } from "webslider-sdk/lib/objects/i-object";
import { StageToolPointsRepositionEventData } from "../../../utils/selection-manager/events/StageToolEvent";

function computeRealMove(eData: StageToolPointsRepositionEventData, zoom: number) {
  // Build the full transform: parent-group matrix × object's own rotation/scale.
  // Inverting it converts a screen-space delta (already divided by zoom) into the
  // object's local coordinate space, correctly accounting for both rotation and scale.
  const objectOwnMatrix = new DOMMatrix(
    `rotate(${eData.objectRotation}deg) scale(${eData.objectScale})`,
  );
  const fullMatrix = eData.contextMatrix.multiply(objectOwnMatrix);
  const p = fullMatrix.inverse().transformPoint(
    new DOMPoint(eData.mouseMove.x / zoom, eData.mouseMove.y / zoom),
  );
  return { x: p.x, y: p.y };
}

export function processPointsRepositionStartEvent(
  _eData: StageToolPointsRepositionEventData,
  _objectById: { [key: string]: IObject },
): void {
  // No-op: initial state is read from objectById in the stop handler
}

export function processPointsRepositionChangeEvent(
  eData: StageToolPointsRepositionEventData,
  _objectById: { [key: string]: IObject },
  { zoom }: { zoom: number },
): void {
  const realMove = computeRealMove(eData, zoom);
  const dx = realMove.x;
  const dy = realMove.y;

  const el = document.querySelector<HTMLElement>(
    `[data-reposition-point="${eData.handle}-${eData.objectId}"]`,
  );
  if (!el) return;

  // Parse current base position from data attributes set on the handle
  const baseLeft = parseFloat(el.dataset.baseLeft ?? "0");
  const baseTop = parseFloat(el.dataset.baseTop ?? "0");

  el.style.left = `${baseLeft + dx}px`;
  el.style.top = `${baseTop + dy}px`;
}

export function processPointsRepositionStopEvent(
  eData: StageToolPointsRepositionEventData,
  objectById: { [key: string]: IObject },
  { zoom }: { zoom: number },
  { _updateObject }: { _updateObject: (object: IObject) => void },
): void {
  const obj = objectById[eData.objectId];
  if (!obj) return;

  const realMove = computeRealMove(eData, zoom);
  const dx = realMove.x;
  const dy = realMove.y;

  const isPoint0 = eData.handle === "point0";

  // New endpoint positions in LOCAL coordinate space (pre-scale/rotate).
  // dx/dy from computeRealMove are already in this space.
  const newLocalX1 = (obj.x1 ?? 0) + (isPoint0 ? dx : 0);
  const newLocalY1 = (obj.y1 ?? 0) + (isPoint0 ? dy : 0);
  const newLocalX2 = (obj.x2 ?? 0) + (!isPoint0 ? dx : 0);
  const newLocalY2 = (obj.y2 ?? 0) + (!isPoint0 ? dy : 0);

  // New bounding box in local space
  const minLX = Math.min(newLocalX1, newLocalX2);
  const minLY = Math.min(newLocalY1, newLocalY2);
  const maxLX = Math.max(newLocalX1, newLocalX2);
  const maxLY = Math.max(newLocalY1, newLocalY2);
  const newWidth = maxLX - minLX;
  const newHeight = maxLY - minLY;

  // Normalized endpoint coords relative to new bounding box origin
  const newX1 = newLocalX1 - minLX;
  const newY1 = newLocalY1 - minLY;
  const newX2 = newLocalX2 - minLX;
  const newY2 = newLocalY2 - minLY;

  // The object holder uses transform-origin: top-left.
  // The new bounding box origin (local 0,0) maps to stage coords via:
  //   new_left = obj.left + M * (minLX, minLY)
  // where M = rotate(R) scale(S) (the object's own transform, no parent groups).
  const M = new DOMMatrix(
    `rotate(${obj.rotation ?? 0}deg) scale(${obj.scale ?? 1})`,
  );
  const originShift = M.transformPoint(new DOMPoint(minLX, minLY));
  const newLeft = (obj.left ?? 0) + originShift.x;
  const newTop  = (obj.top ?? 0) + originShift.y;

  // Imperatively reset the dragged handle's DOM position to prevent React
  // reconciliation from skipping the update when x1/x2 stays 0.
  const handleEl = document.querySelector<HTMLElement>(
    `[data-reposition-point="${eData.handle}-${eData.objectId}"]`,
  );
  if (handleEl) {
    const resetLeft = isPoint0 ? newX1 : newX2;
    const resetTop  = isPoint0 ? newY1 : newY2;
    handleEl.style.left = `${resetLeft}px`;
    handleEl.style.top  = `${resetTop}px`;
    handleEl.dataset.baseLeft = String(resetLeft);
    handleEl.dataset.baseTop  = String(resetTop);
  }

  _updateObject({
    ...obj,
    left: newLeft,
    top: newTop,
    width: newWidth,
    height: newHeight,
    x1: newX1,
    y1: newY1,
    x2: newX2,
    y2: newY2,
  });
}
