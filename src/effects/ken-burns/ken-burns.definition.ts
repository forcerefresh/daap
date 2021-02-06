import { InputType } from "../../inputs/types";
import { IKenBurnsEffect, kenBurns } from "./ken-burns.types";

export const kenBurnsDefinition = {
  id: kenBurns,
  name: "Ken burns",
  form: [
    {
      displayName: "Scale factor",
      helperText: "Percentage value (default 10%)",
      propertyName: "scaleFactor",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Scale center",
      helperText: "Center will keep same position in a time",
      propertyName: "transformOrigin",
      inputType: InputType.TRANSFORM_ORIGIN,
    },
  ],
};

export const kenBurnsDefaults: IKenBurnsEffect = {
  id: kenBurns,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  ease: "none",
  customEase: null,
  // specific to this effect
  scaleFactor: 10,
  transformOrigin: { x: 50, y: 50 },
};
