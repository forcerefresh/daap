import { IOutEffectStartTime } from "../webslider-sdk/src/effects/i-effect-types";

export type EffectType = "in" | "out" | "effect" | "event" | "slide" | "layer";

export interface IEffectDefinition<T> {
  id: string;
  name: string;
  form: T;
}

export interface IEffectBase {
  id: string;
  itemId?: string;
  name?: string;
  type?: EffectType;
  objectProperties?: {
    width: number;
    height: number;
    objectHtml: string;
  };
  breakpointData?: {
    width: number;
    height: number;
    pageWidth: number;
  };
  // >> flags beginning (TODO: make flags optional as by default they are false)
  hasDelay: boolean;
  hasDuration: boolean;
  hasOwnDuration?: boolean;
  hasEase: boolean;
  hasChildEase: boolean;
  hasTimeDistribution?: boolean;
  canBeCombined: boolean;
  // << flags end
  supportedEffectTypes: EffectType[];
  timeDistribution?: number;
  ease?: string;
  customEase?: string;
  childEase?: string;
  childCustomEase?: string;
  duration?: number;
  delay?: number;
  outStartTime?: IOutEffectStartTime;
  // TODO: consider removing seek
  seek?: number;
}

export interface IEasing {
  label: string;
  value: string;
}

export interface INextZIndex {
  nextZIndex?: number;
}

export const EasingOptions: IEasing[] = [
  // none
  "none",
  // power
  "power1.in",
  "power1.inOut",
  "power1.out",
  "power2.in",
  "power2.inOut",
  "power2.out",
  "power3.in",
  "power3.inOut",
  "power3.out",
  "power4.in",
  "power4.inOut",
  "power4.out",
  // back
  "back.in(1)",
  "back.in(2)",
  "back.in(3)",
  "back.inOut(1)",
  "back.inOut(2)",
  "back.inOut(3)",
  "back.out(1)",
  "back.out(2)",
  "back.out(3)",
  //elastic
  "elastic.in(1, 0.3)",
  "elastic.in(1, 0.5)",
  "elastic.in(1, 0.7)",
  "elastic.inOut(1, 0.3)",
  "elastic.inOut(1, 0.5)",
  "elastic.inOut(1, 0.7)",
  "elastic.out(1, 0.3)",
  "elastic.out(1, 0.5)",
  "elastic.out(1, 0.7)",
].map((item) => ({ label: item, value: item }));
