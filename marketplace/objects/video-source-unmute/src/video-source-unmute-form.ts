import { v4 as uuid } from "uuid";
import {
  InputType,
  ISVGInput,
  ITextInput,
} from "../../../../src/webslider-sdk/src/inputs/i-inputs";
import {
  ICommonObjectProperties,
  IObject,
} from "../../../../src/webslider-sdk/src/objects/i-object";
import { VideoSourceUnmuteValues, VIDEO_SOURCE_UNMUTE } from "./types";
import { getHtml } from "./video-source-unmute";
import logo from "./video-source-unmute-logo.svg";

import { createCommonObject } from "../../../../src/webslider-sdk/src/objects/create-common-object";
import { getObjectPlaceholder } from "../../../../src/webslider-sdk/src/objects/object-helpers";
import { logger } from "../../../../src/webslider-sdk/src/utils/logger/logger";
import {
  CommonPropertiesTuple,
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "../../../../src/webslider-sdk/src/objects/common-properties";
/**
 * This is a definition of Video Source Object properties form
 * Note: Generic values needs to match with Video Source Unmute Values interface
 */
export type VideoSourceUnmuteTuple = [
  ITextInput<"sourceId">,
  ISVGInput<"svgMute">,
  ISVGInput<"svgUnmute">,
  ...CommonPropertiesTuple
];

export function createObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<VideoSourceUnmuteTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  logger.debug(`Video source unmute: createObject()`);

  const object = createCommonObject(VIDEO_SOURCE_UNMUTE);

  const propertiesFormDefinition: VideoSourceUnmuteTuple = [
    {
      displayName: "Source ID",
      propertyName: "sourceId",
      inputType: InputType.TEXT,
      value: "",
      defaultValue: "",
    },
    {
      displayName: "MUTE",
      propertyName: "svgMute",
      inputType: InputType.SVG_INPUT,
      value: {
        source: ``,
      },
      defaultValue: {
        source: ``,
      },
    },
    {
      displayName: "UNMUTE",
      propertyName: "svgUnmute",
      inputType: InputType.SVG_INPUT,
      value: {
        source: ``,
      },
      defaultValue: {
        source: ``,
      },
    },
    ...getCommonObjectPropertiesDefinition(),
  ];

  const values: VideoSourceUnmuteValues = {
    sourceId: "",
    svgMute: initialValue?.svg
      ? initialValue.svg
      : {
          source: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M1.75 5.75v4.5h2.5l4 3V2.75l-4 3z"></path><path d="M14.25 5.75l-3.5 4.5m0-4.5l3.5 4.5"></path></g></svg>`,
        },
    svgUnmute: initialValue?.svg
      ? initialValue.svg
      : {
          source: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M1.75 5.75v4.5h2.5l4 3V2.75l-4 3z"></path><path d="M10.75 6.25s1 .5 1 1.75s-1 1.75-1 1.75m1-6.5c2 1 3 2.5 3 4.75s-1 3.75-3 4.75"></path></g></svg>`,
        },
    ...getCommonPropertiesValues(),
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: VIDEO_SOURCE_UNMUTE,
      properties: propertiesFormDefinition, // TODO: check if need to be renamed
      values,
      valuesMetadata: {
        sampleColor: { exportForWizard: false, disabled: true },
        ...getCommonPropertiesMetadataValues(),
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
}) {
  logger.debug(`Video source unmute: getHtmlForApp()`);

  const { object, calculatedObjectSize } = props;

  // Note: object.definition.values contain values that are set from Properties Panel
  const values = object.definition.values as VideoSourceUnmuteValues;

  if (!values.sourceId) {
    return getObjectPlaceholder(
      `VIDEO SOURCE UNMUTE<br/>(Please add Source ID)`
    );
  } else {
    return getHtml({ object, calculatedObjectSize });
  }
}

/**
 * Properties that are shown in App Panel.
 */
export const objectMeta = {
  name: "VIDEO SOURCE UNMUTE",
  description: "Video source unmute",
  icon: logo,
};
