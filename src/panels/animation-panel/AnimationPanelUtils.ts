import { AnimationType } from "webslider-sdk/lib/animations/i-animation-types";
import { ItemType } from "webslider-sdk/lib/objects/i-object";

export function getAnimationTypesForItem(
  itemType?: ItemType,
  hasLicense = true
): AnimationType[] {
  if (!itemType) {
    return [];
  }

  switch (itemType) {
    case "object":
      return hasLicense
        ? ["animation", "in", "out", "event"]
        : ["in", "out", "event", "animation"];
    case "layer":
      return hasLicense ? ["layer", "in", "out"] : ["in", "out", "layer"];
    case "slide":
      return ["slide"];
  }
}

export const isAnimationTypeDisabled = (type: string, hasLicense = true) => {
  if (!hasLicense) {
    return type === "animation" || type === "layer";
  }
  return false;
};

export const animationType2Name = (animationType: AnimationType): string => {
  const def: any = {
    in: "In",
    out: "Out",
    animation: "Animation",
    layer: "Layer animation",
    slide: "Slide transition",
    event: "Event",
  };

  return def[animationType];
};

export const getDefaultAnimationConfigForType = (
  animationType: AnimationType,
  isStructural: boolean,
  itemType?: ItemType
): any => {
  switch (animationType) {
    case "in":
      return {
        delay: "0ms",
        duration: "1000ms",
        ease: "none",
        timeDistribution: 50,
        canBeCombined: !isStructural,
        animation: {
          id: isStructural ? "none-structural" : "none",
          values: {},
        },
      };
    case "out":
      return {
        delay: "0ms",
        duration: "1000ms",
        ease: "none",
        timeDistribution: 50,
        canBeCombined: !isStructural,
        animation: {
          id: isStructural ? "none-structural" : "none",
          values: {},
        },
        outStartTime: {
          customValue: "6s",
          inheritFrom: "inheritFromSlide",
        },
      };
    case "animation":
      return {
        delay: "0ms",
        duration: "-1",
        ease: "none",
        timeDistribution: 50,
        canBeCombined: !isStructural,
        animation: {
          id: isStructural ? "none-structural" : "none",
          values: {},
        },
      };
    case "layer":
      return {
        delay: "0ms",
        duration: "-1",
        ease: "none",
        timeDistribution: 50,
        canBeCombined: !isStructural,
        animation: {
          id: isStructural ? "none-structural" : "none",
          values: {},
        },
      };
    case "slide":
      return {
        delay: "0ms",
        duration: "1000ms",
        ...(itemType === "slide" ? { overlap: "1000ms" } : {}),
        canBeCombined: !isStructural,
        animation: {
          id: isStructural ? "none-structural" : "none",
          values: {},
        },
      };

    case "event":
      return {
        delay: "0ms",
        duration: "1000ms",
        event: "",
        eventTargetId: "",
        reverseEvent: "",
        reverseEventTargetId: "",
        ease: "none",
        timeDistribution: 50,
        canBeCombined: !isStructural,
        animation: {
          id: isStructural ? "none-structural" : "none",
          values: {},
        },
      };
  }
};
