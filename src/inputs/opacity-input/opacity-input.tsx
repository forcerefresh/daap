import { Label, Popover, PopoverInteractionKind, Position } from "@blueprintjs/core";
import BackgroundSVG from "./transparent-bg.svg?react";

import { noop } from "lodash-es";
import { IExtraOptions, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
import { getSelectSlider } from "../input-utils";
import cx from "classnames";

import css from "./opacity-input.module.scss";

export interface IOpacityInput<T = string> extends IExtraOptions {
  inputType: "opacity";
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: number;
  defaultValue: number;

  inputProps?: {
    disabled?: boolean;
    readOnly?: boolean;
  };
}

export const OpacityInputForm: React.FC<IOpacityInput & IUpdateInput> = (
  props
) => {
  const {
    value,
    onChange = noop,
    onPreview = noop,
  } = props;

  return (
    <Popover
      className={cx(css.popover)}
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.BOTTOM}
      modifiers={{ preventOverflow: { enabled: true } }}
      usePortal={true}
      minimal
      content={
        <div className={cx(css.sliderHolder, "opacity-popover")}>
          <div>
            <Label>Opacity</Label>
            {getSelectSlider(
              "",
              value ?? 100,
              {
                min: 0,
                max: 100,
                suffix: "",
                stepSize: 1,
                labelStepSize: 1,
                trackFill: false,
              },
              (opacity: number) => {
                onChange(opacity);
              },
              (opacity: number) => {
                onPreview(opacity);
              }
            )}
          </div>
        </div>
      }
    >
      <div
        id="color-input"
        className={cx(css.opacityButton)}
        onClick={noop}
      >
        <BackgroundSVG
          style={{
            position: "absolute",
            transform: "scale(0.56)",
            transformOrigin: "top left",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0), rgba(55,55,55,1))",
            transformOrigin: "top left",
          }}
        />

        <span
          style={{
            position: "absolute",
            opacity: "0.8",
            color: "rgb(255, 255, 255)",
            textShadow: "black 1px 1px 2px",
            background: "rgba(51, 51, 51, 0.34)",
            lineHeight: "13px",
            top: "6px",
            left: "0px",
            width: "25px",
            textAlign: "center",
          }}
        >
          {value !== 100 && value}
        </span>
      </div>
    </Popover>
  );
};
