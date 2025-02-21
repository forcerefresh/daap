import React, { useEffect, useState } from "react";
import { Button, Label } from "@blueprintjs/core";
import { getColorField, getSelectSlider } from "../input-utils";
import {
  IGradientInput,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { cloneDeep } from "lodash";
import css from "./linear-gradient-input.module.scss";
import { RGBColor } from "react-color";

const getDefaultColor = () => ({ r: 256, g: 256, b: 256, a: 1 });

export const LinearGradientInputForm: React.FC<
  IGradientInput & IUpdateInput
> = (props) => {
  const { displayName, value, onChange, onPreview } = props;

  const [localAngle, setLocalAngle] = useState(0);

  useEffect(() => {
    setLocalAngle(value.angle);
  }, [value.angle]);

  const renderAddBtn = () => {
    return null;
    return (
      <Button
        className={css.addButton}
        minimal
        onClick={() => {
          const valueClone = cloneDeep(value);
          valueClone.points.push({ color: getDefaultColor(), stop: 100 });
          onChange(valueClone);
        }}
        small={true}
        icon="add"
      >
        Add color
      </Button>
    );
  };

  return (
    <div className={css.main}>
      <div>
        {value.points.map((point, index) => (
          <React.Fragment key={index}>
            <div className={css.colorRow}>
              {/* <div className="input60">
                <Label> {index === 0 ? displayName : null}</Label>
              </div> */}

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
                (colorValue: RGBColor) => {
                  const valueClone = cloneDeep(value);
                  valueClone.points[index].color = colorValue;
                  onPreview?.(valueClone);
                }
              )}
              {/* <div> {index === 0 ? "Start" : "End"}</div> */}

              {/* {value.points.length > 1 && (
                <Button
                  className={css.deleteColorBtn}
                  minimal
                  onClick={() => {
                    value.points.splice(index, 1);
                    onChange(value);
                  }}
                  small={true}
                  icon="delete"
                ></Button>
              )} */}
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
          }
        )}
      </div>
      {renderAddBtn()}
    </div>
  );
};
