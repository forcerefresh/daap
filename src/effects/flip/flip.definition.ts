import { InputType } from "../../inputs/types";
import { flip, IFlipEffect } from "./flip.types";

export const flipDefinition = {
  id: flip,
  name: "Flip",
  form: [
    {
      displayName: "Rotation time",
      propertyName: "rotationTime",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Pause time",
      propertyName: "pauseTime",
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
  canBeCombined: false,
  // effect properties
  rotationTime: 1000,
  pauseTime: 500,
  spinDirection: "cc",
};
