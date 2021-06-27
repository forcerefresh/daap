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
      displayName: "Scale X",
      helperText: "Percentage value (default 0)",
      propertyName: "scaleX",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Scale Y",
      helperText: "Percentage value (default 0)",
      propertyName: "scaleY",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Rotation",
      helperText: "Rotate char ( default 0)",
      propertyName: "rotationPerChar",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Position X",
      helperText: "Move along X axis (default 0)",
      propertyName: "positionX",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Position Y",
      helperText: "Move along Y axis (default 0)",
      propertyName: "positionY",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Start from",
      propertyName: "startFrom",
      inputType: InputType.SELECT,
      options: [
        { label: "Random", value: "random" },
        { label: "Center", value: "center" },
        { label: "Edges", value: "edges" },
        { label: "End", value: "end" },
        { label: "Start", value: "0" },
      ],
    },
  ],
};

export const splitTextDefaults: ISplitTextEffect = {
  id: splitText,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["effect"],
  durationPerChar: 200,
  delayBetweenChar: 50,
  scaleX: 0,
  scaleY: 0,
  rotationPerChar: 0,
  positionX: 0,
  positionY: 0,
  startFrom: 0,
};
