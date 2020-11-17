import React, { useEffect, useState } from "react";
import gsap from "gsap";

import css from "./SmallTimeline.module.scss";

export interface ISmallTimelineProps {
  tl: gsap.core.Timeline;
}
const SmallTimeline: React.FC<ISmallTimelineProps> = (props) => {
  const { tl } = props;

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
      </div>
    </div>
  );
};

export default SmallTimeline;
