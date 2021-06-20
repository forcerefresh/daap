import { InputType } from "../../inputs/types";
import { typewriter, ITypeWriterEffect } from "./typewriter.types";

export const typewriterDefinition = {
  id: typewriter,
  name: "Typewriter",
  form: [
    {
      displayName: "Type character",
      helperText:
        "Time takes to display one char when simulation typing (default 0.15)",
      propertyName: "typeCharacterSpeed",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Delete character",
      helperText:
        "Time takes to hide one char when simulation deleting chars (default 0.05)",
      propertyName: "deleteCharacterSpeed",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Between words",
      helperText: "Time between words (default 0.5)",
      propertyName: "emptySpaceTypeTime",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Between words (delete)",
      helperText: "Time between words when simulation deleting (default 0.2)",
      propertyName: "emptySpaceDeleteTime",
      inputType: InputType.NUMBER,
    },

    {
      displayName: "Initial delay",
      helperText: "Delay before typing starts",
      propertyName: "initialDelay",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Cursor blinking",
      helperText: "Time for cursor blinking (default 0.5)",
      propertyName: "cursorBlinking",
      inputType: InputType.NUMBER,
    },

    {
      displayName: "Cursor padding",
      helperText: "Distance between text and cursor",
      propertyName: "cursorPadding",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Text 1",
      propertyName: "text1",
      inputType: InputType.TEXTAREA,
    },
    {
      displayName: "Text 2",
      propertyName: "text2",
      inputType: InputType.TEXTAREA,
    },
    {
      displayName: "Text 3",
      propertyName: "text3",
      inputType: InputType.TEXTAREA,
    },
    {
      displayName: "Text 4",
      propertyName: "text4",
      inputType: InputType.TEXTAREA,
    },
  ],
};

export const typewriterDefaults: ITypeWriterEffect = {
  id: typewriter,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["effect"],
  typeCharacterSpeed: 150,
  deleteCharacterSpeed: 50,
  emptySpaceTypeTime: 500,
  emptySpaceDeleteTime: 200,
  cursorBlinking: 500,
  initialDelay: 2000,
  cursorPadding: 5,
  text1: "UNLIMITED POSSIBILITIES!",
  text2: "Awesome features :D !",
  text3: "MARVELOUS EFFECTS",
  text4: "Lorem ipsum :)",
};
