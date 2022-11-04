import { v4 as uuid } from "uuid";
import {
  ICheckboxInput,
  InputType,
  ITextInput,
} from "webslider-sdk2/lib/inputs/i-inputs";
import { createCommonObject } from "webslider-sdk2/lib/objects/create-common-object";
import {
  CreateObjectFuncPropsType,
  CreateObjectFuncReturnType,
  GetAssetsUrlFuncPropsType,
  GetAssetsUrlFuncReturnType,
  GetHtmlFuncPropsType,
  GetHtmlFuncReturnType,
  ObjectMetaType,
} from "webslider-sdk2/lib/objects/objects-register";
import { logger } from "webslider-sdk2/lib/utils/logger/logger";
import { VideoSourceValues, VIDEO_SOURCE } from "./video-source-types";
import svgIcon from "../static/video-source-icon.svg";

/**
 * This is a type definition of Object properties form
 * Note: Generic values needs to match with ObjectValues interface
 */
export type VideoSourceTuple = [
  ITextInput<"sourceId">,
  ITextInput<"url">,
  ICheckboxInput<"preload">,
  ICheckboxInput<"loop">
];

/**
 * This functions generate and return new Object instance
 * It is called from app every time when you add Object from Objects panel to stage
 */
export function createObject(
  props: CreateObjectFuncPropsType
): CreateObjectFuncReturnType<VideoSourceTuple> {
  logger.debug(`video-source::createObject()`);

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
 * This function return html used in Web Slider App during editing
 */
export function getHtmlForApp(
  props: GetHtmlFuncPropsType
): GetHtmlFuncReturnType {
  logger.debug(`video-source::getHtmlForApp()`);

  return `<div style="
    color: gray; 
    font-weight: bold; 
    display: flex; 
    flex-direction:column;
    justify-content: center; 
    align-items: center; 
    text-align: center; 
    width: 100%; height: 100%;">
     ${svgIcon}
    <p>VIDEO SOURCE</p>
    </div>`;
}

export const getAssetsUrls = (
  props: GetAssetsUrlFuncPropsType
): GetAssetsUrlFuncReturnType => {
  return [];
};

/**
 * Properties that are shown in "Web Slider App > Add Panel".
 */
export const objectMeta: ObjectMetaType = {
  name: "VIDEO SOURCE",
  description: "Add video source",
  icon: svgIcon,
};
