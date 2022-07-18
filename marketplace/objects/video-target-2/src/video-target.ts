import { IObject } from "../../../../src/webslider-sdk/src/objects/i-object";
import { PreloadOrder } from "../../../../src/webslider-sdk/src/objects/objects-register";
import { logger } from "../../../../src/webslider-sdk/src/utils/logger/logger";

import { ObjectValues } from "./types";

let copyInterval: { [key: string]: any } = {};

/**
 * This function return html for object (for Player only).
 */
export function getHtml(props: { object: IObject; calculatedObjectSize: any }) {
  logger.debug(`Video target: getHtml()`);

  const { object, calculatedObjectSize } = props;

  // Note: object.definition.values contain values that are set from Properties Panel
  const values = object.definition.values as ObjectValues;

  return `<canvas width="1200" height="1200" class="canvas-${object.id}"></canvas>`;
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
  };
}) {
  logger.debug(`Video target: objectStart()`);

  const { getConnector, id, values } = props;
  const videoTargetValues = values as ObjectValues;

  const conn = getConnector?.(videoTargetValues.sourceId!);

  logger.log(conn);

  const video = await conn?.getVideo();
  const canvas = document.getElementsByClassName(
    "canvas-" + id
  )[0] as HTMLCanvasElement;

  const ctx = canvas.getContext("2d");

  copyInterval[id] = setInterval(() => {
    if (video) ctx?.drawImage(video, 0, 0, 1200, 1200);
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
