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
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { VideoTargetValues } from "./video-target-types";
import { calculateSize } from "./video-target-utils";

let copyInterval: { [key: string]: any } = {};

/**
 * This function return html used in Web Slider Player
 */
export function getHtml(props: GetHtmlFuncPropsType): GetHtmlFuncReturnType {
  logger.debug(`Video target: getHtml()`);

  const { object, calculatedObjectSize } = props;

  const width = calculatedObjectSize.width;
  const height = calculatedObjectSize.height;

  return `<canvas width="${width}" height="${height}" class="canvas-${object.id}"></canvas>`;
}

/**
 * This function is called on a browser viewport resize
 * It gets new size of the object through calculatedObjectSize
 * Common use case is to update Object's html element size
 */
export async function sizeUpdate(
  props: UpdateObjectSizeFuncPropsType
): Promise<void> /*UpdateObjectSizeFuncReturnType*/ {
  logger.debug(`Video target: sizeUpdate()`);

  const { calculatedObjectSize, className } = props;

  // TO CHECK
  const els = document.getElementsByClassName(className);
  const canvas = els[0] as HTMLCanvasElement;
  const parent = canvas.parentNode! as HTMLDivElement;
  parent.style.width = calculatedObjectSize.width;
  parent.style.height = calculatedObjectSize.height;

  canvas.width = parseFloat(calculatedObjectSize.width);
  canvas.height = parseFloat(calculatedObjectSize.height);
}

/**
 * This function preload asset used by Object
 * e.g: Image, Video, Font, and other assets.
 */
export async function preload(
  props: PreloadFuncPropsType
): Promise<string> /*PreloadFuncReturnType*/ {
  logger.debug(`Video target: preload()`);

  const { id } = props;

  return id;
}

/**
 * This function execute when timeline starts
 */
export async function objectStart(
  props: ExecutionCodeFuncPropsType
): Promise<ExecutionCodeFuncReturnType> {
  logger.debug(`Video target: objectStart()`);

  const { getConnector, id, values } = props;

  const videoTargetValues = values as VideoTargetValues;

  const conn = getConnector?.(videoTargetValues.sourceId!);

  const video = await conn?.getVideo();
  const canvas = document.getElementsByClassName(
    "canvas-" + id
  )[0] as HTMLCanvasElement;

  const ctx = canvas.getContext("2d");

  copyInterval[id] = setInterval(() => {
    const metaData = conn?.getMetaData();
    if (!metaData) return;
    if (video) {
      const calculatedSize = calculateSize(
        values.videoFit.size,
        video.videoWidth,
        video.videoHeight,
        canvas.width,
        canvas.height
      );
      ctx?.drawImage(
        video,
        calculatedSize!.x,
        calculatedSize!.y,
        calculatedSize!.width,
        calculatedSize!.height
      );
    }
  }, 1000 / 60);
}

/**
 * This function execute when timeline stop
 */
export function objectStop(
  props: ExecutionCodeFuncPropsType
): ExecutionCodeFuncReturnType {
  logger.debug(`Video target: objectStop()`);

  const { id } = props;
  clearInterval(copyInterval[id]);
}

/**
 * This function is execute after every change in Properties Panel.
 * Good example of use is "autoHeight" for Text Object as we are calculating Object height to fit all text.
 */
export function postProcess(
  props: PostProcessFuncPropsType
): PostProcessFuncReturnType {
  logger.debug(`Video target: postProcess()`);

  const { object } = props;
  return props.object;
}

/**
 * When object has preload implementation and use "preload()" function to preload required assets, its required to set preload order
 * There are three preload groups
 * First we preload all Objects form FIRST, then MIDDLE, and at the end from LAST group in sequence.
 */
export const PRELOAD_ORDER: PreloadOrder = PreloadOrder.FIRST;
