import {
  ICoverPlacementInput,
  ICoverPlacementValue,
  InputType,
  IVideoInput,
  IVideoInputValue,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { createCommonObject } from "../../webslider-sdk/src/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "../../webslider-sdk/src/objects/i-object";
import { v4 as uuid } from "uuid";
import {
  PostProcessFuncPropsType,
  PostProcessFuncReturnType,
  PreloadOrder,
} from "../../webslider-sdk/src/objects/objects-register";
import video from "./video-icon.svg";
import { addCommonPropertiesToStyle } from "../../utils/utils";
import { getObjectPlaceholder } from "../../webslider-sdk/src/objects/object-helpers";
import {
  CommonPropertiesTuple,
  CommonPropertiesValues,
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "../../webslider-sdk/src/objects/common-properties";
import { getMediaSrc } from "../../integration/utils/local-media";
import { cloneDeep } from "lodash-es";

export const VIDEO = "video";

export type VideoPropertiesTuple = [
  ICoverPlacementInput<"videoFit">,
  IVideoInput<"video">,
  ...CommonPropertiesTuple
];

export interface VideoValues extends CommonPropertiesValues {
  videoFit: ICoverPlacementValue;
  video: IVideoInputValue;
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
    ...getCommonObjectPropertiesDefinition(),
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
    ...getCommonPropertiesValues(),
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: VIDEO,
      properties,
      values,
      valuesMetadata: {
        ...{
          /* dodati meta ovde*/
        },
        ...getCommonPropertiesMetadataValues(),
      },
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
      style += addCommonPropertiesToStyle(style, object);
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
  style += addCommonPropertiesToStyle(style, object);

  let attrs = "";
  if (isPlayer) attrs += "  autoplay muted";
  attrs += ` width="100%"`;
  attrs += ` height="100%"`;

  const videoSrc = getMediaSrc("video", videoValues.video.video, {
    useId: isSave,
    filename: videoValues.video.filename,
  }).src;

  const videoHtml = `<video style="${style}" ${attrs} src="${videoSrc}"></video>`;

  console.log(videoHtml);

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

export async function videoSizeUpdate(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {
  const { id, calculatedObjectSize, className } = props;
  const els = document.getElementsByClassName(className);
  const div = els[0] as HTMLDivElement;
  const parent = div.parentNode! as HTMLDivElement;
  parent.style.width = calculatedObjectSize.width;
  parent.style.height = calculatedObjectSize.height;
  parent.style.left = calculatedObjectSize.left;
  parent.style.top = calculatedObjectSize.top;

  div.style.width = calculatedObjectSize.width;
  div.style.height = calculatedObjectSize.height;
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

export const getAssetsUrls = (props: { values: { [key: string]: any } }) => {
  const videoValues = props.values as VideoValues;

  if (!videoValues.video.video.sourceType) {
    return [];
  }

  console.log({
    id: videoValues.video.video.id,
    url: videoValues.video.video.url,
    filename: videoValues.video.filename,
    localFilename: videoValues.video.video.filename,
    sourceType: videoValues.video.video.sourceType,
    mediaType: "video",
  });
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
