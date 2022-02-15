import React, { useEffect, useState, useCallback } from "react";
import Draggable, {
  ControlPosition,
  DraggableData,
  DraggableEvent,
} from "react-draggable";
import {
  ITimelinesInput,
  InputType,
  IUpdateInput,
  ITimelinesValue,
  ITimelineValue,
  ITimelinePoint,
} from "../types";
import css from "./timelines-input.module.scss";
import cx from "classnames";
import { cloneDeep, debounce } from "lodash";
import { getNumericFiled, getSelectField } from "../input-utils";
import { roundNumber } from "../../utils/doom-utils/common";
import { getInputForm } from "../input-factory";
import { Button } from "@blueprintjs/core";
import classnames from "classnames";
import { EasingOptions } from "../../effects/types";

export const getDefaultTimeline = (): ITimelineValue => {
  return {
    points: [getDefaultPoint()],
  };
};

export const getDefaultPoint = (time = 100): ITimelinePoint => {
  return {
    time,
    easing: "none",
    pointValue: {
      x: { enabled: false, value: 0, position: "rel", easing: "none" },
      y: { enabled: false, value: 0, position: "rel", easing: "none" },
      width: { enabled: false, value: 0, position: "rel", easing: "none" },
      height: { enabled: false, value: 0, position: "rel", easing: "none" },
      rotation: {
        enabled: false,
        value: 0,
        position: "rel" as "abs" | "rel",
        direction: "_ccw" as "_ccw" | "_cw" | "_short",
      },
      opacity: { enabled: false, value: 100, position: "rel", easing: "none" },
      zoom: { enabled: false, value: 100, position: "rel", easing: "none" },
    },
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
  {
    displayName: "Opacity",
    propertyName: "opacity",
    inputType: InputType.RELATIVE_POSITION_INPUT,
  },
  {
    displayName: "Zoom",
    propertyName: "zoom",
    inputType: InputType.RELATIVE_POSITION_INPUT,
  },
];

export const TimelinesInputForm: React.FC<ITimelinesInput & IUpdateInput> = (
  props
) => {
  const { value, onChange } = props;
  const lineRef = React.useRef(null);

  const [localValue, setLocalValue] = useState(value);
  const [selectedIndex, setSelectedIndex] = useState<{
    pointIdx: number;
    timelineIdx: number;
  }>({ pointIdx: 0, timelineIdx: 0 });

  const setLocalValueSorted = (val: ITimelinesValue) => {
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
    debounce((newValue: ITimelinesValue) => {
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

  // NOTE: WORKAROUND TO SET LINE WIDTH
  useEffect(() => {
    const int = setInterval(() => {
      const w = (lineRef?.current as any)?.offsetWidth || 0;
      if (lineWidth === 0 && w !== 0) {
        setLineWidth(w);
        clearInterval(int);
      }
    }, 10);

    return () => {
      clearInterval(int);
    };
  }, []);

  const renderTimeline = (timeline: ITimelineValue, timelineIdx: number) => {
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

            let newTime = roundNumber(time * 100, 2);
            newTime = Math.min(Math.max(newTime, 0), 100);

            newValue.timelines[timelineIdx].points.push(
              getDefaultPoint(newTime)
            );
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
                  const percMultiplier =
                    data.x === 0 ? 0 : (data.x - 6) / (lineWidth - 12);
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
      <div className={classnames("bp3-form-helper-text", css.helperText)}>
        Click on line to add or double click on point to remove it.
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
              "Point position",
              localValue.timelines[selectedIndex.timelineIdx].points[
                selectedIndex.pointIdx!
              ].time + "%",
              () => {},
              "",
              { disabled: true }
            )}
          </div>

          <div>
            {getSelectField(
              "",
              localValue.timelines[selectedIndex.timelineIdx].points[
                selectedIndex.pointIdx!
              ].easing,
              EasingOptions,
              (value: any) => {
                const newLocalValue = cloneDeep(localValue);
                newLocalValue.timelines[selectedIndex.timelineIdx].points[
                  selectedIndex.pointIdx!
                ].easing = value;
                setLocalValueSorted(newLocalValue);
              }
            )}
          </div>

          {formDefinition.map((formDefinition) => {
            function onChange(value: any) {
              const newLocalValue = cloneDeep(localValue);
              (
                newLocalValue.timelines[selectedIndex.timelineIdx].points[
                  selectedIndex.pointIdx!
                ].pointValue as any
              )[formDefinition.propertyName] = value;
              setLocalValueSorted(newLocalValue);
            }

            const val = (
              localValue.timelines[selectedIndex.timelineIdx].points[
                selectedIndex.pointIdx!
              ].pointValue as any
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
