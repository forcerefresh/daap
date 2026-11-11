import React from "react";
import { getUnitNumericFiled } from "../../inputs/input-utils";
import { cloneDeep } from "lodash-es";
import Pencil from "./assets/pencil2.svg?react";
import { FreeDrawValues } from "./free-draw";
import { Button } from "@blueprintjs/core";
import { IFreeDrawToolConfig } from "./types";
import {
  IToolConfig,
  IToolbarProps,
  ToolbarMode,
} from "../../utils/tools/types";
import css from "./FreeDrawToolbar.module.scss";
import ColorInputForm from "../../inputs/color-input/color-input";
import { InputType } from "webslider-sdk/lib/inputs/i-inputs";
import colorInputCss from "../../inputs/color-input/color-input.module.scss";

const ICON_HEIGHT = 36;

export function FreeDrawToolbar(props: IToolbarProps): React.ReactElement {
  const {
    mode,
    object,
    updateObject,
    updateObjectForPreview,
    toolConfig,
    setToolConfig,
  } = props;

  const freeDrawToolState = toolConfig as IToolConfig<IFreeDrawToolConfig>;
  const currentStroke = freeDrawToolState.strokeWidth ?? "5";

  const values = object?.properties as FreeDrawValues | undefined;

  return (
    <div className={css.inputsHolder}>
      {mode === ToolbarMode.Selection && object && values && (
        <div className={css.inputHolder}>
          {getUnitNumericFiled(
            "",
            values.strokeWidth + "px",
            (v: string) => {
              const newObject = cloneDeep(object);
              newObject.properties.strokeWidth = parseInt(v).toString();
              updateObject(newObject);
            },
            "",
            {
              className: css.strokeInput,
              showIncDec: true,
            },
            ["px"],
          )}

          <div className={css.colorInputHolder}>
            <ColorInputForm
              inputType={InputType.COLOR}
              displayName={""}
              propertyName={""}
              value={values.color ?? { r: 255, g: 255, b: 255, a: 1 }}
              defaultValue={null}
              onChange={(value: any) => {
                if (object) {
                  const newObject = cloneDeep(object);
                  newObject.properties.color = value;
                  updateObject(newObject);
                }
              }}
              onPreview={(value: any) => {
                if (object) {
                  const newObject = cloneDeep(object);
                  newObject.properties.color = value;
                  updateObjectForPreview(newObject);
                }
              }}
              inputProps={{
                swatchClassName: colorInputCss.squareSwatch,
                className: colorInputCss.squareColorInput,
              }}
            />
          </div>

          <div className={css.rightHolder}></div>
        </div>
      )}

      {mode === ToolbarMode.Edit && (
        <>
          <div>
            <Button
              minimal
              active={currentStroke === "1" && !freeDrawToolState.eraser}
              onClick={() => {
                setToolConfig({
                  ...freeDrawToolState,
                  strokeWidth: "1",
                  eraser: false,
                });
              }}
              className={css.pencilButton}
            >
              <Pencil
                style={{
                  width: "12px",
                  height: ICON_HEIGHT + "px",
                }}
              />
            </Button>
          </div>

          <div>
            <Button
              minimal
              active={currentStroke === "5" && !freeDrawToolState.eraser}
              onClick={() => {
                setToolConfig({
                  ...freeDrawToolState,
                  strokeWidth: "5",
                  eraser: false,
                });
              }}
              className={css.pencilButton}
            >
              <Pencil
                style={{
                  width: "17px",
                  height: ICON_HEIGHT + "px",
                }}
              />
            </Button>
          </div>

          <div>
            <Button
              minimal
              active={currentStroke === "10" && !freeDrawToolState.eraser}
              onClick={() => {
                setToolConfig({
                  ...freeDrawToolState,
                  strokeWidth: "10",
                  eraser: false,
                });
              }}
              className={css.pencilButton}
            >
              <Pencil
                style={{
                  width: "22px",
                  height: ICON_HEIGHT + "px",
                }}
              />
            </Button>
          </div>

          <div>
            <Button
              minimal
              active={currentStroke === "20" && !freeDrawToolState.eraser}
              onClick={() => {
                setToolConfig({
                  ...freeDrawToolState,
                  strokeWidth: "20",
                  eraser: false,
                });
              }}
              className={css.pencilButton}
            >
              <Pencil
                style={{
                  width: "27px",
                  height: ICON_HEIGHT + "px",
                }}
              />
            </Button>
          </div>

          <div className={css.inputHolder}>
            {getUnitNumericFiled(
              "",
              currentStroke + "px",
              (v: string) => {
                setToolConfig({
                  ...freeDrawToolState,
                  strokeWidth: parseInt(v).toString(),
                  eraser: false,
                });
              },
              "",
              {
                className: css.strokeInput,
                showIncDec: true,
              },
              ["px"],
            )}
          </div>

          <div className={css.colorInputHolder}>
            <ColorInputForm
              inputType={InputType.COLOR}
              displayName={""}
              propertyName={""}
              value={
                freeDrawToolState?.color ?? { r: 255, g: 255, b: 255, a: 1 }
              }
              defaultValue={null}
              onChange={(value: any) => {
                setToolConfig({
                  ...freeDrawToolState,
                  color: value,
                  eraser: false,
                });

              }}
              inputProps={{
                swatchClassName: colorInputCss.squareSwatch,
                className: colorInputCss.squareColorInput,
              }}
            />
          </div>

        </>
      )}
    </div>
  );
}
