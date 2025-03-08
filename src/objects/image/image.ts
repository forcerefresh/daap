import {
  ICheckboxInput,
  ICornerRadiusValue,
  ICoverPlacementInput,
  ICoverPlacementValue,
  IImageInput,
  IImageInputValue,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import {
  GetAssetsUrlFuncPropsType,
  GetAssetsUrlFuncReturnType,
  GetHtmlFuncPropsType,
  PostProcessFuncPropsType,
  PostProcessFuncReturnType,
  PreloadOrder,
  UpdateObjectSizeFuncPropsType,
} from "webslider-sdk/lib/objects/objects-register";
import svg from "./image-icon.svg?react";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import {
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";
import { getMediaSrc } from "../../integration/utils/local-media";
import { ImageItem } from "webslider-sdk/lib/common/i-media-types";
import { cloneDeep, isEmpty, isEqual } from "lodash-es";
import {
  addTransformPropertiesToStyle,
  // addTransformPropertiesToStyle,
  getTransformObjectPropertiesDefinition,
  getTransformPropertiesValues,
  TransformPropertiesValues,
} from "webslider-sdk/lib/objects/transform-properties";
// import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import {
  addCommonStyleToObjectElementContent,
  addTransformStyleToObjectElementContent,
  getObjectElementById,
  getObjectWrapperElementById,
} from "../../animations/animation-utils";
import { getObjectValuesForDevice } from "webslider-sdk/lib/objects/object-utils";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import {
  addBackgroundColor,
  addBorder,
  addClipMask,
  addCommonPropertiesToStyle,
  addPaddingColor,
} from "webslider-sdk/lib/objects/common-properties-player";
import { nlRemove } from "webslider-sdk/lib/utils/utils";

export const IMAGE = "io.forcerefresh.image.object";

export interface ImageValues {
  fit: ICoverPlacementValue;
  image: IImageInputValue;
  // useForThumbnail: boolean;
  preload?: boolean;
}

export type ImagePropertiesTuple = [
  ICoverPlacementInput<"fit">,
  IImageInput<"image">
  // ICheckboxInput<"useForThumbnail">,
  // ICheckboxInput<"preload">
];

export function createImageObject(
  initialValue?: Record<string, any>
): Omit<IObject, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(IMAGE);

  const values: ImageValues = {
    fit: {
      size: "cover",
      positionHorizontal: "center",
      positionVertical: "center",
    },
    image: initialValue?.image || { image: { sourceType: "local" } },
    preload: true,
  };

  object.properties = values;

  return object;
}

export function getImageObjectForm(): ImagePropertiesTuple {
  const form: ImagePropertiesTuple = [
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
      value: undefined,
      defaultValue: undefined,
    },

    // {
    //   displayName: "Preload",
    //   propertyName: "preload",
    //   inputType: InputType.CHECKBOX,
    //   defaultValue: true,
    //   value: true,
    // },
  ];

  return form;
}

