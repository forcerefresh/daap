import { Console } from "console";
import gsap from "gsap";
import { last } from "lodash-es";
import {
  IPlayerData,
  ISlideData,
  ITransitionsData,
} from "../../export/i-export-html";
import {
  CoreObjectType,
  getObjectDefinition,
  PreloadOrder,
} from "../../objects/objects-factory";
import {
  ILayout,
  INavigationValues,
  ISlideTransition,
  NavigationType,
} from "../../objects/types";
import { calculateObjectSize } from "../../panels/stage-panel/StagePanelUtils";
import {
  BreakpointConfiguration,
  DeviceType,
} from "../../store/reducers/i-settings";
import { addClass, removeClass } from "../../utils/doom-utils/common";
import { convertTimeUnitToMs } from "../../utils/utils";
import {
  createTimelineForExecutionCode,
  createTimelineForObject,
} from "../AppPlayerUtils";
import { BreakpointChecker } from "./BreakpointChecker";

//(window as any).YTPlayer = require("yt-player");

/*export interface IPlayerConfig {
  oneSlide: boolean;
}*/
export interface IPlayerConfig {
  isApp?: boolean;
  deviceAuto?: boolean;
}
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
  private frontSlideDataArr?: ISlideData[];

  //protected config: IPlayerConfig;

  private oneSlide: boolean;

  private currentSlideEl?: HTMLDivElement;

  private onUpdateCallback: any;
  private onCurrentTimelineChangeCallback: any;

  private playerConfig: IPlayerConfig;

  private breakpointChecker: BreakpointChecker;
  private currentDeviceType: DeviceType;
  private currentBp: BreakpointConfiguration;
  private scaleParams: { wScale: number; hScale: number } | undefined;

  private preloaders: { [key: string]: Promise<string>[] };
  private pagePreloaderEls: {
    el: HTMLDivElement;
    inTime: number;
    outTime: number;
  }[];

  constructor(
    playerData: IPlayerData | null,
    rootDiv: HTMLDivElement,
    playerConfig: IPlayerConfig = {
      isApp: false,
      deviceAuto: true,
    }
    //config: IPlayerConfig = { oneSlide: false }
  ) {
    this.playerData = playerData;

    this.breakpointChecker = new BreakpointChecker(
      playerData?.breakpoints || { breakpointsConfiguration: [] }
    );
    this.breakpointChecker.init();
    /* this.breakpointChecker.setBPChangeHandler(
      this.breakpointChangeHandler.bind(this)
    );*/
    this.breakpointChecker.setSizeChangeHandler(
      this.sizeChangeHandler.bind(this)
    );

    this.currentDeviceType = this.breakpointChecker.getCurrentDeviceType()!;
    console.log(this.currentDeviceType);
    this.currentBp = this.playerData?.breakpoints.breakpointsConfiguration.find(
      (bp) => bp.type === this.currentDeviceType
    )!;

    this.playerConfig = playerConfig;

    console.log(playerData);
    //console.log(playerData);
    this.oneSlide = playerData?.slideDataArr.length === 1;
    //console.log(config);
    //this.config = config;
    this.rootDiv = rootDiv;

    //rootDiv.style.display = "none";
    rootDiv.innerHTML = playerData?.html || "";

    this.createNavigationEvents(rootDiv);

    this.timelines = [];
    this.staticTimelines = [];

    // NOTE: this implementation initialize all slides
    // TODO: lazy loading for requested slide should be implemented

    this.normalSlideDataArr = this.playerData?.slideDataArr;
    this.frontSlideDataArr = this.playerData?.frontSlideDataArr;

    this.preloaders = {
      first: [],
      middle: [],
      last: [],
    };
    this.pagePreloaderEls = [];

    this.normalSlideDataArr?.forEach((data, idx) => {
      this.createSlide(idx, data);
    });
    this.frontSlideDataArr?.forEach((data, idx) => {
      this.createStaticSlide(idx, data);
    });

    this.resizeAll();
  }

  private bpUpdateSlide() {
    const slideEls = this.rootDiv.getElementsByClassName("slide");

    const bp = this.currentBp;

    console.log(this.scaleParams);
    Array.from(slideEls).forEach((el) => {
      console.log(bp?.normal.page);
      console.log(this.breakpointChecker.currentViewportSize);

      (el as HTMLElement).style.top =
        (bp?.normal._page!.height - bp?.normal._maxSliderSize!.height) / 2 +
        "px"; //* this.scaleParams?.wScale!

      (el as HTMLElement).style.left =
        (bp?.normal._page!.width - bp?.normal._maxSliderSize!.width) / 2 + "px"; //* this.scaleParams?.wScale!

      (el as HTMLElement).style.width = bp?.normal._maxSliderSize!.width + "px"; //* this.scaleParams?.wScale!
      (el as HTMLElement).style.height =
        bp?.normal._maxSliderSize!.height + "px"; //* this.scaleParams?.hScale!
      (el as HTMLElement).style.background = "rgba(0,0,0,0.05)";
      (el as HTMLElement).style.border = "1px dotted red";
      (el as HTMLElement).style.boxSizing = "border-box";
    });
  }

  private calculateSizeParameters(
    bp: BreakpointConfiguration,
    bounds: { width: number; height: number }
  ) {
    const wScale = this.getScale(bp.normal.page.width, bounds.width);
    const hScale = this.getScale(bp.normal.page.height, bounds.height);

    let _pageH = bp.normal.page.height;
    let _pageW = bp.normal.page.width;

    let _maxSliderH = bp.normal.maxSliderSize.height;
    let _maxSliderW = bp.normal.maxSliderSize.width;

    // WIDTH behaviour
    if (bp.normal.breakpoint.width.toMax) {
      _pageW = bounds.width;
      //debugger;
    } else {
      _pageW = Math.min(_pageW, bounds.width);
    }

    _maxSliderW = Math.min(_maxSliderW, bounds.width);

    const whRatio = bp.normal.page.width / bp.normal.page.height;
    const wRatio = _pageW / bp.normal.page.width;

    // HEIGHT  behaviour
    if (bp.normal.heightBehavior.type === "viewport") {
      _pageH = bounds.height;
      _maxSliderH = bounds.height; //Math.min(bp.normal.maxSliderSize.height, bounds.height);
    } else if (bp.normal.heightBehavior.type === "fixed") {
      _pageH = bp.normal.page.height;
      _maxSliderH = bp.normal.maxSliderSize.height;
    } else if (bp.normal.heightBehavior.type === "keepAspectRatio") {
      _pageH = bp.normal.page.height * wRatio;
      _maxSliderH = bp.normal.maxSliderSize.height * wRatio;
      console.log(whRatio);
      console.log(wRatio);

      console.log(_pageH);
      console.log(_maxSliderH);
    }

    bp.normal._page = {
      width: _pageW,
      height: _pageH,
    };

    bp.normal._maxSliderSize = {
      width: _maxSliderW,
      height: _maxSliderH,
    };

    /*
    const _pageW = 
    const _pageH = 
    bp.normal._page = {
      width:
      height:
    }*/

    return {
      wScale,
      hScale,
    };
  }

  private getScale(width: number, newWidth: number) {
    return newWidth / width;
  }

  private bpUpdateObjectsSize() {
    this.normalSlideDataArr?.forEach((data, idx) => {
      this.bpUpdateObjectSize(idx, data);
    });
    this.frontSlideDataArr?.forEach((data, idx) => {
      this.bpUpdateObjectSize(idx, data);
    });
  }

  private bpUpdateObjectSize(idx: number, data: ISlideData) {
    data.transitionsData.forEach((transitionData) => {
      // TODO: use only per device (add per device for layer)
      const calObjSize = calculateObjectSize(
        transitionData.layout as ILayout,
        this.currentBp,
        { resetPosition: false },
        this.scaleParams
      );
      /*
      const calObjSize =
        transitionData.calculatedObjectSizePerDevice?.[
          this.currentDeviceType
        ] || transitionData.calculatedObjectSize;*/

      const objDef = getObjectDefinition(transitionData.itemType);

      objDef?.sizeUpdate(
        {
          id: transitionData.itemId,
          values: transitionData.itemValues,
          className: transitionData.objectClass,
          calculatedObjectSize: calObjSize,
        },
        true
      );
    });
  }

  /*private breakpointChangeHandler(bp: BreakpointConfiguration) {
    // if deviceAuto is true
    if (this.playerConfig.deviceAuto) {
      console.log("+++++++++++++++++++++++++++++++");
      console.log(bp);
      this.setBp(bp);
    }
  }*/

  private sizeChangeHandler(
    size: { width: number; height: number },
    bp: BreakpointConfiguration
  ) {
    console.log(size);
    console.log(bp);
    this.setBp(bp);
  }

  public setBp(bp: BreakpointConfiguration) {
    console.log(bp);
    this.currentBp = bp;
    this.currentDeviceType = bp.type;
    // RESTART!!!! player!!
    this.resizeAll();
  }

  public setDevice(device: DeviceType) {
    this.currentDeviceType = device;

    this.setBp(
      this.playerData?.breakpoints.breakpointsConfiguration.find(
        (bp) => bp.type === this.currentDeviceType
      )!
    );
  }

  private resizeAll() {
    if (this.playerConfig.isApp) return;

    this.scaleParams = this.calculateSizeParameters(
      this.currentBp!,
      this.breakpointChecker.currentViewportSize!
    );

    this.bpUpdateSlide();
    this.bpUpdateObjectsSize();
  }

  private createNavigationEvents(rootDiv: HTMLDivElement) {
    const bulletHolders = rootDiv.querySelectorAll(".ws-bullets-navigation");
    bulletHolders.forEach((holderEL) => {
      holderEL.childNodes.forEach((el, index: number) => {
        //console.log(el);
        el.addEventListener("click", () => {
          //console.log(index);
          this.manualPlaySlide(index);
        });
      });
    });
  }

  private addClassToBullet(rootDiv: HTMLDivElement, idx: number) {
    const bulletHolders = rootDiv.querySelectorAll(".ws-bullets-navigation");
    bulletHolders.forEach((holderEL) => {
      holderEL.childNodes.forEach((el, index: number) => {
        //console.log(el);
        (el as HTMLDivElement).classList.remove("active");
        if (index === idx) {
          (el as HTMLDivElement).classList.add("active");
        }
      });
    });

    let allElements = Array.from(document.querySelectorAll(".widget.hover"));
    for (let element of allElements) {
      element.classList.remove("hover");
    }
  }
  public onUpdate(onUpdateCallback: any) {
    //console.log(onUpdateCallback);
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

  public clear(destroy = false) {
    this.timelines.forEach((tl) => {
      tl.getChildren(true).forEach((intl) => intl?.vars?.onComplete?.());
      tl.clear();
      if (destroy) tl.kill();
    });

    this.staticTimelines.forEach((tl) => {
      tl.clear();
      if (destroy) tl.kill();
    });

    this.slideTransitionTimeline?.clear();
    if (destroy) this.slideTransitionTimeline?.kill();

    this.breakpointChecker.setBPChangeHandler(null);
    this.breakpointChecker.setSizeChangeHandler(null);
  }

  public async play() {
    // for (let i = 0; i < this.preloaders.length; i++) await this.preloaders[i];
    this.rootDiv.style.display = "block";
    this.pagePreloaderEls.forEach((item) => {
      item.el.style.display = "block";
      addClass(item.el, "wsSpinnerFadeIn");
    });
    console.log(this.preloaders[PreloadOrder.LAST]);
    const ctime = Date.now();

    await Promise.all(this.preloaders[PreloadOrder.FIRST]);
    await Promise.all(this.preloaders[PreloadOrder.MIDDLE]);
    await Promise.all(this.preloaders[PreloadOrder.LAST]);

    this.pagePreloaderEls.forEach(function (item) {
      if (Date.now() - ctime < 50) {
        item.el.style.display = "none";
      } else {
        addClass(item.el, "wsSpinnerFadeOut");
        removeClass(item.el, "wsSpinnerFadeIn");

        setTimeout(() => {
          item.el.style.display = "none";
        }, item.outTime);
      }
    });

    this.playSlide(0);
  }

  public playSlide(slideIdx: number = 0, prevTlTime: number = 0) {
    console.log("Play slide: " + slideIdx);

    this.addClassToBullet(this.rootDiv, slideIdx);

    //this.rootDiv.style.display = "block";
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

    // TODO: zasto prva, proveriti sta ovo radi
    const firstSlideTransition =
      this.normalSlideDataArr?.[slideIdx]?.slide?.transitions.slide?.[0];
    const bettwenSlideEff: ISlideTransition | undefined = firstSlideTransition
      ? {
          effect: firstSlideTransition?.effect!,
          duration: convertTimeUnitToMs(firstSlideTransition?.duration!),
        }
      : undefined;

    //console.log(bettwenSlideEff);

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
        breakpointData: {
          width: this.playerData?.breakpointData.width,
          height: this.playerData?.breakpointData.height,
          pageWidth: this.playerData?.breakpointData.pageWidth,
        },
        type: "effect",
        duration: bettwenSlideEff!.duration / 1000,
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
    console.log("Play slide (prevTlTime): " + prevTlTime);

    this.currentSlideTimeline.play(prevTlTime);
    //slideEl.style.display = "block";

    let isUpdated = false;
    this.currentSlideTimeline.eventCallback("onUpdate", () => {
      //console.log("onUpdate 123");
      this.onUpdateCallback?.();

      if (!isUpdated) {
        slideEl.style.display = "block";
        isUpdated = true;
        //console.log("onUpdate 123 true");
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

    // trigger on slide end

    const currSlideTl = this.currentSlideTimeline; //
    currSlideTl
      .getById("slideDurationTimeline")
      .eventCallback("onComplete", () => {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa: " + slideIdx);
        /*this.transitionEndBreakpointHandler(
          slideIdx,
          this.currentSlideTimeline!
        );*/
        currSlideTl?.kill();
        slideEl.style.display = "none";
      });

    //if (hasEffect(bettwenSlideEff)) {
    // trigger when transition have to start
    const triggerTimeline: any = last(this.currentSlideTimeline?.getChildren());

    if (!this.oneSlide) {
      triggerTimeline?.eventCallback("onComplete", () => {
        console.log(slideIdx, "END ");
        this.transitionEndBreakpointHandler(
          slideIdx,
          this.currentSlideTimeline!
        );
      });
    }
    //}
    // OTHER
    //

    this.currentSlideEl = slideEl;
    this.currentSlide = slideIdx;

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
    className: string,
    objectEvent?: INavigationValues
  ) {
    if (!objectEvent) {
      return;
    }

    if (objectEvent.navigationType === NavigationType.None) {
      return;
    } else if (objectEvent.navigationType === NavigationType.Link) {
      const el = document.getElementsByClassName(className)[0];
      console.log(objectEvent?.slideEvent);
      el?.addEventListener(objectEvent?.linkEvent, () => {
        console.log(objectEvent?.linkEvent);
        let a = document.createElement("a");
        // NOTE: when player runs in  app open in new window (_blank)
        a.target = this.playerConfig.isApp ? "_blank" : objectEvent.linkTarget;
        a.href = objectEvent.linkHref;
        a.click();
      });
    } else if (objectEvent.navigationType === NavigationType.Slide) {
      const el = document.getElementsByClassName(className)[0];
      el?.addEventListener(objectEvent?.slideEvent, () => {
        if (objectEvent.slideReferenceType === "slideNo") {
          this.manualPlaySlide(parseInt(objectEvent?.slideNo, 10) - 1);
        } else if (objectEvent.slideReferenceType === "slideId") {
          const slideIdx = this.getSlideIdxByID(objectEvent.slideId);
          if (slideIdx) this.manualPlaySlide(slideIdx);
        } else if (objectEvent.slideReferenceType === "next") {
          const slideIdx = this.getNextSlideIdx(this.currentSlide);
          this.manualPlaySlide(slideIdx);
        } else if (objectEvent.slideReferenceType === "prev") {
          const slideIdx = this.getPrevSlideIdx(this.currentSlide);
          this.manualPlaySlide(slideIdx);
        }
      });
    }
  }

  private getSlideIdxByID(customId: string): number | undefined {
    const slide = this.normalSlideDataArr?.find((slideData) => {
      return slideData.slide.customId === customId;
    });

    return slide ? this.normalSlideDataArr?.indexOf(slide) : undefined;
  }

  private createEvents(slideIdx: number, data: ISlideData) {
    data.transitionsData.forEach((transitionData) => {
      this.createEvent(
        slideIdx,
        transitionData.objectClass,
        transitionData.events
      );
    });
  }

  private createStaticSlide(no: number, data: ISlideData) {
    this.createEvents(no, data);

    const tl = gsap.timeline({ paused: true });
    this.staticTimelines[no] = tl;

    data.transitionsData.forEach((transitionData) => {
      // Note: prepare page loader/s
      this.populatePageSpinners(transitionData);

      // Note: create timelines
      const slideParallelTls = createTimelineForObject(transitionData);
      slideParallelTls.forEach((pTl, idx) => {
        tl.add(pTl, 0);
      });
    });
  }

  private getNextSlideIdx(currIdx: number) {
    const total = this.normalSlideDataArr?.length || -1;
    const nextSlideIdx = currIdx >= total - 1 ? 0 : currIdx + 1;
    return nextSlideIdx;
  }

  private getPrevSlideIdx(currIdx: number) {
    const total = this.normalSlideDataArr?.length || -1;
    console.log(total);
    console.log(currIdx);

    const nextSlideIdx = currIdx === 0 ? total - 1 : currIdx - 1;
    return nextSlideIdx;
  }

  private populatePageSpinners(transitionData: ITransitionsData) {
    if (
      transitionData.itemSystemType === CoreObjectType.SPINNER &&
      transitionData.itemValues.applyTo === "page"
    ) {
      const ppEl = document.querySelector(".object-" + transitionData.itemId);
      if (ppEl) {
        const inTime = (transitionData.itemValues as any).fadeInTime;
        const outTime = (transitionData.itemValues as any).fadeOutTime;

        // ppEl.style.display = "none";
        this.pagePreloaderEls.push({
          el: ppEl as HTMLDivElement,
          inTime,
          outTime,
        });
      }
    }
  }

  private createSlide(slideIdx: number, data: ISlideData) {
    const slideEl = getSlideById(data.slide.id);
    slideEl.style.display = "none";

    this.createEvents(slideIdx, data);

    const slideTimeline = gsap.timeline({ paused: true });
    this.timelines[slideIdx] = slideTimeline;

    // add slide duration timeline (we ise it to kill if effects lats more than set time)
    const slideDurationTimeline = gsap.timeline({
      id: "slideDurationTimeline",
      duration: convertTimeUnitToMs(data.slide.duration.customValue) / 1000,
    });
    slideTimeline.add(slideDurationTimeline);

    // add objects effects timelines
    data.transitionsData.forEach((transitionData) => {
      // TODO: use only per device (add per device for layer)
      const calObjSize =
        transitionData.calculatedObjectSizePerDevice?.[
          this.currentDeviceType
        ] || transitionData.calculatedObjectSize;

      // Note: prepare page loader/s
      this.populatePageSpinners(transitionData);

      // Note: create effects tls
      const slideParallelTls = createTimelineForObject(transitionData);
      slideParallelTls.forEach((pTl, idx) => {
        console.log(pTl);
        console.log(pTl.getChildren());
        slideTimeline.add(pTl, 0);
      });

      // Note: create logic for objects (start, stop, preloaders, ....)
      const objDef = getObjectDefinition(transitionData.itemType);

      /*console.log(transitionData);
      console.log(objDef);
      console.log(objDef?.type);
      console.log(objDef?.type);
      console.log(objDef?.sizeUpdate);
      objDef?.sizeUpdate(
        {
          id: transitionData.itemId,
          values: transitionData.itemValues,
          className: transitionData.objectClass,
          calculatedObjectSize: calObjSize,
        },
        true
      );

      console.log(
        transitionData.calculatedObjectSizePerDevice?.[this.currentDeviceType]
      );
      console.log(transitionData.calculatedObjectSizePerDevice);
*/

      // execution code for objects
      if (!!objDef?.executionCode_Start) {
        const execTl = createTimelineForExecutionCode(
          transitionData,
          objDef.executionCode_Start!,
          objDef.executionCode_Stop!,
          transitionData.itemValues,
          calObjSize
        );
        slideTimeline.add(execTl, 0);
      }

      // preload
      if (transitionData.itemValues.preload && !!objDef?.preload) {
        const preloadPromise = objDef.preload({
          id: transitionData.itemId,
          values: transitionData.itemValues,
          className: transitionData.objectClass,
          calculatedObjectSize: calObjSize,
        });
        this.preloaders[objDef.meta.preloadOrder || PreloadOrder.MIDDLE].push(
          preloadPromise
        );
      }
    });

    console.log(this.preloaders.length, "Preloaders");
    console.log(slideTimeline);
    console.log(slideTimeline.getChildren());
    console.log(slideTimeline.getById("slideDurationTimeline"));

    const nextSlideIdx = this.getNextSlideIdx(slideIdx);

    // 0. get effect definition
    const firstSlideTransition =
      this.normalSlideDataArr?.[nextSlideIdx]?.slide?.transitions.slide?.[0];
    const bettwenSlideEff: ISlideTransition | undefined = firstSlideTransition
      ? {
          effect: firstSlideTransition?.effect!,
          duration: convertTimeUnitToMs(firstSlideTransition?.duration),
        }
      : undefined;

    // create breakpoint for slide transition
    // 1. if no slide transition set to 0
    let overlap = 0;
    // 2. if effect exit use it
    if (bettwenSlideEff?.effect.id !== "none") {
      overlap = bettwenSlideEff?.duration || 0; // bettwenSlideEff?.overlap ? bettwenSlideEff?.overlap : 0;
    }
    // 3. add breakpoint timeline
    //console.log(data.slide.duration.customValue);
    //console.log(overlap);
    // trigger
    const transitionTween = gsap.to(
      {},
      {
        duration:
          (convertTimeUnitToMs(data.slide.duration.customValue) - overlap) /
          1000,
      }
    );
    slideTimeline.add(transitionTween, 0);
  }

  private transitionEndBreakpointHandler(
    slideIdx: number,
    prevTl: gsap.core.Timeline
  ) {
    console.log("transitionEndBreakpointHandler: " + slideIdx);

    const total = this.normalSlideDataArr?.length || -1;

    //console.log(slideIdx, "WWW");
    if (total > 0) {
      const newSlideIdx = slideIdx >= total - 1 ? 0 : slideIdx + 1;
      //console.log(newSlideIdx);

      // 0. get effect definition
      /*const bettwenSlideEff: ISlideTransition | undefined =
        this.normalSlideDataArr?.[newSlideIdx]?.slide?.transitions.slide?.[0];*/
      const firstSlideTransition =
        this.normalSlideDataArr?.[newSlideIdx]?.slide?.transitions.slide?.[0];
      const bettwenSlideEff: ISlideTransition | undefined = firstSlideTransition
        ? {
            effect: firstSlideTransition?.effect!,
            duration: convertTimeUnitToMs(firstSlideTransition?.duration!),
          }
        : undefined;

      // create breakpoint for slide transition
      // 1. if no slide transition set to 0
      let overlap = 0;
      // 2. if effect exit use it
      if (bettwenSlideEff?.effect.id !== "none") {
        overlap = bettwenSlideEff?.duration || 0; //bettwenSlideEff?.overlap ? bettwenSlideEff?.overlap : 0;
      }

      console.log(overlap);
      console.log(
        this.normalSlideDataArr?.[slideIdx]?.slide?.duration?.customValue!
      );

      const overlapPosition =
        convertTimeUnitToMs(
          this.normalSlideDataArr?.[slideIdx]?.slide?.duration?.customValue!
        ) - overlap;

      console.log(overlapPosition);
      console.log(prevTl.time());
      console.log(prevTl.time() - overlapPosition / 1000);
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
