import { RGBColor } from "react-color";
import { v4 as uuid } from "uuid";
import {
  IColorInput,
  InputType,
  INumberInput,
  ISelectInput,
  IUnitsNumberInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import {
  FormType,
  IFormSwitchGroup,
  IFormSwitchGroupItem,
} from "webslider-sdk/lib/form/i-form-layout";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import { CoreObjectType } from "webslider-sdk/lib/objects/objects-register";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { convertRGBColor2RGBAString } from "webslider-sdk/lib/utils/utils";
import svg from "./spinner-icon.svg";
import {
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";
import {
  addTransformPropertiesToStyle,
  getTransformObjectPropertiesDefinition,
  getTransformPropertiesValues,
} from "webslider-sdk/lib/objects/transform-properties";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import {
  getObjectElementById,
  getObjectWrapperElementById,
} from "../../animations/animation-utils";

const SPINNER = "spinner";

export type SpinnerPropertiesTuple = [
  IFormSwitchGroupItem<"applyTo", [IFormSwitchGroup<[]>, IFormSwitchGroup<[]>]>,
  ISelectInput<"type">,
  IColorInput<"color">,
  IUnitsNumberInput<"fadeInTime">,
  IUnitsNumberInput<"fadeOutTime">
];

export interface SpinnerValues {
  type: string;
  color: RGBColor;
  fadeInTime: string;
  fadeOutTime: string;
  applyTo: "page" | "infinite";
}

export function createSpinnerObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<SpinnerPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(SPINNER);

  const properties: SpinnerPropertiesTuple = [
    {
      displayName: "Type",
      propertyName: "applyTo",
      type: FormType.SWITCH_GROUP,
      groups: [
        {
          groupName: "Page",
          groupValue: "page",
          elements: [],
        },
        {
          groupName: "Infinite",
          groupValue: "infinite",
          elements: [],
        },
      ],
    },
    {
      displayName: "Look",
      propertyName: "type",
      inputType: InputType.SELECT,
      options: [
        "plane",
        "chase",
        "dot",
        "bars",
        // "bounce",
        // "wave",
        // "pulse",
        // "flow",
        // "swing",
        // "circle",
        // "circle-fade",
        // "grid",
        // "wander",
      ].map((item) => ({ label: item, value: item })),
      value: "" as any,
      defaultValue: "" as any,
    },
    {
      displayName: "Color",
      propertyName: "color",
      inputType: InputType.COLOR,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Fade in",
      propertyName: "fadeInTime",
      inputType: InputType.UNITS_NUMBER,
      value: {} as any,
      defaultValue: {} as any,
      helperText: "Fade in time",
      allowedUnits: ["ms", "s"],
    },
    {
      displayName: "Fade out",
      propertyName: "fadeOutTime",
      inputType: InputType.UNITS_NUMBER,
      value: {} as any,
      defaultValue: {} as any,
      helperText: "Fade out time",
      allowedUnits: ["ms", "s"],
    },
  ];

  const values: SpinnerValues = {
    type: "plane",
    color: { r: 77, g: 77, b: 77, a: 1 },
    fadeInTime: "500ms",
    fadeOutTime: "500ms",
    applyTo: "page",
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: SPINNER,
      properties,
      values,
      valuesMetadata: {},
    },
    commonStyleDefinition: {
      properties: [...getCommonObjectPropertiesDefinition()],
      values: { ...getCommonPropertiesValues() },
      valuesMetadata: { ...getCommonPropertiesMetadataValues() },
    },
    transformDefinition: {
      properties: [...getTransformObjectPropertiesDefinition()],
      values: { ...getTransformPropertiesValues() },
      valuesMetadata: {},
    },
  };
}

