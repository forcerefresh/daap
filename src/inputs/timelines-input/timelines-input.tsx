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
} from "../../webslider-sdk/src/inputs/i-inputs";
import css from "./timelines-input.module.scss";
import cx from "classnames";
import { cloneDeep, debounce } from "lodash";
import {
  getNumericFiled,
  getSelectField,
  getTextField,
  getUnitNumericFiled,
} from "../input-utils";
import { roundNumber } from "../../utils/doom-utils/common";
import { getInputForm } from "../input-factory";
import { Button } from "@blueprintjs/core";
import classnames from "classnames";
import { EasingOptions } from "../../effects/types";
import {
  getDefaultPoint,
  getDefaultTimeline,
} from "../../effects/timelines/timelines.definition";
import { convertTimeUnitToMs } from "../../webslider-sdk/src/objects/object-utils";

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

  const maxDuration = convertTimeUnitToMs(value.maxDuration);
  // let maxTime = config.;
  // localValue.timelines.forEach((tl) => {
  //   maxTime = Math.max(maxTime, convertTimeUnitToMs(tl.last.time));
  // });

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
    setLineWidth((lineRef?.current as any)?.offsetWidth - 33 || 0);
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
    const left =
      (convertTimeUnitToMs(timeline.first.time) / maxDuration) * lineWidth;
    const width =
      (convertTimeUnitToMs(timeline.last.time) / maxDuration) * lineWidth -
      left;

    return (
      <>
        <div>{timeline.name}</div>
        <div className={css.timelineHolder}>
          {/* <div>
          <strong>From:</strong> X, Width <strong>To:</strong> X, Width, Height
        </div> */}
          <div
            className={cx(css.line, {
              [css.lineSelected]: selectedIndex.timelineIdx === timelineIdx,
            })}
            ref={timelineIdx === 0 ? lineRef : undefined}
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
              // const adjustment = 0;
              setSelectedIndex({
                pointIdx: 0,
                timelineIdx,
              });
              // const rect = event.currentTarget.getBoundingClientRect();
              // const time = (event.clientX - rect.left) / lineWidth + adjustment;
              // const newValue = cloneDeep(localValue);

              // let newTime = roundNumber(time * 100, 2);
              // newTime = Math.min(Math.max(newTime, 0), 100);

              // newValue.timelines[timelineIdx].points.push(
              //   getDefaultPoint(`${newTime}ms`)
              // );
              // setLocalValueSorted(newValue);
              // setSelectedIndex({
              //   pointIdx: newValue.timelines[timelineIdx].points.length - 1,
              //   timelineIdx,
              // });
            }}
          ></div>
          <div
            className={css.fromToBackground}
            style={{ left: left + "px", width: width + "px" }}
          ></div>
          {lineWidth > 0 &&
            [
              { point: timeline.first, propertyName: "first" },
              { point: timeline.last, propertyName: "last" },
            ].map((point, idx) => {
              const position: ControlPosition = {
                x:
                  (convertTimeUnitToMs(point.point.time) / maxDuration) *
                    (lineWidth - 12) +
                  6,
                y: 0,
              };

              let boundRight = lineWidth - 6;
              let boundLeft = 6;
              if (point.propertyName === "first") {
                boundRight =
                  (convertTimeUnitToMs(timeline.last.time) / maxDuration) *
                  lineWidth;
              }
              if (point.propertyName === "last") {
                boundLeft =
                  (convertTimeUnitToMs(timeline.first.time) / maxDuration) *
                  lineWidth;
              }

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
                  bounds={{ left: boundLeft, right: boundRight }}
                  onDrag={(evt: DraggableEvent, data: DraggableData) => {
                    const percMultiplier = //data.x === 0 ? 0 : data.x / lineWidth;
                      data.x === 0 ? 0 : (data.x - 6) / (lineWidth - 12);

                    console.log(percMultiplier);
                    console.log(maxDuration);

                    let newTime = percMultiplier * maxDuration;

                    if (point.propertyName === "first") {
                      newTime = Math.min(
                        newTime,
                        convertTimeUnitToMs(timeline.last.time) - 1
                      );
                    }

                    if (point.propertyName === "last") {
                      newTime = Math.max(
                        newTime,
                        convertTimeUnitToMs(timeline.first.time) + 1
                      );
                    }

                    const newValue = cloneDeep(localValue);
                    newValue.timelines[timelineIdx][
                      point.propertyName as "first" | "last"
                    ].time = `${Math.round(newTime)}ms`;
                    setLocalValueSorted(newValue);
                  }}
                  onMouseDown={() => {
                    setSelectedIndex({ pointIdx: idx, timelineIdx });
                  }}
                >
                  <div
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
        </div>
      </>
    );
  };

  return (
    <div>
      <div className={css.maxHolder}>
        {getUnitNumericFiled(
          "Max",
          localValue.maxDuration,
          (value: string) => {
            const newLocalValue = cloneDeep(localValue);
            newLocalValue.maxDuration = value;
            setLocalValueSorted(newLocalValue);
          },
          "",
          { style: { width: "90px" } },
          ["ms", "s"]
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
          Add timeline
        </Button>
        <Button
          minimal
          disabled={localValue.timelines.length === 1}
          onClick={() => deleteTimeline(selectedIndex.timelineIdx)}
          className={css.addNewTimeline}
          small={true}
          icon="delete"
        >
          Delete timeline
        </Button>
      </div>

      <div className={css.cssPlugin}>
        {localValue.timelines.map((timeline, timelineIdx) =>
          renderTimeline(timeline, timelineIdx)
        )}
      </div>

      {selectedIndex !== undefined && (
        <>
          {/* <div>
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
          </div> */}

          <div>
            {getTextField(
              "Name",
              localValue.timelines[selectedIndex.timelineIdx].name,
              (value: string) => {
                const newLocalValue = cloneDeep(localValue);
                newLocalValue.timelines[selectedIndex.timelineIdx].name = value;
                setLocalValueSorted(newLocalValue);
              }
            )}
          </div>
          <div>
            {getUnitNumericFiled(
              "From",
              localValue.timelines[selectedIndex.timelineIdx].first.time,
              (value: string) => {
                const newLocalValue = cloneDeep(localValue);
                newLocalValue.timelines[selectedIndex.timelineIdx].first.time =
                  value;
                setLocalValueSorted(newLocalValue);
              },
              "",
              { style: { width: "110px" } },
              ["ms", "s"]
            )}
            {getUnitNumericFiled(
              "To",
              localValue.timelines[selectedIndex.timelineIdx].last.time,
              (value: string) => {
                const newLocalValue = cloneDeep(localValue);
                newLocalValue.timelines[selectedIndex.timelineIdx].last.time =
                  value;
                setLocalValueSorted(newLocalValue);
              },
              "",
              { style: { width: "110px" } },
              ["ms", "s"]
            )}
          </div>
          <div className={css.fromToTitle}>
            <strong>{selectedIndex.pointIdx === 0 ? "FROM" : "TO"}</strong>{" "}
          </div>

          {formDefinition.map((formDefinition) => {
            function onChange(value: any) {
              const newLocalValue = cloneDeep(localValue);
              (
                newLocalValue.timelines[selectedIndex.timelineIdx][
                  selectedIndex.pointIdx === 0 ? "first" : "last"
                ].pointValue as any
              )[formDefinition.propertyName] = value;
              setLocalValueSorted(newLocalValue);
            }

            const val = (
              localValue.timelines[selectedIndex.timelineIdx][
                selectedIndex.pointIdx === 0 ? "first" : "last"
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
