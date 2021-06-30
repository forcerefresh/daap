import { InputType } from "../../inputs/types";
import { ISplitTextEffect, splitText } from "./split-text.types";

export const splitTextDefinition = {
  id: splitText,
  name: "Split Text",
  form: [
    {
      displayName: "Duration per char",
      helperText: "Time takes to display one char (default 0.2)",
      propertyName: "durationPerChar",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Delay per char",
      helperText: "Time taken between two chars(default 0.05)",
      propertyName: "delayBetweenChar",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Opacity",
      helperText: "Percentage value (default 0)",
      propertyName: "opacity",
      inputType: InputType.NUMERIC_TIMELINE,
    },
    {
      displayName: "Blur",
      //helperText: "Percentage value (default 0)",
      propertyName: "blur",
      inputType: InputType.NUMERIC_TIMELINE,
    },
    {
      displayName: "Scale X",
      helperText: "Percentage value (default 0)",
      propertyName: "scaleX",
      inputType: InputType.NUMERIC_TIMELINE,
    },
    {
      displayName: "Scale Y",
      helperText: "Percentage value (default 0)",
      propertyName: "scaleY",
      inputType: InputType.NUMERIC_TIMELINE,
    },
    {
      displayName: "Rotation",
      helperText: "Rotate char ( default 0)",
      propertyName: "rotationPerChar",
      inputType: InputType.NUMERIC_TIMELINE,
    },
    {
      displayName: "Position X",
      helperText: "Move along X axis (default 0)",
      propertyName: "positionX",
      inputType: InputType.NUMERIC_TIMELINE,
    },
    {
      displayName: "Position Y",
      helperText: "Move along Y axis (default 0)",
      propertyName: "positionY",
      inputType: InputType.NUMERIC_TIMELINE,
    },
    {
      displayName: "Start from",
      propertyName: "startFrom",
      inputType: InputType.TEXT_START_POSITION,
    },
  ],
};

const delayAndDuration = {
  hasTimelineProperties: false,
  delay: 0,
  duration: 1000,
};

export const splitTextDefaults: ISplitTextEffect = {
  id: splitText,
  hasDelay: true,
  hasDuration: false,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  durationPerChar: 1000,
  delayBetweenChar: 50,
  opacity: { value: 0, ...delayAndDuration },
  blur: { value: 0, ...delayAndDuration },
  scaleX: { value: 1, ...delayAndDuration },
  scaleY: { value: 1, ...delayAndDuration },
  rotationPerChar: {
    value: 0,
    ...delayAndDuration,
  },
  positionX: { value: 0, ...delayAndDuration },
  positionY: { value: 0, ...delayAndDuration },
  startFrom: {
    startFrom: "start",
    customOrder: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20",
    fromCharacter: 1,
  },
};
