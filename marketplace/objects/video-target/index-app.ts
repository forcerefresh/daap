import { VIDEO_TARGET } from "./src/types";
import {
  objectStart,
  objectStop,
  preload,
  sizeUpdate,
} from "./src/video-target";
import {
  createObject,
  getHtmlForApp,
  objectMeta,
} from "./src/video-target-form";
import { IObjectAppDefinition } from "../../../src/webslider-sdk/src/objects/objects-register";
import { addObjectToGlobalScope } from "../../../src/webslider-sdk/src/objects/object-utils";

export const ObjectDefinition: IObjectAppDefinition = {
  type: VIDEO_TARGET,
  group: "media",
  meta: objectMeta,
  createObject,
  sizeUpdate,
  getHtml: getHtmlForApp,
  executionCode_Start: objectStart,
  executionCode_Stop: objectStop,
  preload,
};

addObjectToGlobalScope(VIDEO_TARGET, ObjectDefinition);
