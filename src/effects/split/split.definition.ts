import { InputType } from "../../inputs/types";
import { split, ISplitEffect } from "./split.types";

export const splitDefinition = {
  id: split,
  name: "Split",
  form: [
    {
      displayName: "Split schema",
      helperText: "Click on border to add point; Click on point to remove it",
      propertyName: "split",
      inputType: InputType.SPLIT,
    },
    {
      displayName: "Rotation",
      helperText: "Angle from -360 to 360",
      propertyName: "rotation",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Random intensity",
      helperText: "Random intensity; Set 0 to disable random move",
      propertyName: "randomStrength",
      inputType: InputType.NUMBER,
    },
  ],
};

export const splitDefaults: ISplitEffect = {
  id: split,
  hasDelay: false,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["slide"],
  split: {
    center: {
      x: 50,
      y: 50,
    },
    points: [
      {
        x: 0,
        y: 30.5,
      },
      {
        x: 36,
        y: 100,
      },
      {
        x: 100,
        y: 77.5,
      },
      {
        x: 83,
        y: 0,
      },
    ],
  },
  randomStrength: 0,
  rotation: 20,
};
