import { merge } from "lodash-es";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { getObjectElementById, getParameters } from "../animation-utils";
import {
  createTilesFromHtml,
  getMethodByType,
  getObjectContentElementAndHtml,
  updateTilesSize,
} from "../common";
import { ITilesFadeAnimation, TILES_FADE_ANIMATION } from "./tiles-fade.types";

export function tilesFadeAnimation() {
  let timeline: gsap.core.Timeline;
  let element: HTMLDivElement;

  let objectContentElement: HTMLDivElement;
  let objectContentHtml: string;
  let elements: HTMLDivElement[];

  let elObserver: ResizeObserver;

  function init(config: ITilesFadeAnimation) {
    logger.animation.debug(`${TILES_FADE_ANIMATION} init`);

    //if (elements?.length > 0) return;

    element = getObjectElementById(config.itemId!);

    const target = element;

    // get element and html
    const objectContentElementAndObjectContentHtml =
      getObjectContentElementAndHtml(target);

    objectContentElement =
      objectContentElementAndObjectContentHtml.objectContentElement;
    objectContentHtml =
      objectContentElementAndObjectContentHtml.objectContentHtml;

    // create title elements
    elements = createTilesFromHtml(
      objectContentHtml,
      {
        w: config.objectProperties?.width!,
        h: config.objectProperties?.height!,
      },
      { r: config.rows, c: config.columns }
    );

    // append title elements
    elements.forEach((element) => {
      target.appendChild(element);
    });

    elObserver = new ResizeObserver(sizeChangeHandler);

    function sizeChangeHandler() {
      const tileEls = target.getElementsByClassName("tile") as unknown as any[];
      updateTilesSize(
        tileEls,
        { w: target.offsetWidth, h: target.offsetHeight },
        { r: config.rows, c: config.columns }
      );
    }

    var baseConfig = {
      ease: config.ease,
      duration: (config.duration! / 1000) * (config.timeDistribution! / 100),
      opacity: 0,
      stagger: {
        amount:
          (config.duration! / 1000) * (1 - config.timeDistribution! / 100),
        grid: [config.rows, config.columns],
        ease: config.childEase,
      },
    };

    const partialConfig = getParameters(
      config.rows,
      config.columns,
      config.startFrom
    );

    ///////
    timeline = gsap.timeline({ paused: true });
    timeline[getMethodByType(config.type)](
      elements,
      merge(baseConfig, partialConfig) as any
    );
  }

  function rootStart(config: any) {
    logger.animation.debug(`${TILES_FADE_ANIMATION} rootStart`);

    if (config.type === "in") {
      objectContentElement.style.visibility = "hidden";
      elements.forEach((element) => {
        element.style.visibility = "visible";
      });

      timeline.pause();
      timeline.progress(0);
    }
  }

  function rootStop(config: any) {
    logger.animation.debug(`${TILES_FADE_ANIMATION} rootStop`);

    if (config.type === "out") {
      objectContentElement.style.visibility = "visible";
      elements.forEach((element) => {
        element.style.visibility = "hidden";
      });

      timeline.pause();
      timeline.progress(0);
    }

    elements.forEach((el) => {
      element.removeChild(el);
    });
    elements = [];
  }

  function start(config: any, isManual?: boolean) {
    logger.animation.debug(`${TILES_FADE_ANIMATION} start`);

    elObserver.observe(element);

    //if (isManual) return;

    objectContentElement.style.visibility = "hidden";
    elements.forEach((element) => {
      element.style.visibility = "visible";
    });

    timeline.play(0);
    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.animation.debug(`${TILES_FADE_ANIMATION} stop`);
    logger.animation.debug(isManual);
    logger.animation.debug(isReverse);

    elObserver.disconnect();

    if (isManual) {
      if (isReverse) {
        timeline.pause();
        timeline.progress(0);
        objectContentElement.style.visibility =
          config.type === "in" ? "hidden" : "visible";
        elements.forEach((element) => {
          element.style.visibility =
            config.type === "in" ? "visible" : "hidden";
        });
        return; // RETURN!!!
      }

      //timeline.pause();
      //timeline.progress(config.duration / 1000);
    }

    if (config.type === "in") {
      objectContentElement.style.visibility = "visible";
    }
    elements.forEach((element) => {
      element.style.visibility = "hidden";
    });
  }

  function update(config: any, time: number, isManual?: boolean) {
    logger.animation.debug(`${TILES_FADE_ANIMATION} update`);
    if (isManual) {
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.animation.debug(`${TILES_FADE_ANIMATION} pause`);
    timeline.pause();
  }

  function resume(config: any) {
    logger.animation.debug(`${TILES_FADE_ANIMATION} resume`);
    timeline.resume();
  }

  function destroy(config: any) {
    logger.animation.debug(`${TILES_FADE_ANIMATION} destroy`);
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
