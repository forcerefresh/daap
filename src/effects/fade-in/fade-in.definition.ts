import { InputType } from "../../inputs/types";
import { Easings } from "../types";
import { fadeIn, IFadeInEffect } from "./fade-in.types";

export const fadeInDefinition = {
  id: fadeIn,
  name: "Fade In",
  form: [
    {
      inputType: InputType.NUMBER,
      propertyName: "fromOpacity",
      displayName: "Start opacity",
      helperText: "Percentage value (default 0)",
    },
    {
      inputType: InputType.NUMBER,
      propertyName: "toOpacity",
      displayName: "End opacity",
      helperText: "Percentage value (default 100)",
    },
  ],
};

export const fadeInDefaults: IFadeInEffect = {
  id: fadeIn,
  hasDelay: true,
  hasDuration: true,
  hasEasing: true,
  fromOpacity: 0,
  toOpacity: 100,
  easing: Easings.Power0,
  customEasing: null,
};
