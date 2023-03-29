import {
  InputType,
  INumberInput,
  INumericTimelineInput,
  ITextStartPositionInput,
  IUnitsNumberInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { IAnimationDefinition } from "webslider-sdk/lib/animations/i-animation-types";
import { ITextAnimation, TEXT_ANIMATION } from "./text.types";

export type ITextTuple = [
  IUnitsNumberInput<"durationPerChar">,
  IUnitsNumberInput<"delayBetweenChar">,
  INumericTimelineInput<"opacity">,
  INumericTimelineInput<"blur">,
  INumericTimelineInput<"scaleX">,
  INumericTimelineInput<"scaleY">,
  INumericTimelineInput<"rotationPerChar">,
  INumericTimelineInput<"positionX">,
  INumericTimelineInput<"positionY">,
  ITextStartPositionInput<"startFrom">
];

export const textDefinition: IAnimationDefinition<ITextTuple> = {
  id: TEXT_ANIMATION,
  name: "Text",
  form: [
    {
      displayName: "Duration per char",
      helperText: "Time takes to display one char (default 0.2)",
      propertyName: "durationPerChar",
      inputType: InputType.UNITS_NUMBER,
      value: "500ms",
      defaultValue: "500ms",
      allowedUnits: ["ms"],
    },
    {
      displayName: "Delay per char",
      helperText: "Time taken between two chars(default 0.05)",
      propertyName: "delayBetweenChar",
      inputType: InputType.UNITS_NUMBER,
      value: "100ms",
      defaultValue: "100ms",
      allowedUnits: ["ms"],
    },
    {
      displayName: "Opacity",
      helperText: "Percentage value (default 0)",
      propertyName: "opacity",
      inputType: InputType.NUMERIC_TIMELINE,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Blur",
      //helperText: "Percentage value (default 0)",
      propertyName: "blur",
      inputType: InputType.NUMERIC_TIMELINE,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Scale X",
      helperText: "Percentage value (default 0)",
      propertyName: "scaleX",
      inputType: InputType.NUMERIC_TIMELINE,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Scale Y",
      helperText: "Percentage value (default 0)",
      propertyName: "scaleY",
      inputType: InputType.NUMERIC_TIMELINE,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Rotation",
      helperText: "Rotate char ( default 0)",
      propertyName: "rotationPerChar",
      inputType: InputType.NUMERIC_TIMELINE,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Position X",
      helperText: "Move along X axis (default 0)",
      propertyName: "positionX",
      inputType: InputType.NUMERIC_TIMELINE,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Position Y",
      helperText: "Move along Y axis (default 0)",
      propertyName: "positionY",
      inputType: InputType.NUMERIC_TIMELINE,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Start from",
      propertyName: "startFrom",
      inputType: InputType.TEXT_START_POSITION,
      value: {} as any,
      defaultValue: {} as any,
    },
  ],
};

const delayAndDuration = {
  hasTimelineProperties: false,
  delay: 0,
  duration: 1000,
};

export const textDefaults: ITextAnimation = {
  id: TEXT_ANIMATION,
  hasDelay: true,
  hasDuration: false,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out"],
  supportedObjectTypes: ["text"],
  canBeCombined: false,
  // animation properties
  durationPerChar: "300ms",
  delayBetweenChar: "100ms",
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
