import {
  ISvgMaskInput,
  ISvgMaskInputValue,
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
import svg from "./svg-mask-icon.svg?raw";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import { getMediaSrc } from "../../integration/utils/local-media";
import { addTransformPropertiesToStyle } from "webslider-sdk/lib/objects/transform-properties";
import {
  addCommonStyleToObjectElementContent,
  addTransformStyleToObjectElementContent,
  getObjectElementById,
  getObjectWrapperElementById,
} from "../../animations/animation-utils";
import { getObjectValuesForDevice } from "webslider-sdk/lib/objects/object-utils";
import { TransformPropertiesValues } from "webslider-sdk/lib/objects/transform-properties";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import { fetchSVG } from "../../panels/quick-bar-panel/QuickBarPanel";
import {
  getClipMaskFromSvg,
  getClipMaskFromSvgForExport,
} from "../../utils/doom-utils/clip-path";
// NOTE: temporary — direct store access to resolve the target object for clip-path transform.
// TODO: thread target context through the object registration/callback system instead.
import { store, IStore } from "../../store/store";

export const SVG_MASK = "io.forcerefresh.svg-mask.object";

const svgCache = new Map<string, string>();

/**
 * Resolves the target object (prev sibling in layer objectIds), reads both
 * mask and target positions from the DOM, and sets the correct
 * clipPathUnits + transform on the <clipPath> element so that the mask's
 * on-stage position drives the clipped region on the target.
 *
 * NOTE: uses direct store access — temporary until context is threaded through
 * the registration system.
 */
export function updateSvgMaskClipTransform(
  maskId: string,
  maskCalcSize: { left: string; top: string; width: string; height: string },
): void {
  const state: IStore = store.getState() as IStore;
  const { layers, objects } = state.project;

  // Mask sits one position above the target in objectIds: target = objectIds[maskIndex - 1].
  // Search layers first, then group objects (mask and target may be grouped together).
  let targetId: string | undefined;
  for (const layerId of Object.keys(layers.layerById)) {
    const layer = layers.layerById[layerId];
    const maskIndex = layer.objectIds.indexOf(maskId);
    if (maskIndex > 0) {
      targetId = layer.objectIds[maskIndex - 1];
      break;
    }
  }
  if (!targetId) {
    for (const objId of Object.keys(objects.objectById)) {
      const obj = objects.objectById[objId];
      if (obj.objectIds?.length) {
        const maskIndex = obj.objectIds.indexOf(maskId);
        if (maskIndex > 0) {
          targetId = obj.objectIds[maskIndex - 1];
          break;
        }
      }
    }
  }
  if (!targetId) return;

  // Editor uses object-holder-*, player uses object-wrapper-*
  const targetHolderEl = (
    document.querySelector(`.object-holder-${targetId}`) ??
    document.querySelector(`.object-wrapper-${targetId}`)
  ) as HTMLElement | null;
  if (!targetHolderEl) return;

  const maskLeft = parseFloat(maskCalcSize.left);
  const maskTop = parseFloat(maskCalcSize.top);
  const maskWidth = parseFloat(maskCalcSize.width);
  const maskHeight = parseFloat(maskCalcSize.height);
  const targetLeft = parseFloat(targetHolderEl.style.left);
  const targetTop = parseFloat(targetHolderEl.style.top);

  const clipPathEl = document.getElementById(`svg-mask-${maskId}`);
  if (!clipPathEl) return;

  // SVG width/height are mandatory attributes — safe to read directly
  const svgEl = clipPathEl.closest("svg");
  const svgWidth = parseFloat(svgEl?.getAttribute("width") ?? "1");
  const svgHeight = parseFloat(svgEl?.getAttribute("height") ?? "1");

  const maskObject = objects.objectById[maskId];
  // Read mask transform from DOM — always current even during drag
  const maskHolderEl = (
    document.querySelector(`.object-holder-${maskId}`) ??
    document.querySelector(`.object-wrapper-${maskId}`)
  ) as HTMLElement | null;
  const maskTransformStr = maskHolderEl?.style.transform ?? "";
  const maskRotationMatch = maskTransformStr.match(/rotate\((-?[\d.]+)deg\)/);
  const maskScaleMatch = maskTransformStr.match(/scale\((-?[\d.]+)\)/);
  const maskRotation = maskRotationMatch
    ? parseFloat(maskRotationMatch[1])
    : (maskObject?.rotation ?? 0);
  const maskScale = maskScaleMatch
    ? parseFloat(maskScaleMatch[1])
    : (maskObject?.scale ?? 1);

  const targetObject = objects.objectById[targetId];
  // Read target transform from DOM — store is stale during processScaleChangeEvent / processRotateChangeEvent
  const targetTransformStr = targetHolderEl.style.transform ?? "";
  const targetRotationMatch = targetTransformStr.match(/rotate\((-?[\d.]+)deg\)/);
  const targetScaleMatch = targetTransformStr.match(/scale\((-?[\d.]+)\)/);
  const targetRotation = targetRotationMatch
    ? parseFloat(targetRotationMatch[1])
    : (targetObject?.rotation ?? 0);
  const targetScale = targetScaleMatch
    ? parseFloat(targetScaleMatch[1])
    : (targetObject?.scale ?? 1);

  // Stage-space offset from target origin to mask origin
  const dx = maskLeft - targetLeft;
  const dy = maskTop - targetTop;

  // The clipPath coordinates live in the target's LOCAL space (before its CSS transform).
  // Apply the inverse of target's CSS transform (rotate(-R_t) then scale(1/S_t)) to the
  // stage-space offset to get the local-space translation.
  const R_t = (targetRotation * Math.PI) / 180;
  const tx = (Math.cos(R_t) * dx + Math.sin(R_t) * dy) / targetScale;
  const ty = (-Math.sin(R_t) * dx + Math.cos(R_t) * dy) / targetScale;

  // Scale: SVG coords → mask visual pixel size, expressed in target local units (÷ S_target)
  const scaleX = (maskScale * maskWidth) / (svgWidth * targetScale);
  const scaleY = (maskScale * maskHeight) / (svgHeight * targetScale);

  // Relative rotation: mask rotation in target's local coordinate system
  const relativeRotation = maskRotation - targetRotation;

  // Transform order (SVG applies right-to-left):
  //   1. scale(scaleX, scaleY)        — SVG space → mask visual size in target local units
  //   2. rotate(relativeRotation)     — mask rotation relative to target's orientation
  //   3. translate(tx, ty)            — mask origin in target local space
  clipPathEl.setAttribute("clipPathUnits", "userSpaceOnUse");
  clipPathEl.setAttribute(
    "transform",
    `translate(${tx},${ty}) rotate(${relativeRotation}) scale(${scaleX},${scaleY})`,
  );
}

export interface SvgMaskValues {
  mask: ISvgMaskInputValue;
}

export type SvgMaskPropertiesTuple = [ISvgMaskInput<"mask">];

export function createSvgMaskObject(
  initialValue?: Record<string, any>,
): Omit<IObject, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(SVG_MASK);

  const values: SvgMaskValues = {
    mask: initialValue?.mask || ({ sourceType: "local" } as ISvgMaskInputValue),
  };

  object.properties = values;

  return object;
}

