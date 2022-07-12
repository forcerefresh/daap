import {
  IHTMLInput,
  IHTMLValue,
  IInputMetadataValues,
  InputType,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { createCommonObject } from "../../webslider-sdk/src/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "../../webslider-sdk/src/objects/i-object";
import { v4 as uuid } from "uuid";
import { PreloadOrder } from "../../webslider-sdk/src/objects/objects-register";
import htmlIcon from "./html-icon.svg";
import { addCommonPropertiesToStyle } from "../../utils/utils";
import { getObjectPlaceholder } from "../../webslider-sdk/src/objects/object-helpers";
import {
  CommonPropertiesTuple,
  CommonPropertiesValues,
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "../../webslider-sdk/src/objects/common-properties";

export const HTML = "html";

export type HtmlPropertiesTuple = [
  IHTMLInput<"html">,
  ...CommonPropertiesTuple
];

export interface HtmlValues extends CommonPropertiesValues {
  html: IHTMLValue;
}

export function createHtmlObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
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
    ...getCommonObjectPropertiesDefinition(),
  ];

  const values: HtmlValues = {
    html: initialValue?.html
      ? initialValue.html
      : {
          source: ``,
        },
    ...getCommonPropertiesValues(),
  };

  const valuesMetadata: { [key: string]: IInputMetadataValues } = {
    ...getCommonPropertiesMetadataValues(),
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: HTML,
      properties,
      values,
      valuesMetadata,
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
      return getObjectPlaceholder(`HTMLG<br/>(HTML is not set)`);
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
  description: "Add html",
  preloadOrder: PreloadOrder.FIRST,
  icon: htmlIcon,
};
