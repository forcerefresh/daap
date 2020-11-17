export interface IEffectBase {
  id: string;
  hasDelay: boolean;
  hasDuration: boolean;
  hasEasing: boolean;
  easing: Easings;
  customEasing: string | null;
}

export enum Easings {
  None = "None",
  Power0 = "Power0",
  Power1 = "Power1",
  Power2 = "Power2",
  Power3 = "Power3",
  Power4 = "Power4",
  Back = "Back",
  Elastic = "Elastic",
  Bounce = "Bounce",
  SlowMo = "SlowMo",
  SteppedEase = "SteppedEase",
  Circ = "Circ",
  Expo = "Expo",
  Sine = "Sine",
}

export enum EasingType {
  easeIn = "easeIn",
  easeOut = "easeOut",
  easeInOut = "easeInOut",
}
