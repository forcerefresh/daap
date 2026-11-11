import React, { useEffect, useState } from "react";
import { getColorField, getSelectSlider } from "../input-utils";
import {
  IGradientInput,
  IUpdateInput,
  OnChangeType,
} from "webslider-sdk/lib/inputs/i-inputs";
import { cloneDeep } from "lodash-es";
import css from "./linear-gradient-input.module.scss";
import { RGBColor } from "react-color";

export const LinearGradientInputForm: React.FC<
  IGradientInput & IUpdateInput
> = (props) => {
  const { value, onChange, onPreview } = props;

  const [localAngle, setLocalAngle] = useState(0);

  useEffect(() => {
    setLocalAngle(value.angle);
  }, [value.angle]);

  return (
    <div className={css.main}>
      <div>
        {value.points.map((point, index) => (
          <React.Fragment key={index}>
            <div className={css.colorRow}>
              {getColorField(
                "",
                point.color,
                (colorValue) => {
                  const valueClone = cloneDeep(value);
                  valueClone.points[index].color = colorValue;
                  onChange(valueClone);
                },
                "",
                undefined,
                ((colorValue: RGBColor) => {
                  const valueClone = cloneDeep(value);
                  valueClone.points[index].color = colorValue;
                  onPreview?.(valueClone);
                }) as OnChangeType,
              )}
            </div>
          </React.Fragment>
        ))}

        <div>Angle</div>
        {getSelectSlider(
          "",
          localAngle,
          {
            min: 0,
            max: 360,
            labelStepSize: 1,
            stepSize: 1,
            suffix: "",
            trackFill: false,
          },
          (angle: any) => {
            const valueClone = cloneDeep(value);
            valueClone.angle = angle;
            onChange(valueClone);
          },
          (angle: any) => {
            setLocalAngle(angle);
            const valueClone = cloneDeep(value);
            valueClone.angle = angle;
            onPreview?.(valueClone);
          },
        )}
      </div>
    </div>
  );
};
