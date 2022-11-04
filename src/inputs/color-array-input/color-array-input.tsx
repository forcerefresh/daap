import React from "react";
import { Button, Label } from "@blueprintjs/core";
import { getColorField } from "../input-utils";
import {
  IColorArrayInput,
  IUpdateInput,
} from "webslider-sdk2/lib/inputs/i-inputs";
import { cloneDeep } from "lodash";
import css from "./color-array-input.module.scss";

const getDefaultColor = () => ({ r: 256, g: 256, b: 256, a: 1 });

export const ColorArrayInputForm: React.FC<IColorArrayInput & IUpdateInput> = (
  props
) => {
  const { displayName, value, onChange } = props;

  const renderAddBtn = () => {
    return (
      <Button
        className={css.addButton}
        minimal
        onClick={() => {
          onChange([...value, getDefaultColor()]);
        }}
        small={true}
        icon="add"
      >
        Add color
      </Button>
    );
  };

  return (
    <div className={css.main}>
      <div>
        {value.map((color, index) => (
          <>
            <div className={css.colorRow}>
              <div className="input60">
                <Label> {index === 0 ? displayName : null}</Label>
              </div>
              {getColorField(
                "",
                color,
                (colorValue: any) => {
                  const valueClone = cloneDeep(value);
                  valueClone[index] = colorValue;
                  onChange(valueClone);
                },
                ""
              )}

              {value.length > 1 && (
                <Button
                  className={css.deleteColorBtn}
                  minimal
                  onClick={() => {
                    value.splice(index, 1);
                    onChange(value);
                  }}
                  small={true}
                  icon="delete"
                ></Button>
              )}
            </div>
          </>
        ))}
      </div>
      {renderAddBtn()}
    </div>
  );
};
