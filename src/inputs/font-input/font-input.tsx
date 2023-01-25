import { FormGroup, HTMLSelect, Spinner } from "@blueprintjs/core";
import { compact, pick, uniq } from "lodash-es";
import React, { ChangeEvent, useEffect, useState } from "react";
import { getGlobals } from "../../globals";
import {
  IFontSelectInput,
  IFontSelectInputValue,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import {
  getGoogleVariants,
  getGoogleVariantsNice,
} from "../../utils/fonts/google-fonts";
import css from "./font-input.module.scss";

const DELIMITER = "[DELIMITER]";

const ALL_WEIGHT = [
  { value: "100", label: "100	Thin" },
  { value: "200", label: "200	Extra Light" },
  { value: "300", label: "300	Light" },
  { value: "400", label: "400	Normal" },
  { value: "500", label: "500	Medium" },
  { value: "600", label: "600	Semi Bold" },
  { value: "700", label: "700	Bold" },
  { value: "800", label: "800	Extra Bold" },
  { value: "900", label: "900	Black" },
  { value: "950", label: "950	Extra Black" },
];

const SYSTEM_WEIGHT = [
  { value: "400", label: "400	Normal" },
  { value: "700", label: "700	Bold" },
];
const W_MAP = {
  "100": "100	Thin",
  "200": "200	Extra Light",
  "300": "300	Light",
  "400": "400	Normal",
  "500": "500	Medium",
  "600": "600	Semi Bold",
  "700": "700	Bold",
  "800": "800	Extra Bold",
  "900": "900	Black",
  "950": "950	Extra Black",
};

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

  const isSystem = !!systemFonts.find(
    (font) => font.label === value.fontFamily
  );

  let weightOptions = [...SYSTEM_WEIGHT];

  if (!isSystem) {
    weightOptions = getGoogleVariantsNice(value.fontFamily).map((w) => ({
      label: (W_MAP as any)[w],
      value: w,
    }));
  }

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

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [value.fontFamily]);

  return (
    <>
      <FormGroup label={displayName} labelFor="text-input" inline>
        <HTMLSelect
          style={{ width: "200px", display: "inline-block" }}
          id="text-input"
          options={_options as any}
          value={value.fontFamily + DELIMITER + value.source}
          onChange={(event: ChangeEvent) => {
            const [fontFamily, source] = (
              event.currentTarget as HTMLSelectElement
            ).value.split(DELIMITER);

            setLoading(true);

            const newVariants = getGoogleVariantsNice(fontFamily);

            let weight = value.weight;
            if (newVariants.indexOf(value.weight ?? "") === -1) {
              weight = "400";
            }

            onChange({ ...value, fontFamily, source, weight });
          }}
        />
        {loading && <Spinner size={18} className={css.spinner} />}
      </FormGroup>

      <FormGroup label={"Weight"} labelFor="text-input" inline>
        <HTMLSelect
          id="text-input"
          options={weightOptions}
          value={value.weight}
          onChange={(event: ChangeEvent) => {
            const weight = (event.currentTarget as HTMLSelectElement).value;

            onChange({ ...value, weight });
          }}
        />
      </FormGroup>
    </>
  );
};
