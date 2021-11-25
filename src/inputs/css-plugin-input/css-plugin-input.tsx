import React, { useEffect, useState, useCallback } from "react";
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
  ICSSTimelineValue,
} from "../types";
import css from "./css-plugin-input.module.scss";
import cx from "classnames";
import { cloneDeep, debounce, isNumber } from "lodash";
import { getNumericFiled } from "../input-utils";
import { roundNumber } from "../../utils/doom-utils/common";
import { getInputForm } from "../input-factory";
import { Button } from "@blueprintjs/core";

export const getDefaultTimeline = (): ICSSTimelineValue => {
  return {
    points: [
      {
        time: 100,
        easing: "none",
        css: {
          x: { value: 0, position: "abs" },
          y: { value: 0, position: "abs" },
          width: { value: 0, position: "abs" },
          height: { value: 0, position: "abs" },
          rotation: {
            value: 0,
            position: "abs" as "abs" | "rel",
            direction: "_ccw" as "_ccw" | "_cw" | "_short",
          },
        },
      },
    ],
  };
};

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
  const [selectedIndex, setSelectedIndex] = useState<{
    pointIdx: number;
    timelineIdx: number;
  }>({ pointIdx: 0, timelineIdx: 0 });

  const setLocalValueSorted = (val: ICSSTimelinesValue) => {
    /*val.timelines.map((timeline) => {
      timeline.points.sort((a, b) => {
        return a.time > b.time ? 1 : -1;
      });

      return timeline;
    });*/

    setLocalValue(val);
  };

  useEffect(() => {
    debounceOnChange(localValue);
  }, [localValue]);

  const debounceOnChange = useCallback(
    debounce((newValue: ICSSTimelinesValue) => {
      onChange(newValue);
    }, 100),
    [onChange]
  );

  useEffect(() => {
    return () => {
      debounceOnChange.flush();
    };
  }, []);

  /*
  const debounceOnChange = debounce((newValue: ICSSTimelinesValue) => {
    onChange(newValue);
  }, 10000);*/

  const deletePoint = (timelineIdx: number, index: number) => {
    if (localValue.timelines[timelineIdx].points.length === 1) return;

    const newValue = cloneDeep(localValue);
    newValue.timelines[timelineIdx].points.splice(index, 1);
    setLocalValueSorted(newValue);
    setSelectedIndex({
      pointIdx: index > 0 ? index - 1 : 0,
      timelineIdx: timelineIdx,
    });
  };

  const deleteTimeline = (timelineIdx: number) => {
    const newValue = cloneDeep(localValue);
    newValue.timelines.splice(timelineIdx, 1);
    setLocalValueSorted(newValue);

    const newTimelineIdx = timelineIdx === 0 ? 0 : timelineIdx - 1;
    setSelectedIndex({
      pointIdx:
        selectedIndex.timelineIdx === timelineIdx ? 0 : selectedIndex.pointIdx,
      timelineIdx: newTimelineIdx,
    });
  };

  const addNewTimeline = () => {
    const newValue = cloneDeep(localValue);
    const prevLength = newValue.timelines.length;

    newValue.timelines.push(getDefaultTimeline());
    setLocalValueSorted(newValue);

    setSelectedIndex({
      pointIdx: 0,
      timelineIdx: prevLength,
    });
  };

  const [lineWidth, setLineWidth] = useState(0);
  useEffect(() => {
    setLineWidth((lineRef?.current as any)?.offsetWidth || 0);
  }, [lineRef?.current]);

  const renderTimeline = (timeline: ICSSTimelineValue, timelineIdx: number) => {
    return (
      <div className={css.timelineHolder}>
        <div
          className={css.line}
          ref={timelineIdx === 0 ? lineRef : undefined}
          onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            const adjustment = 0;
            const rect = event.currentTarget.getBoundingClientRect();
            const time = (event.clientX - rect.left) / lineWidth + adjustment;
            const newValue = cloneDeep(localValue);
            console.log(timelineIdx);

            let newTime = roundNumber(time * 100, 2);
            newTime = Math.min(Math.max(newTime, 0), 100);

            newValue.timelines[timelineIdx].points.push({
              time: newTime,
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
            setSelectedIndex({
              pointIdx: newValue.timelines[timelineIdx].points.length - 1,
              timelineIdx,
            });
          }}
        ></div>
        {lineWidth > 0 &&
          timeline.points.map((point, idx) => {
            const position: ControlPosition = {
              x: (point.time / 100) * lineWidth,
              y: 0,
            };
            return (
              <Draggable
                defaultClassName={
                  selectedIndex.pointIdx === idx &&
                  selectedIndex.timelineIdx === timelineIdx
                    ? css.selectedThumb
                    : ""
                }
                key={`${timelineIdx}_${idx}`}
                axis="x"
                handle=".handle"
                defaultPosition={{ x: 0, y: 0 }}
                position={position}
                grid={[1, 1]}
                scale={1}
                bounds={{ left: 6, right: lineWidth - 6 }}
                onDrag={(evt: DraggableEvent, data: DraggableData) => {
                  const percMultiplier = data.x === 0 ? 0 : data.x / lineWidth;
                  const newTime = percMultiplier * 100;
                  const newValue = cloneDeep(localValue);
                  newValue.timelines[timelineIdx].points[idx].time =
                    roundNumber(newTime, 2);
                  setLocalValueSorted(newValue);
                }}
                onMouseDown={() => {
                  setSelectedIndex({ pointIdx: idx, timelineIdx });
                }}
              >
                <div
                  onDoubleClick={() => {
                    deletePoint(timelineIdx, idx);
                  }}
                  className={cx(
                    css.thumb,
                    {
                      [css.selectedThumb]:
                        selectedIndex.pointIdx === idx &&
                        selectedIndex.timelineIdx === timelineIdx,
                    },
                    "handle"
                  )}
                ></div>
              </Draggable>
            );
          })}
        <div>
          <Button
            disabled={localValue.timelines.length === 1}
            minimal
            onClick={(event: any) => {
              event.stopPropagation();
              deleteTimeline(timelineIdx);
            }}
            className={css.deleteLayer}
            small={true}
            icon="delete"
          ></Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className={css.cssPlugin}>
        {localValue.timelines.map((timeline, timelineIdx) =>
          renderTimeline(timeline, timelineIdx)
        )}
      </div>

      <div>
        <Button
          minimal
          onClick={() => addNewTimeline()}
          className={css.addNewTimeline}
          small={true}
          icon="add"
        >
          Add new timeline
        </Button>
      </div>

      {selectedIndex !== undefined && (
        <>
          <div>
            {getNumericFiled(
              "time",
              localValue.timelines[selectedIndex.timelineIdx].points[
                selectedIndex.pointIdx!
              ].time,
              () => {},
              "",
              { disabled: true }
            )}
          </div>

          {formDefinition.map((formDefinition) => {
            function onChange(value: any) {
              const newLocalValue = cloneDeep(localValue);
              (
                newLocalValue.timelines[selectedIndex.timelineIdx].points[
                  selectedIndex.pointIdx!
                ].css as any
              )[formDefinition.propertyName] = value;
              setLocalValueSorted(newLocalValue);
            }

            const val = (
              localValue.timelines[selectedIndex.timelineIdx].points[
                selectedIndex.pointIdx!
              ].css as any
            )[formDefinition.propertyName];

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
