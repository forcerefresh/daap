/**
 * This is a entry point for Object used in Web Slider App.
 */

import { VIDEO_TARGET } from "./src/video-target-types";
import { postProcess } from "./src/video-target-player";
import {
  createObject,
  getAssetsUrls,
  getHtmlForApp,
  objectMeta,
} from "./src/video-target-app";
import { IObjectAppDefinition } from "webslider-sdk2/lib/objects/objects-register";
import { addAppObjectToGlobalScope } from "webslider-sdk2/lib/objects/object-utils";

export const ObjectDefinition: IObjectAppDefinition = {
  type: VIDEO_TARGET,
  group: "media",
  meta: objectMeta,
  createObject,
  getHtml: getHtmlForApp,
  postProcess,
  getAssetsUrls,
};

// Object adds itself to global scope in order to be used by Web Slider App or Player
addAppObjectToGlobalScope(VIDEO_TARGET, ObjectDefinition);
