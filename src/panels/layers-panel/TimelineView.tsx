import React from "react";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import cx from "classnames";
import css from "./TimelineView.module.scss";

export interface TimelineViewProps {
  object: IObject;
  slideDuration: number;
  slideExitDuration: number;
}
export default function TimelineView(props: TimelineViewProps) {
  const { object, slideDuration, slideExitDuration } = props;

  const tls: TimelineViewData[] = [];
  const tlHeight = 12;
  const totalHeight = (tlHeight + 1) * tls.length;

  return (
    <div
      style={{ height: totalHeight + "px" }}
      className={cx(css.timelineHolder, {
        [css.hideMe]: tls.length === 0,
      })}
    >
      {tls.map((tl, idx) => (
        <div
          key={tl.name + idx + tl.no}
          className={cx(css.timeline, tl.className)}
          style={{
            ...tl.timelineStyle,
            height: tlHeight + "px",
            top: (tlHeight + 1) * idx + "px",
          }}
        >
          {tl.no + "." + tl.name}
        </div>
      ))}
    </div>
  );
}

interface TimelineViewData {
  timelineStyle: React.CSSProperties;
  name: string;
  no: number;
  className: string;
}

