import { EffectType } from "../../effects/types";
import { ItemType } from "../../webslider-sdk/src/objects/i-object";

export function getEffectTypesForItem(itemType?: ItemType): EffectType[] {
  if (!itemType) {
    return [];
  }

  switch (itemType) {
    case "object":
      return ["in", "out", "effect", "event"];
    case "layer":
      return ["in", "out", "layer"];
    case "slide":
      return ["slide"];
  }
}

export const effectType2Name = (effectType: EffectType) => {
  const def = {
    in: "In",
    out: "Out",
    effect: "Effect",
    layer: "Layer",
    slide: "Slide",
    event: "Event",
  };

  return def[effectType];
};

export const getDefaultEffectConfigForType = (
  effectType: EffectType,
  isStructural: boolean,
  itemType?: ItemType
): any => {
  switch (effectType) {
    case "in":
      return {
        delay: "0ms",
        duration: "1000ms",
        ease: "none",
        timeDistribution: 50,
        canBeCombined: !isStructural,
        effect: {
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
        effect: {
          id: isStructural ? "none-structural" : "none",
          values: {},
        },
      };
    case "effect":
      return {
        delay: "0ms",
        duration: "-1",
        ease: "none",
        timeDistribution: 50,
        canBeCombined: !isStructural,
        effect: {
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
        effect: {
          id: isStructural ? "none-structural" : "none",
          values: {},
        },
      };
    case "slide":
      return {
        delay: "0ms",
        duration: "2000ms",
        ...(itemType === "slide" ? { overlap: "1000ms" } : {}),
        canBeCombined: !isStructural,
        effect: {
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
        effect: {
          id: isStructural ? "none-structural" : "none",
          values: {},
        },
      };
  }
};
