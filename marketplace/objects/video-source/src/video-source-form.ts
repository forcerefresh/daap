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

/**
 * This is a definition of Object properties form
 * Note: Generic values needs to match with ObjectValues interface
 */
export type VideoSourceTuple = [
  ITextInput<"sourceId">,
  ITextInput<"url">,
  ICheckboxInput<"preload">
];

export function createVideoSourceObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<VideoSourceTuple>, keyof ICommonObjectProperties | "layerId"> {
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
  ];

  const values: VideoSourceValues = {
    sourceType: "VIDEOSource",
    sourceId: "",
    url: "",
    preload: true,
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
export function getVideoSourceHtml(props: {
  object: IObject;
  calculatedObjectSize: any;
  isPlayer?: boolean;
}) {
  const { isPlayer } = props;

  //const jsonSourceValues = object.definition.values as JsonSourceValues;

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
    return "";
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
