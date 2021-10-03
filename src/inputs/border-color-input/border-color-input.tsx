import { cloneDeep } from "lodash-es";
import React from "react";
import { getCheckboxField, getColorField } from "../input-utils";
import { IBorderColorInput, IUpdateInput } from "../types";

export const BorderColorInputForm: React.FC<IBorderColorInput & IUpdateInput> =
  (props) => {
    const { value, onChange } = props;

    const renderForm1 = () => {
      return (
        <div>
          <div className="input60">
            {getColorField(
              "Bottom color",
              value.bottomBorderColor,
              (bottomBorderColor: any) => {
                onChange({ ...value, bottomBorderColor });
              },
              ""
            )}
          </div>
          <div className="input60">
            {getColorField(
              "Top color",
              value.topBorderColor,
              (topBorderColor: any) => {
                onChange({ ...value, topBorderColor });
              },
              ""
            )}
          </div>
          <div className="input60">
            {getColorField(
              "Left color",
              value.leftBorderColor,
              (leftBorderColor: any) => {
                onChange({ ...value, leftBorderColor });
              },
              ""
            )}
          </div>
          <div className="input60">
            {getColorField(
              "Right color",
              value.rightBorderColor,
              (rightBorderColor: any) => {
                onChange({ ...value, rightBorderColor });
              },
              ""
            )}
          </div>
        </div>
      );
    };
    const renderForm2 = () => {
      return (
        <div className="input60">
          {getColorField(
            "Background color",
            value.borderColor,
            (borderColor: any) => {
              onChange({ ...value, borderColor });
            },
            ""
          )}
        </div>
      );
    };

    const renderCB = () => {
      return (
        <div>
          {getCheckboxField(
            "Select color for each side",
            value.useDifferentValues,
            (useDifferentValues: any) => {
              const valueClone = cloneDeep(value);
              valueClone.useDifferentValues = useDifferentValues;
              onChange(valueClone);
            }
          )}
        </div>
      );
    };
    return (
      <>
        {value.useDifferentValues ? (
          <div>
            {renderCB()} {renderForm1()}
          </div>
        ) : (
          <div>
            {renderCB()} {renderForm2()}
          </div>
        )}
      </>
    );
  };
