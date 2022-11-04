import { Label } from "@blueprintjs/core";
import React from "react";
import {
  ITransformOriginInput,
  IUpdateInput,
} from "webslider-sdk2/lib/inputs/i-inputs";
import css from "./transform-origin.module.scss";

const roundTo10 = (n: number) => {
  return Math.round(n / 10) * 10;
};
export const TransformOriginInputForm: React.FC<
  ITransformOriginInput & IUpdateInput
> = (props) => {
  const { displayName, helperText, value, onChange } = props;

  const onAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const adjustment = -4;
    var rect = e.currentTarget.getBoundingClientRect();
    var x = roundTo10(e.clientX - rect.left + adjustment); // x position within the element.
    var y = roundTo10(e.clientY - rect.top + adjustment); // y position within the element.
    onChange({ x, y });
  };

  const pointStyle = {
    left: value.x + "px",
    top: value.y + "px",
  };

  return (
    <div className={css.container}>
      <Label>{displayName}</Label>
      <div>
        <div className={css.area} onClick={onAreaClick}>
          <div className={css.point} style={pointStyle}></div>
        </div>
        <div className="bp3-form-helper-text">{helperText}</div>
      </div>
    </div>
  );
};
