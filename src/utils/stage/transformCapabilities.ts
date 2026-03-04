import type { ObjectMetaType } from "webslider-sdk/lib/objects/objects-register";

export type ResolvedTransformCapabilities = {
  move: boolean;
  scale: boolean;
  resizeAll?: boolean;
  resizeLeft?: boolean;
  resizeTop?: boolean;
  resizeWidth?: boolean;
  resizeHeight?: boolean;
  rotate: boolean;
  pointsReposition: boolean;
};

export function resolveTransformCapabilities(
  meta: ObjectMetaType | null | undefined,
): ResolvedTransformCapabilities {
  const tc = meta?.transformCapabilities;
  const resize = tc?.resize;

  // Base flag: true unless explicitly false
  const resizeBase = typeof resize === "boolean" ? resize : true;
  // Granular overrides when resize is an object
  const resizeObj = typeof resize === "object" ? resize : null;

  return {
    move: tc?.move ?? true,
    scale: tc?.scale ?? true,
    resizeAll: resizeBase,
    resizeLeft: resizeObj?.left ?? resizeBase,
    resizeTop: resizeObj?.top ?? resizeBase,
    resizeWidth: resizeObj?.width ?? resizeBase,
    resizeHeight: resizeObj?.height ?? resizeBase,
    rotate: tc?.rotate ?? true,
    pointsReposition: tc?.pointsReposition ?? false,
  };
}
