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
import svg from "./retina-image-icon.svg";
import { getObjectPlaceholder } from "../../webslider-sdk/src/objects/object-helpers";
import {
  CommonPropertiesTuple,
  CommonPropertiesValues,
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "../../webslider-sdk/src/objects/common-properties";
import { addCommonPropertiesToStyle } from "../../utils/utils";

export const RETINA_IMAGE = "retina_image";

export interface RetinaImageValues extends CommonPropertiesValues {
  fit: ICoverPlacementValue;
  url: IImageInputValue;
  urlx2: IImageInputValue;
  urlx3: IImageInputValue;
  useForThumbnail: boolean;
  preload: boolean;
}

export type RetinaImagePropertiesTuple = [
  ICoverPlacementInput<"fit">,
  IImageInput<"url">,
  IImageInput<"urlx2">,
  IImageInput<"urlx3">,
  ICheckboxInput<"useForThumbnail">,
  ICheckboxInput<"preload">,
  ...CommonPropertiesTuple
];

export function createRetinaImageObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<RetinaImagePropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(RETINA_IMAGE);

  const properties: RetinaImagePropertiesTuple = [
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
      displayName: "Image 2",
      propertyName: "urlx2",
      inputType: InputType.IMAGE,
      value: {
        url: initialValue?.urlx2 || "",
        width: 300,
        height: 300,
        isPlaceholder: !initialValue?.urlx2,
      },
      defaultValue: {
        url: "",
        width: 300,
        height: 300,
        isPlaceholder: true,
      },
    },
    {
      displayName: "Image 3",
      propertyName: "urlx3",
      inputType: InputType.IMAGE,
      value: {
        url: initialValue?.urlx3 || "",
        width: 300,
        height: 300,
        isPlaceholder: !initialValue?.urlx3,
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

  const values: RetinaImageValues = {
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
    urlx2: {
      url: initialValue?.urlx2 || "",
      width: 300,
      height: 300,
      isPlaceholder: !initialValue?.url,
    },
    urlx3: {
      url: initialValue?.urlx3 || "",
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
      type: RETINA_IMAGE,
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

export function getRetinaImageHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const retinaImageProperties = object.definition.values as RetinaImageValues;

  //console.log(imageProperties);
  if (!isPlayer) {
    if (
      retinaImageProperties.url.isPlaceholder ||
      !retinaImageProperties.url.url
    ) {
      return getObjectPlaceholder(`RETINA IMAGE<br/>( placeholder)`);
    }
  }

  const coverPlacementValue = retinaImageProperties.fit as ICoverPlacementValue;

  let backgroundSize = coverPlacementValue.size as
    | "cover"
    | "fit"
    | "100% 100%";

  if (backgroundSize === "cover") backgroundSize = "cover";
  if (backgroundSize === "fit") backgroundSize = "100% 100%";
  const aH = coverPlacementValue.positionHorizontal;
  const aV = coverPlacementValue.positionVertical;

  let style = "";
  style += addCommonPropertiesToStyle(style, object);
  style += "width: 100%;";
  style += "height: 100%;";
  style += `background-repeat:no-repeat;`;
  style += `background-size: ${backgroundSize};`;
  style += `background-position: ${aH} ${aV};`;

  let css = `
     .object-content-${object.id} {
      background-image:url('${retinaImageProperties.url.url}');
    }`;
  if (isPlayer) {
    if (retinaImageProperties.urlx2.url) {
      css += `
      @media 
        only screen and (-webkit-min-device-pixel-ratio: 2),
        only screen and (   min--moz-device-pixel-ratio: 2),
        only screen and (     -o-min-device-pixel-ratio: 2/1),
        only screen and (        min-device-pixel-ratio: 2) {
          .object-content-${object.id} {
            background-image:url('${retinaImageProperties.urlx2.url}');
          }
        }`;
    }
    if (retinaImageProperties.urlx3.url) {
      css += `
      @media 
        only screen and (-webkit-min-device-pixel-ratio: 3),
        only screen and (   min--moz-device-pixel-ratio: 3),
        only screen and (     -o-min-device-pixel-ratio: 3/1),
        only screen and (        min-device-pixel-ratio: 3) { 
          .object-content-${object.id} {
            background-image:url('${retinaImageProperties.urlx3.url}');
          }
    }`;
    }
  }
  return `<style>${css}</style><div class="object-content-${object.id}" style="${style}"></div>`;
}

export async function retinaImageSizeUpdate(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {
  const { id, calculatedObjectSize, className } = props;
  // console.log("imageSizeUpdate: id> " + id);
  // console.log(calculatedObjectSize);
  // console.log(className);

  const els = document.getElementsByClassName(className);
  // console.log(els);
  const imageDiv = els[0] as HTMLDivElement;
  const parent = imageDiv.parentNode! as HTMLDivElement;
  parent.style.width = calculatedObjectSize.width;
  parent.style.height = calculatedObjectSize.height;
  parent.style.left = calculatedObjectSize.left;
  parent.style.top = calculatedObjectSize.top;

  imageDiv.style.width = calculatedObjectSize.width;
  imageDiv.style.height = calculatedObjectSize.height;
}

export async function preloadRetinaImage(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  const { id, values } = props;
  const imageValues = values as RetinaImageValues;

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
  const imageValues = props.values as RetinaImageValues;
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

export const retinaImageMeta = {
  name: "RETINA IMAGE",
  description: "Add retina image",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};
