import { InputType, INumberInput, ITextAreaInput } from "../../inputs/types";
import { IEffectDefinition } from "../types";
import { typewriter, ITypeWriterEffect } from "./typewriter.types";

export type ITypewriterTuple = [
  INumberInput<"typeCharacterSpeed">,
  INumberInput<"deleteCharacterSpeed">,
  INumberInput<"emptySpaceTypeTime">,
  INumberInput<"emptySpaceDeleteTime">,
  INumberInput<"initialDelay">,
  INumberInput<"timeAfterWrite">,
  INumberInput<"cursorBlinking">,
  INumberInput<"cursorPadding">,
  ITextAreaInput<"text1">,
  ITextAreaInput<"text2">,
  ITextAreaInput<"text3">,
  ITextAreaInput<"text4">
];

export const typewriterDefinition: IEffectDefinition<ITypewriterTuple> = {
  id: typewriter,
  name: "Typewriter",
  form: [
    {
      displayName: "Type character",
      helperText:
        "Time takes to display one char when simulation typing (default 0.15)",
      propertyName: "typeCharacterSpeed",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Delete character",
      helperText:
        "Time takes to hide one char when simulation deleting chars (default 0.05)",
      propertyName: "deleteCharacterSpeed",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Between words",
      helperText: "Time between words (default 0.5)",
      propertyName: "emptySpaceTypeTime",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Between words (delete)",
      helperText: "Time between words when simulation deleting (default 0.2)",
      propertyName: "emptySpaceDeleteTime",
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
      displayName: "Time after write",
      helperText: "Cursor blinking after text is written",
      propertyName: "timeAfterWrite",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },

    {
      displayName: "Cursor blinking",
      helperText: "Time for cursor blinking (default 0.5)",
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
      displayName: "Text 1",
      propertyName: "text1",
      inputType: InputType.TEXTAREA,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Text 2",
      propertyName: "text2",
      inputType: InputType.TEXTAREA,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Text 3",
      propertyName: "text3",
      inputType: InputType.TEXTAREA,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Text 4",
      propertyName: "text4",
      inputType: InputType.TEXTAREA,
      value: {} as any,
      defaultValue: {} as any,
    },
  ],
};

export const typewriterDefaults: ITypeWriterEffect = {
  id: typewriter,
  hasDelay: true,
  hasDuration: false,
  hasOwnDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["effect"],
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
  text1: "UNLIMITED POSSIBILITIES!",
  text2: "Awesome features :D !",
  text3: "MARVELOUS EFFECTS",
  text4: "Lorem ipsum :)",
};
