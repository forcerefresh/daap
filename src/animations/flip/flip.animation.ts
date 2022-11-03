import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { FLIP_ANIMATION, IFlipAnimation } from "./flip.types";

export function flipAnimation() {
  let timeline: gsap.core.Timeline;
  let mainElement: HTMLDivElement;
  let cardContainer: HTMLDivElement;
  let images: HTMLDivElement[] = [];
  let rotationTime: number;
  let pauseTime: number;
  let containers: HTMLDivElement[] = [];

  function init(config: IFlipAnimation) {
    logger.debug(`${FLIP_ANIMATION} init`);

    mainElement = getObjectElementById(config.itemId!);
    cardContainer = mainElement.firstChild as HTMLDivElement;
    rotationTime = config.rotationTime / 1000;
    pauseTime = config.pauseTime / 1000;

    if (cardContainer?.hasChildNodes()) {
      let children = cardContainer.childNodes;

      for (let i = 0; i < children.length; i++) {
        images.push(children[i] as HTMLDivElement);
      }
    }

    const emptyDiv = document.createElement("div");
    images.unshift(emptyDiv);
    for (let i = 0; i < images.length - 1; i++) {
      const card = cardContainer.cloneNode(false) as HTMLDivElement;
      card.style.position = "absolute";
      card.style.display = "none";
      card.style.transformStyle = "preserve-3d";
      card.style.transformOrigin = `center ${
        config.spinDirection === "cc" ? "right" : "left"
      }`;
      containers.push(card);
      mainElement.appendChild(card);
    }

    gsap.set(mainElement, {
      perspective: "600px",
    });

    containers.forEach((card, idx) => {
      const front = images[idx].cloneNode(true) as HTMLDivElement;
      const back = images[idx + 1].cloneNode(true) as HTMLDivElement;
      back.style.transform = "rotateY(180deg)";
      back.style.backfaceVisibility = "hidden";
      card.appendChild(front);
      card.appendChild(back);
    });

    cardContainer.style.display = "none";
    timeline = gsap.timeline();
    timeline.to(
      containers[0],
      {
        duration: 0,
        display: "block",
        rotateY: config.spinDirection === "cc" ? -90 : 90,
        translateX: `${config.spinDirection === "cc" ? "-" : ""}50%`,
      },
      0
    );

    timeline.to(
      containers[0],
      {
        duration: rotationTime / 4,
        display: "block",
        rotateY: config.spinDirection === "cc" ? -180 : 180,
        translateX: `${config.spinDirection === "cc" ? "-" : ""}100%`,
        ease: config.ease,
      },
      0
    );

    let currentPosition = 0;
    let lastElement = containers.length - 1;
    for (let i = 0; i < containers.length; i++) {
      // turn on card
      timeline.to(
        containers[i],
        {
          duration: 0,
          display: "block",
        },
        currentPosition
      );

      // flip animation
      timeline.to(
        containers[i],
        {
          duration: rotationTime,
          rotateY: config.spinDirection === "cc" ? -180 : 180,
          translateX: `${config.spinDirection === "cc" ? "-" : ""}100%`,
          ease: config.ease,
        },
        currentPosition
      );

      // turn off card
      timeline.to(
        containers[i],
        {
          duration: 0,
          display: lastElement === i ? "block" : "none",
        },
        currentPosition + pauseTime + rotationTime
      );

      currentPosition += pauseTime + rotationTime;
    }
  }

  function rootStart(config: any) {
    logger.debug(`${FLIP_ANIMATION} rootStart`);

    timeline.pause();
    timeline.progress(0);
  }

  function rootStop(config: any) {
    logger.debug(`${FLIP_ANIMATION} rootStop`);

    timeline.pause();
    timeline.progress(0);
  }

  function start(config: any, isManual?: boolean) {
    logger.debug(`${FLIP_ANIMATION} start`);

    timeline.play(0);

    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug(`${FLIP_ANIMATION} stop`);

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
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug(`${FLIP_ANIMATION} pause`);

    timeline.pause();
  }

  function resume(config: any) {
    logger.debug(`${FLIP_ANIMATION} resume`);

    timeline.resume();
  }

  function direction(config: any, direction: number) {
    logger.debug(`${FLIP_ANIMATION} reverse`);

    if (direction === -1 && !timeline.reversed()) {
      timeline.reverse();
    }
    if (direction === 1) {
      timeline.play();
    }
  }

  function destroy(config: any) {
    logger.debug(`${FLIP_ANIMATION} destroy`);
    timeline.clear();
    timeline.kill();
  }

  return {
    init,
    rootStart,
    start,
    update,
    stop,
    rootStop,
    pause,
    resume,
    direction,
    destroy,
  };
}
