import gsap, { SteppedEase } from "gsap";
import { typewriter, ITypeWriterEffect } from "./typewriter.types";
import { SplitText } from "gsap/SplitText";
import { space2nbsp } from "../../utils/doom-utils/common";
import { createRootTimelineForTextEffect } from "../text.utils";
import { IObject } from "../../objects/types";
import { TextValues } from "../../inputs/types";

//gsap.registerPlugin(SplitText);
export function getTypewriterEffectDuration(object?: IObject, config?: any) {
  const effValues = config?.effect?.values!;
  const values = object?.definition.values as TextValues;

  const wordsArr = values.text.split(" ");
  const charsStr = wordsArr?.join("");
  return (
    effValues.initialDelay +
    effValues.timeAfterWrite +
    (wordsArr!.length - 1) * effValues.emptySpaceTypeTime +
    charsStr!.length * effValues.typeCharacterSpeed +
    (wordsArr!.length - 1) * effValues.emptySpaceDeleteTime +
    charsStr!.length * effValues.deleteCharacterSpeed
  );
}

gsap.registerEffect({
  name: typewriter,
  effect: function (targets: any, config: ITypeWriterEffect) {
    const objectEl = targets[0]! as HTMLElement;
    const pEl = objectEl.firstChild as HTMLParagraphElement;
    pEl.style.opacity = "0";
    const originalInnerHTML = pEl.innerHTML;

    let textChars: SplitText;
    let cursorEl: HTMLDivElement;

    /*const rootTimeline = gsap.timeline({
      duration: config.duration!,
      yoyo: true,
      repeat: -1,
    });*/

    let cursorBlinkingTween: gsap.core.Tween;
    let currentId: number;
    const initializeEffect = (idx = 1) => {
      currentId = idx;

      initializeTextEffect(pEl.innerText); //(config as any)["text" + idx] as string);
    };
    const initializeTextEffect = (text: string) => {
      console.log("init typewriter");
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
        rootTimeline.set(
          cursorEl,
          {
            x: cursorX,
            y: cursorY,
            delay,
          },
          config.initialDelay / 1000
        );

        // show char at right time
        rootTimeline.set(
          chars[i],
          { opacity: 1, delay },
          config.initialDelay / 1000
        );

        console.log(delay);
        delay += add;
      }

      // time after text is written
      delay += !!config.timeAfterWrite ? config.timeAfterWrite / 1000 : 0;
      rootTimeline.set(
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
        rootTimeline.set(
          cursorEl,
          {
            x: cursorX,
            y: cursorY,
            delay,
          },
          config.initialDelay / 1000
        );

        // show char at right time
        rootTimeline.set(
          chars[i],
          { opacity: 0, delay }, // diff
          config.initialDelay / 1000
        );

        console.log(delay);
        delay += add;
      }

      console.log(rootTimeline.duration());
      // EFFECT SETUP ENDEND

      const repeat = (delay / (config.cursorBlinking / 1000)) * 2;
      console.log(repeat);

      //cursor blinking
      cursorBlinkingTween = gsap.to(cursorEl, {
        duration: config.cursorBlinking / 1000,
        autoAlpha: 0,
        repeat: -1, //5, //-1, //repeat, //-1
        yoyo: true,
        ease: SteppedEase.config(1),
      });
    };

    const teardownEffect = () => {
      pEl.style.opacity = "0";
      textChars.revert(); // cleanup SplitText outcome
      pEl.innerHTML = originalInnerHTML; // revert text
      cursorEl.parentElement?.removeChild(cursorEl); // remove cursor
      cursorBlinkingTween.kill();
    };

    //const totalDuration = config.duration!;

    const rootTimeline = createRootTimelineForTextEffect({
      timelineConfig: {
        duration: 1,
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
