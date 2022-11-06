import { v4 as uuid } from "uuid";
import {
  ICoverPlacementInput,
  InputType,
  ITextInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import {
  CreateObjectFuncPropsType,
  CreateObjectFuncReturnType,
  GetAssetsUrlFuncPropsType,
  GetAssetsUrlFuncReturnType,
  GetHtmlFuncPropsType,
  GetHtmlFuncReturnType,
  ObjectMetaType,
} from "webslider-sdk/lib/objects/objects-register";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { VideoTargetValues, VIDEO_TARGET } from "./video-target-types";
import svgIcon from "../static/video-target-icon.svg";
import {
  CommonPropertiesTuple,
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";

/**
 * This is a type definition of Object properties form
 * Note: Generic values needs to match with ObjectValues interface
 */
export type VideoTargetTuple = [
  ITextInput<"sourceId">,
  ICoverPlacementInput<"videoFit">,
  ...CommonPropertiesTuple
];

/**
 * This functions generate and return new Object instance
 * It is called from app every time when you add Object from Objects panel to stage
 */
export function createObject(
  props: CreateObjectFuncPropsType
): CreateObjectFuncReturnType<VideoTargetTuple> {
  logger.debug(`video-target::createObject()`);

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
 * This function return html used in Web Slider App during editing
 */
export function getHtmlForApp(
  props: GetHtmlFuncPropsType
): GetHtmlFuncReturnType {
  logger.debug(`video-target::getHtmlForApp()`);

  const { object } = props;

  // Note: object.definition.values contain values that are set from Properties Panel
  const values = object.definition.values as VideoTargetValues;

  if (!values.sourceId) {
    return getObjectPlaceholder(`VIDEO TARGET<br/>(Please add Source ID)`);
  } else {
    return "Source ID: " + values.sourceId;
  }
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
  name: "VIDEO TARGET",
  description: "Add video target",
  icon: svgIcon,
};
