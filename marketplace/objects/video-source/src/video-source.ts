import { PreloadOrder } from "../../../../src/webslider-sdk/src/objects/objects-register";
import { VideoSourceValues } from "./types";
import { VIDEOSourceConnector } from "./video-source-connector";
import { getOrCreateConnectorById } from "../../../../src/webslider-sdk/src/connectors/connector-manager";

/**
 * This function execute when timeline starts playing
 */
export async function videoSourceStart(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}) {
  const { id, values } = props;
  const videoSourceValues = values as VideoSourceValues;

  const conn = getOrCreateConnectorById(
    VIDEOSourceConnector,
    id,
    videoSourceValues.sourceId
  );

  if (!videoSourceValues.preload) {
    await conn.startVideo(videoSourceValues.url);
  }
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
  const { id, values } = props;

  const videoSourceValues = values as VideoSourceValues;
  const conn = getOrCreateConnectorById(
    VIDEOSourceConnector,
    id,
    videoSourceValues.sourceId
  );

  await conn.startVideo(videoSourceValues.url);

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
