import { VIDEO_SOURCE_UNMUTE } from "./src/types";
import {
  objectStart,
  objectStop,
  postProcess,
  preload,
  sizeUpdate,
  PRELOAD_ORDER,
} from "./src/video-source-unmute";
import {
  createObject,
  getHtmlForApp,
  objectMeta,
} from "./src/video-source-unmute-form";
import { IObjectAppDefinition } from "../../../src/webslider-sdk/src/objects/objects-register";
import { addObjectToGlobalScope } from "../../../src/webslider-sdk/src/objects/object-utils";

export const ObjectDefinition: IObjectAppDefinition = {
  type: VIDEO_SOURCE_UNMUTE,
  group: "media",
  meta: objectMeta,
  createObject,
  sizeUpdate,
  getHtml: getHtmlForApp,
  preload,
  PRELOAD_ORDER,
  executionCode_Start: objectStart,
  executionCode_Stop: objectStop,
  postProcess,
};

addObjectToGlobalScope(VIDEO_SOURCE_UNMUTE, ObjectDefinition);
