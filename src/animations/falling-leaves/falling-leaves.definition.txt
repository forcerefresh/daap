import { IAnimationDefinition } from "webslider-sdk/lib/animations/i-animation-types";
import {
  IImageInput,
  InputType,
  INumberInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import {
  GetAssetsUrlFuncPropsType,
  GetAssetsUrlFuncReturnType,
} from "webslider-sdk/lib/objects/objects-register";
import {
  FALLING_LEAVES_ANIMATION,
  IFallingLeaves,
} from "./falling-leaves.types";

export type IFallingLeavesTuple = [
  INumberInput<"number">,
  IImageInput<"image">,
  INumberInput<"width">,
  INumberInput<"height">
];

export const fallingLeavesDefinition: IAnimationDefinition<IFallingLeavesTuple> =
  {
    id: FALLING_LEAVES_ANIMATION,
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
  id: FALLING_LEAVES_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["animation"],
  canBeCombined: false,
  // animation properties
  number: 30,
  image: { image: { sourceType: "local" } },
  width: 40,
  height: 40,
};

export function fallingLeavesGetAssetsUrls(
  props: GetAssetsUrlFuncPropsType
): GetAssetsUrlFuncReturnType {
  const values = props.values as IFallingLeaves;

  if (!values.image.image.sourceType) {
    return [];
  }

  return [
    {
      id: values.image.image.id,
      url: values.image.image.url,
      filename: values.image.filename,
      localFilename: values.image.image.filename,
      sourceType: values.image.image.sourceType,
      mediaType: "image",
    },
  ];
}
