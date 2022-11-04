import { InputType, INumberInput } from "webslider-sdk2/lib/inputs/i-inputs";
import { IAnimationDefinition } from "../types";
import { IZoomInAnimation, ZOOM_ANIMATION } from "./zoom.types";

export type IZoomInTuple = [INumberInput<"scaleX">, INumberInput<"scaleY">];

export const zoomDefinition: IAnimationDefinition<IZoomInTuple> = {
  id: ZOOM_ANIMATION,
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

export const zoomDefaults: IZoomInAnimation = {
  id: ZOOM_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out"],
  canBeCombined: true,
  outStartTime: {
    customValue: "0ms",
    inheritFrom: "inheritFromSlide",
  },
  // animation properties
  scaleX: 100,
  scaleY: 100,
};
