import { VIDEO_SOURCE } from "./src/types";
import {
  videoSourcePreload,
  videoSourceStart,
  PRELOAD_ORDER,
  videoSourceSizeUpdate,
} from "./src/video-source";
import { addObjectToGlobalScope } from "../../../src/webslider-sdk/src/objects/object-utils";
import { IObjectDefinition } from "../../../src/webslider-sdk/src/objects/objects-register";
import { getVideoSourceHtml } from "./src/video-source-form";

export const VideSourceDefinition: IObjectDefinition = {
  type: VIDEO_SOURCE,
  preload: videoSourcePreload,
  executionCode_Start: videoSourceStart,
  sizeUpdate: videoSourceSizeUpdate,
  getHtml: getVideoSourceHtml,
  PRELOAD_ORDER,
};

addObjectToGlobalScope(VIDEO_SOURCE, VideSourceDefinition);
