import React, { useEffect, useState } from "react";
import gsap from "gsap";

import css from "./SmallTimeline.module.scss";
import { Button, HTMLSelect } from "@blueprintjs/core";
import { ReactComponent as RepeatIcon } from "../../../assets/icons/repeat.svg";
import { IStore } from "../../../store/store";
import { IPreviewState } from "../../../store/reducers/stage";
import { setStagePreview } from "../../../store/actions/actions";
import { connect } from "react-redux";

type ISmallTimelineProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & { tl: gsap.core.Timeline };

const SmallTimeline: React.FC<ISmallTimelineProps> = (props) => {
  const { tl, previewState, _setStagePreview } = props;

  const [progress, setProgress] = useState<number>(0);

  const lineRef = React.useRef(null);

  useEffect(() => {
    tl.eventCallback("onUpdate", () => {
      setProgress(tl.progress());
    });
    return () => {
      // cleanup;
    };
  }, [tl]);

  const thumbStyle = {
    left: ((lineRef?.current as any)?.offsetWidth || 0) * progress + "px",
  };

  return (
    <div className={css.smallTimeline}>
      <div className={css.smallTimelineInner}>
        <div className={css.line} ref={lineRef}></div>
        <div className={css.thumbHolder}>
          <div className={css.thumb} style={thumbStyle}></div>
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
          <Button active={true} minimal color={"#a7b6c2"}>
            <RepeatIcon
              style={{ width: "14px", height: "16px", fill: "#a7b6c2" }}
            />
          </Button>
          <Button
            active={previewState.previewState === "play"}
            minimal
            icon="play"
            onClick={() => {
              _setStagePreview({
                previewState:
                  previewState.previewState === "play" ? "pause" : "play",
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

export default connect(mapStateToProps, mapDispatchToProps)(SmallTimeline);
