import { Bounds } from "../../webslider-sdk/object/i-tool-class";

export interface SnapTarget {
  bounds: Bounds;
  objectId: string;
  snapThreshold?: number;
}

export interface SnapGuide {
  isHorizontal: boolean;  // true = horizontal line (top/bottom snap), false = vertical
  position: number;        // stage-space coordinate (Y for horizontal, X for vertical)
}

export interface SnapResult {
  deltaX: number;
  deltaY: number;
  guides: SnapGuide[];
  snappedObjectIds: string[];
}

export function isNear(value: number, ref: number, threshold: number): boolean {
  return value > ref - threshold && value < ref + threshold;
}

const X_PAIRS: [string, string][] = [
  ["left",    "left"],
  ["left",    "right"],
  ["right",   "left"],
  ["right",   "right"],
  ["vcenter", "vcenter"],
];

const Y_PAIRS: [string, string][] = [
  ["top",     "top"],
  ["top",     "bottom"],
  ["bottom",  "top"],
  ["bottom",  "bottom"],
  ["hcenter", "hcenter"],
];

export function computeSnap(
  movingBounds: Bounds,
  targets: SnapTarget[],
  skipObjectIds: string[],
  stageScale: number,
): SnapResult {
  const result: SnapResult = { deltaX: 0, deltaY: 0, guides: [], snappedObjectIds: [] };
  const mb = movingBounds as unknown as Record<string, number>;

  for (const target of targets) {
    if (skipObjectIds.includes(target.objectId)) continue;

    const tb = target.bounds as unknown as Record<string, number>;
    const threshold = (target.snapThreshold ?? 5) / stageScale;

    if (result.deltaX === 0) {
      for (const [movSide, tgtSide] of X_PAIRS) {
        if (mb[movSide] !== undefined && tb[tgtSide] !== undefined && isNear(mb[movSide], tb[tgtSide], threshold)) {
          result.deltaX = tb[tgtSide] - mb[movSide];
          result.guides.push({ isHorizontal: false, position: tb[tgtSide] });
          if (target.objectId && !result.snappedObjectIds.includes(target.objectId)) {
            result.snappedObjectIds.push(target.objectId);
          }
          break;
        }
      }
    }

    if (result.deltaY === 0) {
      for (const [movSide, tgtSide] of Y_PAIRS) {
        if (mb[movSide] !== undefined && tb[tgtSide] !== undefined && isNear(mb[movSide], tb[tgtSide], threshold)) {
          result.deltaY = tb[tgtSide] - mb[movSide];
          result.guides.push({ isHorizontal: true, position: tb[tgtSide] });
          if (target.objectId && !result.snappedObjectIds.includes(target.objectId)) {
            result.snappedObjectIds.push(target.objectId);
          }
          break;
        }
      }
    }

    if (result.deltaX !== 0 && result.deltaY !== 0) break;
  }

  return result;
}
