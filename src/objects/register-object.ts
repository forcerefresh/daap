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
  IMAGE,
  createImageObject,
  getAssetsUrls,
  getImageHtml,
  getImageObjectForm,
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
  getTextObjectForm,
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
  getFreeDrawForm,
  getFreeDrawHtml,
} from "./free-draw/free-draw";
import { registerObjectTool } from "./objectToolFactory";
import FreeHandDrawTool from "./free-draw/free-draw-stage-tool";
import TextTool from "./text/text-tool";
import { FreeDrawToolbar } from "./free-draw/FreeDrawToolbar";
import TextToolbar from "./text/TextToolbar";
import TextFloatingToolbar from "./text/TextFloatingBar";
import { ImageToolbar } from "./image/ImageToolbar";
// import {
//   BLOB,
//   blobMeta,
//   blobSizeUpdate,
//   createBlobObject,
//   getBlobHtml,
//   getBlobObjectForm,
// } from "./blob/blob";
import {
  createRectangleObject,
  getRectangleHtml,
  getRectangleObjectForm,
  RECTANGLE,
  rectangleMeta,
  rectangleSizeUpdate,
} from "./rectangle/rectangle";
import {
  CIRCLE,
  circleMeta,
  circleSizeUpdate,
  createCircleObject,
  getCircleHtml,
  getCircleObjectForm,
} from "./circle/circle";
import {
  createStarObject,
  getStarHtml,
  getStarObjectForm,
  STAR,
  starMeta,
  starSizeUpdate,
} from "./star/star";
import {
  createPolygonObject,
  getPolygonHtml,
  getPolygonObjectForm,
  POLYGON,
  polygonMeta,
  polygonSizeUpdate,
} from "./polygon/polygon";
import {
  createLineObject,
  getLineForm,
  getLineHtml,
  LINE,
  lineMeta,
  linePostProcess,
  lineSizeUpdate,
} from "./line/line";
import {
  createSvgMaskObject,
  getSvgMaskAssetsUrls,
  getSvgMaskHtml,
  getSvgMaskObjectForm,
  preloadSvgMaskImage,
  SVG_MASK,
  svgMaskMeta,
  svgMaskPostProcess,
  svgMaskSizeUpdate,
} from "./svg-mask/svg-mask";

// -------------------------

registerObject(
  TEXT,
  "1.0.0",
  "text",
  textMeta,
  createTextObject,
  getTextObjectForm,
  textSizeUpdate,
  getTextHtml,
  preloadText,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  getFonts,
);

registerObjectTool({
  type: TEXT,
  meta: textMeta,
  toolClass: TextTool,
  toolBar: TextToolbar,
  floatingBar: TextFloatingToolbar,
});

// forward compatibility
// registerObject(
//   "text",
//   "1.0.0",
//   "text",
//   textMeta,
//   createTextObject,
//   getTextObjectForm,
//   textSizeUpdate,
//   getTextHtml,
//   preloadText,
//   undefined,
//   undefined,
//   undefined,
//   undefined,
//   undefined,
//   getFonts
// );

registerObjectTool({
  type: "text",
  meta: textMeta,
  toolClass: TextTool,
  toolBar: TextToolbar,
  floatingBar: TextFloatingToolbar,
});
// -------------------------

registerObject(
  IMAGE,
  "1.0.0",
  "media",
  imageMeta,
  createImageObject,
  getImageObjectForm,
  imageSizeUpdate,
  getImageHtml,
  preloadImage,
  undefined,
  undefined,
  imagePostProcess,
  getAssetsUrls,
);

registerObject(
  SVG_MASK,
  "1.0.0",
  "media",
  svgMaskMeta,
  createSvgMaskObject,
  getSvgMaskObjectForm,
  svgMaskSizeUpdate,
  getSvgMaskHtml,
  preloadSvgMaskImage,
  undefined,
  undefined,
  svgMaskPostProcess,
  getSvgMaskAssetsUrls,
);

registerObjectTool({
  type: IMAGE,
  meta: imageMeta,
  // toolClass: TextTool,
  toolBar: ImageToolbar,
  // floatingBar: TextFloatingToolbar,
});

// backward compatibility
// registerObject(
//   "image",
//   "media",
//   imageMeta,
//   createImageObject,
//   getImageObjectForm,
//   imageSizeUpdate,
//   getImageHtml,
//   preloadImage,
//   undefined,
//   undefined,
//   imagePostProcess,
//   getAssetsUrls
// );

registerObjectTool({
  type: "image",
  meta: imageMeta,
  // toolClass: TextTool,
  toolBar: ImageToolbar,
  // floatingBar: TextFloatingToolbar,
});

// -------------------------

registerObject(
  FREE_DRAW,
  "1.0.0",
  "media",
  freeDrawMeta,
  createFreeDrawObject,
  getFreeDrawForm,
  freeDrawSizeUpdate,
  getFreeDrawHtml,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
);

