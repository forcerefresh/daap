import React, { useEffect, useState } from "react";
import Draggable, {
  ControlPosition,
  DraggableData,
  DraggableEvent,
} from "react-draggable";
import {
  ICSSTimelineInput,
  InputType,
  IUpdateInput,
  ICSSTimelinesValue,
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
    inputType: InputType.RELATIVE_POSITION_INPUT,
  },
  {
    displayName: "Y",
    propertyName: "y",
    inputType: InputType.RELATIVE_POSITION_INPUT,
  },
  {
    displayName: "Width",
    propertyName: "width",
    inputType: InputType.RELATIVE_POSITION_INPUT,
  },
  {
    displayName: "Height",
    propertyName: "height",
    inputType: InputType.RELATIVE_POSITION_INPUT,
  },
  {
    displayName: "Rotation",
    propertyName: "rotation",
    inputType: InputType.RELATIVE_ROTATION_INPUT,
  },
];

export const CSSPointsInputForm: React.FC<ICSSTimelineInput & IUpdateInput> = (
  props
) => {
  const { value, onChange } = props;
  const lineRef = React.useRef(null);

  const [localValue, setLocalValue] = useState(value);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(0);

  const setLocalValueSorted = (val: ICSSTimelinesValue) => {
    val.timelines.map((timeline) => {
      timeline.points.sort((a, b) => {
        return a.time > b.time ? 1 : -1;
      });

      return timeline;
    });

    setLocalValue(val);
  };

  useEffect(() => {
    debounceOnChange(localValue);
  }, [localValue]);

  const debounceOnChange = debounce((newValue: ICSSTimelinesValue) => {
    onChange(newValue);
  }, 100);

  const deletePoint = (timelineIndex: number, index: number) => {
    if (localValue.timelines[timelineIndex].points.length === 1) return;

    const newValue = cloneDeep(localValue);
    newValue.timelines[timelineIndex].points.splice(index, 1);
    setLocalValueSorted(newValue);
    setSelectedIndex(index > 0 ? index - 1 : 0);
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
              css: {
                x: { value: 0, position: "abs" },
                y: { value: 0, position: "abs" },
                width: { value: 0, position: "abs" },
                height: { value: 0, position: "abs" },
                rotation: { value: 0, position: "abs", direction: "_ccw" },
              },
              easing: "abc",
            });
            setLocalValueSorted(newValue);
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
                  setLocalValueSorted(newValue);
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
              setLocalValueSorted(newLocalValue);
            }

            const val = (localValue.points[selectedIndex!].css as any)[
              formDefinition.propertyName
            ];

            return getInputForm(
              formDefinition.inputType,
              { ...formDefinition, value: val },
              onChange
            );
          })}
        </>
      )}
    </div>
  );
};
