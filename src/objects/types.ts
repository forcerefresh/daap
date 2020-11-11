import { IColorInput, INumberInput, ITextInput } from "../inputs/types";

export enum ObjectType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  VECTOR = '"vector',
}

export interface IDefinition<T = ITextInput | INumberInput | IColorInput> {
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
}

export interface ITransitions {
  in?: ITransition;
  out?: ITransition;
}

export interface ITransition {
  relativeTo: "stage";
  delay: 500;
  duration: 1500;
  effect: IEffect;
}

export interface IEffect {
  alias: string;
  properties?: object; // TODO to be defined
}
