import {
  ICoverPlacementInput,
  ICoverPlacementValue,
  InputType,
  IVideoInput,
  IVideoInputValue,
  IUnitsNumberInput,
  ICheckboxInput,
  ISliderInput,
  ISelectInput,
  IInfoInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";
import {
  ExecutionCodeFuncPropsType,
  ExecutionCodeFuncReturnType,
  GetAssetsUrlFuncPropsType,
  GetAssetsUrlFuncReturnType,
  GetHtmlFuncPropsType,
  PostProcessFuncPropsType,
  PostProcessFuncReturnType,
  PreloadOrder,
  UpdateObjectSizeFuncPropsType,
} from "webslider-sdk/lib/objects/objects-register";
import video from "./video-icon.svg?react";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import {
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";
import { getMediaSrc } from "../../integration/utils/local-media";
import { cloneDeep } from "lodash-es";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import {
  addTransformPropertiesToStyle,
  getTransformObjectPropertiesDefinition,
  getTransformPropertiesValues,
  TransformPropertiesValues,
} from "webslider-sdk/lib/objects/transform-properties";
import {
  addCommonStyleToObjectElementContent,
  addTransformStyleToObjectElementContent,
  getObjectElementById,
  getObjectWrapperElementById,
} from "../../animations/animation-utils";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import {
  convertTimeUnitToMs,
  getObjectValuesForDevice,
} from "webslider-sdk/lib/objects/object-utils";
import { VideoItem } from "webslider-sdk/lib/common/i-media-types";

const timeoutMap = new Map<string, NodeJS.Timeout | any>();

export const VIDEO = "video";

export type VideoPropertiesTuple = [
  ICoverPlacementInput<"videoFit">,
  IVideoInput<"video">,
  ISliderInput<"volume">,
  ICheckboxInput<"controls">,
  ICheckboxInput<"loop">,
  ICheckboxInput<"muted">,
  ICheckboxInput<"playsinline">,
  ISelectInput<"preload">,
  ICheckboxInput<"autoplay">,
  IUnitsNumberInput<"delayTime">,
  IUnitsNumberInput<"initialTime">,
  IInfoInput<"info">
];

export interface VideoValues {
  videoFit: ICoverPlacementValue;
  video: IVideoInputValue;
  initialTime: string;
  delayTime: string;
  volume: number;
  autoplay: boolean;
  controls: boolean;
  loop: boolean;
  muted: boolean;
  playsinline: boolean;
  preload: string;
}

export function createVideoObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<VideoPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(VIDEO);

  const properties: VideoPropertiesTuple = [
    {
      inputType: InputType.COVER_LAYOUT,
      displayName: "Video fit",
      propertyName: "videoFit",
      value: {
        size: "fill",
        positionHorizontal: "center",
        positionVertical: "center",
      },
      defaultValue: {
        size: "fill",
        positionHorizontal: "center",
        positionVertical: "center",
      },
      inputProps: { hidePosition: true },
    },
    {
      displayName: "Video",
      propertyName: "video",
      inputType: InputType.VIDEO,
      value: { video: {} },
      defaultValue: { video: {} },
    },
    {
      displayName: "Volume",
      propertyName: "volume",
      inputType: InputType.SLIDER_INPUT,
      value: 100,
      defaultValue: 100,
      inputProps: {
        min: 0,
        max: 100,
      },
    },
    {
      displayName: "Controls",
      propertyName: "controls",
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
      displayName: "Muted",
      propertyName: "muted",
      inputType: InputType.CHECKBOX,
      defaultValue: true,
      value: true,
    },
    {
      displayName: "Playsinline",
      propertyName: "playsinline",
      inputType: InputType.CHECKBOX,
      defaultValue: true,
      value: true,
    },
    {
      displayName: "Preload",
      propertyName: "preload",
      inputType: InputType.SELECT,
      value: {} as any,
      defaultValue: {} as any,
      options: [
        { label: "none", value: "none" },
        { label: "metadata", value: "metadata" },
        { label: "auto", value: "auto" },
      ],
    },
    {
      displayName: "Autoplay",
      propertyName: "autoplay",
      helperText: "Autoplay require muted",
      inputType: InputType.CHECKBOX,
      defaultValue: true,
      value: true,
    },
    {
      displayName: "Delay",
      propertyName: "delayTime",
      inputType: InputType.UNITS_NUMBER,
      value: "0ms",
      defaultValue: "0ms",
      allowedUnits: ["ms", "s"],
      helperText: "Works when Autoplay is on",
    },
    {
      displayName: "Initial time",
      propertyName: "initialTime",
      inputType: InputType.UNITS_NUMBER,
      value: "0ms",
      defaultValue: "0ms",
      allowedUnits: ["ms", "s"],
      helperText: "Works when Autoplay is on",
    },
    {
      displayName: "Info",
      inputType: InputType.INFO,
      helperText:
        "Autoplay works on desktop when video is Muted. Mobile devices disable Autoplay and use choose 'none' for Preload.",
    },
  ];

  const values: VideoValues = {
    videoFit: {
      size: "fill",
      positionHorizontal: "center",
      positionVertical: "center",
    },
    video: initialValue?.video || {
      video: { sourceType: "local" },
      filename: "",
      previewImage: {},
    },
    delayTime: "0s",
    initialTime: "0s",
    volume: 50,
    autoplay: false,
    controls: false,
    loop: false,
    muted: false,
    playsinline: false,
    preload: "auto",
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: VIDEO,
      properties,
      values,
      valuesMetadata: {
        ...{},
      },
    },
    commonStyleDefinition: {
      properties: [...getCommonObjectPropertiesDefinition(true)],
      values: { ...getCommonPropertiesValues() },
      valuesMetadata: { ...getCommonPropertiesMetadataValues() },
    },
    transformDefinition: {
      properties: [...getTransformObjectPropertiesDefinition(true)],
      values: { ...getTransformPropertiesValues() },
      valuesMetadata: {},
    },
  };
}

