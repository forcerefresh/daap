import { addCommonPropertiesToStyle } from "../../../../src/webslider-sdk/src/objects/common-properties";
import { IObject } from "../../../../src/webslider-sdk/src/objects/i-object";
import { PreloadOrder } from "../../../../src/webslider-sdk/src/objects/objects-register";
import { logger } from "../../../../src/webslider-sdk/src/utils/logger/logger";
import { VideoSourceUnmuteValues } from "./types";

/**
 * This function return html for object (for Player only).
 */
export function getHtml(props: { object: IObject; calculatedObjectSize: any }) {
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

  // Note: object.definition.values contain values that are set from Properties Panel
  // const values = object.definition.values as VideoSourceUnmuteValues;
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
 * This function preload asset required for Object to be shown and played.
 * e.g: Image, Video, Font, and other assets.
 */
export async function preload(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  logger.debug(`Video source unmute: preload()`);

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
  getConnector?: (sourceId: string) => {
    getVideo: () => Promise<HTMLVideoElement>;
    getMetaData: () => any;
  };
}) {
  logger.debug(`Video source unmute: objectStop()`);

  const { getConnector, values } = props;
  const videoSourceUnmuteValues = values as VideoSourceUnmuteValues;

  const conn = getConnector?.(videoSourceUnmuteValues.sourceId!);

  const video = await conn?.getVideo();
  if (video) video.muted = true;

  // TODO
}

/**
 * This function is execute after every change in Properties Panel.
 * Good example of use is "autoHeight" for Text Object as we are calculating Object height to fit all text.
 */
export function postProcess(prevObject: IObject, object: IObject): IObject {
  logger.debug(`Video source unmute: postProcess()`);

  // TODO
  return object;
}

/**
 * When object use "preload()" function to preload required assets, there are three preload groups.
 * First we preload all Objects form FIRST, then MIDDLE, and at the end from LAST group in sequence.
 */
export const PRELOAD_ORDER: PreloadOrder = PreloadOrder.FIRST;