export function getImageHtml(props: GetHtmlFuncPropsType) {
  const { object, isPlayer, isSave, isForThumbnail, deviceType } = props;
  const imageValues = object.properties as ImageValues;

  console.log("imageValues");

  console.log(imageValues);

  if (!isPlayer) {
    if (
      !imageValues.image.sourceType ||
      (imageValues.image.sourceType === "url" && !imageValues.image.url) ||
      (imageValues.image.sourceType === "local" && !imageValues.image.id) ||
      (imageValues.image.sourceType === "library" && !imageValues.image.url)
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

  // const imageItem = getMediaSrc("image", imageValues.image, {
  //   useId: isSave,
  //   filename: imageValues.image.filename,
  // });

  const imageUrl = getMediaSrc(imageValues.image, imageValues.image.sizeType);

  // const fileName = imageValues.image.mediaSizes.find(
  //   (size) => size.sizeType === imageValues.image.sizeType
  // )?.sourceFilename;

  // // TODO: important
  // const imageUrl = `/api/v1/media/${fileName}`;

  let style = "";
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);
  style += "width: 100%;";
  style += "height: 100%;";
  if (!imageValues.preload || !isPlayer || isForThumbnail) {
    style += `background-image:url('${imageUrl}');`; //imageItem.src
  }
  style += `background-repeat:no-repeat;`;
  style += `background-size: ${backgroundSize};`;
  style += `background-position: ${aH} ${aV};`;

  return `
  <style></style>
  
  <div class="object-content object-content-${object.id}" style="${style}"></div>`;
}

export async function imageSizeUpdate(
  props: UpdateObjectSizeFuncPropsType
): Promise<void> {
  const { id, calculatedObjectSize, style, deviceType, transform } = props;

  const objectWrapperEl = getObjectWrapperElementById(id);
  const objectEl = getObjectElementById(id);
  objectWrapperEl.style.width = calculatedObjectSize.width;
  objectWrapperEl.style.height = calculatedObjectSize.height;
  objectWrapperEl.style.left = calculatedObjectSize.left;
  objectWrapperEl.style.top = calculatedObjectSize.top;

  objectEl.style.width = calculatedObjectSize.width;
  objectEl.style.height = calculatedObjectSize.height;

  const objectContentEl = objectEl.getElementsByClassName(
    "object-content"
  )[0] as HTMLElement;
  addCommonStyleToObjectElementContent(objectContentEl, style, deviceType);
  addTransformStyleToObjectElementContent(
    objectContentEl,
    transform,
    deviceType
  );

  const transformProperties = getObjectValuesForDevice(
    transform as TransformPropertiesValues,
    deviceType
  );

  if (transformProperties?.transformOriginX) {
    objectWrapperEl.style.transformOrigin = `${
      transformProperties.transformOriginX ?? "left"
    }  ${transformProperties.transformOriginY ?? "top"}`;
  }
}

export async function preloadImage(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  const { id, values } = props;
  const imageValues = values as ImageValues;

  // if (
  //   imageValues.image.image.baseUrl &&
  //   imageValues.image.image.baseUrl.startsWith("http")
  // ) {
  //   imageSrc = {
  //     src: imageValues.image.image.baseUrl + imageValues.image.image.filename,
  //   };
  // } else {
  const imageSrc = getMediaSrc(imageValues.image, imageValues.image.sizeType);

  // }

  // if there are no image to preload return instantly
  if (!imageSrc) {
    return id;
  }

  const p = new Promise<string>(function (resolve, reject) {
    let img = new Image();
    img.onload = function () {
      // resolve the promise with our url so it is
      // returned in the result of Promise.all
      // setTimeout(() => {
      resolve(id);
      // }, 1000);
    };
    img.onerror = function (err) {
      reject(err);
    };
    img.src = imageSrc!;
  });

  try {
    await p;
  } catch (ex) {
    // TODO: log error
  }

  const el = getObjectElementById(id).getElementsByClassName(
    "object-content-" + id
  )[0] as HTMLDivElement;

  el.style.backgroundImage = `url('${imageSrc}')`;

  return id;
}

export function imagePostProcess(
  props: PostProcessFuncPropsType
): PostProcessFuncReturnType {
  const { object, prevObject } = props;

  const newObj = cloneDeep(object);

  const prevValues = prevObject.properties as ImageValues;
  const newValues = newObj.properties as ImageValues;

  // if (prevValues.image.sourceType !== newValues.image.sourceType) {
  //   newValues.image = getDefaultValuesForSourceType(newValues.image.sourceType);
  // }

  // // we are adding this so we can replace it with real base url
  // if (prevValues.image.sourceType === "local") {
  //   newValues.image.baseUrl = `{MEDIA_ITEM_LOCAL}`;
  // }

  return newObj;
}

function getDefaultValuesForSourceType(
  sourceType: "local" | "library" | "url" | string | undefined
) {
  return { image: { sourceType }, filename: "" };
}

export const getAssetsUrls = (
  props: GetAssetsUrlFuncPropsType
): GetAssetsUrlFuncReturnType => {
  const imageValues = props.values as ImageValues;

  if (!imageValues.image.sourceType) {
    return [];
  }

  return [
    {
      id: imageValues.image.id,
      url: imageValues.image.url,
      filename: imageValues.image.filename,
      localFilename: imageValues.image.filename,
      sourceType: imageValues.image.sourceType,
      mediaType: "image",
      // baseUrl: imageValues.image.baseUrl,
    },
  ];
};

export const imageMeta = {
  name: "Image",
  description: "Add Image Object",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
  supportWidthResize: true,
  supportHeightResize: true,
};
