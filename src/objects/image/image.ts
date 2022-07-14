import {
  ICheckboxInput,
  ICoverPlacementInput,
  ICoverPlacementValue,
  IImageInput,
  IImageInputValue,
  InputType,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { createCommonObject } from "../../webslider-sdk/src/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "../../webslider-sdk/src/objects/i-object";
import { v4 as uuid } from "uuid";
import { PreloadOrder } from "../../webslider-sdk/src/objects/objects-register";
import svg from "./image-icon.svg";
import { getObjectPlaceholder } from "../../webslider-sdk/src/objects/object-helpers";
import { addCommonPropertiesToStyle } from "../../utils/utils";
import {
  CommonPropertiesTuple,
  CommonPropertiesValues,
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "../../webslider-sdk/src/objects/common-properties";
import { getMediaSrc } from "../../integration/utils/local-media";
import { ImageItem } from "../../webslider-sdk/src/common/i-media-types";
import { cloneDeep } from "lodash-es";

export const IMAGE = "image";

export interface ImageValues extends CommonPropertiesValues {
  fit: ICoverPlacementValue;
  image: IImageInputValue;
  useForThumbnail: boolean;
  preload: boolean;
}

export type ImagePropertiesTuple = [
  ICoverPlacementInput<"fit">,
  IImageInput<"image">,
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
        size: "fill",
        positionHorizontal: "center",
        positionVertical: "center",
      },
      defaultValue: {
        size: "fill",
        positionHorizontal: "center",
        positionVertical: "center",
      },
    },
    {
      displayName: "Image",
      propertyName: "image",
      inputType: InputType.IMAGE,
      value: initialValue?.image || {},
      defaultValue: { image: {} },
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
      size: "fill",
      positionHorizontal: "center",
      positionVertical: "center",
    },
    image: initialValue?.image || { image: { sourceType: "local" } },
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
          /*define meta*/
        },
        ...getCommonPropertiesMetadataValues(),
      },
    },
  };
}

export function getImageHtml(props: {
  object: IObject;
  calculatedObjectSize: React.CSSProperties;
  isPlayer?: boolean;
  isSave?: boolean;
}) {
  const { object, isPlayer, isSave } = props;
  const imageValues = object.definition.values as ImageValues;

  if (!isPlayer) {
    if (
      !imageValues.image.image.sourceType ||
      (imageValues.image.image.sourceType === "url" &&
        !imageValues.image.image.url) ||
      (imageValues.image.image.sourceType === "local" &&
        !imageValues.image.image.id) ||
      (imageValues.image.image.sourceType === "library" &&
        !imageValues.image.image.url)
    ) {
      return getObjectPlaceholder(`IMAGE<br/>(placeholder)`);
    }
  }

  const coverPlacementValue = imageValues.fit as ICoverPlacementValue;

  let backgroundSize = coverPlacementValue.size as
    | "cover"
    | "fill"
    | "contain"
    | "100% 100%";

  if (backgroundSize === "cover") backgroundSize = "cover";
  if (backgroundSize === "fill") backgroundSize = "100% 100%";
  const aH = coverPlacementValue.positionHorizontal;
  const aV = coverPlacementValue.positionVertical;

  const imageItem = getMediaSrc("image", imageValues.image.image, {
    useId: isSave,
    filename: imageValues.image.filename,
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

export async function imageSizeUpdate(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {
  const { id, calculatedObjectSize, className } = props;

  const els = document.getElementsByClassName(className);
  const imageDiv = els[0] as HTMLDivElement;
  const parent = imageDiv.parentNode! as HTMLDivElement;
  parent.style.width = calculatedObjectSize.width;
  parent.style.height = calculatedObjectSize.height;
  parent.style.left = calculatedObjectSize.left;
  parent.style.top = calculatedObjectSize.top;

  imageDiv.style.width = calculatedObjectSize.width;
  imageDiv.style.height = calculatedObjectSize.height;
}

export async function preloadImage(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  const { id, values } = props;
  const imageValues = values as ImageValues;

  const imageSrc = getMediaSrc("image", imageValues.image.image) as ImageItem;

  // if there are no image to preload return instantly
  if (!imageSrc.src) {
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
    img.src = imageSrc.src!;
  });

  try {
    await p;
  } catch (ex) {}

  return id;
}

export function imagePostProcess(
  prevObject: IObject,
  object: IObject
): IObject {
  const newObj = cloneDeep(object);

  const prevValues = prevObject.definition.values as ImageValues;
  const newValues = newObj.definition.values as ImageValues;

  if (prevValues.image.image.sourceType !== newValues.image.image.sourceType) {
    newValues.image = getDefaultValuesForSourceType(
      newValues.image.image.sourceType
    );
  }

  return newObj;
}

function getDefaultValuesForSourceType(
  sourceType: "local" | "library" | "url" | string | undefined
) {
  return { image: { sourceType }, filename: "" };
}

export const getAssetsUrls = (props: { values: { [key: string]: any } }) => {
  const imageValues = props.values as ImageValues;

  if (!imageValues.image.image.sourceType) {
    return [];
  }

  return [
    {
      id: imageValues.image.image.id,
      url: imageValues.image.image.url,
      filename: imageValues.image.filename,
      localFilename: imageValues.image.image.filename,
      sourceType: imageValues.image.image.sourceType,
    },
  ];
};

export const imageMeta = {
  name: "IMAGE",
  description: "Add Image",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};
