import {
  ICheckboxInput,
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
import svg from "./image-icon.svg";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import {
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";
import { getMediaSrc } from "../../integration/utils/local-media";
import { ImageItem } from "webslider-sdk/lib/common/i-media-types";
import { cloneDeep } from "lodash-es";
import {
  addTransformPropertiesToStyle,
  getTransformObjectPropertiesDefinition,
  getTransformPropertiesValues,
  TransformPropertiesValues,
} from "webslider-sdk/lib/objects/transform-properties";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import {
  addCommonStyleToObjectElementContent,
  addTransformStyleToObjectElementContent,
  getObjectElementById,
  getObjectWrapperElementById,
} from "../../animations/animation-utils";
import { getObjectValuesForDevice } from "webslider-sdk/lib/objects/object-utils";

export const IMAGE = "image";

export interface ImageValues {
  fit: ICoverPlacementValue;
  image: IImageInputValue;
  // useForThumbnail: boolean;
  preload: boolean;
}

export type ImagePropertiesTuple = [
  ICoverPlacementInput<"fit">,
  IImageInput<"image">,
  // ICheckboxInput<"useForThumbnail">,
  ICheckboxInput<"preload">
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
    // {
    //   displayName: "Use for thumbnail",
    //   propertyName: "useForThumbnail",
    //   inputType: InputType.CHECKBOX,
    //   value: false,
    //   defaultValue: false,
    // },
    {
      displayName: "Preload",
      propertyName: "preload",
      inputType: InputType.CHECKBOX,
      defaultValue: true,
      value: true,
    },
  ];

  const values: ImageValues = {
    fit: {
      size: "fill",
      positionHorizontal: "center",
      positionVertical: "center",
    },
    image: initialValue?.image || { image: { sourceType: "local" } },
    // useForThumbnail: false,
    preload: true,
  };

  return {
    ...object,
    definition: {
      //id: uuid(),
      //type: IMAGE,
      properties,
      values,
      valuesMetadata: {},
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

export function getImageHtml(props: GetHtmlFuncPropsType) {
  const { object, isPlayer, isSave, isForThumbnail, deviceType } = props;
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
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);
  style += "width: 100%;";
  style += "height: 100%;";
  if (!imageValues.preload || !isPlayer || isForThumbnail) {
    style += `background-image:url('${imageItem.src}');`;
  }
  style += `background-repeat:no-repeat;`;
  style += `background-size: ${backgroundSize};`;
  style += `background-position: ${aH} ${aV};`;

  return `<div class="object-content object-content-${object.id}" style="${style}"></div>`;
}

export async function imageSizeUpdate(
  props: UpdateObjectSizeFuncPropsType
): Promise<void> {
  const {
    id,
    calculatedObjectSize,
    commonStyleDefinition,
    deviceType,
    transformDefinition,
  } = props;

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

  let imageSrc: ImageItem = {} as ImageItem;

  if (
    imageValues.image.image.baseUrl &&
    imageValues.image.image.baseUrl.startsWith("http")
  ) {
    imageSrc = {
      src: imageValues.image.image.baseUrl + imageValues.image.image.filename,
    };
  } else {
    imageSrc = getMediaSrc("image", imageValues.image.image) as ImageItem;
  }

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
  } catch (ex) {
    // TODO: log error
  }

  const el = getObjectElementById(id).getElementsByClassName(
    "object-content-" + id
  )[0] as HTMLDivElement;

  el.style.backgroundImage = `url('${imageSrc.src}')`;

  return id;
}

export function imagePostProcess(
  props: PostProcessFuncPropsType
): PostProcessFuncReturnType {
  const { object, prevObject } = props;

  const newObj = cloneDeep(object);

  const prevValues = prevObject.definition.values as ImageValues;
  const newValues = newObj.definition.values as ImageValues;

  if (prevValues.image.image.sourceType !== newValues.image.image.sourceType) {
    newValues.image = getDefaultValuesForSourceType(
      newValues.image.image.sourceType
    );
  }

  // we are adding this so we can replace it with real base url
  if (prevValues.image.image.sourceType === "local") {
    newValues.image.image.baseUrl = `{MEDIA_ITEM_LOCAL}`;
  }

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
      mediaType: "image",
      baseUrl: imageValues.image.image.baseUrl,
    },
  ];
};

export const imageMeta = {
  name: "Image",
  description: "Add Image Object",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};