export function getVideoHtml(props: GetHtmlFuncPropsType) {
  const { object, isPlayer, isSave, deviceType } = props;

  const videoValues = object.definition.values as VideoValues;

  if (!isPlayer) {
    if (
      !videoValues.video.video.sourceType ||
      (videoValues.video.video.sourceType === "url" &&
        !videoValues.video.video.url) ||
      (videoValues.video.video.sourceType === "local" &&
        !videoValues.video.video.id) ||
      (videoValues.video.video.sourceType === "library" &&
        !videoValues.video.video.url)
    ) {
      return getObjectPlaceholder(`VIDEO<br/>(placeholder)`);
    } else {
      if (videoValues.video.video.sourceType === "url") {
        return getObjectPlaceholder(
          `VIDEO URL<br/>${videoValues.video.video.url}`
        );
      }
      // in the app show preview image
      const videoFit = videoValues.videoFit as ICoverPlacementValue;

      let backgroundSize = videoFit.size as
        | "cover"
        | "fill"
        | "contain"
        | "100% 100%";

      if (backgroundSize === "cover") backgroundSize = "cover";
      if (backgroundSize === "fill") backgroundSize = "100% 100%";
      const aH = "center"; //videoFit.positionHorizontal;
      const aV = "center"; //videoFit.positionVertical;

      const imageItem = getMediaSrc("video", videoValues.video.previewImage!, {
        useId: isSave,
        filename: videoValues.video.filename,
      });

      let style = "";
      style = addCommonPropertiesToStyle(style, object, deviceType);
      style = addTransformPropertiesToStyle(style, object, deviceType);
      style += "width: 100%;";
      style += "height: 100%;";
      style += `background-image:url('${imageItem.src}');`;
      style += `background-repeat:no-repeat;`;
      style += `background-size: ${backgroundSize};`;
      style += `background-position: ${aH} ${aV};`;

      return `<div class="object-content object-content-${object.id}" style="${style}"></div>`;
    }
  }

  const videoFit = videoValues.videoFit as ICoverPlacementValue; /*
  let backgroundSize = coverPlacementValue.size as
    | "cover"
    | "fill"
    | "100% 100%";

  if (backgroundSize === "cover") backgroundSize = "cover";
  if (backgroundSize === "fill") backgroundSize = "100% 100%";*/

  let style = "";
  style += `object-fit: ${videoFit.size};`;
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);

  let attrs = "";
  // if (isPlayer) attrs += " muted";
  attrs += ` width="100%"`;
  attrs += ` height="100%"`;
  attrs += videoValues.controls ? " controls" : "";
  attrs += videoValues.muted ? " muted" : "";
  //attrs += videoValues.autoplay ? " autoplay" : "";
  attrs += videoValues.loop ? " loop" : "";
  attrs += videoValues.playsinline ? " playsinline" : "";
  attrs += ` ${videoValues.preload}`;

  const videoSrc = getMediaSrc("video", videoValues.video.video, {
    useId: isSave,
    filename: videoValues.video.filename,
  }).src;

  const videoHtml = `
    <video style="${style}" ${attrs} class="video-content video-content-${object.id}">
      <source type="video/mp4" src="${videoSrc}"></source>
      <source type="video/ogg" src="${videoSrc}"></source>
    </video>
  `;

  //<source class="video-source-${object.id}" type="video/mp4" src="${videoSrc}">
  // TODO: IMPORTANT
  /*getMediaSrc("video", videoValues.video).then((videoItem: VideoItem) => {
    const el = document.getElementsByClassName(`video-source-${object.id}`)[0];
    if (el) {
      (el as HTMLSourceElement).src = videoItem.src!;
    }
  });*/

  return videoHtml;
}

