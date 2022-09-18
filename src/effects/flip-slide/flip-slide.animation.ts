import gsap from "gsap";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { FLIP_SLIDE_ANIMATION, IFlipSlideEffect } from "./flip-slide.types";

export function flipSlideAnimation() {
  let timeline: gsap.core.Timeline;
  let durationBetweenItems: number;
  let slidesHolder: HTMLDivElement;
  let card: HTMLDivElement;
  let slideTransitionHolder: HTMLDivElement;

  function init(config: IFlipSlideEffect) {
    logger.debug(`${FLIP_SLIDE_ANIMATION} init`);

    slidesHolder = document.getElementsByClassName(
      "slidesHolder"
    )[0] as HTMLDivElement;

    slideTransitionHolder = document.getElementsByClassName(
      "slideTransitionHolder"
    )[0] as HTMLDivElement;
    durationBetweenItems = config.durationBetweenItems / 1000;

    gsap.set(slidesHolder, {
      perspective: "600px",
    });

    if (!slideTransitionHolder) {
      card = document.createElement("div");
      card.style.position = "absolute";
      card.style.width = "100%";
      card.style.height = "100%";
      card.style.transformStyle = "preserve-3d";
      card.style.transformOrigin = "center center";
      card.className = "slideTransitionHolder";
      console.log(card, "pppp");
      slidesHolder.append(card);
    } else {
      card = slideTransitionHolder as HTMLDivElement;
    }

    card.style.transformOrigin = `center right`;

    timeline = gsap.timeline({ paused: true });
    timeline.to(card, {
      duration: durationBetweenItems,
      rotateY: -180,
      translateX: "-100%",
      ease: config.ease,
    });
  }

  function rootStart(config: any) {
    logger.debug(`${FLIP_SLIDE_ANIMATION} rootStart`);

    if (config.type === "in") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  function rootStop(config: any) {
    logger.debug(`${FLIP_SLIDE_ANIMATION} rootStop`);

    if (config.type === "out") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  function start(config: any, isManual?: boolean) {
    logger.debug(`${FLIP_SLIDE_ANIMATION} start`);

    if (config?.prevSlideEl) {
      //config.prevSlideEl.style.width = "1244px";
      //config.prevSlideEl.style.height = "700px";
      config.prevSlideEl.style.backfaceVisibility = "hidden";
      card.appendChild(config?.prevSlideEl);
    }

    if (config?.nextSlideEl) {
      config.nextSlideEl.style.transform =
        "rotateY(180deg) translateX(-1024px)"; //TODO
      // gsap.set(config.nextSlideEl, { translateX: "-100%", rotateY: "180deg" });
      config.nextSlideEl.style.backfaceVisibility = "hidden";
      //config.nextSlideEl.style.width = "1244px";
      //config.nextSlideEl.style.height = "700px";

      card.appendChild(config?.nextSlideEl);
      config.nextSlideEl.style.display = "block";
    }

    timeline.play(0);
    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug(`${FLIP_SLIDE_ANIMATION} stop`);

    // gsap.set(slidesHolder, {
    //   perspective: "none",
    // });

    // if (config?.prevSlideEl) {
    //   slidesHolder.appendChild(config?.prevSlideEl);
    //   config.prevSlideEl.style.display = "none";
    // }

    // if (config?.nextSlideEl) {
    //   config.nextSlideEl.style.transform = "rotateY(0deg)";
    //   slidesHolder.appendChild(config?.nextSlideEl!);
    // }

    // const slideTransitionHolder2 = document.getElementsByClassName(
    //   "slideTransitionHolder"
    // )[0];
    slideTransitionHolder?.parentNode?.removeChild(slideTransitionHolder);

    if (isManual) {
      timeline.pause();
      if (isReverse) {
        timeline.progress(0);
      } else {
        timeline.progress(config.duration / 1000);
      }
    }
  }

  function update(config: any, time: number, isManual?: boolean) {
    if (isManual) {
      if (config?.prevSlideEl) {
        config.prevSlideEl.style.backfaceVisibility = "hidden";
        card.appendChild(config?.prevSlideEl);
      }

      if (config?.nextSlideEl) {
        config.nextSlideEl.style.transform = "rotateY(180deg)";
        config.nextSlideEl.style.backfaceVisibility = "hidden";
        card.appendChild(config?.nextSlideEl);
      }
      config!.nextSlideEl!.style.display = "block";
      console.log("MANUAL UPDATE: " + time);
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug(`${FLIP_SLIDE_ANIMATION} pause`);
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug(`${FLIP_SLIDE_ANIMATION} resume`);
    timeline.resume();
  }

  function direction(config: any, direction: number) {
    logger.debug(`${FLIP_SLIDE_ANIMATION} reverse`);

    if (direction === -1 && !timeline.reversed()) {
      timeline.reverse();
    }
    if (direction === 1) {
      timeline.play();
    }
  }

  function destroy(config: any) {
    logger.debug(`${FLIP_SLIDE_ANIMATION} destroy`);
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
    direction,
    destroy,
  };
}
