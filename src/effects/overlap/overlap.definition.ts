import { IOverlapEffect, OVERLAP_ANIMATION } from "./overlap.types";

export const overlapDefinition = {
  id: OVERLAP_ANIMATION,
  name: "Overlap",
  form: [],
};

export const overlapDefaults: IOverlapEffect = {
  id: OVERLAP_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["slide"],
  canBeCombined: true,
  // this effect has no configuration
};
