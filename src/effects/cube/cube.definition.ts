import { InputType } from "../../inputs/types";
import { cube, ICubeEffect } from "./cube.types";

export const cubeDefinition = {
  id: cube,
  name: "Cube",
  form: [
    {
      displayName: "Background color",
      helperText: "Cube background color",
      propertyName: "cubeBackgroundColor",
      inputType: InputType.COLOR,
      //value: { r: 255, g: 255, b: 255, a: 1 },
      //defaultValue: { r: 255, g: 255, b: 255, a: 1 },
    },
    {
      displayName: "Edge color",
      helperText: "Cube edge color",
      propertyName: "cubeEdgeColor",
      inputType: InputType.COLOR,
      //value: { r: 255, g: 255, b: 255, a: 1 },
      //defaultValue: { r: 255, g: 255, b: 255, a: 1 },
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
  cubeBackgroundColor: { r: 255, g: 255, b: 255, a: 1 },
  cubeEdgeColor: { r: 255, g: 255, b: 255, a: 1 },
};
