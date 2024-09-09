import React from "react";
import {
  getFontFamilyField,
  getUnitNumericFiled,
} from "../../inputs/input-utils";
import { cloneDeep } from "lodash-es";
import { Button } from "@blueprintjs/core";
import { IToolbarProps } from "../../utils/tools/types";
import { TextValues } from "./text";
import { convertRGBColor2RGBAString } from "webslider-sdk/lib/utils/utils";
import { hexToRGB } from "../../utils/utils";
import css from "./TextFloatingBar.module.scss";
import { IFontSelectInputValue } from "webslider-sdk/lib/inputs/i-inputs";

const ICON_HEIGHT = 36;

export function TextFloatingToolbar(
  props: IToolbarProps
): React.ReactElement | null {
  const { mode, object, updateObject, deleteObject } = props;

  const values = object?.definition.values as TextValues | undefined;

  console.log(values);
  return object && values ? (
    <div className={css.inputsHolder}>
      {/* {getFontFamilyField(
        "",
        values.font,
        (v: IFontSelectInputValue) => {
          const newObject = cloneDeep(object);
          newObject.definition.values.font = v;
          updateObject(newObject);
        },
        { minimal: true }
      )} */}

      {getUnitNumericFiled(
        "",
        values.fontSize + "px",
        (v: string) => {
          const newObject = cloneDeep(object);
          newObject.definition.values.fontSize = v;
          updateObject(newObject);
        },
        "",
        {
          className: css.fontSizeInput,
          showIncDec: true,
        },
        ["px", "em"]
      )}

      <div>
        <input
          type="color"
          id="head"
          name="head"
          value={convertRGBColor2RGBAString(values.color)}
          onChange={(evt) => {
            const newObject = cloneDeep(object);
            newObject.definition.values.color = hexToRGB(
              evt.currentTarget.value
            );
            updateObject(newObject);
          }}
          style={{ width: "30px", height: "30px", margin: "0px" }}
        />
      </div>
    </div>
  ) : null;
}
