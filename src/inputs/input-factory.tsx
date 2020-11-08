import React from "react";
import { ColorInputForm } from "./color-input/color-input";
import { NumberInputForm } from "./number-input/number-input";
import { SelectInputForm } from "./select-input/select-input";
import { TextInputForm } from "./text-input/text-input";
import { InputType } from "./types";

export function getInputForm<T>(
  inputType: InputType,
  inputProps: T | any,
  onChange: (config: any) => void,
  onInput?: (config: any) => void
): React.ReactElement | undefined {
  switch (inputType) {
    case InputType.NUMBER: {
      return (
        <NumberInputForm
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    case InputType.TEXT: {
      return <TextInputForm {...inputProps} onChange={onChange} />;
    }
    case InputType.COLOR: {
      return <ColorInputForm {...inputProps} onChange={onChange} />;
    }
    case InputType.SELECT: {
      return <SelectInputForm {...inputProps} onChange={onChange} />;
    }
  }
}
