import { v4 as uuid } from "uuid";
import {
  ICheckboxInput,
  InputType,
  ITextInput,
} from "../../../../src/webslider-sdk/src/inputs/i-inputs";
import {
  ICommonObjectProperties,
  IObject,
} from "../../../../src/webslider-sdk/src/objects/i-object";
import { VideoSourceValues, VIDEO_SOURCE } from "./types";
import logo from "./video-source-logo.svg";

import { createCommonObject } from "../../../../src/webslider-sdk/src/objects/create-common-object";
import { getHtml } from "./video-source";
import { logger } from "../../../../src/webslider-sdk/src/utils/logger/logger";

/**
 * This is a definition of Video Source Object properties form
 * Note: Generic values needs to match with Video Source Object Values interface
 */
export type VideoSourceTuple = [
  ITextInput<"sourceId">,
  ITextInput<"url">,
  ICheckboxInput<"preload">,
  ICheckboxInput<"loop">
];

export function createVideoSourceObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<VideoSourceTuple>, keyof ICommonObjectProperties | "layerId"> {
  logger.debug(`Video source: createVideoSourceObject()`);
  const object = createCommonObject(VIDEO_SOURCE);

  const propertiesFormDefinition: VideoSourceTuple = [
    {
      displayName: "Source ID",
      propertyName: "sourceId",
      inputType: InputType.TEXT,
      value: "",
      defaultValue: "",
    },
    {
      displayName: "URL",
      propertyName: "url",
      inputType: InputType.TEXT,
      value: "",
      defaultValue: "",
    },
    {
      displayName: "Preload",
      propertyName: "preload",
      inputType: InputType.CHECKBOX,
      defaultValue: true,
      value: true,
    },
    {
      displayName: "Loop",
      propertyName: "loop",
      inputType: InputType.CHECKBOX,
      defaultValue: true,
      value: true,
    },
  ];

  const values: VideoSourceValues = {
    sourceType: "VIDEOSource",
    sourceId: "",
    url: "",
    preload: true,
    loop: false,
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: VIDEO_SOURCE,
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
  logger.debug(`Video source: getHtmlForApp()`);
  const { isPlayer } = props;

  if (!isPlayer) {
    return `<div style="
    color: gray; 
    font-weight: bold; 
    display: flex; 
    flex-direction:column;
    justify-content: center; 
    align-items: center; 
    text-align: center; 
    width: 100%; height: 100%;">
     ${logo}
    <p>VIDEO SOURCE</p>
    </div>`;
  } else {
    return getHtml(props);
  }
}

/**
 * Properties that are shown in App Panel.
 */
export const videoSourceMeta = {
  name: "VIDEO SOURCE",
  description: "Add video source",
  icon: logo,
};
