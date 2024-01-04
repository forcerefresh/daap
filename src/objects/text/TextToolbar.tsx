import React from "react";
import { getUnitNumericFiled } from "../../inputs/input-utils";
import { cloneDeep } from "lodash-es";
import { Button } from "@blueprintjs/core";
import { IToolbarProps } from "../../utils/tools/types";
import { TextValues } from "./text";
import { convertRGBColor2RGBAString } from "webslider-sdk/lib/utils/utils";
import { hexToRGB } from "../../utils/utils";
import css from "./TextToolbar.module.scss";

const ICON_HEIGHT = 36;

export function TextToolbar(props: IToolbarProps): React.ReactElement {
  const { mode, object, updateObject, deleteObject } = props;

  const values = object?.definition.values as TextValues | undefined;

  return (
    <>
      {object && values && (
        <>
          <div className={css.inputHolder}>
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
                className: css.strokeInput,
              },
              ["px", "em"]
            )}
          </div>

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
    </>
  );
}
