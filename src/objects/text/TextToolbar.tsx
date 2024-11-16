import React from "react";
import {
  getFontFamilyField,
  getUnitNumericFiled,
} from "../../inputs/input-utils";
import { cloneDeep } from "lodash-es";
import { Button, Icon, Popover } from "@blueprintjs/core";
import { IToolbarProps } from "../../utils/tools/types";
import { TextValues } from "./text";
import { convertRGBColor2RGBAString } from "webslider-sdk/lib/utils/utils";
import { hexToRGB } from "../../utils/utils";
import css from "./TextToolbar.module.scss";
import {
  IFontSelectInputValue,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
import cx from "classnames";
import colorInputCss from "../../inputs/color-input/color-input.module.scss";
import { ColorInputForm } from "../../inputs/color-input/color-input";
import AIContextMenu from "./AIContextMenu";

const ICON_HEIGHT = 36;

const alignArr = ["left", "center", "right", "justify"];

export function TextToolbar(props: IToolbarProps): React.ReactElement {
  const { mode, object, updateObject, deleteObject } = props;

  const values = object?.properties as TextValues | undefined;

  return (
    <>
      {object && values && (
        <div className={css.inputsHolder}>
          <Popover
            content={<AIContextMenu />}
            placement="bottom-end"
            // tslint:disable-next-line jsx-no-lambda
            renderTarget={({ isOpen, ...p }) => (
              <Button
                {...p}
                minimal
                style={{ color: "rgb(110 240 239)" }}
                className={cx(css.button, css.squareButton)}
                icon={
                  <Icon
                    icon={"clean"}
                    style={{ marginRight: "5px", color: "rgb(110 240 239)" }}
                  />
                }
              ></Button>
            )}
          />

          {getFontFamilyField(
            "",
            values.font,
            (v: IFontSelectInputValue) => {
              const newObject = cloneDeep(object);
              newObject.properties.font = v;
              updateObject(newObject);
            },
            { minimal: true }
          )}

          {/* {getUnitNumericFiled(
            "",
            values.fontSize + "px",
            (v: string) => {
              const newObject = cloneDeep(object);
              newObject.definition.values.fontSize = v;
              updateObject(newObject);
            },
            "",
            {
              //className: css.fontSizeInput,
            },
            ["px", "em"]
          )} */}

          {/* <div className={css.inputHolder}> */}
          {getUnitNumericFiled(
            "",
            values.fontSize,
            (v: string) => {
              const newObject = cloneDeep(object);
              newObject.properties.fontSize = v;
              updateObject(newObject);
            },
            "",
            {
              className: css.strokeInput,
              showIncDec: true,
            },
            ["px", "em"]
          )}
          {/* </div> */}

          <div className={css.colorInputHolder}>
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
          </div>
          {/* 
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
            style={{ width: "35px", height: "35px", margin: "10px" }}
          /> */}

          <Button
            className={cx(css.button, css.squareButton)}
            minimal
            active={values.bold}
            onClick={(e: React.MouseEvent) => {
              const newObject = cloneDeep(object);
              newObject.definition.values.bold = !values.bold;
              updateObject(newObject);
            }}
            icon={"bold"}
          ></Button>
          <Button
            className={cx(css.button, css.squareButton)}
            minimal
            active={values.italic}
            onClick={(e: React.MouseEvent) => {
              const newObject = cloneDeep(object);
              newObject.definition.values.italic =
                !newObject.definition.values.italic;
              updateObject(newObject);
            }}
            icon={"italic"}
          ></Button>
          <Button
            className={cx(css.button, css.squareButton)}
            minimal
            active={values.underline}
            onClick={(e: React.MouseEvent) => {
              const newObject = cloneDeep(object);
              newObject.definition.values.underline =
                !newObject.definition.values.underline;
              updateObject(newObject);
            }}
            icon={"underline"}
          ></Button>

          <Button
            className={cx(css.button, css.squareButton)}
            minimal
            onClick={(e: React.MouseEvent) => {
              const newObject = cloneDeep(object);

              let nextIndex = alignArr.indexOf(values.textAlign) + 1;
              nextIndex = nextIndex >= alignArr.length ? 0 : nextIndex;

              newObject.definition.values.textAlign = alignArr[nextIndex];
              updateObject(newObject);
            }}
            icon={`align-${values.textAlign}`}
          ></Button>
          <div className={css.rightHolder}>
            {/* <div>
              <Button
                style={{ float: "right" }}
                minimal
                onClick={() => {
                  deleteObject(object);
                }}
                icon={"trash"}
              ></Button>
            </div> */}
          </div>
        </div>
      )}
    </>
  );
}
