import React, { useContext, useEffect, useState } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import css from "./ProjectSmallTimeline.module.scss";
import { Button, HTMLSelect } from "@blueprintjs/core";
import { ReactComponent as RepeatIcon } from "../../assets/icons/repeat.svg";
import { IStore } from "../../store/store";
import { IPreviewState } from "../../store/reducers/stage";
import { setStagePreview } from "../../store/actions/actions";
import { connect } from "react-redux";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import cx from "classnames";
import { convertTimeUnitToMs } from "../../utils/utils";
import { PreviewTimelineContext } from "../../utils/preview-timeline-provider/PreviewTimelineProvider";

export interface SlideTimelineData {
  duration: string;
  transitionDuration: string;
  transitionOverlap: string;
  //transitionOverlap: number;
}

export interface ProjectTimelineData {
  slides: SlideTimelineData[];
  totalTime?: number;
}

type IProjectTimelineProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    //slideProgress: { progress: number; time: number; slideIdx: number };
    projectTimelineData: ProjectTimelineData | null;
    onManualProgress: (progress: number) => void;
  };

const ProjectSmallTimeline: React.FC<IProjectTimelineProps> = (props) => {
  const {
    projectTimelineData,
    onManualProgress,
    previewState,
    _setStagePreview,
  } = props;

  //console.log(projectTimelineData);
  const { previewTimelineState } = useContext(PreviewTimelineContext);
  //const [progress, setProgress] = useState<number>(0);

  // get total duration
  let totalTime = 0;
  projectTimelineData?.slides.forEach((slideData, idx) => {
    /*if (idx == 0) {
      totalTime += slideData.duration;
    } else {*/
    totalTime +=
      convertTimeUnitToMs(slideData.duration) -
      convertTimeUnitToMs(slideData.transitionOverlap);
    /*}*/
  });

  //console.log(totalTime);
  let currPos = 0;
  const slideLeftArr: number[] = [];
  const slidePosMultiplierArr: number[] = [];

  projectTimelineData?.slides.forEach((slideData, idx) => {
    // left position of slide
    // slide left is currPos - transitionDuration
    const slideLeft =
      currPos === 0
        ? 0
        : (currPos - convertTimeUnitToMs(slideData.transitionOverlap)) / // TODO:UPDATE
          totalTime;
    slideLeftArr[idx] = slideLeft;
    currPos +=
      convertTimeUnitToMs(slideData.duration) -
      convertTimeUnitToMs(slideData.transitionOverlap);

    //slide multiplier
    const slidePosMultiplier =
      convertTimeUnitToMs(slideData.duration) / totalTime;
    slidePosMultiplierArr[idx] = slidePosMultiplier;
  });

  //console.log(slideLeftArr);

  //console.log(slidePosMultiplierArr);

  useDeepCompareEffect(() => {
    //render timeline content

    if (lineRef.current) {
      const lineDiv = lineRef.current! as HTMLDivElement;
      const lineWidth = lineDiv.offsetWidth;

      // NOTE: html is only for transitions
      let html = "";
      let currentPosition = 0;
      projectTimelineData?.slides.forEach((slideData, idx) => {
        const transitionLeft =
          (lineWidth / totalTime) *
          (currentPosition - convertTimeUnitToMs(slideData.transitionOverlap)); // TODO:UPDATE
        let transitionWidth =
          (convertTimeUnitToMs(slideData.transitionDuration) / totalTime) *
          lineWidth;
        if (transitionWidth === 0) transitionWidth = 2;
        /*const overlapWidth =
          (slideData.transitionOverlap / totalTime) * lineWidth;*/
        html += `<div style="position: absolute; width: ${transitionWidth}px; height: 4px; background: #744b08; left:${transitionLeft}px "></div>`;
        //html += `<div style="position: absolute; width: ${overlapWidth}px; height: 4px; background: red; left:${left}px "></div>`;

        currentPosition +=
          convertTimeUnitToMs(slideData.duration) -
          convertTimeUnitToMs(slideData.transitionOverlap);
      });
      lineDiv.innerHTML = html;
    }
  }, [projectTimelineData]);

  const lineRef = React.useRef(null);

  /* useEffect(() => {
    tl.eventCallback("onUpdate", () => {
      setProgress(tl.progress());
    });
    return () => {
      // TODO: do we need to cleanup;
    };
  }, [tl]);*/

  //const thumbStyle = {
  //  left: ((lineRef?.current as any)?.offsetWidth || 0) * progress + "px",
  //};
  const currentSlideDuration =
    convertTimeUnitToMs(
      projectTimelineData?.slides[previewTimelineState.slideIdx].duration ||
        "10000ms"
    ) / 1000;
  const progress = previewTimelineState.time / currentSlideDuration; //slideProgress.progress; //slideProgress.time / currentSlideDuration;

  const lineWidth = (lineRef?.current as any)?.offsetWidth || 0;
  let left =
    lineWidth *
    /*slideProgress.progress*/ progress *
    slidePosMultiplierArr[previewTimelineState.slideIdx];

  left = left + lineWidth * slideLeftArr[previewTimelineState.slideIdx];

  //console.log(progress);
  const position =
    previewState.previewState === "play" ? { x: left, y: 0 } : undefined;

  const calculateTimeFromThumb = (x: number) => {
    const multiplier = x / (lineRef?.current as any)?.offsetWidth;
    onManualProgress(multiplier);
    //tl.progress(multiplier, true);
  };

  return (
    <div className={css.smallTimeline}>
      <div className={css.smallTimelineInner}>
        <div className={css.pagination}>
          Slide <strong>{previewTimelineState.slideIdx + 1}</strong>
          {" of "}
          {projectTimelineData?.slides.length}
        </div>
        <div className={css.line} ref={lineRef}></div>
        <div className={css.thumbHolder}>
          <Draggable
            axis="x"
            handle=".handle"
            defaultPosition={{ x: 0, y: 0 }}
            position={position}
            grid={[1, 1]}
            scale={1}
            bounds={{ left: 0, right: (lineRef?.current as any)?.offsetWidth }}
            onDrag={(evt: DraggableEvent, data: DraggableData) => {
              calculateTimeFromThumb(data.x);
            }}
          >
            <div className={cx(css.thumb, "handle")}></div>
          </Draggable>
        </div>
        <div className={css.actionHolder}>
          <HTMLSelect
            value={previewState.previewSpeed}
            onChange={(event: any) => {
              _setStagePreview({ previewSpeed: event.currentTarget.value });
            }}
            options={[
              {
                label: "0.1x",
                value: 0.1,
              },
              {
                label: "0.25x",
                value: 0.25,
              },
              {
                label: "0.5x",
                value: 0.5,
              },
              {
                label: "1x",
                value: 1,
              },
              {
                label: "1.5x",
                value: 1.5,
              },
              {
                label: "2x",
                value: 2,
              },
            ]}
          ></HTMLSelect>
          {/*<Button
            active={previewState.repeat}
            minimal
            color={"#a7b6c2"}
            onClick={() => {
              _setStagePreview({
                repeat: !previewState.repeat,
              });
            }}
          >
            <RepeatIcon
              style={{ width: "14px", height: "16px", fill: "#a7b6c2" }}
            />
          </Button>*/}
          <Button
            active={previewState.previewState === "play"}
            minimal
            icon={previewState.previewState === "play" ? "pause" : "play"}
            onClick={() => {
              _setStagePreview({
                previewState:
                  previewState.previewState === "play" ? "pause" : "play",
              });
            }}
          />
          <Button
            minimal
            icon={"stop"}
            onClick={() => {
              _setStagePreview({
                previewState: "stop",
                isPreview: false,
                scope: null,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { stage } = state;

  return {
    previewState: stage.previewState,
  };
};

const mapDispatchToProps = {
  _setStagePreview: (preview: Partial<IPreviewState>) =>
    setStagePreview(preview),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectSmallTimeline);
