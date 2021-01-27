import { FormGroup, HTMLSelect } from "@blueprintjs/core";
import React, { ChangeEvent } from "react";
import { getGlobals } from "../../globals";
import { ISelectInput, IUpdateInput } from "../types";

export const SelectInputForm: React.FC<ISelectInput & IUpdateInput> = (
  props
) => {
  const { displayName, options, value, onChange } = props;

  let _options: { label: string; value: string }[] = [];
  if (typeof options === "string") {
    const getExternalFonts = (getGlobals() as any)[options];
    if (getExternalFonts)
      _options = getExternalFonts().map((fontName: string) => ({
        label: fontName,
        value: fontName,
      }));
  } else {
    _options = options;
  }

  return (
    <FormGroup label={displayName} labelFor="text-input" inline>
      <HTMLSelect
        id="text-input"
        options={_options}
        value={value}
        onChange={(event: ChangeEvent) =>
          onChange((event.currentTarget as HTMLSelectElement).value)
        }
      />
    </FormGroup>
  );
};
