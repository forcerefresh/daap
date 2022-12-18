import { Console } from "console";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { FLIP_ANIMATION, IFlipAnimation } from "./flip.types";

export function flipAnimation() {
  let timeline: gsap.core.Timeline;
  let objectEL: HTMLDivElement;
  let objectContentEl: HTMLDivElement;
  let images: HTMLDivElement[] = [];
  let rotationTime: number;
  let pauseTime: number;
  let containers: HTMLDivElement[] = [];

  function init(config: IFlipAnimation) {
    logger.animation.debug(`${FLIP_ANIMATION} init`);

    objectEL = getObjectElementById(config.itemId!);
    objectContentEl = objectEL.firstChild as HTMLDivElement;

    console.log(objectContentEl.outerHTML);

    rotationTime = config.rotationTime / 1000;
    pauseTime = config.pauseTime / 1000;

    if (objectContentEl?.hasChildNodes()) {
      let children = objectContentEl.childNodes;

      for (let i = 0; i < children.length; i++) {
        images.push(children[i] as HTMLDivElement);
      }
    }

    const emptyDiv = document.createElement("div");
    images.unshift(emptyDiv);
    for (let i = 0; i < images.length - 1; i++) {
      const container = objectContentEl.cloneNode(false) as HTMLDivElement;
      container.style.position = "absolute";
      container.style.display = "none";
      container.style.transformStyle = "preserve-3d";
      container.style.transformOrigin = `center ${
        config.spinDirection === "cc" ? "right" : "left"
      }`;
      containers.push(container);
      objectEL.appendChild(container);
    }

    gsap.set(objectEL, {
      perspective: "600px",
    });

    containers.forEach((container, idx) => {
      const front = images[idx].cloneNode(true) as HTMLDivElement;
      front.style.backfaceVisibility = "hidden";
      const back = images[idx + 1].cloneNode(true) as HTMLDivElement;
      back.style.transform = "rotateY(180deg)";
      back.style.backfaceVisibility = "hidden";
      container.appendChild(front);
      container.appendChild(back);
    });

    console.log(rotationTime);
    objectContentEl.style.display = "none";
    timeline = gsap.timeline();
    // timeline.to(
    //   containers[0],
    //   {
    //     duration: 0,
    //     display: "block",
    //     rotateY: config.spinDirection === "cc" ? -90 : 90,
    //     translateX: `${config.spinDirection === "cc" ? "-" : ""}50%`,
    //   },
    //   0
    // );

    // timeline.to(
    //   containers[0],
    //   {
    //     duration: rotationTime / 2,
    //     display: "block",
    //     rotateY: config.spinDirection === "cc" ? -180 : 180,
    //     translateX: `${config.spinDirection === "cc" ? "-" : ""}100%`,
    //     ease: config.ease,
    //   },
    //   0
    // );

    let currentPosition = 0; //pauseTime + rotationTime / 2;
    let lastElement = containers.length - 1;
    for (let i = 0; i < containers.length; i++) {
      const rotTime =
        i === 0
          ? !config.rotateFirstElement
            ? 0
            : rotationTime / 2
          : rotationTime;
      // turn on card
      if (!config.rotateFirstElement && i === 0) {
        timeline.to(
          containers[i],
          {
            duration: 0,
            rotateY: config.spinDirection === "cc" ? -180 : 180,
            translateX: `${config.spinDirection === "cc" ? "-" : ""}100%`,
            ease: config.ease,
            display: "block",
          },
          currentPosition
        );
      } else {
        timeline.to(
          containers[i],
          {
            duration: 0,
            display: "block",
            ...(i === 0
              ? {
                  rotateY: config.spinDirection === "cc" ? -90 : 90,
                  translateX: `${config.spinDirection === "cc" ? "-" : ""}50%`,
                }
              : {}),
          },
          currentPosition
        );
        // flip animation
        timeline.to(
          containers[i],
          {
            duration: rotTime,
            rotateY: config.spinDirection === "cc" ? -180 : 180,
            translateX: `${config.spinDirection === "cc" ? "-" : ""}100%`,
            ease: config.ease,
          },
          currentPosition
        );
      }

      // turn off card
      timeline.to(
        containers[i],
        {
          duration: 0,
          display: lastElement === i ? "block" : "none",
        },
        currentPosition + pauseTime + rotTime
      );

      currentPosition += pauseTime + rotTime;
    }
  }

  function rootStart(config: any) {
    logger.animation.debug(`${FLIP_ANIMATION} rootStart`);

    timeline.pause();
    timeline.progress(0);
  }

  function rootStop(config: any) {
    logger.animation.debug(`${FLIP_ANIMATION} rootStop`);

    timeline.pause();
    timeline.progress(0);
  }

  function start(config: IFlipAnimation, isManual?: boolean) {
    logger.animation.debug(`${FLIP_ANIMATION} start`);

    timeline.play(0);

    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.animation.debug(`${FLIP_ANIMATION} stop`);

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
    logger.animation.debug(`${FLIP_ANIMATION} pause`);

    timeline.pause();
  }

  function resume(config: any) {
    logger.animation.debug(`${FLIP_ANIMATION} resume`);

    timeline.resume();
  }

  function direction(config: any, direction: number) {
    logger.animation.debug(`${FLIP_ANIMATION} reverse`);

    if (direction === -1 && !timeline.reversed()) {
      timeline.reverse();
    }
    if (direction === 1) {
      timeline.play();
    }
  }

  function destroy(config: any) {
    logger.animation.debug(`${FLIP_ANIMATION} destroy`);
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
