import { ClientRequest } from "http";
import { cloneDeep } from "lodash-es";
import { v4 as uuid } from "uuid";

import {
  ICheckboxInput,
  IInfoInput,
  InputType,
  ISliderInput,
  ITextInput,
} from "../../inputs/types";
import {
  FormType,
  IFormSwitchGroup,
  IFormSwitchGroupItem,
} from "../../utils/form-layout/i-form-layout";
import { createCommonObject } from "../create-object-factory";
import { getObjectPlaceholder } from "../object-helpers";
import { PreloadOrder } from "../objects-factory";
import { ICommonObjectProperties, IObject } from "../types";
import { YTPlayerManager } from "./player-manager";
import svg from "./youtube-video-icon.svg";
import { YTIFrameAPILoader } from "./yt-api-loader";
declare const YT: any;

const ytAPIPreloader = new YTIFrameAPILoader();
const ytPlayerManager = new YTPlayerManager();

const YOUTUBE_VIDEO = "youtube_video";

export type YoutubeVideoPropertiesTuple = [
  ITextInput<"videoId">,
  ISliderInput<"volume">,
  IFormSwitchGroupItem<
    "preset",
    [
      IFormSwitchGroup<[IInfoInput]>,
      IFormSwitchGroup<
        [
          ICheckboxInput<"preload">,
          ICheckboxInput<"autoPlay">,
          ICheckboxInput<"loop">,
          ICheckboxInput<"controls">,
          ICheckboxInput<"keyboard">,
          ICheckboxInput<"fullscreen">,
          ICheckboxInput<"logo">,
          ICheckboxInput<"related">
        ]
      >
    ]
  >
];

export interface YoutubeVideoValues {
  videoId: string;
  preload: boolean;
  preset: "minimal" | "full";
  autoPlay: boolean;
  loop: boolean;
  controls: boolean;
  keyboard: boolean;
  fullscreen: boolean;
  logo: boolean;
  related: boolean;
  volume: number;
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
    {
      displayName: "Volume",
      propertyName: "volume",
      inputType: InputType.SLIDER_INPUT,
      value: {} as any,
      defaultValue: {} as any,
      inputProps: {
        min: 0,
        max: 100,
        stepSize: 1,
        labelStepSize: 1,
      },
    },
    {
      propertyName: "preset",
      displayName: " ",
      type: FormType.SWITCH_GROUP,
      groups: [
        {
          groupName: "Minimal",
          groupValue: "minimal",
          elements: [
            {
              inputType: InputType.INFO,
              displayName: "      ",
              helperText:
                "Minimal player preload and plays only video in loop. This option is suitable for playing background videos.",
            },
          ],
        },
        {
          groupName: "Regular",
          groupValue: "full",
          elements: [
            {
              displayName: "Preload",
              propertyName: "preload",
              inputType: InputType.CHECKBOX,
              defaultValue: true,
              value: true,
            },
            {
              displayName: "Auto play",
              propertyName: "autoPlay",
              inputType: InputType.CHECKBOX,
              defaultValue: true,
              value: true,
            },
            {
              displayName: "Loop",
              propertyName: "loop",
              inputType: InputType.CHECKBOX,
              defaultValue: true,
              value: true,
            },

            {
              displayName: "Controls",
              propertyName: "controls",
              inputType: InputType.CHECKBOX,
              defaultValue: true,
              value: true,
            },
            {
              displayName: "Keyboard",
              propertyName: "keyboard",
              inputType: InputType.CHECKBOX,
              defaultValue: true,
              value: true,
            },
            {
              displayName: "Fullscreen",
              propertyName: "fullscreen",
              inputType: InputType.CHECKBOX,
              defaultValue: true,
              value: true,
            },
            {
              displayName: "Logo",
              propertyName: "logo",
              inputType: InputType.CHECKBOX,
              defaultValue: true,
              value: true,
            },
            {
              displayName: "Related",
              propertyName: "related",
              inputType: InputType.CHECKBOX,
              defaultValue: true,
              value: true,
            },
          ],
        },
      ],
    },
  ];

  const values: YoutubeVideoValues = {
    videoId: "",
    preload: true,
    preset: "minimal",
    autoPlay: true,
    controls: false,
    fullscreen: false,
    keyboard: false,
    logo: false,
    loop: true,
    related: false,
    volume: 100,
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
  const ytValues = object.definition.values as YoutubeVideoValues;

  if (!isPlayer) {
    if (!ytValues.videoId) {
      return getObjectPlaceholder(`YOUTUBE VIDEO<br/>(Video ID is not set)`);
    } else if (!isPlayer) {
      let style = "";
      style += "width: 100%;";
      style += "height: 100%;";
      style += `background-image:url('https://img.youtube.com/vi/${ytValues.videoId}/sddefault.jpg');`;
      style += `background-repeat:no-repeat;`;
      style += `background-size: cover;`;
      style += `background-position: center center`;

      return `<div class="object-content" style="${style}"></div>`;
    }
  }

  const origW = parseInt(calculatedObjectSize.width);
  const origH = parseInt(calculatedObjectSize.height);

  let h = origH;
  let w = origW;
  let top = 0;
  let left = 0;
  if (origW / origH > 16 / 9) {
    // wide
    h = origW * (9 / 16);
    top = (h - origH) / 2;
  }
  /* const width = parseInt(calculatedObjectSize.width);
  const height = parseInt(calculatedObjectSize.width) * (9 / 16);
  const top =
    height > parseInt(calculatedObjectSize.height)
      ? (height - parseInt(calculatedObjectSize.height)) / 2
      : 0;
*/
  const css = `
  <style>
    .yt-container_${object.id} {
      overflow: hidden;
      width: ${origW}px;
      height:${origH}px;
      ${ytValues.preset === "minimal" ? "pointer-events: none;" : ""}
    }
    .yt-container-inner_${object.id} {
     ${
       ytValues.preset === "minimal"
         ? `margin-top:-${top}px; width: ${w}px; height:${h}px;`
         : ""
     }
    }
    .yt-container-inner_${object.id} iframe {
      ${
        ytValues.preset === "minimal"
          ? "width: 500%; margin-left: -200%; height: 100%;"
          : ""
      }
          
    }
  </style>`;

  const videoHtml = `<div class="yt-container_${object.id}"><div class="yt-container-inner_${object.id}"><div id="player_${object.id}"></div></div></div>${css}`;
  return videoHtml;
}

