import { InputType } from "../../inputs/types";
import { fallingLeaves, IFallingLeaves } from "./falling-leaves.types";

export const fallingLeavesDefinition = {
  id: fallingLeaves,
  name: "Falling Leaves",
  form: [
    {
      inputType: InputType.NUMBER,
      propertyName: "fromOpacity",
      displayName: "Start opacity",
      helperText: "Percentage value (default 0)",
    },
    {
      inputType: InputType.NUMBER,
      propertyName: "toOpacity",
      displayName: "End opacity",
      helperText: "Percentage value (default 100)",
    },
  ],
};

export const fallingLeavesDefaults: IFallingLeaves = {
  id: fallingLeaves,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  // specific to this effect
  fromOpacity: 0,
  toOpacity: 100,
};
