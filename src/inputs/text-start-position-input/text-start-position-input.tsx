import React from "react";
import cx from "classnames";
import { cloneDeep } from "lodash-es";
import { Label } from "@blueprintjs/core";
import { getNumericFiled, getSelectField, getTextArea } from "../input-utils";
import {
  ITextStartPositionInput,
  IUpdateInput,
} from "webslider-sdk2/lib/inputs/i-inputs";
import css from "./text-start-position-input.module.scss";

const START_POSITION_OPTIONS = [
  { label: "Start", value: "0" },
  { label: "Center", value: "center" },
  { label: "Edges", value: "edges" },
  { label: "End", value: "end" },
  { label: "From character", value: "from-character" },
  { label: "Custom", value: "custom-order" },
];

export const TextStartPositionInputForm: React.FC<
  ITextStartPositionInput & IUpdateInput
> = (props) => {
  const { value, onChange } = props;

  return (
    <>
      <div className="input60">
        {getSelectField(
          "Start from",
          value.startFrom,
          START_POSITION_OPTIONS,
          (startFrom: any) => {
            const valueClone = cloneDeep(value);
            valueClone.startFrom = startFrom;
            onChange(valueClone);
          }
        )}
      </div>

      {(value.startFrom === "from-character" ||
        value.startFrom === "custom-order") && (
        <div className={cx(css.alignHolder, "input60")}>
          <div className="bp3-form-group bp3-inline">
            <Label></Label>
            <div className={cx("labelAuto")}>
              {value.startFrom === "from-character" &&
                getNumericFiled(
                  "Char idx",
                  value.fromCharacter,
                  (fromCharacter: any) => {
                    const valueClone = cloneDeep(value);
                    valueClone.fromCharacter = fromCharacter;
                    onChange(valueClone);
                  }
                )}

              {value.startFrom === "custom-order" &&
                getTextArea(
                  "Order",
                  value.customOrder,
                  (customOrder: any) => {
                    const valueClone = cloneDeep(value);
                    valueClone.customOrder = customOrder;
                    onChange(valueClone);
                  },
                  "Comma separated character position"
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
