import { IColorInput, INumberInput, ITextInput } from "../inputs/types";

export enum ObjectType {
  TEXT = "text",
  IMAGE = "image",
}

export interface IDefinition<T = ITextInput | INumberInput | IColorInput> {
  id: string;
  type: ObjectType;
  properties: T;
}

export interface IObject<T extends {} = {}> {
  id: string;
  layerId: string;
  type: ObjectType;
  isVisible: boolean;
  hasTimeline: boolean;
  definition: IDefinition<T>;
}
