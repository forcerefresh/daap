import type { ObjectMetaType } from "webslider-sdk/lib/objects/objects-register";

export type ResolvedTransformCapabilities = {
  move: boolean;
  scale: boolean;
  resize: boolean;
  rotate: boolean;
  pointsReposition: boolean;
};

export function resolveTransformCapabilities(
  meta: ObjectMetaType | null | undefined,
): ResolvedTransformCapabilities {
  const tc = meta?.transformCapabilities;
  return {
    move: tc?.move ?? true,
    scale: tc?.scale ?? !(meta?.disableScale ?? false),
    resize:
      tc?.resize ??
      !!(meta?.supportWidthResize || meta?.supportHeightResize),
    rotate: tc?.rotate ?? true,
    pointsReposition: tc?.pointsReposition ?? false,
  };
}
