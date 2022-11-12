import {
  ExecutionCodeFuncPropsType,
  ExecutionCodeFuncReturnType,
  GetHtmlFuncPropsType,
  GetHtmlFuncReturnType,
  PostProcessFuncPropsType,
  PostProcessFuncReturnType,
  PreloadFuncPropsType,
  PreloadOrder,
  UpdateObjectSizeFuncPropsType,
} from "webslider-sdk/lib/objects/objects-register";
import { createLogger } from "webslider-sdk/lib/utils/logger/logger";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import { VideoSourceUnmuteValues } from "./video-source-unmute-types";

const logger = createLogger();

/**
 * This function return html used in Web Slider Player
 */
export function getHtml(props: GetHtmlFuncPropsType): GetHtmlFuncReturnType {
  logger.debug(`Video source unmute: getHtml()`);

  const { object, calculatedObjectSize } = props;

  const w = parseInt(calculatedObjectSize.width as string);
  const h = parseInt(calculatedObjectSize.height as string);

  let scaleX = 1;
  let scaleY = 1;
  scaleY = h / w;

  const css = `
    <style>
    .mute, .unmute {
      transform: scaleX(${scaleX}) scaleY(${scaleY});
      transform-origin: top left;
      ${addCommonPropertiesToStyle("", object)}
    }
    svg {
      width: 100%;
      height: 100%;
    }
    </style>
  `;

  return `<div class="object-content object-content-${object.id}">
  ${css}<div class="mute" style="display: block">${object.definition.values.svgMute.source}</div>
  ${css}<div class="unmute" style="display: none">${object.definition.values.svgUnmute.source}</div>
  </div>`;
}

/**
 * This function is called on a browser viewport resize
 * It gets new size of the object through calculatedObjectSize
 * Common use case is to update Object's html element size
 */
export async function sizeUpdate(
  props: UpdateObjectSizeFuncPropsType
): Promise<void> /*UpdateObjectSizeFuncReturnType*/ {
  logger.debug(`Video source unmute: sizeUpdate()`);

  const { calculatedObjectSize, className } = props;
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

/**
 * This function preload asset used by Object
 * e.g: Image, Video, Font, and other assets.
 */
export async function preload(
  props: PreloadFuncPropsType
): Promise<string> /*PreloadFuncReturnType*/ {
  logger.debug(`Video source unmute: preload()`);

  const { id } = props;

  return id;
}

/**
 * This function execute when timeline starts
 */
export function objectStart(
  props: ExecutionCodeFuncPropsType
): ExecutionCodeFuncReturnType {
  logger.debug(`Video source unmute: objectStart()`);

  const { getConnector, id, values } = props;
  const videoSourceUnmuteValues = values as VideoSourceUnmuteValues;

  const conn = getConnector?.(videoSourceUnmuteValues.sourceId!);

  const elm = document.getElementsByClassName(
    `object-content object-content-${id}`
  )[0] as HTMLDivElement;

  const unmute = elm.getElementsByClassName("unmute")[0] as HTMLDivElement;
  const mute = elm.getElementsByClassName("mute")[0] as HTMLDivElement;

  elm.addEventListener("click", async () => {
    const video = await conn!.getVideo();
    video.muted = !video.muted;
    if (video.muted) {
      mute.style.display = "block";
      unmute.style.display = "none";
    } else {
      mute.style.display = "none";
      unmute.style.display = "block";
    }
  });
}

/**
 * This function execute when timeline stop
 */
export function objectStop(
  props: ExecutionCodeFuncPropsType
): ExecutionCodeFuncReturnType {
  logger.debug(`Video source unmute: objectStop()`);
}

/**
 * This function is execute after every change in Properties Panel.
 * Good example of use is "autoHeight" for Text Object as we are calculating Object height to fit all text.
 */
export function postProcess(
  props: PostProcessFuncPropsType
): PostProcessFuncReturnType {
  logger.debug(`Video source unmute: postProcess()`);

  const { object } = props;
  return props.object;
}

/**
 * When object has preload implementation and use "preload()" function to preload required assets, its required to set preload order
 * There are three preload groups
 * First we preload all Objects form FIRST, then MIDDLE, and at the end from LAST group in sequence.
 */
export const PRELOAD_ORDER: PreloadOrder = PreloadOrder.FIRST;
