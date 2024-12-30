import { Label } from "@blueprintjs/core";
import classnames from "classnames";
import { cloneDeep } from "lodash-es";
import React from "react";
import { RGBColor } from "react-color";
import { getBorderOptions } from "../../objects/create-object-factory";
import {
  getButtonGroupField,
  getCheckboxField,
  getColorField,
  getSelectField,
  getUnitNumericFiled,
} from "../input-utils";
import {
  IBorderColorInput,
  IBorderInput,
  IBorderSidesValue,
  IBorderValue,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import css from "./border-input.module.scss";
import { createInputLabel } from "../input-helpers";
import { isIBorderValue } from "webslider-sdk/lib/objects/common-properties-player";

export const BorderInputForm: React.FC<IBorderInput & IUpdateInput> = (
  props
) => {
  const { displayName, propertyName, value, onChange } = props;

  // const renderForm1 = () => {
  //   return (
  //     <div>
  //       <div className="input60">
  //         {getColorField(
  //           "Bottom",
  //           value.bottom.color,
  //           (color: RGBColor) => {
  //             onChange({ ...value, bottom: { ...value.bottom, color } });
  //           },
  //           ""
  //         )}
  //       </div>
  //       <div className="input60">
  //         {getColorField(
  //           "Top",
  //           value.top.color,
  //           (color: RGBColor) => {
  //             onChange({ ...value, top: { ...value.top, color } });
  //           },
  //           ""
  //         )}
  //       </div>
  //       <div className="input60">
  //         {getColorField(
  //           "Left",
  //           value.left.color,
  //           (color: RGBColor) => {
  //             onChange({ ...value, top: { ...value.top, color } });
  //           },
  //           ""
  //         )}
  //       </div>
  //       <div className="input60">
  //         {getColorField(
  //           "Right",
  //           value.right.color,
  //           (color: RGBColor) => {
  //             onChange({ ...value, right: { ...value.right, color } });
  //           },
  //           ""
  //         )}
  //       </div>
  //     </div>
  //   );
  // };

  const renderForm2 = (oneValue: IBorderValue) => {
    return (
      <div className={classnames(css.inlineRow)}>
        {/* <Label>{Common}</Label> */}
        {getUnitNumericFiled(
          "",
          oneValue.width,
          (width: string) => {
            onChange({
              ...oneValue,
              width,
            });
          },
          "",
          { style: { width: "90px" } }
        )}

        {getColorField(
          "",
          oneValue.color,
          (color: any) => {
            onChange({
              ...oneValue,
              color,
            });
          },
          ""
        )}

        {getSelectField(
          "",
          oneValue.style,
          getBorderOptions(),
          (style: any) => {
            onChange({
              ...oneValue,
              style,
            });
          }
        )}
      </div>
    );
  };

  const renderRow = (
    sidesValue: IBorderSidesValue,
    label: string,
    propertyName: "top" | "bottom" | "left" | "right"
  ) => {
    return (
      <div className={classnames(css.inlineRow)}>
        <Label>{label}</Label>
        {getUnitNumericFiled(
          "",
          sidesValue[propertyName].width,
          (width: string) => {
            onChange({
              ...sidesValue,
              [propertyName]: { ...sidesValue[propertyName], width },
            });
          },
          "",
          { style: { width: "90px" } }
        )}

        {getColorField(
          "",
          sidesValue[propertyName].color,
          (color: any) => {
            onChange({
              ...sidesValue,
              [propertyName]: { ...sidesValue[propertyName], color },
            });
          },
          ""
        )}

        {getSelectField(
          "",
          sidesValue[propertyName].style,
          getBorderOptions(),
          (style: any) => {
            onChange({
              ...sidesValue,
              [propertyName]: { ...sidesValue[propertyName], style },
            });
          }
        )}
      </div>
    );
  };

  const renderCB = () => {
    return (
      <div>
        {getButtonGroupField(
          createInputLabel(displayName, propertyName),
          isIBorderValue(value) ? "common" : "sides",
          (useCommonValueStr: string) => {
            const current = isIBorderValue(value) ? "common" : "sides";
            if (useCommonValueStr === current) return;

            if (useCommonValueStr === "common") {
              const valueClone = { ...(value as IBorderSidesValue).top };
              onChange(valueClone);
            } else {
              const valueClone = {
                top: { ...(value as IBorderValue) },
                bottom: { ...(value as IBorderValue) },
                left: { ...(value as IBorderValue) },
                right: { ...(value as IBorderValue) },
              };

              onChange(valueClone);
            }
          },
          [
            { value: "common", label: "Common" },
            { value: "sides", label: "Sides" },
          ]
        )}
        {/*getCheckboxField(
          "Select color for each side",
          value.useDifferentValues,
          (useDifferentValues: any) => {
            const valueClone = cloneDeep(value);
            valueClone.useDifferentValues = useDifferentValues;
            onChange(valueClone);
          }
        )*/}
      </div>
    );
  };

  if (isIBorderValue(value)) {
    return (
      <div>
        {renderCB()} {renderForm2(value)}
      </div>
    );
  } else {
    return (
      <div>
        {renderCB()}
        {renderRow(value, "T", "top")}
        {renderRow(value, "R", "right")}
        {renderRow(value, "B", "bottom")}
        {renderRow(value, "L", "left")}
      </div>
    );
  }
};
