import { InputType } from "../../inputs/types";
import { IZoomInEffect, zoomIn } from "./zoom-in.types";

export const zoomInDefinition = {
  id: zoomIn,
  name: "Zoom In",
  form: [
    {
      displayName: "Start scale",
      helperText: "Percentage value (default 0)",
      propertyName: "fromScale",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "End scale",
      helperText: "Percentage value (default 100)",
      propertyName: "toScale",
      inputType: InputType.NUMBER,
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
  // specific to this effect
  fromScale: 0,
  toScale: 100,
};
