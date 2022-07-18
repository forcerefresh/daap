import { VIDEO_SOURCE } from "./src/types";
import {
  videoSourcePreload,
  videoSourceStart,
  PRELOAD_ORDER,
  videoSourceSizeUpdate,
  getHtml,
} from "./src/video-source";
import { addObjectToGlobalScope } from "../../../src/webslider-sdk/src/objects/object-utils";
import { IObjectDefinition } from "../../../src/webslider-sdk/src/objects/objects-register";

export const VideSourceDefinition: IObjectDefinition = {
  type: VIDEO_SOURCE,
  getHtml,
  preload: videoSourcePreload,
  executionCode_Start: videoSourceStart,
  sizeUpdate: videoSourceSizeUpdate,
  PRELOAD_ORDER,
};

addObjectToGlobalScope(VIDEO_SOURCE, VideSourceDefinition);
