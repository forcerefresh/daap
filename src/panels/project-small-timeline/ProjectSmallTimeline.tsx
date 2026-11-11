import React, { useContext } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import css from "./ProjectSmallTimeline.module.scss";
import { Button } from "@blueprintjs/core";
import { IStore } from "../../store/store";
import { IPreviewState } from "../../store/reducers/stage";
import { setStagePreview } from "../../store/actions/actions";
import { connect } from "react-redux";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import cx from "classnames";
import { PreviewTimelineContext } from "../../utils/preview-timeline-provider/PreviewTimelineProvider";
import { last } from "lodash-es";
import { useWindowSize } from "../../utils/hooks/window-size";

export interface SlideTimelineData {
  duration: number;
  transitionDuration: number;
  transitionOverlap: number;
}

export interface ProjectTimelineData {
  slides: SlideTimelineData[];
  totalTime?: number;
}

type IProjectTimelineProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
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

  const windowSize = useWindowSize();

  const { previewTimelineState } = useContext(PreviewTimelineContext);

  // get total duration
  let totalTime = 0;
  projectTimelineData?.slides.forEach((slideData, idx) => {
    totalTime +=
      slideData.duration - (idx === 0 ? 0 : slideData.transitionOverlap);
  });

  let currPos = 0;
  const slideLeftArr: number[] = [];
  const slidePosMultiplierArr: number[] = [];

  projectTimelineData?.slides.forEach((slideData, idx) => {
    // left position of slide
    // slide left is currPos - transitionDuration
    const slideLeft =
      currPos === 0
        ? 0
        : (currPos - (idx === 0 ? 0 : slideData.transitionOverlap)) / totalTime;
    slideLeftArr[idx] = slideLeft;
    currPos +=
      slideData.duration - (idx === 0 ? 0 : slideData.transitionOverlap);

    // slide multiplier
    const slidePosMultiplier = slideData.duration / totalTime;
    slidePosMultiplierArr[idx] = slidePosMultiplier;
  });

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
          (currentPosition - (idx === 0 ? 0 : slideData.transitionOverlap)); // TODO:UPDATE
        let transitionWidth =
          (slideData.transitionDuration / totalTime) * lineWidth;
        if (transitionWidth === 0) transitionWidth = 2;
        html += `<div style="position: absolute; width: ${transitionWidth}px; height: 4px; background: #744b08; left:${transitionLeft}px "></div>`;

        currentPosition +=
          slideData.duration - (idx === 0 ? 0 : slideData.transitionOverlap);
      });

      if (
        projectTimelineData?.slides &&
        projectTimelineData.slides.length > 1
      ) {
        const transitionLeft =
          (lineWidth / totalTime) *
          (currentPosition -
            last(projectTimelineData?.slides!)!.transitionOverlap);
        let transitionWidth =
          (last(projectTimelineData?.slides!)!.transitionOverlap / totalTime) *
          lineWidth;

        html += `<div style="position: absolute; width: ${transitionWidth}px; height: 4px; background: #555; left:${transitionLeft}px "></div>`;
      }
      lineDiv.innerHTML = html;
    }
  }, [projectTimelineData, windowSize]);

  const lineRef = React.useRef(null);

  const currentSlideDuration =
    (projectTimelineData?.slides[previewTimelineState.slideIdx].duration ||
      10000) / 1000;
  const progress = previewTimelineState.time / currentSlideDuration; //slideProgress.progress; //slideProgress.time / currentSlideDuration;

  const lineWidth = (lineRef?.current as any)?.offsetWidth || 0;
  let left =
    lineWidth *
    progress *
    slidePosMultiplierArr[previewTimelineState.slideIdx];

  left = left + lineWidth * slideLeftArr[previewTimelineState.slideIdx];

  const position =
    previewState.previewState === "play" ? { x: left, y: 0 } : undefined;

  const calculateTimeFromThumb = (x: number) => {
    const multiplier = x / (lineRef?.current as any)?.offsetWidth;
    onManualProgress(multiplier);
  };

  return (
    <div className={css.smallTimeline}>
      <div className={css.smallTimelineInner}>
        <div className={css.pagination}>
          Page <strong>{previewTimelineState.slideIdx + 1}</strong>
          {" of "}
          {projectTimelineData?.slides.length}(
          {previewTimelineState.time.toFixed(2)})
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
            onDrag={(_evt: DraggableEvent, data: DraggableData) => {
              calculateTimeFromThumb(data.x);
            }}
          >
            <div className={cx(css.thumb, "handle")}></div>
          </Draggable>
        </div>
        <div className={css.actionHolder}>
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
