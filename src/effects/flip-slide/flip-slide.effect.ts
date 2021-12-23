import gsap from "gsap";
import { flipSlide, IFlipSlideEffect } from "./flip-slide.types";

gsap.registerEffect({
  name: flipSlide,
  effect: function (cards: any, config: IFlipSlideEffect) {
    const durationBetweenItems = config.durationBetweenItems / 1000;

    const slidesHolder = document.getElementsByClassName(
      "slidesHolder"
    )[0] as HTMLDivElement;
    gsap.set(slidesHolder, {
      perspective: "600px",
    });

    const slideTransitionHolder = document.getElementsByClassName(
      "slideTransitionHolder"
    )[0];

    let card: HTMLDivElement;
    if (!slideTransitionHolder) {
      card = document.createElement("div");
      card.style.position = "absolute";
      card.style.width = "100%";
      card.style.height = "100%";
      card.style.transformStyle = "preserve-3d";
      card.className = "slideTransitionHolder";
      slidesHolder.append(card);
    } else {
      card = slideTransitionHolder as HTMLDivElement;
    }
    slidesHolder.appendChild(card);

    const front = config.prevSlideEl as HTMLDivElement;
    front.style.backfaceVisibility = "hidden";
    card.appendChild(front);

    const back = config.nextSlideEl as HTMLDivElement;
    back.style.backfaceVisibility = "hidden";
    back.style.transform = "rotateY(180deg)";
    card.appendChild(back);

    const tl = gsap.timeline({
      paused: true,
    });

    tl.to(card, {
      duration: durationBetweenItems,
      rotateY: -180,
      ease: config.ease,
    });

    tl.play();

    let started = false;
    tl.eventCallback("onComplete", () => {
      if (started) {
        started = false;
        const slideTransitionHolder2 = document.getElementsByClassName(
          "slideTransitionHolder"
        )[0];
        slideTransitionHolder2?.parentNode?.removeChild(slideTransitionHolder2);
      }
    });

    tl.eventCallback("onUpdate", () => {
      if (!started) {
        started = true;
      }
    });

    return tl;
  },
});
