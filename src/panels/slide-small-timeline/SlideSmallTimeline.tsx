import React, { useContext } from "react";

import css from "./SlideSmallTimeline.module.scss";
import { Button } from "@blueprintjs/core";
import RepeatIcon from "../../assets/icons/repeat.svg?react";
import { IStore } from "../../store/store";
import { IPreviewState } from "../../store/reducers/stage";
import { setStagePreview } from "../../store/actions/actions";
import { connect } from "react-redux";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { PreviewTimelineContext } from "../../utils/preview-timeline-provider/PreviewTimelineProvider";

import cx from "classnames";

type ISmallTimelineProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    onManualProgress: (progress: number) => void;
  };

const SlideSmallTimeline: React.FC<ISmallTimelineProps> = (props) => {
  const { onManualProgress, previewState, _setStagePreview } = props;

  const { previewTimelineState } = useContext(PreviewTimelineContext);

  const lineRef = React.useRef(null);

  const left =
    ((lineRef?.current as any)?.offsetWidth || 0) *
    previewTimelineState.progress;
  const position =
    previewState.previewState === "play" ? { x: left, y: 0 } : undefined;

  const calculateTimeFromThumb = (x: number) => {
    const multiplier = x / (lineRef?.current as any)?.offsetWidth;
    onManualProgress(multiplier);
  };
  return (
    <div className={css.smallTimeline}>
      <div className={css.smallTimelineInner}>
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
          </Button>
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

export default connect(mapStateToProps, mapDispatchToProps)(SlideSmallTimeline);
