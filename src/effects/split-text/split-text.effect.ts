import gsap from "gsap";
import { ISplitTextEffect, splitText } from "./split-text.types";
import { SplitText } from "gsap/SplitText";
import { stace2nbsp } from "../../utils/doom-utils/common";

gsap.registerEffect({
  name: splitText,
  effect: function (targets: any, config: ISplitTextEffect) {

    const objectEL = targets[0]! as HTMLElement;
    const pEl = objectEL.firstChild as HTMLParagraphElement;
    pEl.style.opacity = "0";
    const originalInnerHTML = pEl.innerHTML;
    const numberOfChars = pEl.innerHTML.length;

    let textChars: SplitText;

    const totalDuration =
      config.delayBetweenChar * numberOfChars +
      (config.durationPerChar - config.delayBetweenChar);

    const rootTimeline = gsap.timeline({
      duration: totalDuration / 1000
    });

    const initializeEffect = () => {
      // - create characters

      pEl.innerHTML = stace2nbsp(pEl.innerHTML);
      pEl.style.opacity = "1";
      textChars = new SplitText(pEl, {
        type: "chars",
        position: "absolute",
      });
      const chars = textChars.chars;
      gsap.set(chars, { opacity: 1, visibility: "visible" });


      rootTimeline.from(
        chars,
        {
          opacity: 0,
          ease: config.ease,
          duration: config.durationPerChar / 1000,
          x: config.positionX,
          y: config.positionY,
          rotate: config.rotationPerChar,
          scaleX: config.scaleX,
          scaleY: config.scaleY,
          stagger: {
            amount: (config.delayBetweenChar / 1000) * numberOfChars,
            from: config.startFrom
          },
        },
        0
      );
    };

    let isStarted = false;
    rootTimeline.eventCallback("onStart", () => {
      if (!isStarted) {
        // NOTE: wait for element to be visible on dom
        if ((targets[0] as HTMLElement).offsetWidth === 0) {
          return;
        }

        initializeEffect();

        isStarted = true;
      }
    });

    rootTimeline.eventCallback("onUpdate", () => {
      if (!isStarted) {
        // NOTE: wait for element to be visible on dom
        if ((targets[0] as HTMLElement).offsetWidth === 0) {
          return;
        }

        initializeEffect();

        isStarted = true;
      }
    });

    rootTimeline.eventCallback("onComplete", () => {
      if (isStarted) {
        // celanup
        textChars.revert(); // cleanup SplitText outcome
        pEl.innerHTML = originalInnerHTML; // revert text

        isStarted = false;
      }
    });

    return rootTimeline;
  },

  defaults: {},
  extendTimeline: true,
});
