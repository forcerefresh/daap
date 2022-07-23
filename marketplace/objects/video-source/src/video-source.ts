import { PreloadOrder } from "../../../../src/webslider-sdk/src/objects/objects-register";
import { VideoSourceValues } from "./types";
import { VIDEOSourceConnector } from "./video-source-connector";
import { getOrCreateConnectorById } from "../../../../src/webslider-sdk/src/connectors/connector-manager";
import { IObject } from "../../../../src/webslider-sdk/src/objects/i-object";
import { logger } from "../../../../src/webslider-sdk/src/utils/logger/logger";

/**
 * This function return html for object (for Player only).
 */
export function getHtml(props: {
  object: IObject;
  calculatedObjectSize: any;
  isPlayer?: boolean;
}) {
  logger.debug(`Video source: getHtml()`);
  const { object } = props;
  return "";

  // return `<div class="video-source-sound-${object.id}">TURN ON SOUND</div>`;
}

/**
 * This function execute when timeline starts playing
 */
export async function videoSourceStart(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}) {
  logger.debug(`Video source: videoSourceStart()`);
  const { id, values } = props;
  const videoSourceValues = values as VideoSourceValues;

  const conn = getOrCreateConnectorById(
    VIDEOSourceConnector,
    id,
    videoSourceValues.sourceId
  ) as VIDEOSourceConnector;

  //conn.startVideo(url);

  if (!videoSourceValues.preload) {
    await conn.startVideo({
      url: videoSourceValues.url,
      loop: videoSourceValues.loop,
    });
  }

  // const btn = document.getElementsByClassName(
  //   `video-source-sound-${id}`
  // )[0] as HTMLDivElement;

  // btn.addEventListener("click", async () => {
  //   const video = await conn.getVideo();
  //   video.muted = !video.muted;
  //   console.log(video.muted, "sta ovo stampa");
  // });
}

/**
 * This function preload asset required for Object to be shown and played.
 * e.g: Image, Video, Font, and other assets.
 */
export async function videoSourcePreload(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  logger.debug(`Video source: videoSourcePreload()`);

  const { id, values } = props;

  const videoSourceValues = values as VideoSourceValues;

  const conn = getOrCreateConnectorById(
    VIDEOSourceConnector,
    id,
    videoSourceValues.sourceId
  );

  await conn.startVideo({
    url: videoSourceValues.url,
    loop: videoSourceValues.loop,
  });

  return id;
}

/**
 * This function is called on a browser viewport resize.
 * It gets new size of the object through calculatedObjectSize
 * and updates size or a Object html element if needed.
 */
export async function videoSourceSizeUpdate(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {
  return;
}

/**
 * When object use "preload()" function to preload required assets, there are three preload groups.
 * First we preload all Objects form FIRST, then MIDDLE, and at the end from LAST group in sequence.
 */
export const PRELOAD_ORDER: PreloadOrder = PreloadOrder.FIRST;
