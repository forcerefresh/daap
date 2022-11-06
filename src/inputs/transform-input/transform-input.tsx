import React, { useEffect, useState, useCallback, ChangeEvent } from "react";
import Draggable, {
  ControlPosition,
  DraggableData,
  DraggableEvent,
} from "react-draggable";
import cx from "classnames";
import { Button, HTMLSelect } from "@blueprintjs/core";
import { cloneDeep, debounce } from "lodash";
import {
  ITimelinesInput,
  InputType,
  IUpdateInput,
  ITimelinesValue,
  ITimelineValue,
  ITimelinePoint,
} from "webslider-sdk/lib/inputs/i-inputs";
import { convertTimeUnitToMs } from "webslider-sdk/lib/objects/object-utils";
import { AnimeJSEasingOptions } from "webslider-sdk/lib/animations/i-animation-types";
import { getSelectField, getUnitNumericFiled } from "../input-utils";
import { getInputForm } from "../input-factory";
import {
  getDefaultPoint,
  getDefaultTimeline,
} from "../../animations/transform/transform.definition";
import css from "./transform-input.module.scss";

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
    inputType: InputType.UNITS_NUMBER,
    allowedUnits: ["%"],
  },
  {
    displayName: "Scale Y",
    propertyName: "scaleY",
    inputType: InputType.UNITS_NUMBER,
    allowedUnits: ["%"],
  },
  {
    displayName: "Scale Z",
    propertyName: "scaleZ",
    inputType: InputType.UNITS_NUMBER,
    allowedUnits: ["%"],
  },
  {
    displayName: "Rotation X",
    propertyName: "rotateX",
    inputType: InputType.UNITS_NUMBER,
    allowedUnits: ["deg"],
  },
  {
    displayName: "Rotation Y",
    propertyName: "rotateY",
    inputType: InputType.UNITS_NUMBER,
    allowedUnits: ["deg"],
  },
  {
    displayName: "Rotation Z",
    propertyName: "rotateZ",
    inputType: InputType.UNITS_NUMBER,
    allowedUnits: ["deg"],
  },
  {
    displayName: "Opacity",
    propertyName: "opacity",
    inputType: InputType.NUMBER,
  },
  {
    displayName: "Blur",
    propertyName: "blur",
    inputType: InputType.NUMBER,
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
        label: "Scale X",
        value: "scaleX",
      },
      {
        label: "Scale Y",
        value: "scaleY",
      },
      {
        label: "Scale Z",
        value: "scaleZ",
      },
      {
        label: "Rotate X",
        value: "rotateX",
      },
      {
        label: "Rotate Y",
        value: "rotateY",
      },
      {
        label: "Rotate Z",
        value: "rotateZ",
      },
      {
        label: "Opacity",
        value: "opacity",
      },
      {
        label: "Blur",
        value: "blur",
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
      onChange,
      onChange
    );
  };

  const renderSelectedTimelineForm = () => {
    const selectedTimeline = localValue.timelines[selectedIndex.timelineIdx];
    const selectedPoint = selectedTimeline?.points?.[selectedIndex.pointIdx];

    if (!selectedPoint) {
      return null;
    }

    return (
      <>
        <div className={css.configurationTitle}>
          Configuration for selected point
        </div>
        {getUnitNumericFiled(
          "Point Time",
          selectedPoint.time,
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

        {selectedPoint.enabled &&
          renderPointInput(
            localValue.timelines[selectedIndex.timelineIdx],
            selectedPoint
          )}

        <div className={css.configurationTitle}>
          Configuration for selected timeline
        </div>

        {getSelectField(
          "Easing",
          selectedTimeline.ease,
          AnimeJSEasingOptions,
          (value: any) => {
            const newLocalValue = cloneDeep(localValue);
            newLocalValue.timelines[selectedIndex.timelineIdx].ease = value;
            setLocalValueSorted(newLocalValue);
          }
        )}
      </>
    );
  };

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
          return <>{renderTimeline(timeline, timelineIdx)}</>;
        })}
      </div>

      {typeof selectedIndex.timelineIdx !== "undefined" &&
        renderSelectedTimelineForm()}
    </div>
  );
};
