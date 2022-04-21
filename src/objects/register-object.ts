import {
  createDelayObject,
  delayMeta,
  delayObject_Start,
  delayObject_Stop,
  getDelayHtml,
  preloadDelay,
} from "./delay/delay";
import {
  createImageObject,
  getAssetsUrls,
  getImageHtml,
  imageMeta,
  preloadImage,
} from "./image/image";
import {
  createMultiImageObject,
  getMultiImageAssetsUrls,
  getMultiImageHtml,
  multiImageMeta,
  preloadMultiImage,
} from "./multiple-images/multiple-images";
import { IObjectDefinitionHolder, registerObject } from "./objects-factory";
import {
  createSpinnerObject,
  getSpinnerHtml,
  spinnerMeta,
} from "./spinner/spinner";
import {
  createTextObject,
  getTextHtml,
  preloadText,
  textMeta,
} from "./text/text";
import {
  createTrianglifyObject,
  getTrianglifyHtml,
  trianglifyMeta,
  trianglifyObject_Start,
} from "./trianglify/trianglify";
import {
  createYoutubeVideoObject,
  getYoutubeExecutionCode_Start,
  getYoutubeExecutionCode_Stop,
  getYoutubeVideoHtml,
  postProcessYoutube,
  preloadYoutube,
  youtubeVideoMeta,
} from "./youtube-video/youtube-video";

registerObject(
  "youtube_video",
  "media",
  youtubeVideoMeta,
  createYoutubeVideoObject,
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
  getSpinnerHtml
);

registerObject(
  "image",
  "media",
  imageMeta,
  createImageObject,
  getImageHtml,
  preloadImage,
  undefined,
  undefined,
  undefined,
  getAssetsUrls
);

registerObject(
  "delay",
  "other",
  delayMeta,
  createDelayObject,
  getDelayHtml,
  preloadDelay,
  delayObject_Start,
  delayObject_Stop
);

registerObject(
  "trianglify",
  "media",
  trianglifyMeta,
  createTrianglifyObject,
  getTrianglifyHtml,
  undefined,
  trianglifyObject_Start
);

registerObject(
  "multi_image",
  "media",
  multiImageMeta,
  createMultiImageObject,
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
  getTextHtml,
  preloadText
);