export function getSpinnerHtml(props: {
  object: IObject;
  calculatedObjectSize: any;
  isPlayer?: boolean;
}) {
  const { object, isPlayer } = props;

  const spinnerValues = object.definition.values as SpinnerValues;
  let content: { html: string; css: string } | undefined = {} as any;

  const randId = object.id + "-spinner";

  switch (spinnerValues.type) {
    case "plane":
      content = getPlane(spinnerValues, randId, isPlayer);
      break;
    case "chase":
      content = getChase(spinnerValues, randId, isPlayer);
      break;
    case "dot":
      content = getDot(spinnerValues, randId, isPlayer);
      break;
    case "bars":
      content = getBars(spinnerValues, randId, isPlayer);
      break;
  }
  let style = "";
  style += `width: 100%; height: 100%;`;
  style = addCommonPropertiesToStyle(style, object);
  style = addTransformPropertiesToStyle(style, object);

  const css = `
    .object-content-${object.id} {
      opacity: ${spinnerValues.applyTo === "page" ? "0" : "1"};
      transition: opacity 1s;
    }
    .wsSpinnerVisible {
      opacity: 1;
    }
  `;
  return `<div class="object-content object-content-${object.id}" style="${style}">${content?.html}</div><style>${content?.css}${css}</style>`;
}

