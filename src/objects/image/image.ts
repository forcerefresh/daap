import {
  ICheckboxInput,
  ICoverPlacementInput,
  ICoverPlacementValue,
  IImageInput,
  IImageInputValue,
  InputType,
} from "../../inputs/types";
import { createCommonObject } from "../create-object-factory";
import { ICommonObjectProperties, IObject } from "../types";
import { v4 as uuid } from "uuid";
import { PreloadOrder } from "../objects-factory";
import svg from "./image-icon.svg";
import { getObjectPlaceholder } from "../object-helpers";
import { addCommonPropertiesToStyle } from "../../utils/utils";
import {
  CommonPropertiesTuple,
  CommonPropertiesValues,
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "../common-properties";

const IMAGE = "image";

export interface ImageValues extends CommonPropertiesValues {
  fit: ICoverPlacementValue;
  url: IImageInputValue;
  useForThumbnail: boolean;
  preload: boolean;
}

export type ImagePropertiesTuple = [
  ICoverPlacementInput<"fit">,
  IImageInput<"url">,
  ICheckboxInput<"useForThumbnail">,
  ICheckboxInput<"preload">,
  ...CommonPropertiesTuple
];

export function createImageObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<ImagePropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(IMAGE);

  const properties: ImagePropertiesTuple = [
    {
      inputType: InputType.COVER_LAYOUT,
      displayName: "Fit",
      propertyName: "fit",
      value: {
        size: "fit",
        positionHorizontal: "center",
        positionVertical: "center",
      },
      defaultValue: {
        size: "fit",
        positionHorizontal: "center",
        positionVertical: "center",
      },
    },
    {
      displayName: "Image",
      propertyName: "url",
      inputType: InputType.IMAGE,
      value: {
        url: initialValue?.url || "",
        width: 300,
        height: 300,
        isPlaceholder: !initialValue?.url,
      },
      defaultValue: {
        url: "",
        width: 300,
        height: 300,
        isPlaceholder: true,
      },
    },
    {
      displayName: "Use for thumbnail",
      propertyName: "useForThumbnail",
      inputType: InputType.CHECKBOX,
      value: false,
      defaultValue: false,
    },
    {
      displayName: "Preload",
      propertyName: "preload",
      inputType: InputType.CHECKBOX,
      defaultValue: true,
      value: true,
    },
    ...getCommonObjectPropertiesDefinition(),
  ];

  const values: ImageValues = {
    fit: {
      size: "fit",
      positionHorizontal: "center",
      positionVertical: "center",
    },
    url: {
      url: initialValue?.url || "",
      width: 300,
      height: 300,
      isPlaceholder: !initialValue?.url,
    },
    useForThumbnail: false,
    preload: true,
    ...getCommonPropertiesValues(),
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: IMAGE,
      properties,
      values,
      valuesMetadata: {
        ...{
          /*dedine meta*/
        },
        ...getCommonPropertiesMetadataValues(),
      },
    },
  };
}

export function getImageHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const imageProperties = object.definition.values as ImageValues;

  console.log(imageProperties);
  if (!isPlayer) {
    if (imageProperties.url.isPlaceholder || !imageProperties.url.url) {
      return getObjectPlaceholder(`IMAGE<br/>(placeholder)`);
    }
  }

  const coverPlacementValue = imageProperties.fit as ICoverPlacementValue;

  let backgroundSize = coverPlacementValue.size as
    | "cover"
    | "fit"
    | "100% 100%";

  if (backgroundSize === "cover") backgroundSize = "cover";
  if (backgroundSize === "fit") backgroundSize = "100% 100%";
  const aH = coverPlacementValue.positionHorizontal;
  const aV = coverPlacementValue.positionVertical;

  //let style = "";
  //style += addCommonPropertiesToStyle(style, object);
  //return `<img class="object-content" style="${style}" src="${imageProperties.url.value.url}" width="${object.width}" height="${object.height}"/>`;

  let style = "";
  style += addCommonPropertiesToStyle(style, object);
  style += "width: 100%;";
  style += "height: 100%;";
  style += `background-image:url('${imageProperties.url.url}');`;
  style += `background-repeat:no-repeat;`;
  style += `background-size: ${backgroundSize};`;
  style += `background-position: ${aH} ${aV};`;

  return `<div class="object-content" style="${style}"></div>`;
}

export async function preloadImage(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  const { id, values } = props;
  const imageValues = values as ImageValues;

  if (!imageValues.url.url || imageValues.url.isPlaceholder) {
    return id;
  }

  const p = new Promise<string>(function (resolve, reject) {
    let img = new Image();
    img.onload = function () {
      // resolve the promise with our url so it is
      // returned in the result of Promise.all
      resolve(id);
    };
    img.onerror = function (err) {
      reject(err);
    };
    img.src = imageValues.url.url;
  });

  try {
    await p;
  } catch (ex) {}

  return id;
}

export const getAssetsUrls = (props: { values: { [key: string]: any } }) => {
  const imageValues = props.values as ImageValues;
  if (!imageValues.url.url || imageValues.url.isPlaceholder) {
    return [];
  }
  return [
    {
      url: imageValues.url.url,
      fileName: imageValues.url.fileName,
      type: "url",
    },
  ];
};

export const imageMeta = {
  name: "IMAGE",
  description: "Add Image",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};
