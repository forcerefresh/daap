import { IObject } from "./types";

export enum PreloadOrder {
  FIRST = "first",
  MIDDLE = "middle",
  LAST = "last",
}

export enum CoreObjectType {
  SPINNER = "spinner",
}

export type createObjectFuncType = (
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
) => Omit<IObject, "layerId">;

export type getHtmlFuncType = (
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean,
  thumbnailHtmlArr?: (string | undefined)[],
  slidesCounter?: number
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

export type updateObjectSizeFuncType = (
  props: {
    id: string;
    className: string;
    values: { [key: string]: any };
    calculatedObjectSize: any;
    isInitial?: boolean;
  },
  initial: boolean
) => Promise<void>;

export type postProcessFuncType = (
  prevObject: IObject,
  object: IObject
) => IObject;

export interface IObjectAppDefinition extends IObjectDefinition {
  createObject: createObjectFuncType;
  group: string;
  meta: {
    name: string;
    description?: string;
    icon?: string;
    /* depreciated */
    preloadOrder?: PreloadOrder;
    coreType?: CoreObjectType;
  };
}

export interface IObjectDefinition {
  type: string;
  sizeUpdate: updateObjectSizeFuncType;
  getHtml?: getHtmlFuncType;
  executionCode_Start?: executionCodeFuncType;
  executionCode_Stop?: executionCodeFuncType;
  preload?: preloadFuncType;
  postProcess?: postProcessFuncType;
  getAssetsUrls?: getAssetsUrlFuncType;
  external?: boolean;
  PRELOAD_ORDER?: PreloadOrder;
}

// <<<
const objects: IObjectAppDefinition[] = [];

export function registerExternalObject(extObjDef: IObjectAppDefinition) {
  if (!isObjectRegistered(extObjDef.type)) {
    objects.push({ ...extObjDef, external: true });
  } else {
    console.warn(`Object ${extObjDef.type} is already registered`);
  }
}

export function isObjectRegistered(type: string) {
  return !!objects.find((item) => item.type === type);
}

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
  sizeUpdate: updateObjectSizeFuncType,
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
    sizeUpdate,
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
): IObjectAppDefinition | undefined {
  console.log(objects);
  return objects.find((item) => item.type === type);
}
export function getObjectDefinitionsByGroup(
  group: string
): IObjectAppDefinition[] {
  console.log(objects);

  const def = objects.filter((item) => item.group === group);

  return def;
}
