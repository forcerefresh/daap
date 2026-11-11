import {
  ICheckboxInput,
  IColorInput,
  IInputMetadataValues,
  InputType,
  ISVGCustomColorsInput,
  ISVGInput,
  ISVGValue,
} from "webslider-sdk/lib/inputs/i-inputs";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";
import {
  GetHtmlFuncPropsType,
  PreloadOrder,
  UpdateObjectSizeFuncPropsType,
} from "webslider-sdk/lib/objects/objects-register";
import svg from "./svg-icon.svg?raw";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import { convertRGBColor2RGBAString } from "webslider-sdk/lib/utils/utils";
import {
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";
import { RGBColor } from "react-color";
import { FormType, IFormGroupItem } from "webslider-sdk/lib/form/i-form-layout";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import {
  addTransformPropertiesToStyle,
  getTransformObjectPropertiesDefinition,
  getTransformPropertiesValues,
  TransformPropertiesValues,
} from "webslider-sdk/lib/objects/transform-properties";
import {
  addCommonStyleToObjectElementContent,
  addTransformStyleToObjectElementContent,
  getObjectElementById,
  getObjectWrapperElementById,
} from "../../utils/animation-utils";
import { getObjectValuesForDevice } from "webslider-sdk/lib/objects/object-utils";

export const SVG = "svg";

export type SvgPropertiesTuple = [
  ISVGInput<"svg">,
  ICheckboxInput<"keepAspectRatio">,
  IFormGroupItem<
    [IColorInput<"fill">, IColorInput<"stroke">, IColorInput<"color">]
  >,
  IFormGroupItem<[ISVGCustomColorsInput<"svg">]>,
];

export interface SvgValues {
  svg: ISVGValue;
  keepAspectRatio: boolean;
  hasCustomColors: boolean;
  hasFillAndStroke: boolean;
  fill: RGBColor;
  stroke: RGBColor;
  color: RGBColor;
}

export function createSvgObject(
  initialValue?: {
    [key: string]: any;
  },
  _commonProperties?: {
    hasOverflowProperty: boolean;
  },
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
      displayName: "Keep aspect ratio",
      propertyName: "keepAspectRatio",
      inputType: InputType.CHECKBOX,
      value: true,
      defaultValue: true,
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
        {
          displayName: "Color",
          propertyName: "color",
          inputType: InputType.COLOR,
          value: { r: 255, g: 255, b: 255, a: 1 },
          defaultValue: { r: 255, g: 255, b: 255, a: 1 },
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
  ];

  const values: SvgValues = {
    svg: initialValue?.svg
      ? initialValue.svg
      : {
          source: ``,
        },
    keepAspectRatio: true,
    hasCustomColors: false,
    hasFillAndStroke: false,
    fill: { r: 255, g: 255, b: 255, a: 1 },
    stroke: { r: 0, g: 0, b: 0, a: 1 },
    color: { r: 255, g: 255, b: 255, a: 1 },
  };

  const valuesMetadata: { [key: string]: IInputMetadataValues } = {
    fill: { exportForWizard: false, disabled: false },
    stroke: { exportForWizard: false, disabled: false },
    color: { exportForWizard: false, disabled: false },
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
    commonStyleDefinition: {
      properties: [...getCommonObjectPropertiesDefinition(true)],
      values: { ...getCommonPropertiesValues() },
      valuesMetadata: { ...getCommonPropertiesMetadataValues() },
    },
    transformDefinition: {
      properties: [...getTransformObjectPropertiesDefinition(true)],
      values: { ...getTransformPropertiesValues() },
      valuesMetadata: {},
    },
  } as unknown as Omit<IObject<SvgPropertiesTuple>, keyof ICommonObjectProperties | "layerId">;
}

export function getSvgHtml(props: GetHtmlFuncPropsType) {
  const { object, calculatedObjectSize, isPlayer, deviceType } = props;

  const svgValues = (object as any).definition.values as SvgValues;
  const svgValuesMetadata = (object as any).definition.valuesMetadata;

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
      ? `fill: ${convertRGBColor2RGBAString(
          svgValues.fill,
        )}; color: ${convertRGBColor2RGBAString(svgValues.fill)};`
      : "";
  const stroke =
    !svgValuesMetadata["stroke"].disabled && svgValues.hasFillAndStroke
      ? `stroke: ${convertRGBColor2RGBAString(svgValues.stroke)};`
      : "";

  const w = parseInt(calculatedObjectSize.width as string);
  const h = parseInt(calculatedObjectSize.height as string);

  let scaleX = 1;
  let scaleY = 1;
  scaleY = svgValues.keepAspectRatio ? 1 : h / w;

  let css = `
    <style>
    .object-content-${object.id}{
      box-sizing: border-box;
      transform: scaleX(${scaleX}) scaleY(${scaleY});
      transform-origin: top left;
      ${addCommonPropertiesToStyle("", object, deviceType)}
      ${addTransformPropertiesToStyle("", object, deviceType)}   
      ${svgValues.keepAspectRatio ? "width:100%;height:100%;" : ""}
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

  return `${css}<div class="object-content object-content-${object.id}">${svgCode}</div>`;
}

export async function svgSizeUpdate(
  props: UpdateObjectSizeFuncPropsType,
): Promise<void> {
  const {
    id,
    calculatedObjectSize,
    deviceType,
  } = props;
  const { commonStyleDefinition, transformDefinition } = props as any;

  const objectWrapperEl = getObjectWrapperElementById(id);
  const objectEl = getObjectElementById(id);
  objectWrapperEl.style.width = calculatedObjectSize.width;
  objectWrapperEl.style.height = calculatedObjectSize.height;
  objectWrapperEl.style.left = calculatedObjectSize.left;
  objectWrapperEl.style.top = calculatedObjectSize.top;

  objectEl.style.width = calculatedObjectSize.width;
  objectEl.style.height = calculatedObjectSize.height;

  const objectContentEl = objectEl.getElementsByClassName(
    "object-content",
  )[0] as HTMLElement;
  addCommonStyleToObjectElementContent(
    objectContentEl,
    commonStyleDefinition,
    deviceType,
  );
  addTransformStyleToObjectElementContent(
    objectContentEl,
    transformDefinition,
    deviceType,
  );

  const transformProperties = getObjectValuesForDevice(
    transformDefinition?.values as TransformPropertiesValues,
    deviceType,
  );

  if (transformProperties?.transformOriginX) {
    objectWrapperEl.style.transformOrigin = `${
      transformProperties.transformOriginX ?? "center"
    }  ${transformProperties.transformOriginY ?? "center"}`;
  }
}

function replaceColors(svgSource: string, colors: RGBColor[]) {
  let idx = 0;
  return svgSource.replace(/(#[abcdef0-9]{3,6})/gi, function (_v, _c: string) {
    const retColor = colors[idx];
    idx++;
    return convertRGBColor2RGBAString(retColor);
  });
}

export const svgMeta = {
  name: "SVG",
  description: "Add Vector Object",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};
