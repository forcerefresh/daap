import React from "react";
import { IObject, ITransition } from "webslider-sdk/lib/objects/i-object";
import cx from "classnames";
import css from "./TimelineView.module.scss";
import { convertTimeUnitToMs } from "../../utils/utils";
import { getAppAnimationDefinition } from "webslider-sdk/lib/animations/animations-register";
import { AnimationType } from "webslider-sdk/lib/animations/i-animation-types";

export interface TimelineViewProps {
  object: IObject;
  slideDuration: number;
  slideExitDuration: number;
}
export default function TimelineView(props: TimelineViewProps) {
  const { object, slideDuration, slideExitDuration } = props;

  // const tlsIn = createTimelines(
  //   object,
  //   object?.transitions?.in || [],
  //   slideDuration,
  //   slideExitDuration,
  //   "in"
  // );
  // const tlsOut = createTimelines(
  //   object,
  //   object?.transitions?.out || [],
  //   slideDuration,
  //   slideExitDuration,
  //   "out",
  //   true
  // );
  // const tlsEff = createTimelines(
  //   object,
  //   object?.transitions?.animation || [],
  //   slideDuration,
  //   slideExitDuration,
  //   "animation"
  // );

  // const tlsEvent = createTimelines(
  //   object,
  //   object?.transitions?.event || [],
  //   slideDuration,
  //   slideExitDuration,
  //   "event"
  // );

  const tls: TimelineViewData[] = []; //[...tlsIn, ...tlsOut, ...tlsEff, ...tlsEvent];

  /*const sizeOut = calculateTimelineRect(
    slideDuration,
    object?.transitions?.out?.[0]?.delay || 1,
    object?.transitions?.out?.[0]?.duration || 1,
    340,
    true
  );
  const timelineOutStyle = {
    left: sizeOut.left + "px",
    width: sizeOut.width + "px",
  };
  const effDef = getAnimationtDefinition(
    object?.transitions?.animation?.[0]?.animation?.id || "none"
  );

  let effDur = effDef.defaults.hasOwnDuration
    ? effDef.getDuration?.(object, object?.transitions?.animation?.[0]) || 0
    : object?.transitions?.animation?.[0]?.duration;

  const sizeAnimation = calculateTimelineRect(
    slideDuration,
    object?.transitions?.animation?.[0]?.delay || 0,
    effDur || 0,
    340
  );
  const timelineAnimationStyle = {
    left: sizeAnimation.left + "px",
    width: sizeAnimation.width + "px",
  };*/
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
          {/*tl.name*/}
        </div>
      ))}
    </div>
  );
}

/*  {object.transitions.in?.[0]?.animation.id !== "none" && (
        <div className={css.timeline} style={timelineInStyle}>
          {object.transitions.in?.[0]?.animation.id}
        </div>
      )}
      {object.transitions.out?.[0]?.animation.id !== "none" && (
        <div className={css.timeline} style={timelineOutStyle} />
      )}
      {object.transitions.animation?.[0]?.animation.id !== "none" && (
        <div className={css.timeline} style={timelineAnimationStyle} />
      )} */

interface TimelineViewData {
  //left: number;
  //width: number;
  timelineStyle: React.CSSProperties;
  name: string;
  no: number;
  className: string;
}

function createTimelines(
  object: IObject,
  effs: ITransition[],
  slideDuration: number,
  slideExitDuration: number,
  type: AnimationType,
  isOut = false
): TimelineViewData[] {
  const arr: TimelineViewData[] = [];

  effs.map((eff, idx) => {
    const effDef = getAppAnimationDefinition(eff.animation.id);
    const customDuration = effDef?.getDuration
      ? effDef.getDuration(object, eff)
      : undefined;

    const size = calculateTimelineRect(
      slideDuration,
      slideExitDuration,
      convertTimeUnitToMs(eff.delay),
      customDuration || convertTimeUnitToMs(eff.duration),
      340,
      isOut
    );

    const timelineStyle = {
      left: size.left + "px",
      width: size.width + "px",
    };

    const className = css[`timeline-${type}`];
    arr.push({ className, timelineStyle, name: eff.animation.id, no: idx + 1 });
  });

  return arr;
}

function calculateTimelineRect(
  slideDuration: number,
  slideExitDuration: number,
  animationDelay: number,
  animationDuration: number,
  holderWidth: number = 1,
  isOut = false
) {
  const realanimationDuration =
    animationDuration === -1 ? slideDuration : animationDuration;

  let left: number;
  if (isOut) {
    left =
      ((slideDuration - slideExitDuration + animationDelay) / slideDuration) *
      holderWidth;
  } else {
    left =
      animationDelay === 0 ? 0 : (animationDelay / slideDuration) * holderWidth;
  }

  let width = (realanimationDuration / slideDuration) * holderWidth;

  //keep it in a range 0-340
  width = Math.min(Math.max(0, width), holderWidth);

  return { left, width };
}
