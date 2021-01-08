import React from "react";
import { ColorInputForm } from "./color-input/color-input";
import { ImageInputForm } from "./image-input/image-input";
import { NumberInputForm } from "./number-input/number-input";
import { SelectInputForm } from "./select-input/select-input";
import { TextInputForm } from "./text-input/text-input";
import { TransformOriginInputForm } from "./transform-origin/transform-origin";
import { InputType } from "./types";

export function getInputForm<T>(
  inputType: InputType,
  inputProps: T | any,
  onChange: (config: any) => void,
  onInput?: (config: any) => void
): React.ReactElement | undefined {
  const key = inputProps.propertyName || inputProps.id;

  switch (inputType) {
    case InputType.NUMBER: {
      return (
        <NumberInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    case InputType.TEXT: {
      return <TextInputForm key={key} {...inputProps} onInput={onChange} />;
    }
    case InputType.IMAGE: {
      return <ImageInputForm key={key} {...inputProps} onChange={onChange} />;
    }
    case InputType.TRANSFORM_ORIGIN: {
      return (
        <TransformOriginInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
        />
      );
    }
    case InputType.COLOR: {
      return <ColorInputForm key={key} {...inputProps} onChange={onChange} />;
    }
    case InputType.SELECT: {
      return <SelectInputForm key={key} {...inputProps} onChange={onChange} />;
    }
  }
}
