import { ISVGValue } from "../../../../src/webslider-sdk/src/inputs/i-inputs";
import { CommonPropertiesValues } from "../../../../src/webslider-sdk/src/objects/common-properties";

export const VIDEO_SOURCE_UNMUTE = "video-source-unmute";

/**
 * This is a definition of Video Source Unmute Values
 * Values are output of Properties Panel form that follow Video Source Unmute Tuple definition
 */
export interface VideoSourceUnmuteValues extends CommonPropertiesValues {
  sourceId: string;
  svgMute: ISVGValue;
  svgUnmute: ISVGValue;
}