/**
 * This function execute when timeline starts
 */
export function video_objectStart(
  props: ExecutionCodeFuncPropsType
): ExecutionCodeFuncReturnType {
  logger.object.debug(`video:objectStart()`);

  const { id } = props;
  const values = props.values as VideoValues;

  const videoElm = document.getElementsByClassName(
    `video-content-${id}`
  )[0] as HTMLVideoElement;

  if (values.autoplay) {
    const waitingTime = setTimeout(() => {
      const initialTime = convertTimeUnitToMs(values.initialTime);
      videoElm.currentTime = initialTime ? initialTime / 1000 : 0;
      videoElm.volume = values.volume / 100;
      videoElm.play();
    }, convertTimeUnitToMs(values.delayTime));
    timeoutMap.set(id, waitingTime);
  }

  // const waitingTime = setTimeout(() => {
  //   audioElm.volume = values.volume ? values.volume / 100 : 0;
  //   audioElm.play();
  // }, convertTimeUnitToMs(values.delayTime));

  // timeoutMap.set(id, waitingTime);
}

/**
 * This function execute when timeline stop
 */
export function video_objectStop(
  props: ExecutionCodeFuncPropsType
): ExecutionCodeFuncReturnType {
  logger.object.debug(`video:objectStop()`);

  const { id } = props;

  const timeout = timeoutMap.get(id);
  if (timeout) clearTimeout(timeout);

  const videoElm = document.getElementsByClassName(
    `video-content-${id}`
  )[0] as HTMLAudioElement;

  videoElm.currentTime = 0;
  videoElm.pause();
}

export async function videoSizeUpdate(
  props: UpdateObjectSizeFuncPropsType
): Promise<void> {
  const {
    id,
    calculatedObjectSize,
    deviceType,
    transformDefinition,
    commonStyleDefinition,
  } = props;

  const objectWrapperEl = getObjectWrapperElementById(id);
  const objectEl = getObjectElementById(id);
  objectWrapperEl.style.width = calculatedObjectSize.width;
  objectWrapperEl.style.height = calculatedObjectSize.height;
  objectWrapperEl.style.left = calculatedObjectSize.left;
  objectWrapperEl.style.top = calculatedObjectSize.top;

  objectEl.style.width = calculatedObjectSize.width;
  objectEl.style.height = calculatedObjectSize.height;

  const objectContentEl =
    (objectEl.getElementsByClassName("object-content")[0] as HTMLElement) ??
    (objectEl.getElementsByClassName("video-content")[0] as HTMLElement);
  addCommonStyleToObjectElementContent(
    objectContentEl,
    commonStyleDefinition,
    deviceType
  );
  addTransformStyleToObjectElementContent(
    objectContentEl,
    transformDefinition,
    deviceType
  );

  const transformProperties = getObjectValuesForDevice(
    transformDefinition?.values as TransformPropertiesValues,
    deviceType
  );

  if (transformProperties?.transformOriginX) {
    objectWrapperEl.style.transformOrigin = `${
      transformProperties.transformOriginX ?? "center"
    }  ${transformProperties.transformOriginY ?? "center"}`;
  }
}

