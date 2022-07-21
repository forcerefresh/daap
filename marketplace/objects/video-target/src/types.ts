import { ICoverPlacementValue } from "../../../../src/webslider-sdk/src/inputs/i-inputs";
import { CommonPropertiesValues } from "../../../../src/webslider-sdk/src/objects/common-properties";

export const VIDEO_TARGET = "video-target";

/**
 * This is a definition of Video Target Object Values
 * Values are output of Properties Panel form that follow Video Target Tuple definition
 */
export interface VideoTargetValues extends CommonPropertiesValues {
  sourceId: string;
  videoFit: ICoverPlacementValue;
}
