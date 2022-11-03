import {
  FormType,
  IFormGroupItem,
} from "../../webslider-sdk/src/form/i-form-layout";
import {
  InputType,
  INumberInput,
  ITextAreaInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectDefinition } from "../types";
import { TYPEWRITER_ANIMATION, ITypeWriterEffect } from "./typewriter.types";

export type ITypewriterTuple = [
  INumberInput<"typeCharacterSpeed">,
  INumberInput<"emptySpaceTypeTime">,
  INumberInput<"initialDelay">,
  INumberInput<"cursorBlinking">,
  INumberInput<"cursorPadding">,
  IFormGroupItem<
    [
      INumberInput<"timeAfterWrite">,
      INumberInput<"deleteCharacterSpeed">,
      INumberInput<"emptySpaceDeleteTime">
    ]
  >
];

export const typewriterDefinition: IEffectDefinition<ITypewriterTuple> = {
  id: TYPEWRITER_ANIMATION,
  name: "Typewriter",
  form: [
    {
      displayName: "Type character",
      helperText: "Time takes to display one char when simulation typing",
      propertyName: "typeCharacterSpeed",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },

    {
      displayName: "Type space",
      helperText: "Time between words",
      propertyName: "emptySpaceTypeTime",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },

    {
      displayName: "Initial delay",
      helperText: "Delay before typing starts",
      propertyName: "initialDelay",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Cursor blinking",
      helperText: "Time for cursor blinking",
      propertyName: "cursorBlinking",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Cursor padding",
      helperText: "Distance between text and cursor",
      propertyName: "cursorPadding",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Delete",
      type: FormType.GROUP,
      propertyName: "hasDelete",
      optional: true,
      elements: [
        {
          displayName: "Delay before delete start",
          helperText: "Cursor blinking after text is written",
          propertyName: "timeAfterWrite",
          inputType: InputType.NUMBER,
          value: {} as any,
          defaultValue: {} as any,
        },
        {
          displayName: "Delete character",
          helperText:
            "Time takes to hide one char when simulation deleting chars",
          propertyName: "deleteCharacterSpeed",
          inputType: InputType.NUMBER,
          value: {} as any,
          defaultValue: {} as any,
        },
        {
          displayName: "Delete space",
          helperText: "Time between words when simulation deleting",
          propertyName: "emptySpaceDeleteTime",
          inputType: InputType.NUMBER,
          value: {} as any,
          defaultValue: {} as any,
        },
      ],
    },
  ],
};

export const typewriterDefaults: ITypeWriterEffect = {
  id: TYPEWRITER_ANIMATION,
  hasDelay: true,
  hasDuration: false,
  hasOwnDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["effect"],
  canBeCombined: false,
  // effect properties
  typeCharacterSpeed: 150,
  deleteCharacterSpeed: 50,
  emptySpaceTypeTime: 500,
  emptySpaceDeleteTime: 200,
  cursorBlinking: 500,
  initialDelay: 2000,
  timeAfterWrite: 2000,
  cursorPadding: 5,
};
