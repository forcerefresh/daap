/**
 * This is a entry point for Object used in Web Slider Player.
 */

import { VIDEO_TARGET } from "./src/video-target-types";
import {
  objectStart,
  objectStop,
  getHtml,
  preload,
  sizeUpdate,
  PRELOAD_ORDER,
} from "./src/video-target-player";
import { addPlayerObjectToGlobalScope } from "../../../src/webslider-sdk/src/objects/object-utils";
import { IObjectDefinition } from "../../../src/webslider-sdk/src/objects/objects-register";

export const ObjectDefinition: IObjectDefinition = {
  type: VIDEO_TARGET,
  getHtml,
  sizeUpdate,
  preload,
  execStart: objectStart,
  execStop: objectStop,
  preloadOrder: PRELOAD_ORDER,
};

// Object adds itself to global scope in order to be used by Web Slider App or Player
addPlayerObjectToGlobalScope(VIDEO_TARGET, ObjectDefinition);
