import {
  IColorInput,
  INumberInput,
  ITextInput,
  ITransformOriginInput,
} from "../inputs/types";

export enum ObjectType {
  TEXT = "text",
  IMAGE = "image",
  //VIDEO = "video",
  //VECTOR = '"vector',
}

export interface IDefinition<
  T = ITextInput | INumberInput | IColorInput | ITransformOriginInput
> {
  id: string;
  type: ObjectType;
  properties: T;
}

export interface ICommonObjectProperties {
  left?: number;
  leftType?: "px" | "em" | "%" | "vw" | "vh";
  top?: number;
  topType?: "px" | "em" | "%" | "vw" | "vh";
  right?: number;
  rightType?: "px" | "em" | "%" | "vw" | "vh";
  bottom?: number;
  bottomType?: "px" | "em" | "%" | "vw" | "vh";
  width?: number;
  widthType?: "px" | "em" | "%" | "vw" | "vh";
  height?: number;
  heightType?: "px" | "em" | "%" | "vw" | "vh";
}

export interface IObject<T extends {} = {}> extends ICommonObjectProperties {
  id: string;
  layerId: string;
  type: ObjectType;
  isVisible: boolean;
  isLocked: boolean;
  // hasTimeline: boolean; // show in timeline
  transitions: ITransitions;
  definition: IDefinition<T>;
  events: IObjectEvent[];
}

export interface IObjectEvent {
  type?: "click" | "mouseenter" | "mouseleave"; //TODO add other
  action?: IGoToSlideAction | INavigateToUrlAction;
}
export interface IGoToSlideAction {
  action: "goToSlideAction";
  slideId?: number;
  slideLabel?: string;
}

export interface INavigateToUrlAction {
  action: "navigateToUrlAction";
  url?: number;
  target?: string;
}

export interface ITransitions {
  in?: ITransition;
  out?: ITransition;
  effect?: ITransition;
}

export interface ITransition {
  relativeTo: "stage";
  delay: number;
  duration: number;
  timeDistribution?: number;
  ease?: string;
  childEase?: string;
  effect: IEffect;
  overlap?: number;
}

export interface ISlideTransition {
  overlap: number;
  duration: number;
  effect: IEffect;
}

export interface IEffect {
  id: string;
  values?: object;
  // properties?: object; // TODO to be defined
}
