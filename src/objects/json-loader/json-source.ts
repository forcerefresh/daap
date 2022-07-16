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
import { getOrCreateConnectorById } from "../../webslider-sdk//src/connectors/connector-manager";
import logo from "./json-source-logo.svg";
import { JSONSourceConnector } from "./json-source-connector";

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
  const object = {
    ...createCommonObject(JSON_SOURCE),
    ...{
      supportedLayout: {
        none: false,
        absolute: true,
        fit: false,
        grid: false,
        snap: false,
      },
      layout: "absolute" as "absolute",
      absoluteLayout: {
        type: "common" as "common",
        perDevice: [],
        common: {
          deviceType: "common" as "common",
          left: 0,
          top: 0,
          width: 150,
          height: 150,
        },
      },
    },
  };

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

export function getJsonSourceHtml(props: {
  object: IObject;
  calculatedObjectSize: React.CSSProperties;
  isPlayer?: boolean;
}) {
  const { isPlayer } = props;

  //const jsonSourceValues = object.definition.values as JsonSourceValues;

  if (!isPlayer) {
    return `<div style="
      color: gray; 
      font-weight: bold; 
      display: flex; 
      flex-direction:column;
      justify-content: center; 
      align-items: center; 
      text-align: center; 
      width: 100%; height: 100%;">
       ${logo}
      <p>JSON SOURCE</p>
      </div>`;
  } else {
    return "";
  }
}

export async function jsonSourceStart(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}) {
  const { id, values } = props;
  const jsonSourceValues = values as JsonSourceValues;

  const conn = getOrCreateConnectorById(
    JSONSourceConnector,
    id,
    jsonSourceValues.sourceId
  );

  if (!jsonSourceValues.preload) {
    await conn.loadData(jsonSourceValues.url);
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

  const jsonSourceValues = values as JsonSourceValues;
  const conn = getOrCreateConnectorById(
    JSONSourceConnector,
    id,
    jsonSourceValues.sourceId
  );

  await conn.loadData(jsonSourceValues.url);

  return id;
}

export const jsonSourceMeta = {
  name: "JSON SOURCE",
  description: "Add JSON Source",
  preloadOrder: PreloadOrder.FIRST,
  icon: logo,
};
