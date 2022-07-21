export const VIDEO_SOURCE = "video-source";

/**
 * This is a definition of Video Source Object Values
 * Values are output of Properties Panel form that follow Video Source Tuple definition
 */
export interface VideoSourceValues {
  sourceType: "VIDEOSource";
  sourceId: string;
  url: string;
  preload: boolean;
  loop: boolean;
}