export async function preloadYoutube(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  const { id, values, calculatedObjectSize } = props;
  const ytValues = values as YoutubeVideoValues;

  await ytAPIPreloader.subscribe();

  const existingP = ytPlayerManager.getPlayer(id);

  if (existingP) {
    existingP.destroy();
    ytPlayerManager.remove(id);
  }

  const readyPromise = new Promise<{ id: string; player: any }>((resolve) => {
    createVideo(id, ytValues, resolve, calculatedObjectSize);
  });

  const data = await readyPromise;

  ytPlayerManager.addPlayer(data.id, data.player);

  return id;
}

function createVideo(
  id: string,
  values: YoutubeVideoValues,
  callback: (props: { id: string; player: any }) => void,
  calculatedObjectSize: any
) {
  const player = new YT.Player("player_" + id, {
    height: parseInt(calculatedObjectSize.height),
    width: parseInt(calculatedObjectSize.width),
    videoId: values.videoId,
    playerVars: {
      playsinline: 1,
      rel: values.related ? 1 : 0,
      autoplay: 0,
      controls: values.controls ? 1 : 0,
      disablekb: values.keyboard ? 0 : 1,
      loop: values.loop ? 1 : 0,
      ...(values.loop ? { playlist: values.videoId } : {}),
      modestbranding: values.logo ? 0 : 1,
      fs: values.fullscreen ? 1 : 0,
    },
    events: {
      onReady: (event: any) => {
        event.target.setVolume(values.volume);
        if (values.autoPlay || values.preload) player.playVideo();
        else if (!values.preload) {
          callback({ id, player });
        }
      },
      onStateChange: (event: any) => {
        if (values.autoPlay || values.preload) {
          if (event.data === 1) {
            callback({ id, player });
          }
        }
      },
    },
  });
}

export async function getYoutubeExecutionCode_Start(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}) {
  const { id, className, values, calculatedObjectSize } = props;
  const ytValues = values as YoutubeVideoValues;

  if (!ytValues.preload) {
    await preloadYoutube(props);
  }

  const player = ytPlayerManager.getPlayer(id);
  console.log(id);
  console.log(player);
  if (ytValues.autoPlay) {
    player!.playVideo();
  }
}

export async function getYoutubeExecutionCode_Stop(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}) {
  const { id } = props;
  const existingP = ytPlayerManager.getPlayer(id);
  console.log(id);
  console.log(ytPlayerManager);
  console.log(existingP);

  if (existingP) {
    existingP.destroy();
    ytPlayerManager.remove(id);
  }
}

export function postProcessYoutube(
  prevObject: IObject,
  object: IObject
): IObject {
  const newObj = cloneDeep(object);

  const values = newObj.definition.values as YoutubeVideoValues;
  if (values.preset === "minimal") {
    values.preload = true;
    values.autoPlay = true;
    values.controls = false;
    values.fullscreen = false;
    values.keyboard = false;
    values.logo = false;
    values.loop = true;
    values.related = false;
  } else if (
    prevObject.definition.values.preset === "minimal" &&
    newObj.definition.values.preset === "full"
  ) {
    values.preload = true;
    values.autoPlay = true;
    values.controls = true;
    values.fullscreen = true;
    values.keyboard = true;
    values.logo = true;
    values.loop = false;
    values.related = false;
  }

  return newObj;
}
export const youtubeVideoMeta = {
  name: "YOUTUBE VIDEO",
  description: "Add youtube video",
  preloadOrder: PreloadOrder.LAST,
  icon: svg,
};
