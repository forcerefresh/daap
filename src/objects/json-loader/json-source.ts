import React from "react";
import { v4 as uuid } from "uuid";

import {
  ICheckboxInput,
  InputType,
  ITextInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { createCommonObject } from "../../webslider-sdk/src/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "../../webslider-sdk/src/objects/i-object";
import { getObjectPlaceholder } from "../../webslider-sdk/src/objects/object-helpers";
import { PreloadOrder } from "../../webslider-sdk/src/objects/objects-register";
import { getOrCreateConnectorById } from "./connectors-manager";
import svg from "./json-source.svg";

export const JSON_SOURCE = "json_source";

export type JSONSourceTuple = [
  ITextInput<"sourceId">,
  ITextInput<"url">,
  ICheckboxInput<"preload">
];

export interface JsonSourceValues {
  sourceType: "JSONSource";
  sourceId: string;
  url: string;
  preload: boolean;
}

export function createJsonSource(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<JSONSourceTuple>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(JSON_SOURCE);

  const properties: JSONSourceTuple = [
    {
      displayName: "Source ID",
      propertyName: "sourceId",
      inputType: InputType.TEXT,
      value: "",
      defaultValue: "",
    },
    {
      displayName: "URL",
      propertyName: "url",
      inputType: InputType.TEXT,
      value: "",
      defaultValue: "",
    },
    {
      displayName: "Preload",
      propertyName: "preload",
      inputType: InputType.CHECKBOX,
      defaultValue: true,
      value: true,
    },
  ];

  const values: JsonSourceValues = {
    sourceType: "JSONSource",
    sourceId: "",
    url: "",
    preload: true,
  };
  return {
    ...object,
    definition: {
      id: uuid(),
      type: JSON_SOURCE,
      properties,
      values,
      valuesMetadata: {},
    },
  };
}

export function getJsonSourceHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const jsonSourceValues = object.definition.values as JsonSourceValues;

  if (!isPlayer) {
    return getObjectPlaceholder(`JSONSource</br>${jsonSourceValues.sourceId}`);
  }

  return `<div class="object-content">${jsonSourceValues.url}</div>`;
}

export async function jsonSourceStart(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}) {
  const { id, values } = props;
  const connValues = values as JsonSourceValues;

  const conn = getOrCreateConnectorById(id);

  if (!connValues.preload) {
    await conn.loadData(connValues.url);
  }
}

export async function jsonSourceSizeUpdate(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {}

export async function jsonSourcePreload(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  const { id, values } = props;

  const connValues = values as JsonSourceValues;
  const conn = getOrCreateConnectorById(id);

  await conn.loadData(connValues.url);

  return id;
}

export function getJsonSourceConnector(objectId: string) {
  return getOrCreateConnectorById(objectId);
}

export const jsonSourceMeta = {
  name: "JSON SOURCE",
  description: "Add JSON Source",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};
