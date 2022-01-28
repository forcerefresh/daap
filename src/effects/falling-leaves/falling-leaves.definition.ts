import { IImageInput, InputType, INumberInput } from "../../inputs/types";
import { IEffectDefinition } from "../types";
import { fallingLeaves, IFallingLeaves } from "./falling-leaves.types";

export type IFallingLeavesTuple = [
  INumberInput<"number">,
  IImageInput<"image">,
  INumberInput<"width">,
  INumberInput<"height">
];

export const fallingLeavesDefinition: IEffectDefinition<IFallingLeavesTuple> = {
  id: fallingLeaves,
  name: "Falling Leaves",
  form: [
    {
      displayName: "Number",
      helperText: "Recommended up to 50 items.",
      propertyName: "number",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Image",
      propertyName: "image",
      inputType: InputType.IMAGE,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Width",
      propertyName: "width",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Height",
      propertyName: "height",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
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
  canBeCombined: false,
  // effect properties
  number: 30,
  image: {
    url: "/images/leaf.png",
    width: 40,
    height: 40,
  },
  width: 40,
  height: 40,
};
