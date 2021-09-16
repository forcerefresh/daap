import gsap from "gsap";
import { last } from "lodash-es";
import { ISlideEffect } from "../../effects/slide/slide.types";
import { IPlayerData, ISlideData } from "../../export/export-html";
import {
  IGoToSlideAction,
  IObjectEvent,
  ISlideTransition,
} from "../../objects/types";
import { SlideType } from "../../store/reducers/slides";
import { createTimelineForObject } from "../AppPlayerUtils";

/*export interface IPlayerConfig {
  oneSlide: boolean;
}*/
export class Player {
  protected playerData: IPlayerData | null;
  protected rootDiv: HTMLDivElement;
  protected currentSlide: number = -1;

  private timelines: gsap.core.Timeline[];
  private staticTimelines: gsap.core.Timeline[];

  private currentSlideTimeline?: gsap.core.Timeline;
  private currentSlideTimelineIdx: number = 0;
  private slideTransitionTimeline?: gsap.core.Timeline;

  private nextZIndex = 1;

  private normalSlideDataArr?: ISlideData[];
  private staticSlideDataArr?: ISlideData[];

  //protected config: IPlayerConfig;

  private oneSlide: boolean;

  private currentSlideEl?: HTMLDivElement;

  private onUpdateCallback: any;
  private onCurrentTimelineChangeCallback: any;

  constructor(
    playerData: IPlayerData | null,
    rootDiv: HTMLDivElement
    //config: IPlayerConfig = { oneSlide: false }
  ) {
    //console.log(playerData);
    this.oneSlide = playerData?.slideDataArr.length === 1;
    //console.log(config);
    //this.config = config;
    this.rootDiv = rootDiv;

    rootDiv.style.display = "none";
    rootDiv.innerHTML = playerData?.html || "";

    this.playerData = playerData;

    this.timelines = [];
    this.staticTimelines = [];

    // NOTE: this implementation initialize all slides
    // TODO: lazy loading for requested slide should be implemented

    this.normalSlideDataArr = this.playerData?.slideDataArr.filter(
      (sliderData) => sliderData.slide.slideType === SlideType.Normal
    );
    this.staticSlideDataArr = this.playerData?.slideDataArr.filter(
      (sliderData) => sliderData.slide.slideType === SlideType.Static
    );

    this.normalSlideDataArr?.forEach((data, idx) => {
      this.createSlide(idx, data);
    });
    this.staticSlideDataArr?.forEach((data, idx) => {
      this.createStaticSlide(idx, data);
    });
  }

  public onUpdate(onUpdateCallback: any) {
    console.log(onUpdateCallback);
    this.onUpdateCallback = onUpdateCallback;
  }

  onCurrentTimelineChange(onCurrentTimelineChangeCallback: any) {
    this.onCurrentTimelineChangeCallback = onCurrentTimelineChangeCallback;
  }

  public setRootPaused(p: boolean) {
    if (p) {
      this.timelines.forEach((tl) => {
        tl.pause();
      });

      this.staticTimelines.forEach((tl) => {
        tl.pause();
      });

      this.slideTransitionTimeline?.pause();
    }
  }

  public getCurrentTimeline(): gsap.core.Timeline | undefined {
    return this.currentSlideTimeline;
  }
  public getCurrentTimelineIdx(): number {
    return this.currentSlideTimelineIdx;
  }

  public paused(p: boolean) {
    this.timelines.forEach((tl) => {
      tl.paused(p);
    });

    this.staticTimelines.forEach((tl) => {
      tl.paused(p);
    });

    this.slideTransitionTimeline?.paused(p);
  }

  public clear() {
    this.timelines.forEach((tl) => {
      tl.clear();
    });

    this.staticTimelines.forEach((tl) => {
      tl.clear();
    });

    this.slideTransitionTimeline?.clear();
  }