export function getSvgMaskObjectForm(): SvgMaskPropertiesTuple {
  return [
    {
      displayName: "Mask",
      propertyName: "mask",
      inputType: InputType.SVG_MASK_INPUT,
      value: undefined,
      defaultValue: undefined,
    },
  ];
}

export function getSvgMaskHtml(props: GetHtmlFuncPropsType) {
  const { object, isPlayer, deviceType, calculatedObjectSize } = props;
  const values = object.properties as SvgMaskValues;

  const hasMask =
    values.mask?.sourceType &&
    (values.mask.sourceType !== "local" || values.mask.id) &&
    (values.mask.sourceType !== "url" || values.mask.url);

  if (!isPlayer && !hasMask) {
    return getObjectPlaceholder(`SVG MASK<br/>(placeholder)`);
  }

  let style = "";
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);
  style += "width:100%;height:100%;";

  const maskUrl = getMediaSrc(values.mask as any, values.mask?.sizeType);
  const clipMaskId = `svg-mask-${object.id}`;

  if (maskUrl) {
    const applySvg = (svgContent: string) => {
      const el = document.querySelector<HTMLElement>(
        `.object-content-${object.id}`,
      );
      if (el) {
        el.innerHTML = getClipMaskFromSvg(svgContent, clipMaskId, "", "");
        // Read from the holder's current DOM state so async fetch picks up the
        // actual rendered position rather than the stale render-closure value.
        const maskHolderEl = (
          document.querySelector(`.object-holder-${object.id}`) ??
          document.querySelector(`.object-wrapper-${object.id}`)
        ) as HTMLElement | null;
        updateSvgMaskClipTransform(
          object.id,
          maskHolderEl
            ? {
                left: maskHolderEl.style.left,
                top: maskHolderEl.style.top,
                width: maskHolderEl.style.width,
                height: maskHolderEl.style.height,
              }
            : calculatedObjectSize,
        );
      }
    };

    const cached = svgCache.get(maskUrl);
    if (cached) {
      let svgHtml: string;
      if (isPlayer && props.targetObject && props.targetCalculatedObjectSize) {
        // Static export/player: bake the clip transform from data — no live DOM update.
        svgHtml = getClipMaskFromSvgForExport(
          cached,
          clipMaskId,
          calculatedObjectSize,
          props.targetCalculatedObjectSize,
          object.rotation ?? 0,
          object.scale ?? 1,
          props.targetObject.rotation ?? 0,
          props.targetObject.scale ?? 1,
        );
      } else {
        // Editor: return SVG inline so processScaleChangeEvent's innerHTML
        // replacement preserves the <clipPath> element during mask drag.
        // The clipPath transform is set post-commit by useLayoutEffect in StageObject.
        svgHtml = getClipMaskFromSvg(cached, clipMaskId, "", "");
      }
      return `<div class="object-content object-content-${object.id}" style="${style}">${svgHtml}</div>`;
    } else {
      fetchSVG(maskUrl).then((svgContent) => {
        svgCache.set(maskUrl, svgContent);
        applySvg(svgContent);
      });
    }
  }

  return `<div class="object-content object-content-${object.id}" style="${style}"></div>`;
}

