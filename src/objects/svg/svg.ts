import {
  IColorInput,
  IInputMetadataValues,
  InputType,
  ISVGCustomColorsInput,
  ISVGInput,
  ISVGValue,
} from "../../inputs/types";
import { createCommonObject } from "../create-object-factory";
import { ICommonObjectProperties, IObject } from "../types";
import { v4 as uuid } from "uuid";
import { PreloadOrder } from "../objects-factory";
import svg from "./svg-icon.svg";
import {
  addCommonPropertiesToStyle,
  convertTimeUnitToMs,
  rgbColor2cssRgba,
} from "../../utils/utils";
import { getObjectPlaceholder } from "../object-helpers";
import {
  CommonPropertiesTuple,
  CommonPropertiesValues,
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "../common-properties";
import { RGBColor } from "react-color";
import {
  FormType,
  IFormGroupItem,
} from "../../utils/form-layout/i-form-layout";

export const SVG = "svg";

export type SvgPropertiesTuple = [
  ISVGInput<"svg">,
  IFormGroupItem<[IColorInput<"fill">, IColorInput<"stroke">]>,
  IFormGroupItem<[ISVGCustomColorsInput<"svg">]>,
  ...CommonPropertiesTuple
];

export interface SvgValues extends CommonPropertiesValues {
  svg: ISVGValue;
  hasCustomColors: boolean;
  hasFillAndStroke: boolean;
  fill: RGBColor;
  stroke: RGBColor;
}

export function createSvgObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<SvgPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(SVG);

  const properties: SvgPropertiesTuple = [
    {
      displayName: "SVG",
      propertyName: "svg",
      inputType: InputType.SVG_INPUT,
      value: {
        source: `<svg height="100" width="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
        </svg>`,
      },
      defaultValue: {
        source: `<svg height="100" width="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
        </svg>`,
      },
    },
    {
      displayName: "Fill & Stroke",
      type: FormType.GROUP,
      propertyName: "hasFillAndStroke",
      optional: true,
      elements: [
        {
          displayName: "Fill",
          propertyName: "fill",
          inputType: InputType.COLOR,
          value: { r: 255, g: 255, b: 255, a: 1 },
          defaultValue: { r: 255, g: 255, b: 255, a: 1 },
          optional: true,
        },
        {
          displayName: "Stroke",
          propertyName: "stroke",
          inputType: InputType.COLOR,
          value: { r: 0, g: 0, b: 0, a: 1 },
          defaultValue: { r: 0, g: 0, b: 0, a: 1 },
          optional: true,
        },
      ],
    },
    {
      displayName: "Custom colors",
      type: FormType.GROUP,
      propertyName: "hasCustomColors",
      optional: true,
      elements: [
        {
          displayName: "",
          duplicate: "1",
          propertyName: "svg",
          inputType: InputType.SVG_CUSTOM_COLORS,
          value: { source: "" },
          defaultValue: { source: "" },
        },
      ],
    },
    ...getCommonObjectPropertiesDefinition(),
  ];

  const values: SvgValues = {
    svg: initialValue?.svg
      ? initialValue.svg
      : {
          source: ``,
        },
    hasCustomColors: false,
    hasFillAndStroke: false,
    fill: { r: 255, g: 255, b: 255, a: 1 },
    stroke: { r: 0, g: 0, b: 0, a: 1 },
    ...getCommonPropertiesValues(),
  };

  const valuesMetadata: { [key: string]: IInputMetadataValues } = {
    fill: { exportForWizard: false, disabled: false },
    stroke: { exportForWizard: false, disabled: false },
    ...getCommonPropertiesMetadataValues(),
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: SVG,
      properties,
      values,
      valuesMetadata,
    },
  };
}

export function getSvgHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const svgValues = object.definition.values as SvgValues;
  const svgValuesMetadata = object.definition.valuesMetadata;

  if (!isPlayer) {
    if (!svgValues.svg.source) {
      return getObjectPlaceholder(`SVG<br/>(SVG is not set)`);
    }
  }

  const svgCode =
    svgValues.svg.colors && svgValues.hasCustomColors
      ? replaceColors(svgValues.svg.source, svgValues.svg.colors)
      : svgValues.svg.source;

  const fill =
    !svgValuesMetadata["fill"].disabled && svgValues.hasFillAndStroke
      ? `fill: ${rgbColor2cssRgba(svgValues.fill)};`
      : "";
  const stroke =
    !svgValuesMetadata["stroke"].disabled && svgValues.hasFillAndStroke
      ? `stroke: ${rgbColor2cssRgba(svgValues.stroke)};`
      : "";

  const w = parseInt(calculatedObjectSize.width as string);
  const h = parseInt(calculatedObjectSize.height as string);

  let scaleX = 1;
  let scaleY = 1;
  scaleY = h / w;

  let css = `
    <style>
    .object-content-${object.id}{
      transform: scaleX(${scaleX}) scaleY(${scaleY});
      transform-origin: top left;
      ${addCommonPropertiesToStyle("", object)}
    }
    .object-content-${object.id} svg {
      width: 100%;
      height: 100%;
    }
    </style>`;

  if (svgValues.hasFillAndStroke) {
    css += `
      <style>
      .object-content-${object.id} svg {
        ${fill}
        ${stroke}
      }
      </style>`;
  }

  //if (svgValues.svg) {
  return `${css}<div class="object-content object-content-${object.id}">${svgCode}</div>`;
  //}
  //return ``;
}

export async function svgSizeUpdate(props: {
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

function replaceColors(svgSource: string, colors: RGBColor[]) {
  let idx = 0;
  /*
    let s;
    s = svgSource.replace(/fill:(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
      const retColor = colors[idx];
      idx++;
      return "fill:" + rgbColor2cssRgba(retColor);
    });
    s = s.replace(/fill="(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
      const retColor = colors[idx];
      idx++;
      return `fill="` + rgbColor2cssRgba(retColor);
    });
  
    return s;*/

  return svgSource.replace(/(#[abcdef0-9]{3,6})/gi, function (v, c: string) {
    const retColor = colors[idx];
    idx++;
    return rgbColor2cssRgba(retColor);
  });
}

export const svgMeta = {
  name: "SVG",
  description: "Add vector",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};
