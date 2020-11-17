import { InputType } from "../../inputs/types";
import { Easings, IEffectBase } from "../types";

interface IZoomInEffect extends IEffectBase {
  fromScale: number;
  toScale: number;
}

export const zoomInDefaults: IZoomInEffect = {
  id: "zoomIn",
  hasDelay: true,
  hasDuration: true,
  hasEasing: true,
  fromScale: 0,
  toScale: 100,
  easing: Easings.Power0,
  customEasing: null,
};

export const zoomInDefinition = {
  id: "zoomIn",
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