export async function svgMaskSizeUpdate(
  props: UpdateObjectSizeFuncPropsType,
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
    "object-content",
  )[0] as HTMLElement;
  addCommonStyleToObjectElementContent(objectContentEl, style, deviceType);
  addTransformStyleToObjectElementContent(objectContentEl, transform, deviceType);

  const transformProperties = getObjectValuesForDevice(
    transform as unknown as TransformPropertiesValues,
    deviceType,
  );

  if (transformProperties?.transformOriginX) {
    objectWrapperEl.style.transformOrigin = `${transformProperties.transformOriginX ?? "left"} ${transformProperties.transformOriginY ?? "top"}`;
  }
}

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
  return props.object;
}

export const getSvgMaskAssetsUrls = (
  props: GetAssetsUrlFuncPropsType,
): GetAssetsUrlFuncReturnType => {
  const values = props.values as unknown as SvgMaskValues;

  if (!values.mask?.sourceType) {
    return [];
  }

  return [
    {
      id: values.mask.id,
      url: values.mask.url,
      filename: values.mask.filename,
      localFilename: values.mask.filename,
      sourceType: values.mask.sourceType,
      mediaType: "svg-mask",
    },
  ];
};

export const svgMaskMeta = {
  name: "SVG Mask",
  description: "Add SVG Mask Object",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
  supportWidthResize: true,
  supportHeightResize: true,
};
