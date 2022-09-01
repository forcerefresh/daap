import {
  InputType,
  INumberInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectDefinition } from "../types";
import { IZoomInEffect, zoomIn } from "./zoom.types";

export type IZoomInTuple = [INumberInput<"scaleX">, INumberInput<"scaleY">];

export const zoomInDefinition: IEffectDefinition<IZoomInTuple> = {
  id: zoomIn,
  name: "Zoom",
  form: [
    {
      displayName: "Scale X",
      helperText: "Percentage value (default 0)",
      propertyName: "scaleX",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Scale Y",
      helperText: "Percentage value (default 100)",
      propertyName: "scaleY",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
  ],
};

export const zoomInDefaults: IZoomInEffect = {
  id: zoomIn,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  canBeCombined: true,
  outStartTime: {
    customValue: "0ms",
    inheritFrom: "inheritFromSlide",
  },
  // effect properties
  scaleX: 100,
  scaleY: 100,
};
