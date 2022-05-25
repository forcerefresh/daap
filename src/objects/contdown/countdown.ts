import {
  ICheckboxInput,
  IColorInput,
  IFontSelectInput,
  IFontSelectInputValue,
  InputType,
  ISelectInput,
  IUnitsNumberInput,
} from "../../inputs/types";
import { createCommonObject } from "../create-object-factory";
import { ICommonObjectProperties, IObject } from "../types";
import { v4 as uuid } from "uuid";
import { PreloadOrder } from "../objects-factory";
import svg from "./countdown-icon.svg";
import { convertTimeUnitToMs } from "../../utils/utils";
import {
  FormType,
  IFormGroupItem,
} from "../../utils/form-layout/i-form-layout";
import { RGBColor } from "react-color";
import { getObjectPlaceholder } from "../object-helpers";

const COUNTDOWN = "countdown";

const intervalMap = new Map<string, NodeJS.Timeout>();

export interface CountdownValues {
  countdown: string;
  font: IFontSelectInputValue;
  color: RGBColor;
  fontSize: string;
  weight: string;
  preload: boolean;
  textAlign: string;
}

export type CountdownPropertiesTuple = [
  IUnitsNumberInput<"countdown">,
  IFormGroupItem<
    [
      IFontSelectInput<"font">,
      IColorInput<"color">,
      IUnitsNumberInput<"fontSize">,
      ISelectInput<"weight">,
      ISelectInput<"textAlign">
    ]
  >
];

export function createCountdownObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<CountdownPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(COUNTDOWN);

  const properties: CountdownPropertiesTuple = [
    {
      displayName: "Countdown",
      placeholder: "",
      allowedUnits: ["s"],
      propertyName: "countdown",
      inputType: InputType.UNITS_NUMBER,
      value: "5s",
      defaultValue: "5s",
    },
    {
      displayName: "Font",
      propertyName: "fontConfiguration",
      type: FormType.GROUP,
      initiallyOpen: true,
      optional: false,
      elements: [
        {
          displayName: "Font",
          propertyName: "font",
          inputType: InputType.FONT_SELECT,
          value: (initialValue?.font as IFontSelectInputValue) || {
            fontFamily: "Arial",
            source: "system-fonts",
          },
          defaultValue: {
            fontFamily: "Arial",
            source: "system-fonts",
          },
        },
        {
          displayName: "Color",
          propertyName: "color",
          inputType: InputType.COLOR,
          value: { r: 255, g: 255, b: 255, a: 1 },
          defaultValue: { r: 255, g: 255, b: 255, a: 1 },
        },
        {
          displayName: "Font size",
          placeholder: "Enter font size",
          allowedUnits: ["px", "em", "%"],
          propertyName: "fontSize",
          inputType: InputType.UNITS_NUMBER,
          value: initialValue?.fontSize || "1em",
          defaultValue: "1em",
        },
        {
          displayName: "Weight",
          propertyName: "weight",
          inputType: InputType.SELECT,
          value: "400",
          defaultValue: "400",
          options: [
            { value: "100", label: "100	Thin" },
            { value: "200", label: "200	Extra Light" },
            { value: "300", label: "300	Light" },
            { value: "400", label: "400	Normal" },
            { value: "500", label: "500	Medium" },
            { value: "600", label: "600	Semi Bold" },
            { value: "700", label: "700	Bold" },
            { value: "800", label: "800	Extra Bold" },
            { value: "900", label: "900	Black" },
            { value: "950", label: "950	Extra Black" },
          ],
        },
        {
          displayName: "Text align",
          propertyName: "textAlign",
          inputType: InputType.SELECT,
          value: "left",
          defaultValue: "left",
          options: [
            { value: "left", label: "Left" },
            { value: "center", label: "Cente" },
            { value: "right", label: "Right" },
          ],
        },
      ],
    },
  ];

  const values: CountdownValues = {
    countdown: "5s",
    color: { r: 255, g: 255, b: 255, a: 1 },
    font: {
      fontFamily: "Arial",
      source: "system-fonts",
    },
    fontSize: "3em",
    weight: "normal",
    textAlign: "center",
    preload: true,
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: COUNTDOWN,
      properties,
      values,
      valuesMetadata: {},
    },
  };
}

export function getCountdownHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const countdownValues = object.definition.values as CountdownValues;

  if (!isPlayer) {
    return getObjectPlaceholder(`COUNTDOWN<br/>${countdownValues.countdown}`);
  }

  let style = "";
  style += "font-family: " + countdownValues.font.fontFamily + ";";
  style += "font-size: " + countdownValues.fontSize + ";";
  const c = countdownValues.color;
  style += `color: rgba(${c?.r},${c?.g},${c?.b},${c?.a});`;
  style += "font-weight: " + countdownValues.weight + ";";
  style += "text-align:" + countdownValues.textAlign + ";";

  return `<div class="object-content object-content-${object.id}" style="${style}"></div>`;
}

export async function countdownSizeUpdate(props: {
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

export async function preloadCountdown(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  /*const { id, values } = props;
  const delayValues = values as CountdownValues;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve(id);
    }, convertTimeUnitToMs(delayValues.delay));

    intervalMap.set(id, timeout);
  });*/

  return "";
}

export function countdownObject_Start(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}) {
  const { id, values } = props;
  const countdownValues = values as CountdownValues;

  const cd = convertTimeUnitToMs(countdownValues.countdown);
  const startTime = Date.now();

  const el = document.getElementsByClassName(`object-content-${id}`)[0];
  const cdMS = cd - (Date.now() - startTime);
  const cdS = Math.round(cdMS / 1000);
  if (el) el.innerHTML = `${cdS}`;

  const timeout = setInterval(() => {
    const el = document.getElementsByClassName(`object-content-${id}`)[0];
    const cdMS = cd - (Date.now() - startTime);
    if (cdMS < 0) {
      if (el) el.innerHTML = ``;
      const timerInt = intervalMap.get(id);
      if (timerInt) clearInterval(timerInt);

      return;
    }
    const cdS = Math.round(cdMS / 1000);
    if (el) el.innerHTML = `${cdS}`;
  }, 10);

  intervalMap.set(id, timeout);
}

export function countdownObject_Stop(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}) {
  const { id } = props;
  const timeout = intervalMap.get(id);
  if (timeout) clearInterval(timeout);
}

export const countdownMeta = {
  name: "COUNTDOWN",
  description: "Add countdown",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};
