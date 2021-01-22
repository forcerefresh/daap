import { FormGroup, InputGroup, Intent, TextArea } from "@blueprintjs/core";
import { noop } from "lodash-es";
import React from "react";
import { ITextAreaInput, IUpdateInput } from "../types";

export const TextAreaInputForm: React.FC<ITextAreaInput & IUpdateInput> = (
  props
) => {
  const { displayName, value, onChange = noop, onInput = noop } = props;
  return (
    <FormGroup label={displayName} labelFor="textarea-input">
      <TextArea
        id="textarea-input"
        growVertically={true}
        rows={5}
        fill
        value={value}
        onChange={(event: any) => onChange(event.target.value)}
        onInput={(event: any) => onInput(event.target.value)}
      />
    </FormGroup>
  );
};
