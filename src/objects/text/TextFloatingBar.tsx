import React from "react";
import { getUnitNumericFiled } from "../../inputs/input-utils";
import { cloneDeep } from "lodash-es";
import { Button, Icon, Popover } from "@blueprintjs/core";
import { IToolbarProps } from "../../utils/tools/types";
import { TextValues } from "./text";

import css from "./TextFloatingBar.module.scss";
import colorInputCss from "../../inputs/color-input/color-input.module.scss";
import {
  IBorderColorValue,
  IBorderValue,
  IBoxValue,
  IClipMaskValue,
  ICornerRadiusValue,
  ICoverPlacementValue,
  IFontSelectInputValue,
  IGridLayoutInputValue,
  IInsetLayoutInputValue,
  ILayoutChildrenValue,
  INumericTimelineValue,
  IParallaxInputValue,
  IRelativePositionValue,
  IRelativeRotationValue,
  ITextStartPositionValue,
  ITimelinesValue,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
import { ColorInputForm } from "../../inputs/color-input/color-input";
import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";
import ContextMenu from "../../panels/context-menu/ContextMenu";
import AIContextMenu from "./AIContextMenu";

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

      <Popover
        content={<AIContextMenu />}
        placement="bottom-end"
        // tslint:disable-next-line jsx-no-lambda
        renderTarget={({ isOpen, ...p }) => (
          <Button {...p} minimal style={{ color: "rgb(110 240 239)" }}>
            <Icon
              icon={"clean"}
              style={{ marginRight: "5px", color: "rgb(110 240 239)" }}
            />
            Assist
          </Button>
        )}
      />

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
        <ColorInputForm
          inputType={InputType.COLOR}
          displayName={""}
          propertyName={""}
          value={values.color}
          defaultValue={null}
          onChange={(value: any) => {
            const newObject = cloneDeep(object);
            newObject.definition.values.color = value;
            updateObject(newObject);
          }}
          inputProps={{
            swatchClassName: colorInputCss.squareSwatch,
            className: colorInputCss.squareColorInput,
          }}
        />
        {/* <input
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
        /> */}
      </div>
    </div>
  ) : null;
}
