import React from "react";
import { Button } from "@blueprintjs/core";
import { getColorField } from "../input-utils";
import { IColorArrayInput, IUpdateInput } from "../types";
import { cloneDeep } from "lodash";

export const ColorArrayInputForm: React.FC<IColorArrayInput & IUpdateInput> = (
  props
) => {
  const { value, onChange } = props;

  const renderAddBtn = () => {
    return (
      <div>
        <p>Add color</p>
        <Button
          minimal
          onClick={() => {
            onChange([...value, { r: 256, g: 256, b: 256, a: 1 }]);
          }}
          small={true}
          icon="add"
        ></Button>
      </div>
    );
  };

  return (
    <div>
      <ul>
        {value.map((color, index) => (
          <>
            <div>
              <div className="input60">
                {getColorField(
                  "color:",
                  color,
                  (colorValue: any) => {
                    const valueClone = cloneDeep(value);
                    valueClone[index] = colorValue;
                    onChange(valueClone);
                  },
                  ""
                )}
              </div>
              <Button
                disabled={value.length === 1}
                minimal
                onClick={() => {
                  value.splice(index, 1);
                  onChange(value);
                }}
                small={true}
                icon="delete"
              ></Button>
            </div>
          </>
        ))}
      </ul>
      {renderAddBtn()}
    </div>
  );
};
