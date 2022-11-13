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
import { VideoSourceValues } from "./video-source-types";
import { VIDEOSourceConnector } from "./video-source-connector";
import { getOrCreateConnectorById } from "webslider-sdk/lib/connectors/connector-manager";

/**
 * This function return html used in Web Slider Player
 */
export function getHtml(props: GetHtmlFuncPropsType): GetHtmlFuncReturnType {
  logger.object.debug(`Video source: getHtml()`);
  return "";
}

/**
 * This function is called on a browser viewport resize
 * It gets new size of the object through calculatedObjectSize
 * Common use case is to update Object's html element size
 */
export async function sizeUpdate(
  props: UpdateObjectSizeFuncPropsType
): Promise<void> /*UpdateObjectSizeFuncReturnType*/ {
  logger.object.debug(`Video source: sizeUpdate()`);
  return;
}

/**
 * This function preload asset used by Object
 * e.g: Image, Video, Font, and other assets.
 */
export async function preload(
  props: PreloadFuncPropsType
): Promise<string> /*PreloadFuncReturnType*/ {
  logger.object.debug(`Video source: preload()`);

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
 * This function execute when timeline starts
 */
export async function objectStart(
  props: ExecutionCodeFuncPropsType
): Promise<ExecutionCodeFuncReturnType> {
  logger.object.debug(`Video source: objectStart()`);

  const { id, values } = props;
  const videoSourceValues = values as VideoSourceValues;

  const conn = getOrCreateConnectorById(
    VIDEOSourceConnector,
    id,
    videoSourceValues.sourceId
  ) as VIDEOSourceConnector;

  if (!videoSourceValues.preload) {
    await conn.startVideo({
      url: videoSourceValues.url,
      loop: videoSourceValues.loop,
    });
  }
}

/**
 * This function execute when timeline stop
 */
export function objectStop(
  props: ExecutionCodeFuncPropsType
): ExecutionCodeFuncReturnType {
  logger.object.debug(`Video source: objectStop()`);
}

/**
 * This function is execute after every change in Properties Panel.
 * Good example of use is "autoHeight" for Text Object as we are calculating Object height to fit all text.
 */
export function postProcess(
  props: PostProcessFuncPropsType
): PostProcessFuncReturnType {
  logger.object.debug(`Video source: postProcess()`);

  const { object } = props;
  return props.object;
}

/**
 * When object has preload implementation and use "preload()" function to preload required assets, its required to set preload order
 * There are three preload groups
 * First we preload all Objects form FIRST, then MIDDLE, and at the end from LAST group in sequence.
 */
export const PRELOAD_ORDER: PreloadOrder = PreloadOrder.FIRST;
