import React from "react";
import cx from "classnames";
import { cloneDeep } from "lodash-es";
import { Alignment, Label } from "@blueprintjs/core";
import {
  getSelectField,
  getNumericFiled,
  getCheckboxField,
} from "../input-utils";
import {
  ICoverPlacementInput,
  INumericTimelineInput,
  INumericTimelineValue,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import css from "./numeric-timeline-input.module.scss";

export const NumericTimelineInputForm: React.FC<
  INumericTimelineInput & IUpdateInput
> = (props) => {
  const { displayName, value, onChange } = props;

  return (
    <>
      <div className="input60">
        {getNumericFiled(
          displayName,
          value.value,

          (newValue: any) => {
            const valueClone = cloneDeep(value);
            valueClone.value = newValue;
            onChange(valueClone);
          }
        )}
      </div>

      <div className={cx(css.rowHolder, "input60")}>
        <div className="bp3-form-group bp3-inline">
          <Label></Label>

          <div className={cx(css.rowHolderInputs)}>
            {getCheckboxField(
              "Set different timing",
              value.hasTimelineProperties,
              (hasTimelineProperties: any) => {
                const valueClone = cloneDeep(value);
                valueClone.hasTimelineProperties = hasTimelineProperties;
                onChange(valueClone);
              },
              undefined,
              { alignIndicator: Alignment.LEFT }
            )}

            {/*<div className={css.smallTimelineHolder}>
              <div className={css.smallTimeline}></div>
            </div>*/}

            {value.hasTimelineProperties && (
              <>
                {getNumericFiled(
                  "Delay",
                  value.delay,

                  (delay: any) => {
                    const valueClone = cloneDeep(value);
                    valueClone.delay = delay;
                    onChange(valueClone);
                  }
                )}

                {getNumericFiled(
                  "Duraton",
                  value.duration,

                  (duration: any) => {
                    const valueClone = cloneDeep(value);
                    valueClone.duration = duration;
                    onChange(valueClone);
                  }
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
