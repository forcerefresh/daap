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
  IUpdateInput,
} from "webslider-sdk2/lib/inputs/i-inputs";
import css from "./border-input.module.scss";

export const BorderInputForm: React.FC<IBorderInput & IUpdateInput> = (
  props
) => {
  const { displayName, value, onChange } = props;

  const renderForm1 = () => {
    return (
      <div>
        <div className="input60">
          {getColorField(
            "Bottom",
            value.bottom.color,
            (color: RGBColor) => {
              onChange({ ...value, bottom: { ...value.bottom, color } });
            },
            ""
          )}
        </div>
        <div className="input60">
          {getColorField(
            "Top",
            value.top.color,
            (color: RGBColor) => {
              onChange({ ...value, top: { ...value.top, color } });
            },
            ""
          )}
        </div>
        <div className="input60">
          {getColorField(
            "Left",
            value.left.color,
            (color: RGBColor) => {
              onChange({ ...value, top: { ...value.top, color } });
            },
            ""
          )}
        </div>
        <div className="input60">
          {getColorField(
            "Right",
            value.right.color,
            (color: RGBColor) => {
              onChange({ ...value, right: { ...value.right, color } });
            },
            ""
          )}
        </div>
      </div>
    );
  };
  const renderForm2 = () => {
    return (
      <div className={classnames(css.inlineRow)}>
        <Label>Common</Label>
        {getUnitNumericFiled(
          "",
          value.commonBorder.width,
          (width: string) => {
            onChange({
              ...value,
              commonBorder: { ...value.commonBorder, width },
            });
          },
          "",
          { style: { width: "90px" } }
        )}

        {getColorField(
          "",
          value.commonBorder.color,
          (color: any) => {
            onChange({
              ...value,
              commonBorder: { ...value.commonBorder, color },
            });
          },
          ""
        )}

        {getSelectField(
          "",
          value.commonBorder.style,
          getBorderOptions(),
          (style: any) => {
            onChange({
              ...value,
              commonBorder: { ...value.commonBorder, style },
            });
          }
        )}
      </div>
    );
  };

  const renderRow = (
    label: string,
    propertyName: "commonBorder" | "top" | "bottom" | "left" | "right"
  ) => {
    return (
      <div className={classnames(css.inlineRow)}>
        <Label>{label}</Label>
        {getUnitNumericFiled(
          "",
          value[propertyName].width,
          (width: string) => {
            onChange({
              ...value,
              [propertyName]: { ...value[propertyName], width },
            });
          },
          "",
          { style: { width: "90px" } }
        )}

        {getColorField(
          "",
          value[propertyName].color,
          (color: any) => {
            onChange({
              ...value,
              [propertyName]: { ...value[propertyName], color },
            });
          },
          ""
        )}

        {getSelectField(
          "",
          value[propertyName].style,
          getBorderOptions(),
          (style: any) => {
            onChange({
              ...value,
              [propertyName]: { ...value[propertyName], style },
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
          displayName,
          value.useCommonValue ? "common" : "sides",
          (useCommonValueStr: string) => {
            const valueClone = cloneDeep(value);
            valueClone.useCommonValue = useCommonValueStr === "common";
            onChange(valueClone);
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

  return (
    <>
      {value.useCommonValue ? (
        <div>
          {renderCB()} {renderForm2()}
        </div>
      ) : (
        <div>
          {renderCB()}
          {renderRow("Top", "top")}
          {renderRow("Right", "right")}
          {renderRow("Bottom", "bottom")}
          {renderRow("Left", "left")}
        </div>
      )}
    </>
  );
};
