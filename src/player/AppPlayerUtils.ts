import gsap from "gsap";
import { ITransitionsData } from "../export/export-html";

export function createTimelineForObject(
  data: ITransitionsData
): gsap.core.Timeline {
  const tl = gsap.timeline();

  const effIn = data.transitions.in;
  const effOut = data.transitions.out;

  console.log(effIn);
  let totalDuration = 0;
  if (effIn) {
    console.log(effIn.delay);
    console.log(effIn.duration);
    totalDuration += effIn.delay;

    // ONE: delay for IN effect
    (tl as any).add(
      gsap.to("." + data.objectClass, { duration: effIn.delay / 1000 })
    );
    totalDuration += effIn.duration;

    // TWO: duration for IN effect
    (tl as any).add(
      gsap.effects[effIn.effect.id]("." + data.objectClass, {
        ...effIn.effect.values,
        objectProperties: {
          width: data.data.objectWidth,
          height: data.data.objectHeight,
          objectHtml: data.data.objectHtml,
        },
        type: "in",
        duration: effIn.duration / 1000,
        ease: effIn.ease,
        childEase: effIn.childEase,
        timeDistribution: effIn.timeDistribution,
      })
    );
  }

  if (effOut) {
    let betweenGap =
      data.data.slideDuration.customValue - (effOut.duration + effOut.delay);

    if (effIn) {
      betweenGap -= effIn?.duration + effIn?.delay;
    }

    if (betweenGap > 0) {
      console.log(betweenGap);
      totalDuration += betweenGap;
      (tl as any).add(
        gsap.to("." + data.objectClass, { duration: betweenGap / 1000 })
      );
    }

    totalDuration += effOut.duration;
    (tl as any).add(
      gsap.effects[effOut.effect.id](
        "." + data.objectClass,
        {
          ...effOut.effect.values,
          objectProperties: {
            width: data.data.objectWidth,
            height: data.data.objectHeight,
            objectHtml: data.data.objectHtml,
          },
          type: "out",
          duration: effOut.duration / 1000,
          delay: effOut.delay / 1000,
          ease: effOut.ease,
          childEase: effOut.childEase,
          timeDistribution: effOut.timeDistribution,
        },
        (data.data.slideDuration.customValue - effOut.duration - effOut.delay) /
          1000
      )
    );

    totalDuration += effOut.delay;
    (tl as any).add(
      gsap.to("." + data.objectClass, { duration: effOut.delay / 1000 })
    );
  }

  console.log("total", totalDuration);
  console.log("slide dur", data.data.slideDuration.customValue);

  return tl;
}
