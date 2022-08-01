/**
 * This is object unique id. This have to be unique string.
 * To avoid name overlaping use companuy or website as a prefix.
 */
export const VIDEO_SOURCE = "video-source";

/**
 * Values are output of Properties Panel form that follow object tuple definition
 */
export interface VideoSourceValues {
  sourceType: "VIDEOSource";
  sourceId: string;
  url: string;
  preload: boolean;
  loop: boolean;
}
