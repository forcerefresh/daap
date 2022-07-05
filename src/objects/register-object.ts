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
  imageSizeUpdate,
  preloadImage,
} from "./image/image";
import {
  createMultiImageObject,
  getMultiImageAssetsUrls,
  getMultiImageHtml,
  multiImageMeta,
  multiimageSizeUpdate,
  preloadMultiImage,
} from "./multiple-images/multiple-images";
import { registerObject } from "../webslider-sdk/src/objects/objects-register";
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
  videoSizeUpdate,
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
  getBulletsHtml
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
  "image",
  "media",
  imageMeta,
  createImageObject,
  imageSizeUpdate,
  getImageHtml,
  preloadImage,
  undefined,
  undefined,
  undefined,
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
  "other",
  svgMeta,
  createSvgObject,
  svgSizeUpdate,
  getSvgHtml
);

registerObject(
  "html",
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
  getVideoHtml
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

registerObject(
  "json_source",
  "other",
  jsonSourceMeta,
  createJsonSource,
  jsonSourceSizeUpdate,
  getJsonSourceHtml,
  jsonSourcePreload,
  jsonSourceStart
);

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

registerObject(
  "trianglify",
  "media",
  trianglifyMeta,
  createTrianglifyObject,
  trianglifySizeUpdate,
  getTrianglifyHtml
);

registerObject(
  "multi_image",
  "media",
  multiImageMeta,
  createMultiImageObject,
  multiimageSizeUpdate,
  getMultiImageHtml,
  preloadMultiImage,
  undefined,
  undefined,
  undefined
  //getMultiImageAssetsUrls // TODO: IMPORTANT
);

registerObject(
  "text",
  "text",
  textMeta,
  createTextObject,
  textSizeUpdate,
  getTextHtml,
  preloadText
);

registerObject(
  "text_target",
  "text",
  textTargetMeta,
  createTextTarget,
  textTargetSizeUpdate,
  getTextTargetHtml,
  preloadTextTarget,
  textTargetStart
);

registerObject(
  "rich_text",
  "text",
  richMeta,
  createRichTextObject,
  richTextSizeUpdate,
  getRichTextHtml,
  preloadText
);
