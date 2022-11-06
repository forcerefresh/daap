/**
 * This is a entry point for Object used in Web Slider App.
 */

import { VIDEO_SOURCE_UNMUTE } from "./src/video-source-unmute-types";
import { postProcess } from "./src/video-source-unmute-player";
import {
  createObject,
  getAssetsUrls,
  getHtmlForApp,
  objectMeta,
} from "./src/video-source-unmute-app";
import { IObjectAppDefinition } from "webslider-sdk/lib/objects/objects-register";
import { addAppObjectToGlobalScope } from "webslider-sdk/lib/objects/object-utils";

export const ObjectDefinition: IObjectAppDefinition = {
  type: VIDEO_SOURCE_UNMUTE,
  group: "media",
  meta: objectMeta,
  createObject,
  getHtml: getHtmlForApp,
  postProcess,
  getAssetsUrls,
};

// Object adds itself to global scope in order to be used by Web Slider App or Player
addAppObjectToGlobalScope(VIDEO_SOURCE_UNMUTE, ObjectDefinition);
