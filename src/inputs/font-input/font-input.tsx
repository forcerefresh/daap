import { FormGroup, HTMLSelect } from "@blueprintjs/core";
import { pick } from "lodash-es";
import React, { ChangeEvent } from "react";
import { getGlobals } from "../../globals";
import {
  IFontSelectInput,
  IFontSelectInputValue,
  IUpdateInput,
} from "../types";

const DELIMITER = "[DELIMITER]";

export const FontSelectInputForm: React.FC<IFontSelectInput & IUpdateInput> = (
  props
) => {
  const { displayName, value, onChange } = props;

  const googleFonts = getGlobals()
    .getFonts()
    .filter((font) => font.source === "google-fonts")
    .sort()
    .map((item) => ({
      label: item.fontFamily,
      value: item.fontFamily + DELIMITER + item.source,
    }));

  const systemFonts = getGlobals()
    .getFonts()
    .filter((font) => font.source === "system-fonts")
    .sort()
    .map((item) => ({
      label: item.fontFamily,
      value: item.fontFamily + DELIMITER + item.source,
    }));

  const _options: {
    label: string;
    value: string;
    disabled?: boolean;
  }[] = [
    {
      label: "System fonts",
      value: "Disabled1",
      disabled: true,
    },
    ...systemFonts,
    {
      label: "Google fonts",
      value: "Disabled2",
      disabled: true,
    },
    ...googleFonts,
  ];

  return (
    <FormGroup label={displayName} labelFor="text-input" inline>
      <HTMLSelect
        id="text-input"
        options={_options as any}
        value={value.fontFamily + DELIMITER + value.source}
        onChange={(event: ChangeEvent) => {
          const [
            fontFamily,
            source,
          ] = (event.currentTarget as HTMLSelectElement).value.split(DELIMITER);

          onChange({ fontFamily, source });
        }}
      />
    </FormGroup>
  );
};
