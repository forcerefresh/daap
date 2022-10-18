import {
  IColorInput,
  InputType,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectDefinition } from "../types";
import { cube, ICubeEffect } from "./cube.types";

export type ICubeTuple = [
  IColorInput<"cubeBackgroundColor">,
  IColorInput<"cubeEdgeColor">
];

export const cubeDefinition: IEffectDefinition<ICubeTuple> = {
  id: cube,
  name: "Cube",
  form: [
    {
      displayName: "Background color",
      helperText: "Cube background color",
      propertyName: "cubeBackgroundColor",
      inputType: InputType.COLOR,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Edge color",
      helperText: "Cube edge color",
      propertyName: "cubeEdgeColor",
      inputType: InputType.COLOR,
      value: {} as any,
      defaultValue: {} as any,
    },
  ],
};

export const cubeDefaults: ICubeEffect = {
  id: cube,
  hasDelay: false,
  hasDuration: true,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["slide"],
  canBeCombined: false,
  // effect properties
  cubeBackgroundColor: { r: 255, g: 255, b: 255, a: 0 },
  cubeEdgeColor: { r: 255, g: 255, b: 255, a: 0 },
};