  public playSlide(slideIdx: number = 0, prevTlTime: number = 0) {
    this.rootDiv.style.display = "block";
    if (!this.normalSlideDataArr?.[slideIdx]) {
      //slide does not exist
      return;
    }
    // TODO: if we have two slide playing we should wait for transition to be done
    // 1. ...
    // TODO: check if all assets are loaded
    // 2 ...

    // NOTE: temporary
    const prevSlideTimeline = this.currentSlideTimeline;
    if (prevSlideTimeline) {
      // TODO: NOTE: temporary to try to stop typewriter
      //prevSlideTimeline.kill();
    }

    const bettwenSlideEff: ISlideTransition | undefined =
      this.normalSlideDataArr?.[slideIdx]?.slide?.slideTransition;

    console.log(bettwenSlideEff);

    const prevSlideEl = this.currentSlideEl;

    const slideEl = getSlideById(
      this.normalSlideDataArr?.[slideIdx]?.slide?.id
    ) as HTMLDivElement;
    //slideEl.style.display = "block";
    /*slideIdx === 1 &&
      bettwenSlideEff?.effect.id &&
      bettwenSlideEff?.effect.id !== "none"
        ? "none"
        : "block";*/
    //console.log(slideIdx);
    this.currentSlideTimeline = this.timelines[slideIdx];
    this.currentSlideTimelineIdx = slideIdx;

    const hasEffect = (bettwenSlideEff?: ISlideTransition) => {
      return (
        bettwenSlideEff?.effect.id && bettwenSlideEff?.effect.id !== "none"
      );
    };
    //console.log(bettwenSlideEff);
    if (hasEffect(bettwenSlideEff)) {
      this.slideTransitionTimeline = gsap.timeline({ paused: true });

      const tlEff = gsap.effects[bettwenSlideEff!.effect.id]([slideEl], {
        ...bettwenSlideEff!.effect.values,
        objectProperties: {
          width: 960,
          height: 485,
        },
        type: "effect",
        duration: bettwenSlideEff.duration / 1000,
        //ease: bettwenSlideEff.ease,
        //childEase: bettwenSlideEff.childEase,
        //timeDistribution: bettwenSlideEff.timeDistribution,
        prevSlideEl: this.currentSlideEl,
        nextSlideEl: slideEl,
        nextZIndex: this.nextZIndex,
      });
      this.slideTransitionTimeline.add(tlEff);
      this.slideTransitionTimeline.play();
    } else {
      slideEl.style.zIndex = `${this.nextZIndex++}`;
    }

    if (this.oneSlide) {
      this.currentSlideTimeline.repeat(-1);
    }

    // PLAY SLIDE :)
    this.currentSlideTimeline.play(prevTlTime);
    //slideEl.style.display = "block";

    let isUpdated = false;
    this.currentSlideTimeline.eventCallback("onUpdate", () => {
      this.onUpdateCallback?.();

      if (!isUpdated) {
        slideEl.style.display = "block";
        isUpdated = true;
      }
      if (!hasEffect(bettwenSlideEff)) {
        // ako nema effekat
        //
      }
      //
    });

    this.currentSlideTimeline.eventCallback("onComplete", function () {
      slideEl.style.display = "none";
    });

    const triggerTimeline: any = last(this.currentSlideTimeline?.getChildren());

    if (!this.oneSlide) {
      triggerTimeline?.eventCallback("onComplete", () => {
        //console.log(slideIdx, "END ");
        this.transitionEndBreakpointHandler(
          slideIdx,
          this.currentSlideTimeline!
        );
      });
    }

    this.currentSlideEl = slideEl;

    this.onCurrentTimelineChangeCallback?.();
  }

  public manualPlaySlide(slideIdx: number) {
    const currentSlideTime = this.currentSlideTimeline?.time();
    const tl = this.timelines[slideIdx];
    if (this.currentSlideTimeline === tl) {
      return;
    }

    const triggerTimeline = last(this.currentSlideTimeline?.getChildren());
    triggerTimeline?.eventCallback("onComplete", () => {
      // NOTE:  empty callback to overwrite onComplete
      // //console.log("canceled");
    });

    this.playSlide(slideIdx);
  }

  private createEvent(
    no: number,
    objectEvent: IObjectEvent,
    className: string
  ) {
    const el = document.getElementsByClassName(className)[0];
    el?.addEventListener(objectEvent.type as string, () => {
      this.manualPlaySlide((objectEvent.action as IGoToSlideAction).slideId!);
    });
  }

  private createEvents(slideIdx: number, data: ISlideData) {
    data.transitionsData.forEach((transitionData) => {
      transitionData.events?.forEach((event) => {
        this.createEvent(slideIdx, event, transitionData.objectClass);
      });
    });
  }

