import { InputType } from "../../inputs/types";
import { IZoomInEffect, zoomIn } from "./zoom.types";

export const zoomInDefinition = {
  id: zoomIn,
  name: "Zoom",
  form: [
    {
      displayName: "Scale X",
      helperText: "Percentage value (default 0)",
      propertyName: "scaleX",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Scale Y",
      helperText: "Percentage value (default 100)",
      propertyName: "scaleY",
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
  scaleX: 100,
  scaleY: 100,
};
