import { InputType } from "../../inputs/types";
import { Easings, IEffectBase } from "../types";
import gsap from "gsap"; // TODO: remove player from here

const fadeIn = "fadeIn";

interface IFadeInEffect extends IEffectBase {
  fromOpacity: number;
  toOpacity: number;
}

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

export const fadeInDefinition = {
  id: fadeIn,
  name: "Fade In",
  form: [
    {
      displayName: "Start opacity",
      helperText: "Percentage value (default 0)",
      propertyName: "fromOpacity",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "End opacity",
      helperText: "Percentage value (default 100)",
      propertyName: "toOpacity",
      inputType: InputType.NUMBER,
    },
  ],
};

// Register an effect for reuse
gsap.registerEffect({
  name: fadeIn,
  effect: function (targets: any, config: any) {
    console.log(arguments);
    return gsap.to(targets, {
      duration: config.duration,
      opacity: 0,
    });
  },
  defaults: { duration: 8 },
  extendTimeline: true,
});
