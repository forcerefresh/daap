import { ISVGValue } from "../../../../src/webslider-sdk/src/inputs/i-inputs";

/**
 * This is object unique id. This have to be unique string.
 * To avoid name overlaping use companuy or website as a prefix.
 */
export const VIDEO_SOURCE_UNMUTE = "video-source-unmute";

/**
 * Values are output of Properties Panel form that follow object tuple definition
 */
export interface VideoSourceUnmuteValues {
  sourceId: string;
  svgMute: ISVGValue;
  svgUnmute: ISVGValue;
}
