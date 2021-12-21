import { InputType } from "../../inputs/types";
import { flip, IFlipEffect } from "./flip.types";

export const flipDefinition = {
  id: flip,
  name: "Flip",
  form: [
    {
      displayName: "Item",
      helperText: "Duration per item",
      propertyName: "durationPerItem",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Flip",
      helperText: "Duration between items",
      propertyName: "durationBetweenItems",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Spin direction",
      propertyName: "spinDirection",
      inputType: InputType.SELECT,
      options: [
        { label: "Clockwise", value: "cc" },
        { label: "Counterclockwise", value: "ccw" },
      ],
    },
  ],
};

export const flipDefaults: IFlipEffect = {
  id: flip,
  hasDelay: true,
  hasDuration: false,
  hasOwnDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["effect"],
  durationPerItem: 2000,
  durationBetweenItems: 3000,
  spinDirection: "cc",
};