export async function spinnerSizeUpdate(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {
  const { id, calculatedObjectSize } = props;

  const objectWrapperEl = getObjectWrapperElementById(id);
  const objectEl = getObjectElementById(id);
  objectWrapperEl.style.width = calculatedObjectSize.width;
  objectWrapperEl.style.height = calculatedObjectSize.height;
  objectWrapperEl.style.left = calculatedObjectSize.left;
  objectWrapperEl.style.top = calculatedObjectSize.top;

  objectEl.style.width = calculatedObjectSize.width;
  objectEl.style.height = calculatedObjectSize.height;
}

export const spinnerMeta = {
  name: "Spinner",
  description: "Add Spinner Object",
  icon: svg,
  coreType: CoreObjectType.SPINNER,
};

function getFade(randId: string, spinnerValues: SpinnerValues) {
  let css = `
    .wsSpinnerFadeIn {
      animation: wsSpinnerFadeInKF_${randId} ${spinnerValues.fadeInTime};
    }
    .wsSpinnerFadeOut{
      animation: wsSpinnerFadeOutKF_${randId} ${spinnerValues.fadeOutTime};
    }
    @keyframes wsSpinnerFadeInKF_${randId} {
      0% {opacity:0;}
      100% {opacity:1;}
    }
    @keyframes wsSpinnerFadeOutKF_${randId} {
      0% {opacity:1;}
      100% {opacity:0;}
    }
  `;
  return css;
}

function getPlane(
  spinnerValues: SpinnerValues,
  randId: string,
  isPlayer: boolean | undefined
) {
  let css = `
    ${getFade(randId, spinnerValues)}
    .sk-plane_${randId} {
      width: 100%;
      height: 100%;
      background-color: ${convertRGBColor2RGBAString(spinnerValues.color)};
      animation: sk-plane_${randId} 1.5s infinite ease-in-out; 
    }
  `;
  if (isPlayer) {
    css += `
      @keyframes sk-plane_${randId} {
        0% { transform: perspective(120px) rotateX(0deg) rotateY(0deg); } 
        50% { transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg); } 
        100% { transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg); } 
      }
    `;
  }
  let html = `<div class="sk-plane_${randId}"></div>`;
  return { css, html };
}

function getChase(
  spinnerValues: SpinnerValues,
  randId: string,
  isPlayer: boolean | undefined
) {
  let css = `
    ${getFade(randId, spinnerValues)}
    .sk-chase-dot_${randId} {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      animation: sk-chase-dot_${randId} 2.0s infinite ease-in-out both;
    }

    .sk-chase-dot_${randId}:before {
      content: '';
      display: block;
      width: 25%;
      height: 25%;
      background-color: ${convertRGBColor2RGBAString(spinnerValues.color)};
      border-radius: 100%;
      animation: sk-chase-dot-before_${randId} 2.0s infinite ease-in-out both;
    }

    .sk-chase-dot_${randId}:nth-child(1) { animation-delay: -1.1s; }
    .sk-chase-dot_${randId}:nth-child(2) { animation-delay: -1.0s; }
    .sk-chase-dot_${randId}:nth-child(3) { animation-delay: -0.9s; }
    .sk-chase-dot_${randId}:nth-child(4) { animation-delay: -0.8s; }
    .sk-chase-dot_${randId}:nth-child(5) { animation-delay: -0.7s; }
    .sk-chase-dot_${randId}:nth-child(6) { animation-delay: -0.6s; }
    .sk-chase-dot_${randId}:nth-child(1):before { animation-delay: -1.1s; }
    .sk-chase-dot_${randId}:nth-child(2):before { animation-delay: -1.0s; }
    .sk-chase-dot_${randId}:nth-child(3):before { animation-delay: -0.9s; }
    .sk-chase-dot_${randId}:nth-child(4):before { animation-delay: -0.8s; }
    .sk-chase-dot_${randId}:nth-child(5):before { animation-delay: -0.7s; }
    .sk-chase-dot_${randId}:nth-child(6):before { animation-delay: -0.6s; }
  `;
  if (isPlayer) {
    css += `
      @keyframes sk-chase_${randId} {
        100% { transform: rotate(360deg); }
      }
      @keyframes sk-chase-dot_${randId} {
        80%, 100% { transform: rotate(360deg); }
      }
      @keyframes sk-chase-dot-before_${randId} {
        50% { transform: scale(0.4); } 
        100%, 0% { transform: scale(1.0); }
      }
    `;
  }
  let html = `
    <div class="sk-chase_${randId}">
      <div class="sk-chase-dot_${randId}"></div>
      <div class="sk-chase-dot_${randId}"></div>
      <div class="sk-chase-dot_${randId}"></div>
      <div class="sk-chase-dot_${randId}"></div>
      <div class="sk-chase-dot_${randId}"></div>
      <div class="sk-chase-dot_${randId}"></div>
    </div>`;
  return { css, html };
}
function getDot(
  spinnerValues: SpinnerValues,
  randId: string,
  isPlayer: boolean | undefined
) {
  let css = `
    ${getFade(randId, spinnerValues)}
    .sk-dot_${randId} {
      width: 100%;
      height: 100%;
      position: relative;
    }
    .sk-double-bounce1_${randId}, .sk-double-bounce2_${randId} {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: ${convertRGBColor2RGBAString(spinnerValues.color)};
      opacity: 0.6;
      position: absolute;
      top: 0;
      left: 0;
      animation: sk-bounce_${randId} 2.0s infinite ease-in-out;
    }
    .sk-double-bounce2_${randId} {
      animation-delay: -1.0s;
    }
  `;
  if (isPlayer) {
    css += `
      @keyframes sk-bounce_${randId} {
        0%, 100% { transform: scale(0.0); } 
        50% { transform: scale(1.0); }
      }
    `;
  }
  let html = `
    <div class="sk-dot_${randId}">
      <div class="sk-double-bounce1_${randId}"></div>
      <div class="sk-double-bounce2_${randId}"></div>
    </div>
  `;
  return { css, html };
}

function getBars(
  spinnerValues: SpinnerValues,
  randId: string,
  isPlayer: boolean | undefined
) {
  let css = `
    ${getFade(randId, spinnerValues)}
    .sk-bars_${randId} {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-between;
    }
    .sk-bars_${randId} > div {
      background-color: ${convertRGBColor2RGBAString(spinnerValues.color)};
      height: 100%;
      width: 12%;
      display: inline-block;
      animation: sk-stretchdelay_${randId} 1.2s infinite ease-in-out;
    }
    
    .sk-bars_${randId} .sk-rect2_${randId} {
      animation-delay: -1.1s;
    }
    .sk-bars_${randId} .sk-rect3_${randId} {
      animation-delay: -1.0s;
    }
    .sk-bars_${randId} .sk-rect4_${randId} {
      animation-delay: -0.9s;
    }
    .sk-bars_${randId} .sk-rect5_${randId} {
      animation-delay: -0.8s;
    }
  `;
  if (isPlayer) {
    css += `
      @keyframes sk-stretchdelay_${randId} {
        0%, 40%, 100% { transform: scaleY(0.4); }  
        20% { transform: scaleY(1.0); }
      }
    `;
  }
  let html = `
  <div class="sk-bars_${randId}">
    <div class="sk-rect1_${randId}"></div>
    <div class="sk-rect2_${randId}"></div>
    <div class="sk-rect3_${randId}"></div>
    <div class="sk-rect4_${randId}"></div>
    <div class="sk-rect5_${randId}"></div>
  </div>
  `;
  return { css, html };
}
