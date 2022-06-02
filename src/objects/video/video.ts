import { InputType, IVideoInput, IVideoInputValue } from "../../inputs/types";
import { createCommonObject } from "../create-object-factory";
import { ICommonObjectProperties, IObject } from "../types";
import { v4 as uuid } from "uuid";
import { PreloadOrder } from "../objects-factory";
import video from "./video-icon.svg";
import { addCommonPropertiesToStyle } from "../../utils/utils";
import { getObjectPlaceholder } from "../object-helpers";
import {
  CommonPropertiesTuple,
  CommonPropertiesValues,
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "../../webslider-sdk/src/objects/common-properties";

export const VIDEO = "video";

export type VideoPropertiesTuple = [
  IVideoInput<"url">,
  ...CommonPropertiesTuple
];

export interface VideoValues extends CommonPropertiesValues {
  url: IVideoInputValue;
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
      displayName: "Video url",
      propertyName: "url",
      inputType: InputType.VIDEO,
      value: { url: "", width: 960, height: 540, isPlaceholder: true },
      defaultValue: {
        url: "",
        width: 960,
        height: 540,
        isPlaceholder: true,
      },
    },
    ...getCommonObjectPropertiesDefinition(),
  ];

  const values: VideoValues = {
    url: initialValue?.url || {
      url: "",
      width: 960,
      height: 540,
      isPlaceholder: true,
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

export function getVideoHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const videoProperties = object.definition.values as VideoValues;

  if (!isPlayer) {
    if (!videoProperties.url) {
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

  const url = videoProperties.url.url;
  const videoHtml = `<video style="${style}" ${attrs}><source src="${url}" type="video/mp4"></video>`;

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
