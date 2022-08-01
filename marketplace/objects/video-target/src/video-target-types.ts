import { ICoverPlacementValue } from "../../../../src/webslider-sdk/src/inputs/i-inputs";
import { CommonPropertiesValues } from "../../../../src/webslider-sdk/src/objects/common-properties";

/**
 * This is object unique id. This have to be unique string.
 * To avoid name overlaping use companuy or website as a prefix.
 */
export const VIDEO_TARGET = "video-target";

/**
 * Values are output of Properties Panel form that follow object tuple definition
 */
export interface VideoTargetValues extends CommonPropertiesValues {
  sourceId: string;
  videoFit: ICoverPlacementValue;
}
