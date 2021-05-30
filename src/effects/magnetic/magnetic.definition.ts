import { InputType } from "../../inputs/types";
import { magnetic, IMagneticEffect } from "./magnetic.types";

export const magneticDefinition = {
  id: magnetic,
  name: "Magnetic",
  form: [
    {
      displayName: "Strength X",
      helperText: "Set strength for horizontal movement",
      propertyName: "strengthX",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Strength Y",
      helperText: "Set strength for vertical movement",
      propertyName: "strengthY",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Reset on complete",
      helperText: "Position object to initial position on complete",
      propertyName: "setToInitialPositionOnComplete",
      inputType: InputType.CHECKBOX,
    },
    {
      displayName: "Follow time",
      helperText: "Time after objects stops move",
      propertyName: "followTime",
      inputType: InputType.NUMBER,
    },
  ],
};

export const magneticDefaults: IMagneticEffect = {
  id: magnetic,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "back.in(2)",
  supportedEffectTypes: ["effect"],
  followTime: 400,
  setToInitialPositionOnComplete: true,
  strengthX: 10,
  strengthY: 10,
};
