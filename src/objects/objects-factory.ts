import { IObject } from "./types";
import { youtubeVideoMeta } from "./youtube-video/youtube-video";

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

export type executionCodeFuncType = (
  className: string,
  values: { [key: string]: any },
  calculatedObjectSize: any
) => void;

export interface IObjectDefinitionHolder {
  type: string;
  group: string;
  meta: {
    name: string;
    description?: string;
    icon?: string;
  };
  createObject: createObjectFuncType;
  getHtml?: getHtmlFuncType;
  executionCode?: executionCodeFuncType;
}
// <<<
const objects: IObjectDefinitionHolder[] = [];

export function registerObject(
  type: string,
  group: string,
  createObject: createObjectFuncType,
  getHtml?: getHtmlFuncType,
  executionCode?: executionCodeFuncType
) {
  objects.push({
    type,
    group,
    meta: youtubeVideoMeta,
    createObject,
    getHtml,
    executionCode,
  });
}

export function getObjectDefinition(type: string): IObjectDefinitionHolder {
  return objects.find((item) => item.type === type) as IObjectDefinitionHolder;
}
export function getObjectDefinitionsByGroup(
  group: string
): IObjectDefinitionHolder[] {
  return objects.filter((item) => item.group === group);
}
