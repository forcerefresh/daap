import React from "react";
import cx from "classnames";
import { cloneDeep } from "lodash-es";
import { Label } from "@blueprintjs/core";
import {
  getButtonGroupField,
  getSelectField,
  getUnitNumericFiled,
} from "../input-utils";
import {
  ICoverPlacementInput,
  ILayoutChildrenInput,
  IUpdateInput,
} from "webslider-sdk2/lib/inputs/i-inputs";
import { IObject } from "webslider-sdk2/lib/objects/i-object";
import { objects } from "../../store/reducers/objects";
//import css from "./layout-childern-input.module.scss";

const LAYOUT_TYPE_OPTIONS = [
  { label: "column", value: "column" },
  { label: "row", value: "row" },
  { label: "inline", value: "inline" },
];

const ALIGN_OPTIONS = [
  { label: "start", value: "start" },
  { label: "center", value: "center" },
  { label: "end", value: "end" },
];

const JUSTIFY_OPTIONS = [
  { label: "start", value: "start" },
  { label: "center", value: "center" },
  { label: "end", value: "end" },
];

export const LayoutChildrenInputForm: React.FC<
  ILayoutChildrenInput &
    IUpdateInput & {
      layerData?: {
        //layer?: ILayer;
        objects?: IObject[];
      };
    }
> = (props) => {
  const { value, onChange, layerData } = props;

  return (
    <>
      <div className="input60">
        {getSelectField(
          "Type",
          value.type,
          LAYOUT_TYPE_OPTIONS,
          (type: any) => {
            const valueClone = cloneDeep(value);
            valueClone.type = type;
            onChange(valueClone);
          }
        )}
      </div>

      <div className={cx("input60")}>
        {getSelectField("Align", value.align, ALIGN_OPTIONS, (align: any) => {
          const valueClone = cloneDeep(value);
          valueClone.align = align;
          onChange(valueClone);
        })}

        {getSelectField(
          "Justify",
          value.justify,
          JUSTIFY_OPTIONS,
          (justify: any) => {
            const valueClone = cloneDeep(value);
            valueClone.justify = justify;
            onChange(valueClone);
          }
        )}
      </div>

      <div>
        {getButtonGroupField(
          "Gap",
          value.itemsGap.type,
          (type: any) => {
            const valueClone = cloneDeep(value);
            valueClone.itemsGap.type = type;
            onChange(valueClone);
          },
          [
            { value: "common", label: "Common" },
            { value: "each", label: "Each" },
          ]
        )}
      </div>
      {value.itemsGap.type === "common" && (
        <div>
          {getUnitNumericFiled(
            "Common",
            value.itemsGap.commonValue,
            (commonValue: any) => {
              const valueClone = cloneDeep(value);
              valueClone.itemsGap.commonValue = commonValue;
              onChange(valueClone);
            }
          )}
        </div>
      )}

      {value.itemsGap.type === "each" && (
        <div>
          {layerData?.objects?.map((object, idx) => {
            if (idx === layerData.objects!.length - 1) return null;

            return getUnitNumericFiled(
              `Gap ${idx + 1}`,
              value.itemsGap.eachValues[idx]
                ? value.itemsGap.eachValues[idx]
                : "",
              (eachValue: any) => {
                const valueClone = cloneDeep(value);
                valueClone.itemsGap.eachValues[idx] = eachValue;
                onChange(valueClone);
              }
            );
          })}
        </div>
      )}
    </>
  );
};
