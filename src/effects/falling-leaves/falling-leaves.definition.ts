import { InputType } from "../../inputs/types";
import { fallingLeaves, IFallingLeaves } from "./falling-leaves.types";

export const fallingLeavesDefinition = {
  id: fallingLeaves,
  name: "Falling Leaves",
  form: [
    {
      inputType: InputType.NUMBER,
      propertyName: "number",
      displayName: "Number",
      helperText: "Recommended up to 50 items.",
    },
    {
      inputType: InputType.IMAGE,
      propertyName: "image",
      displayName: "Image",
    },
    {
      inputType: InputType.NUMBER,
      propertyName: "width",
      displayName: "Width",
    },
    {
      inputType: InputType.NUMBER,
      propertyName: "height",
      displayName: "Height",
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
  supportedEffectTypes: ["effect"],
  // specific to this effect
  number: 30,
  image: {
    url: "/images/leaf.png",
    width: 40,
    height: 40,
  },
  width: 40,
  height: 40,
};
