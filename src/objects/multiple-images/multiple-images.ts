import {
  ICoverPlacementInput,
  ICoverPlacementValue,
  IImageInputValue,
  IMultiImageInput,
  InputType,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { createCommonObject } from "../../webslider-sdk/src/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "../../webslider-sdk/src/objects/i-object";
import { v4 as uuid } from "uuid";
import svg from "./multiple-images-icon.svg";
import { getObjectPlaceholder } from "../../webslider-sdk/src/objects/object-helpers";
import { addCommonPropertiesToStyle } from "../../utils/utils";

const MULTI_IMAGE = "multi_image";

export interface MultiImageValues {
  fit: ICoverPlacementValue;
  urls: IImageInputValue[];
}

export type MultiImagePropertiesTuple = [
  ICoverPlacementInput<"fit">,
  IMultiImageInput<"urls">
];

export function createMultiImageObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
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
      displayName: "Images",
      propertyName: "urls",
      inputType: InputType.MULTI_IMAGE,
      value: initialValue?.urls ? initialValue?.urls : [],
      defaultValue: [],
    },
  ];

  const values: MultiImageValues = {
    fit: {
      size: "fit",
      positionHorizontal: "center",
      positionVertical: "center",
    },
    urls: initialValue?.urls ? initialValue?.urls : [],
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
  };
}

export function getMultiImageHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const multiImageProperties = object.definition.values as MultiImageValues;
  //const url = multiImageProperties.urls[0];
  if (!isPlayer) {
    if (multiImageProperties.urls.length === 0) {
      return getObjectPlaceholder(`MULTI IMAGE<br/>(placeholder)`);
    }
  }

  const coverPlacementValue = multiImageProperties.fit as ICoverPlacementValue;

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
  style += `background-repeat:no-repeat;`;
  style += `background-size: ${backgroundSize};`;
  style += `background-position: ${aH} ${aV};`;

  let ret = "";
  ret += `<div class="object-content" style="width: 100%; height: 100%;">`;
  multiImageProperties.urls.forEach((url: IImageInputValue, idx: number) => {
    let styleOne = style;
    styleOne += `background-image:url('${url.image.url}');`; // TODO: IMPORTANT
    styleOne += `position: absolute;`;
    if (isPlayer) {
    } else {
      styleOne += `top: -${idx * 20}px;`;
      styleOne += `left: ${idx * 20}px;`;
      styleOne += `z-index: ${100 - idx};`;
    }
    ret += `<div class="object-content-item" style="${styleOne}"></div>`;
  });
  ret += `</div>`;
  return ret;
}

export async function multiimageSizeUpdate(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {
  const { id, calculatedObjectSize } = props;
  console.log("multiimageSizeUpdate: id> " + id);
  console.log(calculatedObjectSize);
}

function preloadImagePromise(imageItem: IImageInputValue): Promise<void> {
  return new Promise<void>(function (resolve, reject) {
    let img = new Image();
    img.onload = function () {
      // resolve the promise with our url so it is
      // returned in the result of Promise.all
      resolve();
    };
    img.onerror = function (err) {
      reject(err);
    };
    img.src = imageItem.image.url!; // TODO: IMPORTANT
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

  const loaders = multiImageValues.urls.map((oneVal) => {
    return oneVal.filename || oneVal.image.url // TODO: IMPORTANT
      ? preloadImagePromise(oneVal)
      : Promise.resolve();
  });

  await Promise.allSettled(loaders);

  return id;
}

export const getMultiImageAssetsUrls = (props: {
  values: { [key: string]: any };
}) => {
  const imageValues = props.values as MultiImageValues;

  const ret: {
    url?: string;
    filename?: string;
    type: "url" | "local" | string;
  }[] = [];
  imageValues.urls.forEach((item) => {
    if (item.image.url) {
      ret.push({ url: item.image.url, type: "url" }); // TODO: rename to sourceType // TODO: IMPORTANT
    }
    if (item.filename) {
      ret.push({ filename: item.filename, type: "local" }); // TODO: rename to sourceType // TODO: IMPORTANT
    }
  });

  return ret;
};

export const multiImageMeta = {
  name: "MULTIPLE IMAGES",
  description: "Add multi-image object",
  icon: svg,
};
