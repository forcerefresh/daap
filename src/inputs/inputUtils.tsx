import React from "react";
import { ColorInputForm } from "./form-inputs/color-input-form";
import { NumberInputForm } from "./form-inputs/numberInputForm";
import { TextInputForm } from "./form-inputs/textInputForm";
import { InputType } from "./types";

export function getInputForm<T>(
  inputType: InputType,
  inputProps: T | any,
  onChange: (config: any) => void
): React.ReactElement | undefined {
  switch (inputType) {
    case InputType.NUMBER: {
      return <NumberInputForm {...inputProps} />;
    }
    case InputType.TEXT: {
      return <TextInputForm {...inputProps} />;
    }
    case InputType.COLOR: {
      return <ColorInputForm {...inputProps} onChange={onChange} />;
    }
  }
}
