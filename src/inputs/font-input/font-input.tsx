import { FormGroup, HTMLSelect, Spinner } from "@blueprintjs/core";
import cx from "classnames";
import React, { ChangeEvent, useEffect, useState } from "react";
import { getGlobals } from "../../globals";
import {
  IFontSelectInput,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { getGoogleVariantsNice } from "../../utils/fonts/google-fonts";
import css from "./font-input.module.scss";

const DELIMITER = "[DELIMITER]";


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
  const { displayName, value, onChange, minimal } = props;

  const googleFonts = (getGlobals()
    .getFonts?.() ?? [])
    .filter((font) => font.source === "google-fonts")
    .sort()
    .map((item) => ({
      label: item.fontFamily,
      value: item.fontFamily + DELIMITER + item.source,
    }));

  const myFonts = (getGlobals().getMyFonts?.() ?? [])
    .map((font) => font.name)
    .sort()
    .map((name) => ({
      label: name,
      value: name + DELIMITER + "my-fonts",
    }));

  const isGoogleFont = !!googleFonts.find(
    (font) => font.label === value.fontFamily
  );

  let weightOptions = [...SYSTEM_WEIGHT];

  if (isGoogleFont) {
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
      label: "My fonts",
      value: "Disabled1",
      disabled: true,
    },
    ...myFonts,
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
      <FormGroup
        label={displayName}
        labelFor="text-input"
        inline
        className={cx({ [css.formGroupMinimal]: minimal })}
      >
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
        {loading && (
          <Spinner
            size={18}
            className={cx(css.spinner, { [css.spinnerMinimal]: minimal })}
          />
        )}
      </FormGroup>

      <FormGroup
        label={minimal ? "" : "Weight"}
        labelFor="text-input"
        inline
        className={cx({ [css.formGroupMinimal]: minimal })}
      >
        <HTMLSelect
          id="text-input"
          options={weightOptions}
          value={value.weight}
          style={{ width: "130px", display: "inline-block" }}
          onChange={(event: ChangeEvent) => {
            const weight = (event.currentTarget as HTMLSelectElement).value;

            onChange({ ...value, weight });
          }}
        />
      </FormGroup>
    </>
  );
};
