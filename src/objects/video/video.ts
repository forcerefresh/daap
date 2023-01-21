import {
  ICoverPlacementInput,
  ICoverPlacementValue,
  InputType,
  IVideoInput,
  IVideoInputValue,
  IUnitsNumberInput,
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
  PostProcessFuncPropsType,
  PostProcessFuncReturnType,
  PreloadOrder,
} from "webslider-sdk/lib/objects/objects-register";
import video from "./video-icon.svg";
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
} from "webslider-sdk/lib/objects/transform-properties";
import {
  getObjectElementById,
  getObjectWrapperElementById,
} from "../../animations/animation-utils";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { convertTimeUnitToMs } from "webslider-sdk/lib/objects/object-utils";

const timeoutMap = new Map<string, NodeJS.Timeout | any>();

export const VIDEO = "video";

export type VideoPropertiesTuple = [
  ICoverPlacementInput<"videoFit">,
  IVideoInput<"video">,
  IUnitsNumberInput<"delayTime">,
  IUnitsNumberInput<"initialTime">
];

export interface VideoValues {
  videoFit: ICoverPlacementValue;
  video: IVideoInputValue;
  initialTime: string;
  delayTime: string;
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
      displayName: "Delay",
      propertyName: "delayTime",
      inputType: InputType.UNITS_NUMBER,
      value: "0ms",
      defaultValue: "0ms",
      allowedUnits: ["ms", "s"],
    },
    {
      displayName: "Initial time",
      propertyName: "initialTime",
      inputType: InputType.UNITS_NUMBER,
      value: "0ms",
      defaultValue: "0ms",
      allowedUnits: ["ms", "s"],
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
      properties: [...getCommonObjectPropertiesDefinition()],
      values: { ...getCommonPropertiesValues() },
      valuesMetadata: { ...getCommonPropertiesMetadataValues() },
    },
    transformDefinition: {
      properties: [...getTransformObjectPropertiesDefinition()],
      values: { ...getTransformPropertiesValues() },
      valuesMetadata: {},
    },
  };
}

export function getVideoHtml(props: {
  object: IObject;
  calculatedObjectSize: React.CSSProperties;
  isPlayer?: boolean;
  isSave?: boolean;
}) {
  const { object, isPlayer, isSave } = props;

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
      style = addCommonPropertiesToStyle(style, object);
      style = addTransformPropertiesToStyle(style, object);
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
  style = addCommonPropertiesToStyle(style, object);
  style = addTransformPropertiesToStyle(style, object);

  let attrs = "";
  if (isPlayer) attrs += " muted";
  attrs += ` width="100%"`;
  attrs += ` height="100%"`;

  const videoSrc = getMediaSrc("video", videoValues.video.video, {
    useId: isSave,
    filename: videoValues.video.filename,
  }).src;

  const videoHtml = `<video style="${style}" ${attrs} class="video-content-${object.id}" src="${videoSrc}"></video>`;

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

  const waitingTime = setTimeout(() => {
    const initialTime = convertTimeUnitToMs(values.initialTime);
    videoElm.currentTime = initialTime ? initialTime / 1000 : 0;
    videoElm.play();
  }, convertTimeUnitToMs(values.delayTime));

  timeoutMap.set(id, waitingTime);

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

export async function videoSizeUpdate(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {
  const { id, calculatedObjectSize } = props;

  const objectWrapperEl = getObjectWrapperElementById(id);
  const objectEl = getObjectElementById(id);
  objectWrapperEl.style.width = calculatedObjectSize.width;
  objectWrapperEl.style.height = calculatedObjectSize.height;
  objectWrapperEl.style.left = calculatedObjectSize.left;
  objectWrapperEl.style.top = calculatedObjectSize.top;

  objectEl.style.width = calculatedObjectSize.width;
  objectEl.style.height = calculatedObjectSize.height;
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
  name: "VIDEO",
  description: "Add video",
  preloadOrder: PreloadOrder.FIRST,
  icon: video,
};
