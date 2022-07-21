import { v4 as uuid } from "uuid";
import {
  ICoverPlacementInput,
  InputType,
  ITextInput,
} from "../../../../src/webslider-sdk/src/inputs/i-inputs";
import {
  ICommonObjectProperties,
  IObject,
} from "../../../../src/webslider-sdk/src/objects/i-object";
import { VideoTargetValues, VIDEO_TARGET } from "./types";
import { getHtml } from "./video-target";
import logo from "./video-target-logo.svg";

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
 * This is a definition of Object properties form
 * Note: Generic values needs to match with ObjectValues interface
 */
export type VideoTargetTuple = [
  ITextInput<"sourceId">,
  ICoverPlacementInput<"videoFit">,
  ...CommonPropertiesTuple
];

export function createObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<VideoTargetTuple>, keyof ICommonObjectProperties | "layerId"> {
  logger.debug(`Video target: createObject()`);

  const object = createCommonObject(VIDEO_TARGET);

  const propertiesFormDefinition: VideoTargetTuple = [
    {
      displayName: "Source ID",
      propertyName: "sourceId",
      inputType: InputType.TEXT,
      value: "",
      defaultValue: "",
    },
    {
      inputType: InputType.COVER_LAYOUT,
      displayName: "Video fit",
      propertyName: "videoFit",
      value: {
        size: "fill",
        positionHorizontal: "center",
        positionVertical: "center",
      },
      defaultValue: {
        size: "fill",
        positionHorizontal: "center",
        positionVertical: "center",
      },
      inputProps: { hidePosition: true },
    },
    ...getCommonObjectPropertiesDefinition(),
  ];

  const values: VideoTargetValues = {
    sourceId: "",
    videoFit: {
      size: "fill",
      positionHorizontal: "center",
      positionVertical: "center",
    },
    ...getCommonPropertiesValues(),
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
  isPlayer?: boolean;
}) {
  logger.debug(`Video target: getHtmlForApp()`);

  const { object, isPlayer } = props;

  // Note: object.definition.values contain values that are set from Properties Panel
  const values = object.definition.values as VideoTargetValues;

  if (!isPlayer) {
    if (!values.sourceId) {
      return getObjectPlaceholder(`VIDEO TARGET<br/>(Please add Source ID)`);
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
  icon: logo,
};
