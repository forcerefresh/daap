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
import svg from "./svg-mask-icon.svg?react";
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
import { fetchSVG } from "../../panels/quick-bar-panel/QuickBarPanel";
import { updateClipPaths } from "../../utils/doom-utils/clip-path";

import { IStore, store } from "../../store/store";

const GLOBAL_SVG_CACHE = {};

export const SVG_MASK = "io.forcerefresh.svg-mask.object";

export interface SvgMaskValues {
  mask: IImageInputValue;
}

export type SvgMaskPropertiesTuple = [];

export function createSvgMaskObject(
  initialValue?: Record<string, any>,
): Omit<IObject, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(SVG_MASK);

  const values: SvgMaskValues = {
    mask: initialValue?.mask || { mask: { sourceType: "local" } },
  };

  object.properties = values;

  return object;
}

export function getSvgMaskObjectForm(): SvgMaskPropertiesTuple {
  const form: SvgMaskPropertiesTuple = [];

  return form;
}

export function getSvgMaskHtml(props: GetHtmlFuncPropsType) {
  const {
    object,
    isPlayer,
    isSave,
    isForThumbnail,
    deviceType,
    calculatedObjectSize,
  } = props;

  const svgMaskValues = object.properties as SvgMaskValues;

  if (!isPlayer) {
    if (
      !svgMaskValues.mask.sourceType ||
      (svgMaskValues.mask.sourceType === "url" && !svgMaskValues.mask.url) ||
      (svgMaskValues.mask.sourceType === "local" && !svgMaskValues.mask.id) ||
      (svgMaskValues.mask.sourceType === "library" &&
        !svgMaskValues.mask.url &&
        !svgMaskValues.mask.id)
    ) {
      return getObjectPlaceholder(`IMAGE<br/>(placeholder)`);
    }
  }

  // const svgMaskItem = getMediaSrc("mask", svgMaskValues.mask, {
  //   useId: isSave,
  //   filename: svgMaskValues.mask.filename,
  // });

  const state = store.getState() as IStore;
  const imgObject =
    state.project.objects.objectById["b2d10a11-63e0-40a3-a557-153b36d317fb"];

  if (!imgObject) return "";
  // imgObject
  //  transform: `translate(${parseInt(calculatedObjectSize.left)} ${parseInt(calculatedObjectSize.top)}) scale(${object.scale} ${object.scale}) rotate(${object.rotation ?? 0})`,

  const absTransform = calculateClipMaskTransform(
    {
      left: parseInt(imgObject.left),
      top: parseInt(imgObject.top),
      scale: imgObject.scale ?? 1,
      rotation: imgObject.rotation ?? 0,
    },
    {
      left: parseInt(calculatedObjectSize.left),
      top: parseInt(calculatedObjectSize.top),
      scale: object.scale ?? 1,
      rotation: object.rotation ?? 0,
    },
  );

  // const absX =
  //   imgObject.left +
  //   parseInt(calculatedObjectSize.left) * (imgObject.scale ?? 1);
  // const absY =
  //   imgObject.top + parseInt(calculatedObjectSize.top) * (imgObject.scale ?? 1);
  // const absScale = (object.scale ?? 1) * (imgObject.scale ?? 1);
  // const absRotate = (object.rotation ?? 0) - (imgObject.rotation ?? 0);

  const svgMaskUrl = getMediaSrc(
    svgMaskValues.mask,
    svgMaskValues.mask.sizeType,
  );

  // const fileName = svgMaskValues.mask.mediaSizes.find(
  //   (size) => size.sizeType === svgMaskValues.mask.sizeType
  // )?.sourceFilename;

  // // TODO: important
  // const svgMaskUrl = `/api/v1/media/${fileName}`;

  let style = "";
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);
  style += "width: 100%;";
  style += "height: 100%;";

  if (GLOBAL_SVG_CACHE[object.id]) {
    const updateSVG = updateClipPaths(GLOBAL_SVG_CACHE[object.id], {
      id: "c123",
      clipPathUnits: "userSpaceOnUse",
      transform: `translate(${absTransform.x} ${absTransform.y}) scale(${absTransform.scale}) rotate(${absTransform.rotation})`,
    });

    return `<div class="object-content object-content-${object.id}" style="${style}">${updateSVG}</div>`;
  }

  fetchSVG(svgMaskUrl).then((response) => {
    const updateSVG = updateClipPaths(response, {
      id: "c123",
      clipPathUnits: "userSpaceOnUse",
      transform: `translate(${absTransform.x} ${absTransform.y}) scale(${absTransform.scale}) rotate(${absTransform.rotation})`,
    });

    const el = document.querySelector(`.object-content-${object.id}`);
    if (el) {
      el.innerHTML = updateSVG;
    }
    GLOBAL_SVG_CACHE[object.id] = response;
  });

  return `<div class="object-content object-content-${object.id}" style="${style}"></div>`;
}

