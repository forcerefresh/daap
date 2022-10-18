import gsap from "gsap";
import { FLIP_SLIDE_ANIMATION, IFlipSlideEffect } from "./flip-slide.types";

gsap.registerEffect({
  name: FLIP_SLIDE_ANIMATION,
  effect: function (cards: any, config: IFlipSlideEffect) {
    const durationBetweenItems = 1; // TODOTODOconfig.durationBetweenItems / 1000;

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
      card.style.transformOrigin = "center center";
      card.className = "slideTransitionHolder";
      slidesHolder.append(card);
    } else {
      card = slideTransitionHolder as HTMLDivElement;
    }

    card.style.transformOrigin = `center right`;

    const tl = gsap.timeline({
      paused: true,
    });

    tl.to(card, {
      duration: durationBetweenItems,
      rotateY: -180,
      translateX: "-100%",
      ease: config.ease,
    });

    tl.play();

    let started = false;
    tl.eventCallback("onComplete", () => {
      if (started) {
        gsap.set(slidesHolder, {
          perspective: "none",
        });

        if (config?.prevSlideEl) {
          slidesHolder.appendChild(config?.prevSlideEl);
          config.prevSlideEl.style.display = "none";
        }

        if (config?.nextSlideEl) {
          config.nextSlideEl.style.transform = "rotateY(0deg)";
          slidesHolder.appendChild(config?.nextSlideEl!);
        }

        started = false;

        // const slideTransitionHolder2 = document.getElementsByClassName(
        //   "slideTransitionHolder"
        // )[0];
        slideTransitionHolder?.parentNode?.removeChild(slideTransitionHolder);
      }
    });

    tl.eventCallback("onUpdate", () => {
      if (!started) {
        // NOTE: reattach slide
        if (config?.prevSlideEl) {
          //config.prevSlideEl.style.width = "1244px";
          //config.prevSlideEl.style.height = "700px";
          config.prevSlideEl.style.backfaceVisibility = "hidden";
          card.appendChild(config?.prevSlideEl);
        }

        if (config?.nextSlideEl) {
          config.nextSlideEl.style.transform = "rotateY(180deg)";
          config.nextSlideEl.style.backfaceVisibility = "hidden";
          //config.nextSlideEl.style.width = "1244px";
          //config.nextSlideEl.style.height = "700px";

          card.appendChild(config?.nextSlideEl);
        }

        config!.nextSlideEl!.style.display = "block";

        started = true;
      }
    });

    return tl;
  },
});
