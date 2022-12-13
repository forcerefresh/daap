import { RGBColor } from "react-color";
import { v4 as uuid } from "uuid";
import {
  IColorInput,
  InputType,
  INumberInput,
  ISelectInput,
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

const SPINNER = "spinner";

export type SpinnerPropertiesTuple = [
  IFormSwitchGroupItem<"applyTo", [IFormSwitchGroup<[]>, IFormSwitchGroup<[]>]>,
  ISelectInput<"type">,
  IColorInput<"color">,
  INumberInput<"fadeInTime">,
  INumberInput<"fadeOutTime">
];

export interface SpinnerValues {
  type: string;
  color: RGBColor;
  fadeInTime: number;
  fadeOutTime: number;
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
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
      helperText: "Fade in time",
    },
    {
      displayName: "Fade out",
      propertyName: "fadeOutTime",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
      helperText: "Fade out time",
    },
  ];

  const values: SpinnerValues = {
    type: "plane",
    color: { r: 77, g: 77, b: 77, a: 1 },
    fadeInTime: 500,
    fadeOutTime: 500,
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
  };
}

export function getSpinnerHtml(props: {
  object: IObject;
  calculatedObjectSize: any;
  isPlayer?: boolean;
}) {
  const { object, isPlayer } = props;

  const randId = uuid();

  const spinnerValues = object.definition.values as SpinnerValues;
  let css = `<style>
  .wsSpinnerFadeIn {
    animation: wsSpinnerFadeInKF_${randId} ${spinnerValues.fadeInTime}ms;
  }
  .wsSpinnerFadeOut{
    animation: wsSpinnerFadeOutKF_${randId} ${spinnerValues.fadeOutTime}ms;

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

  if (spinnerValues.type === "plane") {
    css += `
  .sk-plane_${randId} {
    width: 100%;
    height: 100%;
    background-color: ${convertRGBColor2RGBAString(spinnerValues.color)};
    animation: sk-plane_${randId} 1.5s infinite ease-in-out; 
  }
  `;
    if (isPlayer) {
      css += `@keyframes sk-plane_${randId} {
      0% {
        transform: perspective(120px) rotateX(0deg) rotateY(0deg); 
      } 50% {
        transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg); 
      } 100% {
        transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg); 
      } 
    }`;
    }
  }

  if (spinnerValues.type === "chase") {
    css += `
      .sk-chase_${randId} {
        width: 100%;
        height: 100%;
        position: relative;
        animation: sk-chase_${randId} 2.5s infinite linear both;
      }

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
      css += `@keyframes sk-chase_${randId} {
          100% { transform: rotate(360deg); } 
        }
        @keyframes sk-chase-dot_${randId} {
          80%, 100% { transform: rotate(360deg); } 
        }
        @keyframes sk-chase-dot-before_${randId} {
          50% {
            transform: scale(0.4); 
          } 100%, 0% {
            transform: scale(1.0); 
          } 
        }`;
    }
  }

  css += `</style>`;

  let style = "width: 100%;";
  style += "height: 100%;";
  // style += `background:red;`;

  let html = "";
  if (spinnerValues.type === "plane") {
    html = `<div class="sk-plane_${randId}"></div>`;
  }
  if (spinnerValues.type === "chase") {
    html = `<div class="sk-chase_${randId}">
    <div class="sk-chase-dot_${randId}"></div>
    <div class="sk-chase-dot_${randId}"></div>
    <div class="sk-chase-dot_${randId}"></div>
    <div class="sk-chase-dot_${randId}"></div>
    <div class="sk-chase-dot_${randId}"></div>
    <div class="sk-chase-dot_${randId}"></div>
  </div>`;
  }
  return `<div class="object-content object-content-${object.id}" style="${style}">${html}</div>${css}`;
}

export async function spinnerSizeUpdate(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {
  const { id, calculatedObjectSize } = props;
}

export const spinnerMeta = {
  name: "SPINNER",
  description: "Add spinner",
  icon: svg,
  coreType: CoreObjectType.SPINNER,
};
