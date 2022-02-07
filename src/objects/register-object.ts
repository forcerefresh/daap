import {
  createImageObject,
  getImageHtml,
  imageMeta,
  preloadImage,
} from "./image/image";
import {
  createMultiImageObject,
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
  preloadImage
);

registerObject(
  "multi_image",
  "media",
  multiImageMeta,
  createMultiImageObject,
  getMultiImageHtml,
  preloadMultiImage
);

registerObject(
  "text",
  "text",
  textMeta,
  createTextObject,
  getTextHtml,
  preloadText
);
