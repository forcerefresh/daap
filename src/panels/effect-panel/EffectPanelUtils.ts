import { EffectType } from "../../effects/types";
import { ItemType } from "../../objects/types";

export function getEffectTypesForItem(itemType?: ItemType): EffectType[] {
  if (!itemType) {
    return [];
  }

  switch (itemType) {
    case "object":
      return ["in", "out", "effect"];
    case "layer":
      return ["layer"];
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
  };

  return def[effectType];
};

export const getDefaultEffectConfigForType = (effectType: EffectType): any => {
  switch (effectType) {
    case "in":
      return {
        delay: 0,
        duration: 1000,
        ease: "none",
        timeDistribution: 50,
        effect: {
          id: "none",
          values: {},
        },
      };
    case "out":
      return {
        delay: 0,
        duration: 1000,
        ease: "none",
        timeDistribution: 50,
        effect: {
          id: "none",
          values: {},
        },
      };
    case "effect":
      return {
        delay: 0,
        duration: -1,
        ease: "none",
        timeDistribution: 50,
        effect: {
          id: "none",
          values: {},
        },
      };
    case "layer":
      return {
        delay: 0,
        duration: -1,
        ease: "none",
        timeDistribution: 50,
        effect: {
          id: "none",
          values: {},
        },
      };
  }
};
