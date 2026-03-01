import {
  ICoverPlacementInput,
  ICoverPlacementValue,
  IImageInputValue,
  IMultiImageInput,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";
import svg from "./multiple-images-icon.svg?raw";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import { getMediaSrc } from "../../integration/utils/local-media";
import { cloneDeep } from "lodash-es";
import {
  GetAssetsUrlFuncPropsType,
  GetAssetsUrlFuncReturnType,
  PostProcessFuncPropsType,
  PostProcessFuncReturnType,
} from "webslider-sdk/lib/objects/objects-register";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import {
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";

const MULTI_IMAGE = "multi-image-object";

export interface MultiImageValues {
  fit: ICoverPlacementValue;
  images: IImageInputValue[];
}

export type MultiImagePropertiesTuple = [
  ICoverPlacementInput<"fit">,
  IMultiImageInput<"images">,
];

export function createMultiImageObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  },
): Omit<
  IObject<MultiImagePropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(MULTI_IMAGE);

  const properties: MultiImagePropertiesTuple = [
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
      displayName: "Images",
      propertyName: "images",
      inputType: InputType.MULTI_IMAGE,
      value: initialValue?.images || [],
      defaultValue: [],
    },
  ];

  const values: MultiImageValues = {
    fit: {
      size: "fill",
      positionHorizontal: "center",
      positionVertical: "center",
    },
    images: initialValue?.images || [],
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: MULTI_IMAGE,
      properties,
      values,
      valuesMetadata: {},
    },
    commonStyleDefinition: {
      properties: [...getCommonObjectPropertiesDefinition()],
      values: { ...getCommonPropertiesValues() },
      valuesMetadata: { ...getCommonPropertiesMetadataValues() },
    },
  };
}

export function getMultiImageHtml(props: {
  object: IObject;
  calculatedObjectSize: React.CSSProperties;
  isPlayer?: boolean;
  isSave?: boolean;
}) {
  const { object, isPlayer, isSave } = props;

  const multiImageProperties = object.definition.values as MultiImageValues;
  if (!isPlayer) {
    if (
      multiImageProperties.images.length === 0 ||
      !multiImageProperties.images[0].image.sourceType ||
      (multiImageProperties.images[0].image.sourceType === "url" &&
        !multiImageProperties.images[0].image.url) ||
      (multiImageProperties.images[0].image.sourceType === "local" &&
        !multiImageProperties.images[0].image.id) ||
      (multiImageProperties.images[0].image.sourceType === "library" &&
        !multiImageProperties.images[0].image.url)
    ) {
      return getObjectPlaceholder(`MULTI IMAGE<br/>(placeholder)`);
    }
  }

  const coverPlacementValue = multiImageProperties.fit as ICoverPlacementValue;

  let backgroundSize = coverPlacementValue.size as
    | "cover"
    | "fill"
    | "contain"
    | "100% 100%";

  if (backgroundSize === "cover") backgroundSize = "cover";
  if (backgroundSize === "fill") backgroundSize = "100% 100%";
  const aH = coverPlacementValue.positionHorizontal;
  const aV = coverPlacementValue.positionVertical;

  let objectContentStyle = "";
  objectContentStyle += "position: absolute;";

  objectContentStyle += "width: 100%;";
  objectContentStyle += "height: 100%;";
  objectContentStyle = addCommonPropertiesToStyle(objectContentStyle, object);

  let style = "";
  style += "width: 100%;";
  style += "height: 100%;";
  style += `background-repeat:no-repeat;`;
  style += `background-size: ${backgroundSize};`;
  style += `background-position: ${aH} ${aV};`;

  let ret = "";
  ret += `<div class="object-content" style="${objectContentStyle}">`;
  multiImageProperties.images.forEach(
    (image: IImageInputValue, idx: number) => {
      //const imageitem = getMediaSrc("image", image.image);
      // TODO: Check useId
      const imageItem = getMediaSrc("image", image.image, {
        useId: isSave,
        filename: image.image.filename,
      });

      let styleOne = style;
      styleOne += `background-image:url('${imageItem.src}');`;
      styleOne += `position: absolute;`;
      if (isPlayer) {
      } else {
        // NOTE: For editor move images in order to see them all
        styleOne += `top: -${idx * 20}px;`;
        styleOne += `left: ${idx * 20}px;`;
        styleOne += `z-index: ${100 - idx};`;
      }
      ret += `<div class="object-content-item" style="${styleOne}"></div>`;
    },
  );
  ret += `</div>`;
  return ret;
}

export async function multiImageSizeUpdate(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {
  const { id, calculatedObjectSize } = props;
  // TODO: implement this (probably similar to image)
}

function preloadImagePromise(image: IImageInputValue): Promise<void> {
  return new Promise<void>(function (resolve, reject) {
    let img = new Image();
    img.onload = function () {
      resolve();
    };
    img.onerror = function (err) {
      reject(err);
    };
    const imageItem = getMediaSrc("image", image);
    img.src = imageItem.src!;
  });
}

export async function preloadMultiImage(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  const { id, values } = props;
  const multiImageValues = values as MultiImageValues;

  const loaders = multiImageValues.images.map((image) => {
    return image.image.sourceType
      ? preloadImagePromise(image)
      : Promise.resolve();
  });

  await Promise.allSettled(loaders);

  return id;
}

export function multiImagePostProcess(
  props: PostProcessFuncPropsType,
): PostProcessFuncReturnType {
  const { object, prevObject } = props;

  const newObj = cloneDeep(object);

  const prevValues = prevObject.definition.values as MultiImageValues;
  const newValues = newObj.definition.values as MultiImageValues;

  if (prevValues.images.length === newValues.images.length) {
    newValues.images.forEach((newImage, idx) => {
      const prevImages = prevValues.images[idx];
      if (newImage.image.sourceType !== prevImages.image.sourceType) {
        newValues.images[idx] = getDefaultValuesForSourceType(
          newImage.image.sourceType,
        );
      }
    });
  }

  return newObj;
}

function getDefaultValuesForSourceType(
  sourceType: "local" | "library" | "url" | string | undefined,
) {
  return { image: { sourceType }, filename: "" };
}

export const getMultiImageAssetsUrls = (
  props: GetAssetsUrlFuncPropsType,
): GetAssetsUrlFuncReturnType => {
  const imageValues = props.values as MultiImageValues;

  const ret: GetAssetsUrlFuncReturnType = [];
  imageValues.images.forEach((image) => {
    if (image.image.sourceType) {
      ret.push({
        id: image.image.id,
        url: image.image.url,
        filename: image.filename,
        localFilename: image.image.filename,
        sourceType: image.image.sourceType,
        mediaType: "image",
      });
    }
  });

  return ret;
};

export const multiImageMeta = {
  name: "Multi Images",
  description: "Add multi image object",
  icon: svg,
};
