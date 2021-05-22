import gsap from "gsap";
import { ITransitionsData } from "../export/export-html";
import { ITransition } from "../objects/types";

export function createTimelineForObject(
  data: ITransitionsData
): gsap.core.Timeline[] {
  const getDuration = (eff: ITransition) => {
    return eff.duration === -1
      ? data.data.slideDuration.customValue
      : eff.duration;
  };

  let tl;
  const parallelTimelines: gsap.core.Timeline[] = [];

  const effIn = data.transitions.in;
  const effOut = data.transitions.out;
  const effEffect = data.transitions.effect || data.transitions.layer; // TODO: layer is added adhock

  if (effIn || effOut) {
    tl = gsap.timeline();
    parallelTimelines.push(tl);

    let totalDuration = 0;
    if (effIn) {
      totalDuration += effIn.delay;

      // ONE: delay for IN effect
      (tl as any).add(
        gsap.to("." + data.objectClass, { duration: effIn.delay / 1000 })
      );
      totalDuration += getDuration(effIn);

      //console.log(getDuration(effIn));
      // TWO: duration for IN effect

      const ineff = gsap.effects[effIn.effect.id]("." + data.objectClass, {
        ...effIn.effect.values,
        objectProperties: {
          width: data.data.objectWidth,
          height: data.data.objectHeight,
          left: data.data.objectLeft,
          top: data.data.objectTop,
          objectHtml: data.data.objectHtml,
        },
        type: "in",
        duration: getDuration(effIn) / 1000,
        ease: effIn.ease,
        childEase: effIn.childEase,
        timeDistribution: effIn.timeDistribution,
      });
      (tl as any).add(ineff);
    }

    if (effOut) {
      let betweenGap =
        data.data.slideDuration.customValue -
        (getDuration(effOut) + effOut.delay);

      //console.log(betweenGap);
      if (effIn) {
        betweenGap -= getDuration(effIn) + effIn?.delay;
        //console.log(betweenGap);
      }
      //console.log(betweenGap);

      if (betweenGap > 0) {
        totalDuration += betweenGap;

        //console.log(betweenGap, "betweenGap");
        (tl as any).add(
          gsap.to("." + data.objectClass, { duration: betweenGap / 1000 })
        );
      }

      //console.log(totalDuration);

      totalDuration += getDuration(effOut);
      (tl as any).add(
        gsap.effects[effOut.effect.id](
          "." + data.objectClass,
          {
            ...effOut.effect.values,
            objectProperties: {
              width: data.data.objectWidth,
              height: data.data.objectHeight,
              left: data.data.objectLeft,
              top: data.data.objectTop,
              objectHtml: data.data.objectHtml,
            },
            type: "out",
            duration: getDuration(effOut) / 1000,
            delay: effOut.delay / 1000,
            ease: effOut.ease,
            childEase: effOut.childEase,
            timeDistribution: effOut.timeDistribution,
          },
          (data.data.slideDuration.customValue -
            getDuration(effOut) -
            effOut.delay) /
            1000
        )
      );

      totalDuration += effOut.delay;

      //console.log(totalDuration);
      (tl as any).add(
        gsap.to("." + data.objectClass, { duration: effOut.delay / 1000 })
      );
    }

    //console.log("total", totalDuration);
    //console.log("slide dur", data.data.slideDuration.customValue);
  }

  if (effEffect) {
    tl = gsap.timeline();
    parallelTimelines.push(tl);

    let totalDuration = 0;
    totalDuration += effEffect.delay;

    // ONE: delay for IN effect
    (tl as any).add(
      gsap.to("." + data.objectClass, { duration: effEffect.delay / 1000 })
    );

    totalDuration += getDuration(effEffect);
    // TWO: duration for IN effect
    const eff = gsap.effects[effEffect.effect.id]("." + data.objectClass, {
      ...effEffect.effect.values,
      objectProperties: {
        width: data.data.objectWidth,
        height: data.data.objectHeight,
        left: data.data.objectLeft,
        top: data.data.objectTop,
        objectHtml: data.data.objectHtml,
      },
      type: "in",
      duration: getDuration(effEffect) / 1000,
      ease: effEffect.ease,
      childEase: effEffect.childEase,
      timeDistribution: effEffect.timeDistribution,
    });
    (tl as any).add(eff);

    // THREE end gap
    let betweenGap =
      data.data.slideDuration.customValue -
      (getDuration(effEffect) + effEffect.delay);
    (tl as any).add(
      gsap.to("." + data.objectClass, { duration: betweenGap / 1000 })
    );
  }

  return parallelTimelines;
}
