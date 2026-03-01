import {
  IHTMLInput,
  IHTMLValue,
  IInputMetadataValues,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";
import { PreloadOrder } from "webslider-sdk/lib/objects/objects-register";
import htmlIcon from "./html-icon.svg?raw";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import {
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";

export const HTML = "html-object";

export type HtmlPropertiesTuple = [IHTMLInput<"html">];

export interface HtmlValues {
  html: IHTMLValue;
}

export function createHtmlObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  },
): Omit<
  IObject<HtmlPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(HTML);

  const properties: HtmlPropertiesTuple = [
    {
      displayName: "HTML",
      propertyName: "html",
      inputType: InputType.HTML_INPUT,
      value: {
        source: ``,
      },
      defaultValue: {
        source: ``,
      },
    },
  ];

  const values: HtmlValues = {
    html: initialValue?.html
      ? initialValue.html
      : {
          source: ``,
        },
  };

  const valuesMetadata: { [key: string]: IInputMetadataValues } = {};

  return {
    ...object,
    definition: {
      id: uuid(),
      type: HTML,
      properties,
      values,
      valuesMetadata,
    },
    commonStyleDefinition: {
      properties: [...getCommonObjectPropertiesDefinition()],
      values: { ...getCommonPropertiesValues() },
      valuesMetadata: { ...getCommonPropertiesMetadataValues() },
    },
  };
}

export function getHtmlHtml(props: {
  object: IObject;
  calculatedObjectSize: React.CSSProperties;
  isPlayer?: boolean;
}) {
  const { object, isPlayer } = props;

  const htmlValues = object.definition.values as HtmlValues;
  const htmlValuesMetadata = object.definition.valuesMetadata;

  if (!isPlayer) {
    if (!htmlValues.html.source) {
      return getObjectPlaceholder(`HTML<br/>(HTML is not set)`);
    }
  }

  let css = `
      <style>
      .object-content-${object.id}  {   
        ${addCommonPropertiesToStyle("", object)}
        
      }
      </style>`;

  return `${css}<div class="object-content object-content-${object.id}">${htmlValues.html.source}</div>`;
}

export async function htmlSizeUpdate(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {
  const { id, calculatedObjectSize, className } = props;
  const els = document.getElementsByClassName(className);
  const div = els[0] as HTMLDivElement;
  const parent = div.parentNode! as HTMLDivElement;
  parent.style.width = calculatedObjectSize.width;
  parent.style.height = calculatedObjectSize.height;
  parent.style.left = calculatedObjectSize.left;
  parent.style.top = calculatedObjectSize.top;

  div.style.width = calculatedObjectSize.width;
  div.style.height = calculatedObjectSize.height;
}

export const htmlMeta = {
  name: "HTML",
  description: "Add HTML Object",
  preloadOrder: PreloadOrder.FIRST,
  icon: htmlIcon,
};
