import {
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
import { PreloadOrder } from "../../webslider-sdk/src/objects/objects-register";
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

export const VIDEO = "video";

export type VideoPropertiesTuple = [
  IVideoInput<"video">,
  ...CommonPropertiesTuple
];

export interface VideoValues extends CommonPropertiesValues {
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
      displayName: "Video",
      propertyName: "video",
      inputType: InputType.VIDEO,
      value: { video: {} },
      defaultValue: { video: {} },
    },
    ...getCommonObjectPropertiesDefinition(),
  ];

  const values: VideoValues = {
    video: initialValue?.video || { video: {}, filename: "", previewImage: {} },
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
}) {
  const { object, isPlayer } = props;

  const videoValues = object.definition.values as VideoValues;

  if (!isPlayer) {
    if (!videoValues.video.video.url && !videoValues.video.filename) {
      return getObjectPlaceholder(`VIDEO<br/>(placeholder)`);
    }
  }

  let style = "";
  style += "object-fit: fill;";
  style += addCommonPropertiesToStyle(style, object);

  let attrs = "";
  if (isPlayer) attrs += " autoplay controls";
  attrs += ` width="100%"`;
  attrs += ` height="100%"`;

  const videoHtml = `<video style="${style}" ${attrs}><source class="video-source-${object.id}" type="video/mp4"></video>`;
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

export const videoMeta = {
  name: "VIDEO",
  description: "Add video",
  preloadOrder: PreloadOrder.FIRST,
  icon: video,
};