  private createStaticSlide(no: number, data: ISlideData) {
    this.createEvents(no, data);

    const tl = gsap.timeline({ paused: true });
    this.staticTimelines[no] = tl;

    data.transitionsData.forEach((transitionData) => {
      const slideParallelTls = createTimelineForObject(transitionData);
      slideParallelTls.forEach((pTl, idx) => {
        tl.add(pTl, 0);
      });
    });
  }

  private createSlide(slideIdx: number, data: ISlideData) {
    const slideEl = getSlideById(data.slide.id);
    slideEl.style.display = "none";

    this.createEvents(slideIdx, data);

    const tl = gsap.timeline({ paused: true });
    this.timelines[slideIdx] = tl;

    data.transitionsData.forEach((transitionData) => {
      const slideParallelTls = createTimelineForObject(transitionData);
      slideParallelTls.forEach((pTl, idx) => {
        tl.add(pTl, 0);
      });
    });

    // refactoer
    const total = this.normalSlideDataArr?.length || -1;
    //console.log(slideIdx, "WWW");

    const nextSlideIdx = slideIdx >= total - 1 ? 0 : slideIdx + 1;

    // 0. get effect definition
    const bettwenSlideEff: ISlideTransition | undefined =
      this.normalSlideDataArr?.[nextSlideIdx]?.slide?.slideTransition;

    // create breakpoint for slide transition
    // 1. if no slide transition set to 0
    let overlap = 0;
    // 2. if effect exit use it
    if (bettwenSlideEff?.effect.id !== "none") {
      overlap = bettwenSlideEff?.overlap ? bettwenSlideEff?.overlap : 0;
    }
    // 3. add breakpoint timeline
    //console.log(data.slide.duration.customValue);
    //console.log(overlap);
    const transitionTween = gsap.to(
      {},
      { duration: (data.slide.duration.customValue - overlap) / 1000 }
    );
    tl.add(transitionTween, 0);
  }

  private transitionEndBreakpointHandler(
    slideIdx: number,
    prevTl: gsap.core.Timeline
  ) {
    const total = this.normalSlideDataArr?.length || -1;

    //console.log(slideIdx, "WWW");
    if (total > 0) {
      const newSlideIdx = slideIdx >= total - 1 ? 0 : slideIdx + 1;
      //console.log(newSlideIdx);

      // 0. get effect definition
      const bettwenSlideEff: ISlideTransition | undefined =
        this.normalSlideDataArr?.[newSlideIdx]?.slide?.slideTransition;
      // create breakpoint for slide transition
      // 1. if no slide transition set to 0
      let overlap = 0;
      // 2. if effect exit use it
      if (bettwenSlideEff?.effect.id !== "none") {
        overlap = bettwenSlideEff?.overlap ? bettwenSlideEff?.overlap : 0;
      }

      const overlapPosition =
        this.normalSlideDataArr?.[newSlideIdx]?.slide?.duration?.customValue! -
        overlap;

      //console.log(overlapPosition);
      this.playSlide(newSlideIdx, prevTl.time() - overlapPosition / 1000); //- overlap ? overlap / 1000 : 0
    }
  }
}

/*
      tl.clear();

      tl.repeat(-1);
      tl.timeScale(previewState.previewSpeed);

      ////console.log(transitionsDataArr);

      //if(previewState.scope)
      transitionsDataArr.forEach((data) => {
        const parallelTls = createTimelineForObject(data);
        let prevTime = 0;
        parallelTls.forEach((pTl, idx) => {
          const transitionTween = gsap.to({}, 2, {
            onComplete: () => ////console.log("AAAAAAAAAAAaa"),
          });
          tl.add(transitionTween);

          //////console.log(pTl);
          ///pTl.startTime(prevTime);
          tl.add(pTl, 0);
          prevTime = (data.data.slideDuration.customValue - 1000) / 1000;
        });
      });

      tl.repeatDelay(-1);
      tl.restart();

     */

function getSlideById(id?: string) {
  if (!id) {
    throw new Error("Id is not provided");
  }
  const slideClassname = "slide-" + id;
  const slideEl = document.getElementsByClassName(
    slideClassname
  )[0] as HTMLElement;
  return slideEl;
}
