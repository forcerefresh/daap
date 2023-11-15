import React from "react";
import { getUnitNumericFiled } from "../../inputs/input-utils";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { cloneDeep } from "lodash-es";
import { ReactComponent as Pencil } from "./assets/pencil2.svg";
import { ReactComponent as Eraser } from "./assets/eraser.svg";
import { FreeDrawValues } from "./free-draw";
import { Button } from "@blueprintjs/core";
import { IToolConfig } from "../../utils/tools/ToolsProvider";
import { IFreeDrawToolConfig } from "./types";
import { ToolbarMode } from "../../utils/tools/types";
import css from "./FreeDrawToolbar.module.scss";

const ICON_HEIGHT = 36;

export interface IToolbarProps {
  mode?: ToolbarMode;
  object: IObject | null;
  addObject: (object: IObject) => void;
  updateObject: (object: IObject) => void;
  deleteObject: (object: IObject) => void;
  // tool configuration (use for internal shared state between Quick Toolbar and Stage Tool )
  toolConfig: IToolConfig<unknown>;
  setToolConfig: (toolConfig: IToolConfig<unknown>) => void;
}

export function FreeDrawToolbar(props: IToolbarProps): React.ReactElement {
  const {
    mode,
    object,
    updateObject,
    deleteObject,
    toolConfig,
    setToolConfig,
  } = props;

  const freeDrawToolState = toolConfig as IToolConfig<IFreeDrawToolConfig>;
  const currentStroke = freeDrawToolState.strokeWidth ?? "5";

  const values = object?.definition.values as FreeDrawValues | undefined;

  return (
    <>
      {mode === ToolbarMode.Selection && object && values && (
        <>
          <div className={css.inputHolder}>
            {getUnitNumericFiled(
              "",
              values.lines[0].strokeWidth + "px",
              (v: string) => {
                const newObject = cloneDeep(object);
                newObject.definition.values.lines[0].strokeWidth =
                  parseInt(v).toString();
                updateObject(newObject);
              },
              "",
              {
                className: css.strokeInput,
              },
              ["px"]
            )}
          </div>

          <div>
            <input
              type="color"
              id="head"
              name="head"
              value={values.lines[0]?.color ?? "white"}
              onChange={(evt) => {
                const newObject = cloneDeep(object);
                newObject.definition.values.lines[0].color =
                  evt.currentTarget.value;

                updateObject(newObject);
              }}
              style={{ width: "35px", height: "35px", margin: "10px" }}
            />
          </div>
          <div className={css.rightHolder}>
            <div>
              <Button
                style={{ float: "right" }}
                minimal
                onClick={() => {
                  deleteObject(object);
                }}
                icon={"trash"}
              ></Button>
            </div>
          </div>
        </>
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
              },
              ["px"]
            )}
          </div>

          <div>
            <input
              type="color"
              id="head"
              name="head"
              value={freeDrawToolState?.color ?? "white"}
              onChange={(evt) => {
                setToolConfig({
                  ...freeDrawToolState,
                  color: evt.currentTarget.value,
                  eraser: false,
                });
              }}
              style={{ width: "35px", height: "35px", margin: "10px" }}
            />
          </div>

          <div>
            <Button
              minimal
              active={freeDrawToolState.eraser}
              onClick={() => {
                setToolConfig({
                  ...freeDrawToolState,
                  eraser: true,
                });
              }}
            >
              <Eraser
                style={{
                  width: "27px",
                  height: ICON_HEIGHT + "px",
                }}
              />
            </Button>
          </div>
        </>
      )}
    </>
  );
}
