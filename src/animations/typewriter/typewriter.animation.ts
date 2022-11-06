import { space2nbsp } from "../../utils/doom-utils/common";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { ITypeWriterAnimation } from "./typewriter.types";
import gsap, { SteppedEase } from "gsap";
import { SplitText } from "gsap/SplitText";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { TextValues } from "../../objects/text/text";

export function getTypewriterAnimationDuration(object?: IObject, config?: any) {
  const effValues = config?.animation?.values!;
  const values = object?.definition.values as TextValues;

  const wordsArr = values.text.split(" ");
  const charsStr = wordsArr?.join("");

  const deleteTime = effValues.hasDelete
    ? effValues.timeAfterWrite +
      (wordsArr!.length - 1) * effValues.emptySpaceDeleteTime +
      charsStr!.length * effValues.deleteCharacterSpeed
    : 0;

  return (
    effValues.initialDelay +
    (wordsArr!.length - 1) * effValues.emptySpaceTypeTime +
    charsStr!.length * effValues.typeCharacterSpeed +
    deleteTime
  );
}

export function typewriterAnimation() {
  let objectEl: HTMLDivElement;
  let pEl: HTMLParagraphElement;
  let textChars: SplitText;
  let cursorEl: HTMLDivElement;
  let cursorBlinkingTween: gsap.core.Tween;

  let timeline: gsap.core.Timeline;

  let originalInnerHTML: string;

  function init(config: ITypeWriterAnimation) {
    logger.debug("typewriter init");

    objectEl = getObjectElementById(config.itemId!);

    pEl = objectEl.firstChild as HTMLParagraphElement;
    pEl.style.opacity = "0";
    pEl.style.display = "block";
    originalInnerHTML = pEl.innerHTML;

    timeline = gsap.timeline({ paused: true });
  }

  function initializeAnimation(config: ITypeWriterAnimation) {
    initializeTextAnimation(pEl.innerText, config);
  }

  function teardownAnimation() {
    pEl.style.opacity = "0";
    textChars.revert(); // cleanup SplitText outcome
    pEl.innerHTML = originalInnerHTML; // revert text
    cursorEl.parentElement?.removeChild(cursorEl); // remove cursor
    cursorBlinkingTween.kill();
  }

  function initializeTextAnimation(text: string, config: ITypeWriterAnimation) {
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
      timeline.set(chars[i], { opacity: 1, delay }, config.initialDelay / 1000);

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
    if (config.hasDelete) {
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
      setTimeout(() => {
        startInternal(config);
      }, 1);
      return;
    } else {
      startInternal(config);
    }

    if (isManual) timeline.pause();
  }

  function startInternal(config: ITypeWriterAnimation) {
    logger.debug("typewriter startInternal");

    initializeAnimation(config);

    timeline.play(0);
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug("typewriter stop");

    teardownAnimation();

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
