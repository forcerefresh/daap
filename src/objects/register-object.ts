import {
  countdownMeta,
  countdownObject_Start,
  countdownObject_Stop,
  countdownSizeUpdate,
  createCountdownObject,
  getCountdownHtml,
  preloadCountdown,
} from "./contdown/countdown";
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
import { IObjectDefinitionHolder, registerObject } from "./objects-factory";
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
  createYoutubeVideoObject,
  getYoutubeExecutionCode_Start,
  getYoutubeExecutionCode_Stop,
  getYoutubeVideoHtml,
  postProcessYoutube,
  preloadYoutube,
  youtubeVideoSizeUpdate,
  youtubeVideoMeta,
} from "./youtube-video/youtube-video";

registerObject(
  "youtube_video",
  "media",
  youtubeVideoMeta,
  createYoutubeVideoObject,
  youtubeVideoSizeUpdate,
  getYoutubeVideoHtml,
  preloadYoutube,
  getYoutubeExecutionCode_Start,
  getYoutubeExecutionCode_Stop,
  postProcessYoutube
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
  "countdown",
  "other",
  countdownMeta,
  createCountdownObject,
  countdownSizeUpdate,
  getCountdownHtml,
  preloadCountdown,
  countdownObject_Start,
  countdownObject_Stop
);

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
  undefined,
  getMultiImageAssetsUrls
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
