import gsap, { SteppedEase } from "gsap";
import { typewriter, ITypeWriterEffect } from "./typewriter.types";
import { SplitText } from "gsap/SplitText";
import { nl2br, space2nbsp } from "../../utils/doom-utils/common";

//gsap.registerPlugin(SplitText);

gsap.registerEffect({
  name: typewriter,
  effect: function (targets: any, config: ITypeWriterEffect) {
    const objectEl = targets[0]! as HTMLElement;
    const pEl = objectEl.firstChild as HTMLParagraphElement;
    pEl.style.opacity = "0";
    const originalInnerHTML = pEl.innerHTML;

    let textChars: SplitText;
    let cursorEl: HTMLDivElement;

    const rootTimeline = gsap.timeline({
      duration: config.duration!,
      yoyo: true,
      repeat: -1,
    });

    let currentId: number;
    const initializeEffect = (idx = 1) => {
      currentId = idx;
      initializeTextEffect((config as any)["text" + idx] as string);
    };
    const initializeTextEffect = (text: string) => {
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
      for (let i = 0; i < chars.length; i++) {
        let positionX;
        let positionY;

        positionX =
          parseInt((chars[i] as HTMLElement).style.left) +
          parseInt((chars[i] as HTMLElement).style.width) +
          config.cursorPadding;

        positionY = parseInt((chars[i] as HTMLElement).style.top, 10);

        /* //deleteCharacterSpeed: number;
        //emptySpaceDeleteTime: number;
        cursorBlinking: number;
        initialDelay: number;
        cursorPadding: number;*/

        const add =
          chars[i].innerHTML === "&nbsp;"
            ? config.emptySpaceTypeTime / 1000
            : config.typeCharacterSpeed / 1000;

        // move cursor to right position
        rootTimeline.set(
          cursorEl,
          {
            x: positionX,
            y: positionY,
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

        delay += add;
      }

      const repeat = (delay / (config.cursorBlinking / 1000)) * 2;
      console.log(repeat);
      //cursor blinking
      rootTimeline.to(
        cursorEl,
        {
          duration: config.cursorBlinking / 1000,
          autoAlpha: 0,
          repeat: 5, //-1, //repeat, //-1
          yoyo: true,
          ease: SteppedEase.config(1),
        },
        0
      );
    };

    console.log(rootTimeline.duration());
    console.log(rootTimeline.totalDuration());

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

      if (
        rootTimeline.progress() >
        (config.duration! + config.initialDelay) / 1000
      ) {
        rootTimeline.repeat(0).progress(1).kill();
      }
    });

    rootTimeline.eventCallback("onComplete", () => {
      console.log("onComplete");
      if (isStarted) {
        // celanup
        textChars.revert(); // cleanup SplitText outcome
        pEl.innerHTML = originalInnerHTML; // revert text
        cursorEl.parentElement?.removeChild(cursorEl); // remove cursor

        isStarted = false;
      }
    });

    console.log(rootTimeline.duration());
    return rootTimeline;
  },

  defaults: {},
  extendTimeline: true,
});
/*


let delay = 0;
for (let i = 0; i < chars.length; i++) {
  if (i < chars.length - 1) {
    position = parseInt(chars[i + 1].style.left) + cs;
  } else {
    position = width + cs;
  }

  console.log(chars[i].innerHTML);
  console.log(chars[i].style.top);
  const add = chars[i].innerHTML == "&nbsp;" ? 1 : 0.2;

  tl.set(
    "#cursor",
    { x: position, y: parseInt(chars[i].style.top, 10) },
    delay
  );
  tl.set(chars[i], { opacity: 1 }, delay);

  delay += add;
  //tl.set("#wrapper", { x: "-=" + width / 2 / chars.length }, i * delay);
}

*/
