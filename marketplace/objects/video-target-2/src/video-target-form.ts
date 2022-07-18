import { v4 as uuid } from "uuid";
import {
  ICheckboxInput,
  IColorInput,
  InputType,
  ISliderInput,
  ITextInput,
} from "../../../../src/webslider-sdk/src/inputs/i-inputs";
import {
  ICommonObjectProperties,
  IObject,
} from "../../../../src/webslider-sdk/src/objects/i-object";
import { ObjectValues, VIDEO_TARGET } from "./types";
import { getHtml } from "./video-target";
import svg from "./logo.svg";

import { createCommonObject } from "../../../../src/webslider-sdk/src/objects/create-common-object";
import { getObjectPlaceholder } from "../../../../src/webslider-sdk/src/objects/object-helpers";
import { logger } from "../../../../src/webslider-sdk/src/utils/logger/logger";
/**
 * This is a definition of Object properties form
 * Note: Generic values needs to match with ObjectValues interface
 */
export type ObjectTuple = [ITextInput<"sourceId">];

export function createObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<ObjectTuple>, keyof ICommonObjectProperties | "layerId"> {
  logger.debug(`Video target: createObject()`);

  const object = createCommonObject(VIDEO_TARGET);

  const propertiesFormDefinition: ObjectTuple = [
    {
      displayName: "Text input",
      propertyName: "sourceId",
      inputType: InputType.TEXT,
      value: "",
      defaultValue: "",
    },
  ];

  const values: ObjectValues = {
    sourceId: "",
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: VIDEO_TARGET,
      properties: propertiesFormDefinition, // TODO: check if need to be renamed
      values,
      valuesMetadata: {
        sampleColor: { exportForWizard: false, disabled: true },
      },
    },
  };
}

/**
 * This function return html for object (for App only).
 */
export function getHtmlForApp(props: {
  object: IObject;
  calculatedObjectSize: any;
  isPlayer?: boolean;
}) {
  logger.debug(`Video target: getHtmlForApp()`);

  const { object, calculatedObjectSize, isPlayer } = props;

  // Note: object.definition.values contain values that are set from Properties Panel
  const values = object.definition.values as ObjectValues;

  if (!isPlayer) {
    if (!values.sourceId) {
      return getObjectPlaceholder(
        `VIDEO TARGET<br/>(Please add some text in Sample text field)`
      );
    } else {
      return "Source ID: " + values.sourceId;
    }
  }

  return getHtml(props);
}

/**
 * Properties that are shown in App Panel.
 */
export const objectMeta = {
  name: "VIDEO TARGET",
  description: "Video target object",
  icon: svg,
};
