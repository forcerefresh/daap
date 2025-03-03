import React from "react";
import {
  getCoverLayoutField,
  getFontFamilyField,
  getUnitNumericFiled,
} from "../../inputs/input-utils";
import { cloneDeep } from "lodash-es";
import { Button } from "@blueprintjs/core";
import { IToolbarProps } from "../../utils/tools/types";
import { ImageValues } from "./image";
import { convertRGBColor2RGBAString } from "webslider-sdk/lib/utils/utils";
import { hexToRGB } from "../../utils/utils";
import css from "./ImageToolbar.module.scss";
import {
  IFontSelectInputValue,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
import cx from "classnames";
import colorInputCss from "../../inputs/color-input/color-input.module.scss";
import ColorInputForm from "../../inputs/color-input/color-input";

const ICON_HEIGHT = 36;

const alignArr = ["left", "center", "right", "justify"];

export function ImageToolbar(props: IToolbarProps): React.ReactElement {
  const { mode, object, updateObject, deleteObject } = props;

  const values = object?.properties as ImageValues | undefined;

  return (
    <>
      {object && values && (
        <div className={css.inputsHolder}>
          {getCoverLayoutField("", values.fit, (v) => {
            if (object) {
              const newObject = cloneDeep(object);
              newObject.properties.fit = v;
              updateObject(newObject);
            }
          })}
        </div>
      )}
    </>
  );
}
