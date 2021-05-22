import { InputType } from "../../inputs/types";
import { parallax, IParallaxEffect } from "./parallax.types";

export const parallaxDefinition = {
  id: parallax,
  name: "Parallax",
  form: [
    {
      displayName: "Parallax",
      propertyName: "parallax",
      inputType: InputType.PARALLAX,
    },
  ],
};

export const parallaxDefaults: IParallaxEffect = {
  id: parallax,
  hasDelay: false,
  hasDuration: false,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["layer"],
  parallax: { objects: [], autoDepthInc: 5, autoDepth: true, smooth: true },
};
