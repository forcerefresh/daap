import { VIDEO_SOURCE } from "./src/types";
import {
  videoSourceMeta,
  createVideoSourceObject,
  getVideoSourceHtml,
} from "./src/video-source-form";
import {
  videoSourcePreload,
  videoSourceSizeUpdate,
  videoSourceStart,
} from "./src/video-source";
import { IObjectAppDefinition } from "../../../src/webslider-sdk/src/objects/objects-register";
import { addObjectToGlobalScope } from "../../../src/webslider-sdk/src/objects/object-utils";

export const VideoSourceDefinition: IObjectAppDefinition = {
  type: VIDEO_SOURCE,
  group: "media",
  meta: videoSourceMeta,
  createObject: createVideoSourceObject,
  sizeUpdate: videoSourceSizeUpdate,
  executionCode_Start: videoSourceStart,
  preload: videoSourcePreload,
  getHtml: getVideoSourceHtml,
};

addObjectToGlobalScope(VIDEO_SOURCE, VideoSourceDefinition);
