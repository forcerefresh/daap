import React from "react";
import { ColorInputForm } from "./form-inputs/color-input/color-input";
import { NumberInputForm } from "./form-inputs/number-input/number-input";
import { SelectInputForm } from "./form-inputs/select-input/select-input";
import { TextInputForm } from "./form-inputs/text-input/text-input";
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
    case InputType.SELECT: {
      return <SelectInputForm {...inputProps} onChange={onChange} />;
    }
  }
}
