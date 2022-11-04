import { AnimationType } from "../../animations/types";
import { ItemType } from "webslider-sdk2/lib/objects/i-object";

export function getAnimationTypesForItem(itemType?: ItemType): AnimationType[] {
  if (!itemType) {
    return [];
  }

  switch (itemType) {
    case "object":
      return ["in", "out", "animation", "event"];
    case "layer":
      return ["in", "out", "layer"];
    case "slide":
      return ["slide"];
  }
}

export const animationType2Name = (animationType: AnimationType): string => {
  const def: any = {
    in: "In",
    out: "Out",
    animation: "Other",
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
