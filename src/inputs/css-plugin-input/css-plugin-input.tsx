import React, { useEffect, useState } from "react";
import Draggable, {
  ControlPosition,
  DraggableData,
  DraggableEvent,
} from "react-draggable";
import {
  ICSSPointsInput,
  ICSSPointsValue,
  InputType,
  IUpdateInput,
} from "../types";
import css from "./css-plugin-input.module.scss";
import cx from "classnames";
import { cloneDeep, debounce, isNumber } from "lodash";
import { getNumericFiled } from "../input-utils";
import { roundNumber } from "../../utils/doom-utils/common";
import { getInputForm } from "../input-factory";

const formDefinition = [
  {
    displayName: "X",
    propertyName: "x",
    inputType: InputType.NUMBER,
  },
  {
    displayName: "Y",
    propertyName: "y",
    inputType: InputType.NUMBER,
  },
  {
    displayName: "Width",
    propertyName: "width",
    inputType: InputType.NUMBER,
  },
  {
    displayName: "Height",
    propertyName: "height",
    inputType: InputType.NUMBER,
  },
  {
    displayName: "Rotation",
    propertyName: "rotation",
    inputType: InputType.NUMBER,
  },
];

export const CSSPointsInputForm: React.FC<ICSSPointsInput & IUpdateInput> = (
  props
) => {
  const { value, onChange } = props;
  const lineRef = React.useRef(null);

  const [localValue, setLocalValue] = useState(value);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();

  useEffect(() => {
    debounceOnChange(localValue);
  }, [localValue]);

  const debounceOnChange = debounce((newValue: ICSSPointsValue) => {
    onChange(newValue);
  }, 100);

  const deletePoint = (index: number) => {
    setSelectedIndex(undefined);
    const newValue = cloneDeep(localValue);
    newValue.points.splice(index, 1);
    setLocalValue(newValue);
  };

  const lineWidth = (lineRef?.current as any)?.offsetWidth || 0;

  return (
    <div>
      <div className={css.cssPlugin}>
        <div
          className={css.line}
          ref={lineRef}
          onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            const adjustment = 0;
            const rect = event.currentTarget.getBoundingClientRect();
            const time = (event.clientX - rect.left) / lineWidth + adjustment;
            const newValue = cloneDeep(localValue);
            newValue.points.push({
              time: roundNumber(time * 100, 2),
              css: { x: 0, y: 0, width: 0, height: 0, rotation: 0 },
              easing: "abc",
            });
            setLocalValue(newValue);
            setSelectedIndex(newValue.points.length - 1);
          }}
        ></div>
        {lineWidth > 0 &&
          localValue.points.map((point, idx) => {
            const position: ControlPosition = {
              x: (point.time / 100) * lineWidth,
              y: 0,
            };
            return (
              <Draggable
                defaultClassName={
                  selectedIndex === idx ? css.selectedThumb : ""
                }
                key={idx}
                axis="x"
                handle=".handle"
                defaultPosition={{ x: 0, y: 0 }}
                position={position}
                grid={[1, 1]}
                scale={1}
                bounds={{ left: 0, right: lineWidth }}
                onDrag={(evt: DraggableEvent, data: DraggableData) => {
                  const percMultiplier = data.x === 0 ? 0 : data.x / lineWidth;
                  const newTime = percMultiplier * 100;
                  const newValue = cloneDeep(localValue);
                  newValue.points[idx].time = roundNumber(newTime, 2);
                  setLocalValue(newValue);
                }}
                onMouseDown={() => {
                  setSelectedIndex(idx);
                }}
              >
                <div
                  onDoubleClick={() => {
                    deletePoint(idx);
                  }}
                  className={cx(
                    css.thumb,
                    { [css.selectedThumb]: selectedIndex === idx },
                    "handle"
                  )}
                ></div>
              </Draggable>
            );
          })}
      </div>
      {selectedIndex !== undefined && (
        <>
          <div>
            {getNumericFiled(
              "time",
              localValue.points[selectedIndex!].time,
              () => {},
              "",
              { disabled: true }
            )}
          </div>

          {formDefinition.map((formDefinition) => {
            function onChange(value: any) {
              const newLocalValue = cloneDeep(localValue);
              (newLocalValue.points[selectedIndex!].css as any)[
                formDefinition.propertyName
              ] = value;

              console.log(newLocalValue);
              setLocalValue(newLocalValue);
            }

            const val = (localValue.points[selectedIndex!].css as any)[
              formDefinition.propertyName
            ];

            return getInputForm(
              formDefinition.inputType,
              { ...formDefinition, value: val },
              onChange,
              onChange
            );
          })}
        </>
      )}
    </div>
  );
};
