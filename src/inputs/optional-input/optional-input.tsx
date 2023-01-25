import { Switch } from "@blueprintjs/core";
import React from "react";
import { IInputMetadataValues } from "webslider-sdk/lib/inputs/i-inputs";
import css from "./optional-input.module.scss";

export interface IOptionalInput {
  children: React.ReactNode;
  metadataValues: IInputMetadataValues;
  onMetadataChange: (metadata: IInputMetadataValues) => void;
}

export const OptionalInput: React.FC<IOptionalInput> = (props) => {
  const {
    children,
    metadataValues = { disabled: false, exportForWizard: true },
    onMetadataChange,
  } = props;

  return (
    <div className={css.main}>
      {children}
      <div className={css.optionsHolder}>
        <Switch
          checked={!metadataValues.disabled}
          onChange={() => {
            onMetadataChange({
              ...metadataValues,
              disabled: !metadataValues.disabled,
            });
          }}
          innerLabelChecked="on"
          innerLabel="off"
        />
      </div>
    </div>
  );
};
