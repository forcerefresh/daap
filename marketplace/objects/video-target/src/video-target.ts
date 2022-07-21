import { IObject } from "../../../../src/webslider-sdk/src/objects/i-object";
import { PreloadOrder } from "../../../../src/webslider-sdk/src/objects/objects-register";
import { logger } from "../../../../src/webslider-sdk/src/utils/logger/logger";

import { VideoTargetValues } from "./types";
import { calculateSize } from "./video-target-utils";

let copyInterval: { [key: string]: any } = {};

/**
 * This function return html for object (for Player only).
 */
export function getHtml(props: { object: IObject; calculatedObjectSize: any }) {
  logger.debug(`Video target: getHtml()`);

  const { object, calculatedObjectSize } = props;

  const width = parseFloat(calculatedObjectSize.width);
  const height = parseFloat(calculatedObjectSize.height);

  return `<canvas width="${width}" height="${height}" class="canvas-${object.id}"></canvas>`;
}

/**
 * This function is called on a browser viewport resize.
 * It gets new size of the object through calculatedObjectSize
 * and updates size or a Object html element if needed.
 */
export async function sizeUpdate(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
  isInitial?: boolean;
}): Promise<void> {
  logger.debug(`Video target: sizeUpdate()`);
  const { id, calculatedObjectSize, className } = props;

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
 * This function preload asset required for Object to be shown and played.
 * e.g: Image, Video, Font, and other assets.
 */
export async function preload(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  logger.debug(`Video target: preload()`);

  return props.id;
}

/**
 * This function execute when timeline starts playing
 */
export async function objectStart(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
  getConnector?: (sourceId: string) => {
    getVideo: () => Promise<HTMLVideoElement>;
    getMetaData: () => any;
  };
}) {
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

  // TODO
}

/**
 * This function execute when timeline stop
 */
export async function objectStop(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}) {
  logger.debug(`Video target: objectStop()`);

  const { id } = props;
  clearInterval(copyInterval[id]);
  // TODO
}

/**
 * This function is execute after every change in Properties Panel.
 * Good example of use is "autoHeight" for Text Object as we are calculating Object height to fit all text.
 */
export function postProcess(prevObject: IObject, object: IObject): IObject {
  logger.debug(`Video target: postProcess()`);

  // TODO
  return object;
}

/**
 * When object use "preload()" function to preload required assets, there are three preload groups.
 * First we preload all Objects form FIRST, then MIDDLE, and at the end from LAST group in sequence.
 */
export const PRELOAD_ORDER: PreloadOrder = PreloadOrder.FIRST;