export async function svgMaskSizeUpdate(
  props: UpdateObjectSizeFuncPropsType,
): Promise<void> {}

export async function preloadSvgMaskImage(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  return props.id;
}

export function svgMaskPostProcess(
  props: PostProcessFuncPropsType,
): PostProcessFuncReturnType {
  const { object } = props;

  return object;
}

export const getSvgMaskAssetsUrls = (
  props: GetAssetsUrlFuncPropsType,
): GetAssetsUrlFuncReturnType => {
  const svgMaskValues = props.values as SvgMaskValues;

  if (!svgMaskValues.mask.sourceType) {
    return [];
  }

  return [
    {
      id: svgMaskValues.mask.id,
      url: svgMaskValues.mask.url,
      filename: svgMaskValues.mask.filename,
      localFilename: svgMaskValues.mask.filename,
      sourceType: svgMaskValues.mask.sourceType,
      mediaType: "svg-mask",
      // baseUrl: svgMaskValues.mask.baseUrl,
    },
  ];
};

export const svgMaskMeta = {
  name: "Svg MAsk",
  description: "Add SVG Mask Object",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
  supportWidthResize: true,
  supportHeightResize: true,
};

function calculateAbsoluteTransform(target, relative) {
  // Convert to radians for calculations
  const targetRad = ((target.rotation || 0) * Math.PI) / 180;
  const relativeRad = ((relative.rotation || 0) * Math.PI) / 180;

  // Combined rotation
  const totalRad = targetRad + relativeRad;
  const totalRotation = (totalRad * 180) / Math.PI;

  // Combined scale
  const totalScale = (target.scale || 1) * (relative.scale || 1);

  // Calculate relative position in target's rotated space
  const cos = Math.cos(targetRad);
  const sin = Math.sin(targetRad);

  // Transform relative point by target's rotation and scale
  const relativeX = (relative.left || 0) * (target.scale || 1);
  const relativeY = (relative.top || 0) * (target.scale || 1);

  const rotatedX = relativeX * cos - relativeY * sin;
  const rotatedY = relativeX * sin + relativeY * cos;

  // Add to target position
  const absX = (target.left || 0) + rotatedX;
  const absY = (target.top || 0) + rotatedY;

  return {
    x: absX,
    y: absY,
    scale: totalScale,
    rotation: totalRotation,
  };
}

// function calculateClipMaskTransform(targetTransform, relativeClipTransform) {
//   // For the mask to stay in place, we need to apply transforms in reverse order
//   // with inverse values

//   // Step 1: Start with relative clip position (in target's local space)
//   let x = relativeClipTransform.left || 0;
//   let y = relativeClipTransform.top || 0;
//   let scale = relativeClipTransform.scale || 1;
//   let rotation = relativeClipTransform.rotation || 0;

//   // Step 2: Apply inverse of target's scale
//   const invScale = 1 / (targetTransform.scale || 1);
//   scale *= invScale;

//   // Step 3: Apply inverse of target's rotation (to the position)
//   // Convert to radians
//   const invRotRad = (-(targetTransform.rotation || 0) * Math.PI) / 180;
//   const cos = Math.cos(invRotRad);
//   const sin = Math.sin(invRotRad);

//   // Rotate the position around the origin
//   const rotatedX = x * cos - y * sin;
//   const rotatedY = x * sin + y * cos;
//   x = rotatedX;
//   y = rotatedY;

//   // Step 4: Apply inverse of target's translation
//   x -= targetTransform.left || 0;
//   y -= targetTransform.top || 0;

//   // Step 5: Handle rotation of the mask itself (inverse of target rotation + relative rotation)
//   rotation =
//     -(targetTransform.rotation || 0) + (relativeClipTransform.rotation || 0);

//   return {
//     x,
//     y,
//     scale,
//     rotation,
//   };
// }

function calculateClipMaskTransform(
  target: {
    left: number;
    top: number;
    scale: number;
    rotation: number;
  },
  clipmask: {
    left: number;
    top: number;
    scale: number;
    rotation: number;
  },
) {
  // Convert target rotation to radians
  const targetRad = (target.rotation * Math.PI) / 180;

  // Offset of clipmask from target in world space
  const dx = clipmask.left - target.left;
  const dy = clipmask.top - target.top;

  // Rotate that offset into target's local space (inverse rotation)
  const cos = Math.cos(-targetRad);
  const sin = Math.sin(-targetRad);

  const localX = (cos * dx - sin * dy) / target.scale;
  const localY = (sin * dx + cos * dy) / target.scale;

  // Scale: clipmask world scale relative to target's scale
  const localScale = clipmask.scale / target.scale;

  // Rotation: clipmask world rotation relative to target's rotation
  const localRotation = clipmask.rotation - target.rotation;

  return {
    x: localX,
    y: localY,
    scale: localScale,
    rotation: localRotation,
  };
}
