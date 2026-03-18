import gsap from "gsap";
import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";
import {
  INumericTimelineValue,
  ITextStartPositionValue,
} from "webslider-sdk/lib/inputs/i-inputs";
import { getMethodByType } from "./common";

export function createRootTimelineForTextAnimation({
  timelineConfig,
  target,
  initializeAnimation,
  teardownAnimation,
}: {
  timelineConfig?: gsap.TimelineVars;
  target: HTMLElement;
  initializeAnimation: () => void;
  teardownAnimation: () => void;
}) {
  // used to initialize and teardown only once
  let isInitialized = false;

  const rootTimeline = gsap.timeline(timelineConfig);

  const initializeIfNotInitialized = () => {
    if (!isInitialized) {
      // NOTE: wait for element to be visible on dom
      if (target.offsetWidth === 0) {
        return;
      }

      initializeAnimation();

      isInitialized = true;
    }
  };

  const teardownIfInitialized = () => {
    if (isInitialized) {
      teardownAnimation();

      isInitialized = false;
    }
  };

  rootTimeline.eventCallback("onStart", () => {
    initializeIfNotInitialized();
  });

  rootTimeline.eventCallback("onUpdate", () => {
    initializeIfNotInitialized();
  });

  rootTimeline.eventCallback("onComplete", () => {
    teardownIfInitialized();
  });

  return rootTimeline;
}

export function addTextAnimationPartToTimeline({
  chars,
  timeline,
  config,
  propertyName,
  value,
  from,
}: {
  chars: Element[];
  timeline: gsap.core.Timeline;
  config: IAnimationBase & {
    durationPerChar: string;
    delayBetweenChar: string;
    startFrom: any;
  };
  propertyName: string;
  value: INumericTimelineValue;
  from?: string | number;
}) {
  const durationPerChar = parseInt(config.durationPerChar);
  const delayBetweenChar = parseInt(config.delayBetweenChar);

  timeline[getMethodByType(config.type)](
    chars,
    {
      ease: config.ease,
      duration:
        (value.hasTimelineProperties ? value.duration : durationPerChar) / 1000,
      [propertyName]: value.value,
      stagger: {
        amount: (delayBetweenChar / 1000) * chars.length,
        from: from ? from : getStartFromCharacter(config.startFrom),
      },
    },
    value.hasTimelineProperties ? value.delay / 1000 : 0
  );
}

function getNodeIndex(element: any) {
  return [...element.parentNode.childNodes].indexOf(element);
}

export function getStartFromCharacter(value: ITextStartPositionValue): any {
  if (value.startFrom === "from-character") {
    return (value?.fromCharacter || 1) - 1;
  }
  return value.startFrom;

  /*
  "custom-order")
  value.startFrom === "custom-order")
  startFrom.startFrom===""*/
}

export function arrangeChars(value: ITextStartPositionValue, chars: any[]) {
  if (value.startFrom === "custom-order") {
    const arrayOfIndexes = value.customOrder?.split(",");
    const retArr: any[] = [];
    arrayOfIndexes?.forEach((idx) => {
      retArr.push(chars[parseInt(idx) - 1]);
    });
    return retArr;
  }

  return chars;
}