export function videoPostProcess(
  props: PostProcessFuncPropsType
): PostProcessFuncReturnType {
  const { object, prevObject } = props;

  const newObj = cloneDeep(object);

  const prevValues = prevObject.definition.values as VideoValues;
  const newValues = newObj.definition.values as VideoValues;

  if (prevValues.video.video.sourceType !== newValues.video.video.sourceType) {
    newValues.video = getDefaultValuesForSourceType(
      newValues.video.video.sourceType
    );
  }

  return newObj;
}

function getDefaultValuesForSourceType(
  sourceType: "local" | "url" | string | undefined
) {
  return {
    video: { sourceType },
    filename: "",
    previewImage: {},
  } as IVideoInputValue;
}

export async function preloadVideo(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  const { id, values } = props;
  const videoValues = values as VideoValues;

  if (videoValues.preload === "none") {
    return id;
  }

  let imageSrc: VideoItem = {} as VideoItem;

  if (
    videoValues.video.video.baseUrl &&
    videoValues.video.video.baseUrl.startsWith("http")
  ) {
    imageSrc = {
      src: videoValues.video.video.baseUrl + videoValues.video.video.filename,
    };
  } else {
    imageSrc = getMediaSrc("image", videoValues.video.video) as VideoItem;
  }

  // if there are no image to preload return instantly
  if (!imageSrc.src) {
    return id;
  }

  const videoEl = getObjectElementById(id).getElementsByTagName("video")[0];
  if (videoEl) {
    const eventToListen =
      videoValues.preload === "auto" ? "loadeddata" : "loadedmetadata";

    const p = new Promise<string>(function (resolve, reject) {
      videoEl.addEventListener(eventToListen, () => {
        videoEl.currentTime = 0;
        videoEl.pause();
        resolve(id);
      });
      videoEl.volume = 0;
      videoEl.play();
    });

    try {
      await p;
    } catch (ex) {
      console.log(ex);
    }
  }

  // const p = new Promise<string>(function (resolve, reject) {
  //   let img = new Image();
  //   img.onload = function () {
  //     // resolve the promise with our url so it is
  //     // returned in the result of Promise.all
  //     resolve(id);
  //   };
  //   img.onerror = function (err) {
  //     reject(err);
  //   };
  //   img.src = imageSrc.src!;
  // });

  // try {
  //   await p;
  // } catch (ex) {
  //   // TODO: log error
  // }

  // const el = getObjectElementById(id).getElementsByClassName(
  //   "object-content-" + id
  // )[0] as HTMLDivElement;

  // el.style.backgroundImage = `url('${imageSrc.src}')`;

  return id;
}

export const getAssetsUrls = (
  props: GetAssetsUrlFuncPropsType
): GetAssetsUrlFuncReturnType => {
  const videoValues = props.values as VideoValues;

  if (!videoValues.video.video.sourceType) {
    return [];
  }

  return [
    {
      id: videoValues.video.video.id,
      url: videoValues.video.video.url,
      filename: videoValues.video.filename,
      localFilename: videoValues.video.video.filename,
      sourceType: videoValues.video.video.sourceType,
      mediaType: "video",
    },
  ];
};

export const videoMeta = {
  name: "Video",
  description: "Add Video Object",
  preloadOrder: PreloadOrder.FIRST,
  icon: video,
};
