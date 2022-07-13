import gsap from "gsap";
import {
  INumericTimelineValue,
  ITextStartPositionValue,
} from "../webslider-sdk/src/inputs/i-inputs";
import { getMethodByType } from "./common";
import { IEffectBase } from "./types";

export function createRootTimelineForTextEffect({
  timelineConfig,
  target,
  initializeEffect,
  teardownEffect,
}: {
  timelineConfig?: gsap.TimelineVars;
  target: HTMLElement;
  initializeEffect: () => void;
  teardownEffect: () => void;
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

      initializeEffect();

      isInitialized = true;
    }
  };

  const teardownIfInitialized = () => {
    if (isInitialized) {
      teardownEffect();

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

export function addTextEffectPartToTimeline({
  chars,
  timeline,
  config,
  propertyName,
  value,
  from,
}: {
  chars: Element[];
  timeline: gsap.core.Timeline;
  config: IEffectBase & {
    durationPerChar: number;
    delayBetweenChar: number;
    startFrom: any;
  };
  propertyName: string;
  value: INumericTimelineValue;
  from?: string | number;
}) {
  timeline[getMethodByType(config.type)](
    chars,
    {
      ease: config.ease,
      duration:
        (value.hasTimelineProperties
          ? value.duration
          : config.durationPerChar) / 1000,
      [propertyName]: value.value,
      stagger: {
        amount: (config.delayBetweenChar / 1000) * chars.length,
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
