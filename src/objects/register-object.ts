import { IObjectDefinitionHolder, registerObject } from "./objects-factory";
import {
  createYoutubeVideoObject,
  getYoutubeExecutionCode,
  getYoutubeVideoHtml,
} from "./youtube-video/youtube-video";

registerObject(
  "youtube_video",
  "media",
  createYoutubeVideoObject,
  getYoutubeVideoHtml,
  getYoutubeExecutionCode
);
