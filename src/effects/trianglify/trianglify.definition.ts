import { InputType } from "../../inputs/types";
import { ITrianglifyEffect, trianglifyPhoto } from "./trianglify.types";

export const trianlifyDefinition = {
  id: trianglifyPhoto,
  name: "Trianglify",
  form: [
    {
      displayName: "Background color",
      helperText: null,
      propertyName: "colors",
      inputType: InputType.COLOR_ARRAY,
    },
    {
      displayName: "Cell size",
      helperText: "Size in pixels of the mesh used to generate triangles",
      propertyName: "cellSize",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Variance",
      helperText: "Amount of randomness used when generating triangles",
      propertyName: "variance",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Seed",
      helperText:
        "Seeds the random number generator to create repeatable patterns",
      propertyName: "seed",
      inputType: InputType.TEXT,
    },
    {
      displayName: "Fill",
      helperText: "Amount of randomness used when generating triangles",
      propertyName: "fill",
      inputType: InputType.CHECKBOX,
    },
    {
      displayName: "Stroke Width",
      helperText:
        "Specify the width of the strokes used to outline the polygons",
      propertyName: "strokeWidth",
      inputType: InputType.NUMBER,
    },
  ],
};

export const trianglifyDefaults: ITrianglifyEffect = {
  id: trianglifyPhoto,
  hasDelay: false,
  hasDuration: true,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  // specific this effect
  colors: [{ r: 255, g: 255, b: 255, a: 1 }],
  cellSize: 75,
  variance: 75,
  seed: "qwerty",
  fill: true,
  strokeWidth: 0,
};
