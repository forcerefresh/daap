import {
  createImageObject,
  getImageHtml,
  imageMeta,
  preloadImage,
} from "./image/image";
import { IObjectDefinitionHolder, registerObject } from "./objects-factory";
import {
  createSpinnerObject,
  getSpinnerHtml,
  spinnerMeta,
} from "./spinner/spinner";
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
