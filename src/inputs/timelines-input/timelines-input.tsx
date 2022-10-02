import React, { useEffect, useState, useCallback, ChangeEvent } from "react";
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
  getCheckboxField,
  getNumericFiled,
  getSelectField,
  getTextField,
  getUnitNumericFiled,
} from "../input-utils";
import { roundNumber } from "../../utils/doom-utils/common";
import { getInputForm } from "../input-factory";
import { Button, HTMLSelect } from "@blueprintjs/core";
import classnames from "classnames";
import { EasingOptions } from "../../effects/types";
import {
  getDefaultPoint,
  getDefaultTimeline,
  // getDefaultTimeline,
} from "../../effects/timelines/timelines.definition";
import { convertTimeUnitToMs } from "../../webslider-sdk/src/objects/object-utils";
import { time } from "console";
import { first, last } from "lodash-es";

const formDefinition = [
  {
    displayName: "Translate X",
    propertyName: "translateX",
    inputType: InputType.RELATIVE_POSITION_INPUT,
  },
  {
    displayName: "Translate Y",
    propertyName: "translateY",
    inputType: InputType.RELATIVE_POSITION_INPUT,
  },
  {
    displayName: "Translate Z",
    propertyName: "translateZ",
    inputType: InputType.RELATIVE_POSITION_INPUT,
  },

  {
    displayName: "Scale X",
    propertyName: "scaleX",
    inputType: InputType.RELATIVE_POSITION_INPUT,
  },
  {
    displayName: "Scale Y",
    propertyName: "scaleY",
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

  const [errorMaxDuration, serErrorMaxDuration] = useState(false);

  const [localValue, setLocalValue] = useState(value);
  const [selectedIndex, setSelectedIndex] = useState<{
    pointIdx: number;
    timelineIdx: number;
  }>({ pointIdx: 0, timelineIdx: 0 });

  const maxDuration = convertTimeUnitToMs(localValue.maxDuration);
  // let maxTime = config.;
  // localValue.timelines.forEach((tl) => {
  //   maxTime = Math.max(maxTime, convertTimeUnitToMs(tl.last.time));
  // });

  const deletePoint = (timelineIdx: number, index: number) => {
    if (localValue.timelines[timelineIdx].points.length <= 2) return;

    const newValue = cloneDeep(localValue);
    newValue.timelines[timelineIdx].points.splice(index, 1);
    setLocalValueSorted(newValue);
    setSelectedIndex({
      pointIdx: index > 0 ? index - 1 : 0,
      timelineIdx: timelineIdx,
    });
  };

  const getAllTimelinesMaxTime = () => {
    let max = 0;
    value.timelines.forEach((tl) => {
      max = Math.max(getTimelineMaxTime(tl), max);
    });
    return max;
  };

  const getTimelineMaxTime = (timeline: ITimelineValue) => {
    let max = 0;
    timeline.points.forEach((point) => {
      max = Math.max(convertTimeUnitToMs(point.time), max);
    });
    return max;
  };

  const getTimelineMinTime = (timeline: ITimelineValue) => {
    let min = Number.MAX_SAFE_INTEGER;
    timeline.points.forEach((point) => {
      min = Math.min(convertTimeUnitToMs(point.time), min);
    });
    return min;
  };

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

  const addNewTimeline = (propertyName: string, property: string) => {
    const newValue = cloneDeep(localValue);
    const prevLength = newValue.timelines.length;

    newValue.timelines.push(getDefaultTimeline(propertyName, property));
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
    const left = (getTimelineMinTime(timeline) / maxDuration) * lineWidth;
    const width =
      (getTimelineMaxTime(timeline) / maxDuration) * lineWidth - left;

    return (
      <div className={css.timelineHolder}>
        <div
          className={cx(css.timelineTitle, {
            [css.selectedTimelineTitle]:
              selectedIndex.timelineIdx === timelineIdx,
          })}
        >
          {timeline.propertyName}
        </div>
        <div className={css.timeline}>
          {/* <div>
          <strong>From:</strong> X, Width <strong>To:</strong> X, Width, Height
        </div> */}
          <div
            className={cx(css.line, {
              [css.lineSelected]: selectedIndex.timelineIdx === timelineIdx,
            })}
            ref={timelineIdx === 0 ? lineRef : undefined}
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
              if (selectedIndex.timelineIdx === timelineIdx) {
                return;
              }

              setSelectedIndex({
                pointIdx: selectedIndex.pointIdx,
                timelineIdx,
              });
            }}
            onDoubleClick={(event: React.MouseEvent<HTMLDivElement>) => {
              const adjustment = 0;
              const rect = event.currentTarget.getBoundingClientRect();
              const time = (event.clientX - rect.left) / lineWidth + adjustment;
              const newValue = cloneDeep(localValue);

              let newTime = Math.round(time * maxDuration);
              newTime = Math.min(Math.max(newTime, 0), maxDuration);

              newValue.timelines[timelineIdx].points.push(
                getDefaultPoint(
                  newTime + "ms",
                  true,
                  newValue.timelines[timelineIdx].property
                )
              );
              setLocalValueSorted(newValue);
              setSelectedIndex({
                pointIdx: newValue.timelines[timelineIdx].points.length - 1,
                timelineIdx,
              });

              // const adjustment = 0;
              // --------------------
              // setSelectedIndex({
              //   pointIdx: 0,
              //   timelineIdx,
              // });

              //-------------------
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
            timeline.points.map((point, idx) => {
              const position: ControlPosition = {
                x:
                  (convertTimeUnitToMs(point.time) / maxDuration) *
                    (lineWidth - 12) +
                  6,
                y: 0,
              };

              let boundRight = lineWidth - 6;
              let boundLeft = 6;
              // if (point.propertyName === "first") {
              //   boundRight =
              //     (convertTimeUnitToMs(timeline.last.time) / maxDuration) *
              //     lineWidth;
              // }
              // if (point.propertyName === "last") {
              //   boundLeft =
              //     (convertTimeUnitToMs(timeline.first.time) / maxDuration) *
              //     lineWidth;
              // }

              return (
                <Draggable
                  defaultClassName={cx({
                    [css.enabledThumb]: point.enabled,
                    [css.selectedThumb]:
                      selectedIndex.pointIdx === idx &&
                      selectedIndex.timelineIdx === timelineIdx,
                  })}
                  key={`${timelineIdx}_${idx}`}
                  axis="x"
                  handle=".handle"
                  defaultPosition={{ x: 0, y: 0 }}
                  position={position}
                  grid={[1, 1]}
                  scale={1}
                  bounds={{ left: boundLeft, right: boundRight }}
                  onDrag={(evt: DraggableEvent, data: DraggableData) => {
                    const percMultiplier =
                      data.x === 0 ? 0 : (data.x - 6) / (lineWidth - 12);
                    const newTime = percMultiplier * maxDuration;
                    const newValue = cloneDeep(localValue);
                    newValue.timelines[timelineIdx].points[idx].time =
                      Math.round(newTime) + "ms";
                    setLocalValueSorted(newValue);
                    // const percMultiplier = //data.x === 0 ? 0 : data.x / lineWidth;
                    //   data.x === 0 ? 0 : (data.x - 6) / (lineWidth - 12);
                    // console.log(percMultiplier);
                    // console.log(maxDuration);
                    // let newTime = percMultiplier * maxDuration;
                    // if (point.propertyName === "first") {
                    //   newTime = Math.min(
                    //     newTime,
                    //     convertTimeUnitToMs(timeline.last.time) - 1
                    //   );
                    // }
                    // if (point.propertyName === "last") {
                    //   newTime = Math.max(
                    //     newTime,
                    //     convertTimeUnitToMs(timeline.first.time) + 1
                    //   );
                    // }
                    // const newValue = cloneDeep(localValue);
                    // newValue.timelines[timelineIdx][
                    //   point.propertyName as "first" | "last"
                    // ].time = `${Math.round(newTime)}ms`;
                    // setLocalValueSorted(newValue);
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
        </div>
      </div>
    );
  };

  const getTimelineOptions = () => {
    const timelineOptions = [
      {
        label: "Translate X",
        value: "translateX",
      },
      {
        label: "Translate Y",
        value: "translateY",
      },
      {
        label: "Translate Z",
        value: "translateZ",
      },
      {
        label: "Opacity",
        value: "opacity",
      },
      {
        label: "Scale X",
        value: "scaleX",
      },
      {
        label: "Scale Y",
        value: "scaleY",
      },
    ];

    const existingProperties = value.timelines.map((tl) => tl.property);

    const timelineOptionsWithDisabled = timelineOptions.map((item) => {
      if (existingProperties.indexOf(item.value) === -1) {
        return item;
      }
      return { ...item, disabled: true };
    });

    return timelineOptionsWithDisabled;
  };

  // const formForTimeline = formDefinition.find((item) => {
  //   return (
  //     item.propertyName === value.timelines[selectedIndex.timelineIdx]?.property
  //   );
  // });

  const renderPointInput = (
    timeline: ITimelineValue,
    point: ITimelinePoint
  ) => {
    const pointFromDefinition = formDefinition.find((item) => {
      return item.propertyName === timeline.property;
    });

    if (!pointFromDefinition) {
      return null;
    }

    function onChange(value: any) {
      const newLocalValue = cloneDeep(localValue);
      newLocalValue.timelines[selectedIndex.timelineIdx].points[
        selectedIndex.pointIdx
      ].pointValue = value;
      setLocalValueSorted(newLocalValue);
    }

    const val =
      localValue.timelines[selectedIndex.timelineIdx]?.points[
        selectedIndex.pointIdx
      ].pointValue;

    return getInputForm(
      pointFromDefinition!.inputType,
      { ...pointFromDefinition, value: val },
      onChange
    );
  };

  const renderSelectedTimelineForm = () => {
    // return (
    //   value.timelines[selectedIndex.timelineIdx]?.points?.[
    //     selectedIndex.pointIdx
    //   ]?.time || ""
    // );

    const point =
      localValue.timelines[selectedIndex.timelineIdx]?.points?.[
        selectedIndex.pointIdx
      ];

    if (!point) {
      return null;
    }

    return (
      <>
        <div className={css.configurationTitle}>
          Configuration for selected point
        </div>
        {getUnitNumericFiled(
          "Point Time",
          point.time,
          (value: string) => {
            const newLocalValue = cloneDeep(localValue);
            newLocalValue.timelines[selectedIndex.timelineIdx].points[
              selectedIndex.pointIdx
            ].time = value;
            setLocalValueSorted(newLocalValue);
          },
          "",
          { style: { width: "110px" } },
          ["ms", "s"]
        )}
        {/* {getCheckboxField("Enable", point.enabled, (value: boolean) => {
          const newLocalValue = cloneDeep(localValue);
          newLocalValue.timelines[selectedIndex.timelineIdx].points[
            selectedIndex.pointIdx
          ].enabled = value;
          setLocalValueSorted(newLocalValue);
        })} */}

        {point.enabled &&
          renderPointInput(
            localValue.timelines[selectedIndex.timelineIdx],
            point
          )}
      </>
    );
  };

  //debugger;
  return (
    <div>
      <div className={css.maxHolder}>
        {getUnitNumericFiled(
          "Max duration",
          localValue.maxDuration,
          (value: string) => {
            if (convertTimeUnitToMs(value) < getAllTimelinesMaxTime()) {
              serErrorMaxDuration(true);
              return;
            }
            const newLocalValue = cloneDeep(localValue);
            newLocalValue.maxDuration = value;
            setLocalValueSorted(newLocalValue);
            serErrorMaxDuration(false);
          },
          "",
          {
            style: {
              width: "90px",
              //...(errorMaxDuration ? { background: "red" } : {}),
            },
            ...(errorMaxDuration ? { intent: "warning" } : {}),
          },
          ["ms", "s"]
        )}
        {errorMaxDuration && (
          <span className="warning">
            Max duration is greater than point time
          </span>
        )}
      </div>

      <div>
        <HTMLSelect
          options={
            [
              {
                label: `Add timeline for...`,
                value: "",
                readOnly: true,
              },
              ...getTimelineOptions(),
            ] as any
          }
          value={""}
          onChange={(event: ChangeEvent) => {
            const value = (event.currentTarget as any).value;
            const label = getTimelineOptions().find(
              (item) => item.value === value
            )?.label;
            addNewTimeline(label!, value);
          }}
        />

        {/* <Button
          minimal
          onClick={() => addNewTimeline()}
          className={css.addNewTimeline}
          small={true}
          icon="add"
        >
          Add timeline
        </Button> */}
        <Button
          minimal
          disabled={localValue.timelines.length === 0}
          onClick={() => deleteTimeline(selectedIndex.timelineIdx)}
          className={css.deleteTimeline}
          small={true}
          icon="delete"
        >
          Delete timeline
        </Button>
      </div>

      <div className={css.cssPlugin}>
        {localValue.timelines.map((timeline, timelineIdx) => {
          return (
            <>
              {renderTimeline(timeline, timelineIdx)}

              {/* {[formForTimeline].map((formDefinition) => {
                function onChange(value: any) {
                  // const newLocalValue = cloneDeep(localValue);
                  // (
                  //   newLocalValue.timelines[selectedIndex.timelineIdx][
                  //     selectedIndex.pointIdx === 0 ? "first" : "last"
                  //   ].pointValue as any
                  // )[formDefinition.propertyName] = value;
                  // setLocalValueSorted(newLocalValue);
                }

                console.log(localValue.timelines);
                console.log(selectedIndex.timelineIdx);
                console.log(selectedIndex.pointIdx);
                const val =
                  localValue.timelines[selectedIndex.timelineIdx]?.points[
                    selectedIndex.pointIdx
                  ].pointValue;

                if (!formDefinition) {
                  return null;
                }

                return getInputForm(
                  formDefinition!.inputType,
                  { ...formDefinition, value: val },
                  onChange
                );
              })} */}
            </>
          );
        })}
      </div>

      {typeof selectedIndex.timelineIdx !== "undefined" &&
        renderSelectedTimelineForm()}

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

          {/* <div>
            {getTextField(
              "Name",
              localValue.timelines[selectedIndex.timelineIdx].name,
              (value: string) => {
                const newLocalValue = cloneDeep(localValue);
                newLocalValue.timelines[selectedIndex.timelineIdx].name = value;
                setLocalValueSorted(newLocalValue);
              }
            )}
          </div> */}
          <div>
            {/* {getUnitNumericFiled(
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
            )} */}
            {/* {getUnitNumericFiled(
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
            )} */}
          </div>
          {/* <div className={css.fromToTitle}>
            <strong>{selectedIndex.pointIdx === 0 ? "FROM" : "TO"}</strong>{" "}
          </div> */}
        </>
      )}
    </div>
  );
};
