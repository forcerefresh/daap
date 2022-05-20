import gsap from "gsap";
import { ISplitTextEffect, splitText } from "./split-text.types";
import { SplitText } from "gsap/SplitText";
import { space2nbsp } from "../../utils/doom-utils/common";
import { getMethodByType } from "../common";
import {
  addTextEffectPartToTimeline,
  arrangeChars,
  createRootTimelineForTextEffect,
} from "../text.utils";
import { pick } from "lodash-es";

gsap.registerEffect({
  name: splitText,
  effect: function (targets: any, config: ISplitTextEffect) {
    console.log("splitText");
    const objectEL = targets[0]! as HTMLElement;
    const pElOriginal = objectEL.firstChild as HTMLParagraphElement;

    pElOriginal.style.opacity = config.type === "in" ? "0" : "1";

    const numberOfChars = pElOriginal.innerHTML.length;

    let textChars: SplitText;
    console.log(config);

    let pElClone: any = null;
    const initializeEffect = () => {
      pElClone = pElOriginal.cloneNode(true) as HTMLElement;
      objectEL.appendChild(pElClone);
      pElClone.style.opacity = config.type === "in" ? "0" : "1";
      pElClone.innerHTML = pElClone.innerHTML; // space2nbsp(pElClone.innerHTML);

      pElClone.style.opacity = "1"; // config.type === "in" ? "0" : "1";
      pElOriginal.style.opacity = config.type === "in" ? "0" : "1";

      textChars = new SplitText(pElClone, {
        type: "words,chars",
        // position: "absolute",
      });
      const chars = arrangeChars(config.startFrom, textChars.chars);
      gsap.set(chars, { opacity: 1, visibility: "visible" });

      /* console.log(config.positionX);

      const newChars1 = [...chars].slice(0, 4).reverse();
      const newChars2 = [...chars].slice(5, 10);
      const newChars = [...newChars1, ...newChars2];
      rootTimeline.from(
        chars,
        {
          x: gsap.utils.wrap([
            "-=100",
            "-=100",
            "-=100",
            "-=100",
            "-=100",
            "+=100",
            "+=100",
            "+=100",
            "+=100",
            "+=100",
          ]),
          delay: 0.1,
          stagger: {
            amount: (config.delayBetweenChar / 1000) * chars.length,
            from: "center",
          },
        },
        0
      );
*/

      addTextEffectPartToTimeline({
        timeline: rootTimeline,
        chars,
        config: config,
        value: config.positionX,
        propertyName: "x",
      });

      addTextEffectPartToTimeline({
        timeline: rootTimeline,
        chars,
        config: config,
        value: config.positionY,
        propertyName: "y",
      });

      addTextEffectPartToTimeline({
        timeline: rootTimeline,
        chars,
        config: config,
        value: config.rotationPerChar,
        propertyName: "rotation",
      });

      addTextEffectPartToTimeline({
        timeline: rootTimeline,
        chars,
        config: config,
        value: config.scaleX,
        propertyName: "scaleX",
      });

      addTextEffectPartToTimeline({
        timeline: rootTimeline,
        chars,
        config: config,
        value: config.scaleY,
        propertyName: "scaleY",
      });

      addTextEffectPartToTimeline({
        timeline: rootTimeline,
        chars,
        config: config,
        value: config.opacity,
        propertyName: "opacity",
      });

      addTextEffectPartToTimeline({
        timeline: rootTimeline,
        chars,
        config: config,
        value: { ...config.blur, ...{ value: `blur(${config.blur.value}px)` } }, //{ ...config.blur, ...{ value: `blur(${config.blur}px)` } },
        propertyName: "filter",
      });
    };

    const teardownEffect = () => {
      //textChars.revert(); //// OBSOLETE:  cleanup SplitText outcome  - no need as we clean all (removeChild)
      pElClone.parentElement?.removeChild(pElClone);
      pElClone.style.opacity = "0";
      pElOriginal.style.opacity = config.type === "in" ? "1" : "0";
      pElClone = null;
    };

    const totalDuration =
      config.delayBetweenChar * numberOfChars +
      (config.durationPerChar - config.delayBetweenChar);

    const rootTimeline = createRootTimelineForTextEffect({
      timelineConfig: {
        duration: totalDuration / 1000,
      },
      target: targets[0] as HTMLElement,
      initializeEffect,
      teardownEffect,
    });

    return rootTimeline;
  },

  defaults: {},
  extendTimeline: true,
});
