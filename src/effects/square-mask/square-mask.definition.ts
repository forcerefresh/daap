import { InputType } from "../../inputs/types";
import { ISquareMaskEffect, squareMask } from "./square-mask.types";

export const squareMaskDefinition = {
  id: squareMask,
  name: "Square Mask",
  form: [
    {
      displayName: "Bottom mask",
      helperText: null,
      propertyName: "borderBottom",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Top mask",
      helperText: null,
      propertyName: "borderTop",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Left mask",
      helperText: null,
      propertyName: "borderLeft",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Right mask",
      helperText: null,
      propertyName: "borderRight",
      inputType: InputType.NUMBER,
    },
  ],
};

export const squareMaskDefaults: ISquareMaskEffect = {
  id: squareMask,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  // specific this effect
  borderBottom: 0,
  borderLeft: 0,
  borderRight: 0,
  borderTop: 0,
};
