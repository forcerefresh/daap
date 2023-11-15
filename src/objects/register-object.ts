import {
  arrowMeta,
  arrowSizeUpdate,
  createArrowObject,
  getArrowHtml,
} from "./arrow/arrow";
import {
  bulletsMeta,
  bulletsSizeUpdate,
  createBulletsObject,
  getBulletsAssetsUrls,
  getBulletsHtml,
} from "./bullets/bullets";
import {
  buttonMeta,
  buttonSizeUpdate,
  createButtonObject,
  getButtonHtml,
} from "./button/button";
/*
import {
  countdownMeta,
  countdownObject_Start,
  countdownObject_Stop,
  countdownSizeUpdate,
  createCountdownObject,
  getCountdownHtml,
  preloadCountdown,
} from "./contdown/countdown";*/

import {
  createDelayObject,
  delayMeta,
  delayObject_Start,
  delayObject_Stop,
  delaySizeUpdate,
  getDelayHtml,
  preloadDelay,
} from "./delay/delay";
import {
  createFrameObject,
  frameMeta,
  frameSizeUpdate,
  getFrameHtml,
} from "./frame/frame";
import {
  createHtmlObject,
  getHtmlHtml,
  htmlMeta,
  htmlSizeUpdate,
} from "./html/html";
import {
  createImageObject,
  getAssetsUrls,
  getImageHtml,
  imageMeta,
  imagePostProcess,
  imageSizeUpdate,
  preloadImage,
} from "./image/image";
import {
  createMultiImageObject,
  getMultiImageAssetsUrls,
  getMultiImageHtml,
  multiImageMeta,
  multiImagePostProcess,
  multiImageSizeUpdate,
  preloadMultiImage,
} from "./multiple-images/multiple-images";
import { registerObject } from "webslider-sdk/lib/objects/objects-register";
import {
  createRichTextObject,
  richMeta,
  richTextSizeUpdate,
  getRichTextHtml,
} from "./rich-text/rich-text";
import {
  createSpinnerObject,
  getSpinnerHtml,
  spinnerMeta,
  spinnerSizeUpdate,
} from "./spinner/spinner";
import { createSvgObject, getSvgHtml, svgMeta, svgSizeUpdate } from "./svg/svg";
import {
  createTextObject,
  getTextHtml,
  preloadText,
  textMeta,
  textSizeUpdate,
  getFonts,
  TEXT,
} from "./text/text";
import {
  createTrianglifyObject,
  getTrianglifyHtml,
  trianglifyMeta,
  trianglifySizeUpdate,
} from "./trianglify/trianglify";
import {
  createVideoObject,
  getVideoHtml,
  videoMeta,
  videoPostProcess,
  videoSizeUpdate,
  getAssetsUrls as getVideoAssetsUrls,
  video_objectStart,
  video_objectStop,
  preloadVideo,
} from "./video/video";
import {
  createJsonSource,
  getJsonSourceHtml,
  jsonSourceMeta,
  jsonSourcePreload,
  jsonSourceSizeUpdate,
  jsonSourceStart,
} from "./json-loader/json-source";
import {
  createTextTarget,
  getTextTargetHtml,
  preloadTextTarget,
  textTargetMeta,
  textTargetSizeUpdate,
  textTargetStart,
} from "./text-target/text-target";
import {
  FREE_DRAW,
  createFreeDrawObject,
  freeDrawMeta,
  freeDrawSizeUpdate,
  getFreeDrawHtml,
} from "./free-draw/free-draw";
import { registerObjectTool } from "./objectToolFactory";
import FreeHandDrawTool from "./free-draw/free-draw-stage-tool";
import TextTool from "./text/text-tool";
import { FreeDrawToolbar } from "./free-draw/FreeDrawToolbar";

registerObject(
  "button",
  "navigation",
  buttonMeta,
  createButtonObject,
  buttonSizeUpdate,
  getButtonHtml
);

registerObject(
  "arrow",
  "navigation",
  arrowMeta,
  createArrowObject,
  arrowSizeUpdate,
  getArrowHtml
);

registerObject(
  "bullets",
  "navigation",
  bulletsMeta,
  createBulletsObject,
  bulletsSizeUpdate,
  getBulletsHtml,
  undefined,
  undefined,
  undefined,
  undefined,
  getBulletsAssetsUrls
);

registerObject(
  "spinner",
  "navigation",
  spinnerMeta,
  createSpinnerObject,
  spinnerSizeUpdate,
  getSpinnerHtml
);

registerObject(
  FREE_DRAW,
  "media",
  freeDrawMeta,
  createFreeDrawObject,
  freeDrawSizeUpdate,
  getFreeDrawHtml,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined
);

registerObjectTool({
  type: FREE_DRAW,
  meta: freeDrawMeta,
  toolClass: FreeHandDrawTool,
  toolBar: FreeDrawToolbar,
});

registerObject(
  "image",
  "media",
  imageMeta,
  createImageObject,
  imageSizeUpdate,
  getImageHtml,
  preloadImage,
  undefined,
  undefined,
  imagePostProcess,
  getAssetsUrls
);

registerObject(
  "frame",
  "other",
  frameMeta,
  createFrameObject,
  frameSizeUpdate,
  getFrameHtml
);

registerObject(
  "svg",
  "media",
  svgMeta,
  createSvgObject,
  svgSizeUpdate,
  getSvgHtml
);

registerObject(
  "html-object",
  "other",
  htmlMeta,
  createHtmlObject,
  htmlSizeUpdate,
  getHtmlHtml
);

registerObject(
  "video",
  "media",
  videoMeta,
  createVideoObject,
  videoSizeUpdate,
  getVideoHtml,
  preloadVideo,
  video_objectStart,
  video_objectStop,
  videoPostProcess,
  getVideoAssetsUrls
);

registerObject(
  "delay",
  "other",
  delayMeta,
  createDelayObject,
  delaySizeUpdate,
  getDelayHtml,
  preloadDelay,
  delayObject_Start,
  delayObject_Stop
);

// registerObject(
//   "json_source",
//   "other",
//   jsonSourceMeta,
//   createJsonSource,
//   jsonSourceSizeUpdate,
//   getJsonSourceHtml,
//   jsonSourcePreload,
//   jsonSourceStart
// );

/*
registerObject(
  "countdown",
  "other",
  countdownMeta,
  createCountdownObject,
  countdownSizeUpdate,
  getCountdownHtml,
  preloadCountdown,
  countdownObject_Start,
  countdownObject_Stop
);*/

// registerObject(
//   "trianglify",
//   "media",
//   trianglifyMeta,
//   createTrianglifyObject,
//   trianglifySizeUpdate,
//   getTrianglifyHtml
// );

registerObject(
  "multi-image-object",
  "media",
  multiImageMeta,
  createMultiImageObject,
  multiImageSizeUpdate,
  getMultiImageHtml,
  preloadMultiImage,
  undefined,
  undefined,
  multiImagePostProcess,
  getMultiImageAssetsUrls
);

registerObject(
  TEXT,
  "text",
  textMeta,
  createTextObject,
  textSizeUpdate,
  getTextHtml,
  preloadText,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  getFonts
);

registerObjectTool({ type: TEXT, meta: textMeta, toolClass: TextTool });

// registerObject(
//   "text_target",
//   "text",
//   textTargetMeta,
//   createTextTarget,
//   textTargetSizeUpdate,
//   getTextTargetHtml,
//   preloadTextTarget,
//   textTargetStart
// );

registerObject(
  "rich-text-object",
  "text",
  richMeta,
  createRichTextObject,
  richTextSizeUpdate,
  getRichTextHtml,
  preloadText
);
