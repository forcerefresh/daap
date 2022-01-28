import classNames from "classnames";
import { v4 as uuid } from "uuid";
import { InputType, ITextInput, VideoValues } from "../../inputs/types";
import { createCommonObject } from "../create-object-factory";
import { ICommonObjectProperties, IObject } from "../types";
import svg from "./youtube-video-icon.svg";
declare const YT: any;

const YOUTUBE_VIDEO = "youtube_video";

export type YoutubeVideoPropertiesTuple = [ITextInput<"videoId">];

export interface YoutubeVideoValues {
  videoId: string;
}

export function createYoutubeVideoObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<YoutubeVideoPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(YOUTUBE_VIDEO);

  const properties: YoutubeVideoPropertiesTuple = [
    {
      displayName: "Video ID",
      propertyName: "videoId",
      inputType: InputType.TEXT,
      value: "",
      defaultValue: "",
    },
  ];

  const values: YoutubeVideoValues = {
    videoId: "",
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: YOUTUBE_VIDEO,
      properties,
      values,
      valuesMetadata: {},
    },
  };
}

export function getYoutubeVideoHtml(
  object: IObject,
  calculatedObjectSize: any,
  isPlayer: boolean
) {
  const ytProperties = object.definition.values as YoutubeVideoValues;

  if (!isPlayer) {
    if (!ytProperties.videoId) {
      return `<div style="border: 6px dashed gray; text-shadow: 1px 1px 2px black; color: gray; font-weight: bold; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;; height: 100%;">YOUTUBE VIDEO<br/>(Video ID is not set)</div>`;
    } else if (!isPlayer) {
      return `<div style="border: 6px dashed gray; text-shadow: 1px 1px 2px black; color: gray; font-weight: bold; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;; height: 100%;">YOUTUBE VIDEO<br/>ID:${ytProperties.videoId}</div>`;
    }
  }
  const width = parseInt(calculatedObjectSize.width);
  const height = parseInt(calculatedObjectSize.width) * (9 / 16);
  const top =
    height > parseInt(calculatedObjectSize.height)
      ? (height - parseInt(calculatedObjectSize.height)) / 2
      : 0;

  const css = `
  <style>
    .yt-container {
      overflow: hidden;
      width: ${calculatedObjectSize.width};
      height:${calculatedObjectSize.height};
      pointer-events: none;
    }
    .yt-container-inner {
      //overflow: hidden;
      margin-top:-${top}px;
      width: ${calculatedObjectSize.width};
      height:${height}px;
    }
    .yt-container-inner iframe {
      /* Extend it beyond the viewport... */
      width: 500%;
      height: 100%;
      //margin-top:-100px;
      /* ...and bring it back again */
      margin-left: -200%;
    }
  </style>`;

  const videoHtml = `<div class="yt-container"><div class="yt-container-inner"><div id="player"></div></div>${css}`;
  return videoHtml;
}

export function getYoutubeExecutionCode(
  className: string,
  values: { [key: string]: any },
  calculatedObjectSize: any
) {
  const videoValues = values as YoutubeVideoValues;

  //--------------------------------T|O|D|O
  /*const player = new (window as any).YTPlayer("#player", {
      controls: false,
      autoplay: true,
      annotations: false,
      related: false,
    });
    console.log("-----------------------");
    player.load("CGsOqLxBW40", true);
    player.setVolume(100);

    player.on("playing", () => {
      console.log(player.getDuration()); // => 351.521
    });*/

  // 2. This code loads the IFrame Player API code asynchronously.
  var tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag!.parentNode!.insertBefore(tag, firstScriptTag);

  // 3. This function creates an <iframe> (and YouTube player)
  //    after the API code downloads.
  var player: any;
  if (typeof YT !== "undefined") {
    player = new YT.Player("player", {
      height: "360",
      width: "640",
      videoId: videoValues.videoId,
      playerVars: {
        playsinline: 1,
        ref: 0,
        autoplay: 1,
        controls: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  } else {
    (window as any).onYouTubeIframeAPIReady = () => {
      player = new YT!.Player("player", {
        height: "390",
        width: "640",
        videoId: videoValues.videoId,
        playerVars: {
          playsinline: 1,
          autoplay: 1,
          controls: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };
  }
  // 4. The API will call this function when the video player is ready.
  function onPlayerReady(event: any) {
    //event.target.playVideo();
    //document.querySelector("." + className);
  }

  // 5. The API calls this function when the player's state changes.
  //    The function indicates that when playing a video (state=1),
  //    the player should play for six seconds and then stop.
  var done = false;
  function onPlayerStateChange(event: any) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
      //setTimeout(stopVideo, 6000);
      //done = true;
    }
  }
  function stopVideo() {
    player.stopVideo();
  }
}

export const youtubeVideoMeta = {
  name: "YOUTUBE VIDEO",
  description: "Add youtube video",
  icon: svg,
};
