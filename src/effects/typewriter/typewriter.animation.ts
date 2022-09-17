import { space2nbsp } from "../../utils/doom-utils/common";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { createRootTimelineForTextEffect } from "../text.utils";
import { ITypeWriterEffect } from "./typewriter.types";

function typewriterAnimation() {
  let timeline: gsap.core.Timeline;
  let objectEl: HTMLElement;
  let pEl: HTMLParagraphElement;
  let originalInnerHTML: string;
  let textChars: SplitText;
  let cursorEl: HTMLDivElement;

  let cursorBlinkingTween: gsap.core.Tween;
  let currentId: number;

  let initializeEffect: any;
  let initializeTextEffect: any;
  let teardownEffect: any;

  function init(config: ITypeWriterEffect) {
    logger.debug("typewriter init");

    objectEl = getObjectElementById(config.itemId!);
    pEl = objectEl.firstChild as HTMLParagraphElement;
    pEl.style.opacity = "0";
    originalInnerHTML = pEl.innerHTML;

    let currentId: number;
    initializeEffect = (idx = 1) => {
      currentId = idx;

      initializeTextEffect(pEl.innerText); //(config as any)["text" + idx] as string);
    };

    initializeTextEffect = (text: string) => {
      // - create characters
      pEl.innerText = text;
      pEl.innerHTML = space2nbsp(pEl.innerHTML);
      pEl.style.opacity = "1";
      textChars = new SplitText(pEl, {
        type: "chars",
        position: "absolute",
      });
      const chars = textChars.chars;
      gsap.set(chars, { opacity: 0, visibility: "visible" });

      // - create cursor
      cursorEl = document.createElement("div");
      cursorEl.style.position = "absolute";
      cursorEl.style.top = "0px";
      cursorEl.style.left = "0px";
      cursorEl.style.height = (chars[0] as HTMLElement).style.height;
      cursorEl.style.width = "2px";
      cursorEl.style.background = "white";
      cursorEl.style.visibility = "visible";
      objectEl.appendChild(cursorEl);

      // - set animation
      let delay = 0;
      let cursorX;
      let cursorY;
      for (let i = 0; i < chars.length; i++) {
        cursorX =
          parseInt((chars[i] as HTMLElement).style.left) +
          parseInt((chars[i] as HTMLElement).style.width) +
          config.cursorPadding;
        cursorY = parseInt((chars[i] as HTMLElement).style.top, 10);

        const add =
          chars[i].innerHTML === "&nbsp;"
            ? config.emptySpaceTypeTime / 1000
            : config.typeCharacterSpeed / 1000;

        // move cursor to right position
        timeline.set(
          cursorEl,
          {
            x: cursorX,
            y: cursorY,
            delay,
          },
          config.initialDelay / 1000
        );

        // show char at right time
        timeline.set(
          chars[i],
          { opacity: 1, delay },
          config.initialDelay / 1000
        );

        delay += add;
      }

      // time after text is written
      delay += !!config.timeAfterWrite ? config.timeAfterWrite / 1000 : 0;
      timeline.set(
        cursorEl,
        {
          x: cursorX,
          delay,
        },
        config.initialDelay / 1000
      );

      // delete text
      for (let i = chars.length - 1; i >= 0; i--) {
        // diff
        cursorX =
          parseInt((chars[i] as HTMLElement).style.left) +
          //parseInt((chars[i] as HTMLElement).style.width) +
          config.cursorPadding;
        cursorY = parseInt((chars[i] as HTMLElement).style.top, 10);

        const add =
          chars[i].innerHTML === "&nbsp;"
            ? config.emptySpaceDeleteTime / 1000 // diff
            : config.deleteCharacterSpeed / 1000;

        // move cursor to right position
        timeline.set(
          cursorEl,
          {
            x: cursorX,
            y: cursorY,
            delay,
          },
          config.initialDelay / 1000
        );

        // show char at right time
        timeline.set(
          chars[i],
          { opacity: 0, delay }, // diff
          config.initialDelay / 1000
        );

        delay += add;
      }

      // EFFECT SETUP ENDEND

      const repeat = (delay / (config.cursorBlinking / 1000)) * 2;

      //cursor blinking
      cursorBlinkingTween = gsap.to(cursorEl, {
        duration: config.cursorBlinking / 1000,
        autoAlpha: 0,
        repeat: -1, //5, //-1, //repeat, //-1
        yoyo: true,
        ease: SteppedEase.config(1),
      });

      teardownEffect = () => {
        pEl.style.opacity = "0";
        textChars.revert(); // cleanup SplitText outcome
        pEl.innerHTML = originalInnerHTML; // revert text
        cursorEl.parentElement?.removeChild(cursorEl); // remove cursor
        cursorBlinkingTween.kill();
      };
    };

    timeline = gsap.timeline({ duration: 1 });
  }

  function rootStart(config: any) {
    logger.debug("typewriter rootStart");

    timeline.pause();
    timeline.progress(0);
  }

  function rootStop(config: any) {
    logger.debug("typewriter rootStop");

    timeline.pause();
    timeline.progress(0);
  }

  function start(config: any, isManual?: boolean) {
    logger.debug("typewriter start");

    if (objectEl.offsetWidth === 0) {
      return;
    }

    initializeEffect();

    timeline.play(0);
    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug("typewriter stop");

    teardownEffect();

    //timeline.pause();
    //timeline.progress(config.duration / 1000);
  }

  function update(config: any, time: number, isManual?: boolean) {
    logger.debug("typewriter update");

    if (isManual) {
      console.log("MANUAL UPDATE: " + time);
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug("typewriter pause");
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug("typewriter resume");
    timeline.resume();
  }

  function destroy(config: any) {
    logger.debug("typewriter destroy");
    timeline.clear();
    timeline.kill();
  }

  return {
    start,
    stop,
    init,
    update,
    pause,
    resume,
    rootStart,
    rootStop,
    destroy,
  };
}

const typewriterDef = {
  effectId: "typewriter",
  effectFunc: typewriterAnimation,
};
export default typewriterDef;
