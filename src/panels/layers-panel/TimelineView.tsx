import React from "react";
import { IObject, ITransition } from "../../webslider-sdk/src/objects/i-object";
import cx from "classnames";
import css from "./TimelineView.module.scss";
import { getEffectDefinition } from "../../effects/effects";
import { max } from "lodash-es";
import { convertTimeUnitToMs } from "../../utils/utils";

export interface TimelineViewProps {
  object: IObject;
  slideDuration: number;
}
export default function TimelineView(props: TimelineViewProps) {
  const { object, slideDuration } = props;

  const tlsIn = createTimelines(object?.transitions?.in || [], slideDuration);
  const tlsOut = createTimelines(
    object?.transitions?.out || [],
    slideDuration,
    true
  );
  const tlsEff = createTimelines(
    object?.transitions?.effect || [],
    slideDuration
  );

  const tls = [...tlsIn, ...tlsOut, ...tlsEff];

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
  const effDef = getEffectDefinition(
    object?.transitions?.effect?.[0]?.effect?.id || "none"
  );

  let effDur = effDef.defaults.hasOwnDuration
    ? effDef.getDuration?.(object, object?.transitions?.effect?.[0]) || 0
    : object?.transitions?.effect?.[0]?.duration;

  const sizeEffect = calculateTimelineRect(
    slideDuration,
    object?.transitions?.effect?.[0]?.delay || 0,
    effDur || 0,
    340
  );
  const timelineEffectStyle = {
    left: sizeEffect.left + "px",
    width: sizeEffect.width + "px",
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
          className={css.timeline}
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

/*  {object.transitions.in?.[0]?.effect.id !== "none" && (
        <div className={css.timeline} style={timelineInStyle}>
          {object.transitions.in?.[0]?.effect.id}
        </div>
      )}
      {object.transitions.out?.[0]?.effect.id !== "none" && (
        <div className={css.timeline} style={timelineOutStyle} />
      )}
      {object.transitions.effect?.[0]?.effect.id !== "none" && (
        <div className={css.timeline} style={timelineEffectStyle} />
      )} */

interface TimelineViewData {
  //left: number;
  //width: number;
  timelineStyle: React.CSSProperties;
  name: string;
  no: number;
}

function createTimelines(
  effs: ITransition[],
  slideDuration: number,
  isOut = false
): TimelineViewData[] {
  const arr: TimelineViewData[] = [];

  effs.map((eff, idx) => {
    const size = calculateTimelineRect(
      slideDuration,
      convertTimeUnitToMs(eff.delay),
      convertTimeUnitToMs(eff.duration),
      340,
      isOut
    );

    const timelineStyle = {
      left: size.left + "px",
      width: size.width + "px",
    };
    arr.push({ timelineStyle, name: eff.effect.id, no: idx + 1 });
  });

  return arr;
}

function calculateTimelineRect(
  slideDuration: number,
  effectDelay: number,
  effectDuration: number,
  holderWidth: number = 1,
  isOut = false
) {
  const realEffectDuration =
    effectDuration === -1 ? slideDuration : effectDuration;

  let left: number;
  if (isOut) {
    left =
      ((slideDuration - effectDelay - realEffectDuration) / slideDuration) *
      holderWidth;
  } else {
    left = effectDelay === 0 ? 0 : (effectDelay / slideDuration) * holderWidth;
  }

  let width = (realEffectDuration / slideDuration) * holderWidth;

  //keep it in a range 0-340
  width = Math.min(Math.max(0, width), holderWidth);

  return { left, width };
}