registerObjectTool({
  type: FREE_DRAW,
  meta: freeDrawMeta,
  toolClass: FreeHandDrawTool,
  toolBar: FreeDrawToolbar,
});

// backward compatibility
// registerObject(
//   "free-draw",
//   "media",
//   freeDrawMeta,
//   createFreeDrawObject,
//   getFreeDrawForm,
//   freeDrawSizeUpdate,
//   getFreeDrawHtml,
//   undefined,
//   undefined,
//   undefined,
//   undefined,
//   undefined
// );

registerObjectTool({
  type: "free-draw",
  meta: freeDrawMeta,
  toolClass: FreeHandDrawTool,
  toolBar: FreeDrawToolbar,
});

// -------------------------

// registerObject(
//   BLOB,
//   "1.0.0",
//   "media",
//   blobMeta,
//   createBlobObject,
//   getBlobObjectForm,
//   blobSizeUpdate,
//   getBlobHtml,
//   undefined,
//   undefined,
//   undefined,
//   undefined,
//   undefined
// );

registerObject(
  RECTANGLE,
  "1.0.0",
  "media",
  rectangleMeta,
  createRectangleObject,
  getRectangleObjectForm,
  rectangleSizeUpdate,
  getRectangleHtml,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
);

registerObject(
  CIRCLE,
  "1.0.0",
  "media",
  circleMeta,
  createCircleObject,
  getCircleObjectForm,
  circleSizeUpdate,
  getCircleHtml,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
);

registerObject(
  STAR,
  "1.0.0",
  "media",
  starMeta,
  createStarObject,
  getStarObjectForm,
  starSizeUpdate,
  getStarHtml,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
);

registerObject(
  POLYGON,
  "1.0.0",
  "media",
  polygonMeta,
  createPolygonObject,
  getPolygonObjectForm,
  polygonSizeUpdate,
  getPolygonHtml,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
);

registerObject(
  LINE,
  "1.0.0",
  "media",
  lineMeta,
  createLineObject,
  getLineForm,
  lineSizeUpdate,
  getLineHtml,
  undefined,
  undefined,
  undefined,
  linePostProcess,
  undefined,
);

// -------------------------

// registerObject(
//   "svg",
//   "media",
//   svgMeta,
//   createSvgObject,
//   svgSizeUpdate,
//   getSvgHtml
// );

// -------------------------

// registerObject(
//   "button",
//   "navigation",
//   buttonMeta,
//   createButtonObject,
//   buttonSizeUpdate,
//   getButtonHtml
// );

// registerObject(
//   "arrow",
//   "navigation",
//   arrowMeta,
//   createArrowObject,
//   arrowSizeUpdate,
//   getArrowHtml
// );

// registerObject(
//   "bullets",
//   "navigation",
//   bulletsMeta,
//   createBulletsObject,
//   bulletsSizeUpdate,
//   getBulletsHtml,
//   undefined,
//   undefined,
//   undefined,
//   undefined,
//   getBulletsAssetsUrls
// );

// registerObject(
//   "spinner",
//   "navigation",
//   spinnerMeta,
//   createSpinnerObject,
//   spinnerSizeUpdate,
//   getSpinnerHtml
// );

// registerObject(
//   "frame",
//   "other",
//   frameMeta,
//   createFrameObject,
//   frameSizeUpdate,
//   getFrameHtml
// );

// registerObject(
//   "html-object",
//   "other",
//   htmlMeta,
//   createHtmlObject,
//   htmlSizeUpdate,
//   getHtmlHtml
// );

// registerObject(
//   "video",
//   "media",
//   videoMeta,
//   createVideoObject,
//   videoSizeUpdate,
//   getVideoHtml,
//   preloadVideo,
//   video_objectStart,
//   video_objectStop,
//   videoPostProcess,
//   getVideoAssetsUrls
// );

// registerObject(
//   "delay",
//   "other",
//   delayMeta,
//   createDelayObject,
//   delaySizeUpdate,
//   getDelayHtml,
//   preloadDelay,
//   delayObject_Start,
//   delayObject_Stop
// );

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

// registerObject(
//   "multi-image-object",
//   "media",
//   multiImageMeta,
//   createMultiImageObject,
//   multiImageSizeUpdate,
//   getMultiImageHtml,
//   preloadMultiImage,
//   undefined,
//   undefined,
//   multiImagePostProcess,
//   getMultiImageAssetsUrls
// );

//registerObjectTool({ type: TEXT, meta: textMeta, toolClass: TextTool });

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

// registerObject(
//   "rich-text-object",
//   "text",
//   richMeta,
//   createRichTextObject,
//   richTextSizeUpdate,
//   getRichTextHtml,
//   preloadText
// );
