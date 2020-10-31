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
  hasTimeline: boolean; // show in timeline
  timeline: ITimeline;
  definition: IDefinition<T>;
}

export interface ITimeline {
  keyFrames: IKeyFrame[];
}

export interface IKeyFrame {
  time: number;
  properties: IKeyFrameProperties;
}

export interface IKeyFrameProperties {
  left?: number;
  top?: number;
  right?: number; // TODO: do we need this?
  bottom?: number; // TODO: do we need this?
  scale?: number;
  rotate?: number;
}
