import { IObject } from "./types";

export enum PreloadOrder {
  FIRST = "first",
  MIDDLE = "middle",
  LAST = "last",
}

export enum CoreObjectType {
  SPINNER = "spinner",
}

type createObjectFuncType = (
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
) => Omit<IObject, "layerId">;

type getHtmlFuncType = (
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) => string;

export type executionCodeFuncType = (props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}) => void;

export type getAssetsUrlFuncType = (props: {
  values: { [key: string]: any };
}) => { url: string; type: "url" | string }[];

export type preloadFuncType = (props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}) => Promise<string>;

export type postProcessFuncType = (
  prevObject: IObject,
  object: IObject
) => IObject;

export interface IObjectDefinitionHolder {
  type: string;
  group: string;
  meta: {
    name: string;
    description?: string;
    icon?: string;
    preloadOrder?: PreloadOrder;
    coreType?: CoreObjectType;
  };
  createObject: createObjectFuncType;
  getHtml?: getHtmlFuncType;
  executionCode_Start?: executionCodeFuncType;
  executionCode_Stop?: executionCodeFuncType;
  preload?: preloadFuncType;
  postProcess?: postProcessFuncType;
  getAssetsUrls?: getAssetsUrlFuncType;
}

// <<<
const objects: IObjectDefinitionHolder[] = [];

export function registerObject(
  type: string,
  group: string,
  meta: {
    name: string;
    description?: string;
    icon?: string;
    preloadOrder?: PreloadOrder;
    coreType?: CoreObjectType;
  },
  createObject: createObjectFuncType,
  getHtml?: getHtmlFuncType,
  preload?: preloadFuncType,
  executionCode_Start?: executionCodeFuncType,
  executionCode_Stop?: executionCodeFuncType,
  postProcess?: postProcessFuncType,
  getAssetsUrls?: getAssetsUrlFuncType
) {
  objects.push({
    type,
    group,
    meta,
    createObject,
    getHtml,
    executionCode_Start,
    executionCode_Stop,
    preload,
    postProcess,
    getAssetsUrls,
  });
}

export function getObjectDefinition(
  type: string
): IObjectDefinitionHolder | undefined {
  return objects.find((item) => item.type === type);
}
export function getObjectDefinitionsByGroup(
  group: string
): IObjectDefinitionHolder[] {
  return objects.filter((item) => item.group === group);
}
