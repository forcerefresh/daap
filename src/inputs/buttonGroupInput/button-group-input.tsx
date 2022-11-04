import React from "react";
import { Button, ButtonGroup, FormGroup } from "@blueprintjs/core";
import {
  IButtonGroupInput,
  IUpdateInput,
} from "webslider-sdk2/lib/inputs/i-inputs";
import css from "./button-group-input.module.scss";

export const ButtonGroupInputForm: React.FC<
  IButtonGroupInput & IUpdateInput
> = (props) => {
  const { value, options, onChange, displayName, helperText } = props;

  return (
    <FormGroup
      label={displayName}
      helperText={!!helperText && helperText}
      inline
      className={css.main}
    >
      <ButtonGroup>
        {options.map((el, idx) => (
          <Button
            active={options[idx].value === value}
            onClick={() => onChange(options[idx].value)}
          >
            {el.label}
          </Button>
        ))}
      </ButtonGroup>
    </FormGroup>
  );
};
