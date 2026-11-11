import {
  InputType,
  IUnitsNumberInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";
import { PreloadOrder } from "webslider-sdk/lib/objects/objects-register";
import svg from "./delay-icon.svg?raw";
import { convertTimeUnitToMs } from "../../utils/utils";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";

const DELAY = "delay";

const intervalMap = new Map<string, NodeJS.Timeout>();

export interface DelayValues {
  delay: string;
  preload: true;
}

export type DelayPropertiesTuple = [IUnitsNumberInput<"delay">];

export function createDelayObject(
  _initialValue?: {
    [key: string]: any;
  },
  _commonProperties?: {
    hasOverflowProperty: boolean;
  },
): Omit<
  IObject<DelayPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(DELAY);

  const properties: DelayPropertiesTuple = [
    {
      displayName: "Delay",
      placeholder: "",
      allowedUnits: ["s", "ms"],
      propertyName: "delay",
      inputType: InputType.UNITS_NUMBER,
      value: "5s",
      defaultValue: "5s",
    },
  ];

  const values: DelayValues = {
    delay: "5s",
    preload: true,
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: DELAY,
      properties,
      values,
      valuesMetadata: {},
    },
  } as unknown as Omit<IObject<DelayPropertiesTuple>, keyof ICommonObjectProperties | "layerId">;
}

export function getDelayHtml(props: {
  object: IObject;
  calculatedObjectSize: React.CSSProperties;
  isPlayer?: boolean;
}) {
  const { object, isPlayer } = props;

  const delayValues = (object as any).definition.values as DelayValues;

  if (!isPlayer) {
    return getObjectPlaceholder(`DELAY<br/>${delayValues.delay}`);
  }

  return `<div class="object-content object-content-${object.id}" style="font-size:5em"></div>`;
}

export async function delaySizeUpdate(_props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {
}

export async function preloadDelay(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  const { id, values } = props;
  const delayValues = values as DelayValues;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(id);
    }, convertTimeUnitToMs(delayValues.delay));

    intervalMap.set(id, timeout);
  });
}

export function delayObject_Start() {}

export function delayObject_Stop(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}) {
  const { id } = props;
  const timeout = intervalMap.get(id);
  if (timeout) clearTimeout(timeout);
}

export const delayMeta = {
  name: "Delay",
  description: "Add Delay Object",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};
