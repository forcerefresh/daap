import { VIDEO_SOURCE_UNMUTE } from "./src/types";
import {
  objectStart,
  objectStop,
  getHtml,
  postProcess,
  preload,
  sizeUpdate,
} from "./src/video-source-unmute";
import { addObjectToGlobalScope } from "../../../src/webslider-sdk/src/objects/object-utils";
import { IObjectDefinition } from "../../../src/webslider-sdk/src/objects/objects-register";

export const ObjectDefinition: IObjectDefinition = {
  type: VIDEO_SOURCE_UNMUTE,
  sizeUpdate,
  getHtml,
  preload,
  executionCode_Start: objectStart,
  executionCode_Stop: objectStop,
  postProcess,
};

addObjectToGlobalScope(VIDEO_SOURCE_UNMUTE, ObjectDefinition);
