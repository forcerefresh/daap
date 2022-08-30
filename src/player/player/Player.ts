import {
  IPlayerData,
  ISlideData,
  ITransitionsData,
} from "../../export/i-export-html";
import { loadAndRegisterExternalComponent } from "../../objects/external-object-utils";
import { layerSizeUpdate } from "../../objects/layer/layer";
import {
  CoreObjectType,
  getPlayerObjectDefinition,
  PreloadOrder,
} from "../../webslider-sdk/src/objects/objects-register";
import {
  ILayout,
  ISlideTransition,
  NavigationType,
} from "../../webslider-sdk/src/objects/i-object";
import { INavigationValues } from "../../webslider-sdk/src/objects/i-navigation-types";
import { calculateObjectSize } from "../../panels/stage-panel/StagePanelUtils";
import { BreakpointConfiguration } from "../../webslider-sdk/src/common/i-breakpoint-configuration";
import { DeviceType } from "../../webslider-sdk/src/common/i-device-type";
import { addClass, removeClass } from "../../utils/doom-utils/common";
import { convertTimeUnitToMs } from "../../utils/utils";
import {
  createEventTimelineForObject,
  createTimelineForObject,
  IEventTimeline,
} from "../AppPlayerUtils";
import { BreakpointChecker } from "./BreakpointChecker";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import getTickerInstance from "./Ticker";
import { Timeline } from "./Timeline";
import { RootTimeline } from "./RootTimeline";

export interface IPlayerConfig {
  isApp?: boolean;
  deviceAuto?: boolean;
}
export class Player {
  protected playerData: IPlayerData | null;
  protected rootDiv: HTMLDivElement;
  protected currentSlide: number = -1;

  private timelines: RootTimeline[];
  private staticTimelines: RootTimeline[];

  private currentSlideTimeline?: RootTimeline;
  private currentSlideTimelineIdx: number = 0;
  private slideTransitionTimeline?: RootTimeline;

  private nextZIndex = 1;

  private normalSlideDataArr?: ISlideData[];
  private frontSlideDataArr?: ISlideData[];
  private backSlideDataArr?: ISlideData[];

  //protected config: IPlayerConfig;

  private oneSlide: boolean;

  private currentSlideEl?: HTMLDivElement;

  // used for app
  private onUpdateCallback: any;
  private onCurrentTimelineChangeCallback: any;

  private playerConfig: IPlayerConfig;

  private breakpointChecker: BreakpointChecker;
  private currentDeviceType: DeviceType;
  private currentBp: BreakpointConfiguration;
  private scaleParams: { wScale: number; hScale: number } | undefined;

  private preloaders: { [key: string]: Promise<string>[] };
  private extComponentPreloaders: Promise<any>[];

  private slideTransitionInProgress = false;

  private pagePreloaderEls: {
    el: HTMLDivElement;
    inTime: number;
    outTime: number;
  }[];

  private eventTimelines: IEventTimeline[] = [];

  constructor(
    playerData: IPlayerData | null,
    rootDiv: HTMLDivElement,
    playerConfig: IPlayerConfig = {
      isApp: false,
      deviceAuto: true,
    }
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

    // current breakpoint configuration
    this.currentBp = this.playerData?.breakpoints.breakpointsConfiguration.find(
      (bp) => bp.type === this.currentDeviceType
    )!;

    this.playerConfig = playerConfig;

    this.oneSlide = playerData?.slideDataArr.length === 1;

    this.rootDiv = rootDiv;

    rootDiv.innerHTML = playerData?.html || "";

    this.createNavigationEvents(rootDiv);

    this.timelines = [];
    this.staticTimelines = [];

    // NOTE: this implementation initialize all slides
    // TODO: lazy loading for requested slide should be implemented

    this.normalSlideDataArr = this.playerData?.slideDataArr;
    this.frontSlideDataArr = this.playerData?.frontSlideDataArr;
    this.backSlideDataArr = this.playerData?.backSlideDataArr;

    this.preloaders = {
      first: [],
      middle: [],
      last: [],
    };
    this.pagePreloaderEls = [];

    this.extComponentPreloaders = [];

    // if is app do not load external components
    if (playerConfig.isApp) {
      this.createAllSlides();
      this.addListenersForEventsEffects();
    } else {
      this.playerData?.extensions?.forEach((extension) => {
        this.extComponentPreloaders.push(
          loadAndRegisterExternalComponent(extension)
        );
      });

      Promise.all(this.extComponentPreloaders)
        .then(() => {
          logger.info("All external components are loaded.");
        })
        .catch((err) => console.warn)
        .finally(() => {
          this.createAllSlides();
          this.addListenersForEventsEffects();
        });
    }

    //initSliderElement(this.rootDiv);
  }

  private addListenersForEventsEffects() {
    this.eventTimelines.forEach((tlObj) => {
      const className = `custom-id-${tlObj.eventTargetId}`;

      if (
        tlObj.reverseEvent === tlObj.event &&
        tlObj.reverseEventTargetId === tlObj.eventTargetId
      ) {
        // NOTE (case 1): if same event for forward and reverse
        const el = this.rootDiv.getElementsByClassName(className)[0];
        console.log(el);
        el?.addEventListener(tlObj.event, (evt) => {
          tlObj.rootTimeline.setDirection(
            tlObj.rootTimeline.isPaused
              ? 1
              : tlObj.rootTimeline.direction === -1
              ? 1
              : -1
          );
          tlObj.rootTimeline.resume();
        });
      } else {
        // NOTE: ( case 2)
        // const className = this.targetId2Classname[tlObj.eventTargetId];
        const el = this.rootDiv.getElementsByClassName(className)[0];
        console.log(el);
        el?.addEventListener(tlObj.event, () => {
          tlObj.rootTimeline.resume();
          tlObj.rootTimeline.setDirection(1);
        });

        // reverse
        const classNameR = `custom-id-${tlObj.reverseEventTargetId}`; //this.targetId2Classname[tlObj.reverseEventTargetId];
        const elR = this.rootDiv.getElementsByClassName(classNameR)[0];
        console.log(elR);
        elR?.addEventListener(tlObj.reverseEvent, () => {
          tlObj.rootTimeline.resume();
          tlObj.rootTimeline.setDirection(-1);
        });
      }

      tlObj.rootTimeline.init();
      tlObj.rootTimeline.play();
      tlObj.rootTimeline.pause();
    });
  }
  // this we are calling after we load external components
  private createAllSlides() {
    this.backSlideDataArr?.forEach((data, idx) => {
      this.createStaticSlide(idx, data);
    });
    this.frontSlideDataArr?.forEach((data, idx) => {
      this.createStaticSlide(idx, data);
    });
    this.normalSlideDataArr?.forEach((data, idx) => {
      this.createSlide(idx, data);
    });

    this.resizeAll(true);
  }

  private bpUpdateSlide(isInitial = false) {
    const slideEls = this.rootDiv.getElementsByClassName("slide");

    const bp = this.currentBp;

    Array.from(slideEls).forEach((el) => {
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

  private bpUpdateObjectsSize(isInitial = false) {
    this.normalSlideDataArr?.forEach((data, idx) => {
      this.bpUpdateObjectSize(idx, data, isInitial);
    });
    this.frontSlideDataArr?.forEach((data, idx) => {
      this.bpUpdateObjectSize(idx, data, isInitial);
    });
    this.backSlideDataArr?.forEach((data, idx) => {
      this.bpUpdateObjectSize(idx, data, isInitial);
    });
  }

  private bpUpdateObjectSize(idx: number, data: ISlideData, isInitial = false) {
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

      let objDef = getPlayerObjectDefinition(transitionData.itemType);

      if (transitionData.itemType === "layer") {
        // NOTE: be cerful as we set only sizeUpdate
        objDef = { sizeUpdate: layerSizeUpdate } as any;
      }

      objDef?.sizeUpdate(
        {
          id: transitionData.itemId,
          values: transitionData.itemValues,
          className: transitionData.objectClass,
          calculatedObjectSize: calObjSize,
          isInitial,
        },
        true
      );
    });
  }

  /*private breakpointChangeHandler(bp: BreakpointConfiguration) {
    // if deviceAuto is true
    if (this.playerConfig.deviceAuto) {
;
      this.setBp(bp);
    }
  }*/

  private sizeChangeHandler(
    size: { width: number; height: number },
    bp: BreakpointConfiguration
  ) {
    this.setBp(bp);
  }

  public setBp(bp: BreakpointConfiguration) {
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

  private resizeAll(isInitial = false) {
    if (this.playerConfig.isApp) return;

    this.scaleParams = this.calculateSizeParameters(
      this.currentBp!,
      this.breakpointChecker.currentViewportSize!
    );

    this.bpUpdateSlide(isInitial);
    this.bpUpdateObjectsSize(isInitial);
  }

  private createNavigationEvents(rootDiv: HTMLDivElement) {
    const bulletHolders = rootDiv.querySelectorAll(".ws-bullets-navigation");
    bulletHolders.forEach((holderEL) => {
      holderEL.childNodes.forEach((el, index: number) => {
        el.addEventListener("click", () => {
          this.manualPlaySlide(index);
        });
      });
    });
  }

  private addClassToBullet(rootDiv: HTMLDivElement, idx: number) {
    const bulletHolders = rootDiv.querySelectorAll(".ws-bullets-navigation");
    bulletHolders.forEach((holderEL) => {
      holderEL.childNodes.forEach((el, index: number) => {
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

  public getCurrentTimeline(): RootTimeline | undefined {
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

    this.currentSlideTimeline?.paused(p);
    this.slideTransitionTimeline?.paused(p);
  }

  public clear(destroy = false) {
    getTickerInstance().stop();

    this.staticTimelines.forEach((tl) => {
      tl.clear();
      tl.kill();
    });
    this.staticTimelines = [];

    this.timelines.forEach((tl) => {
      tl.destroy();
    });
    this.timelines = [];

    this.eventTimelines.forEach((tlObj) => {
      tlObj.rootTimeline.destroy();
    });
    this.eventTimelines = [];

    this.slideTransitionTimeline?.destroy();
    this.slideTransitionTimeline = undefined;

    this.breakpointChecker.setBPChangeHandler(null);
    this.breakpointChecker.setSizeChangeHandler(null);

    this.currentSlideTimelineIdx = 0;

    this.currentSlideTimeline?.destroy();
    this.currentSlideTimeline = undefined;
  }

  public async play() {
    getTickerInstance().start();
    //// TMP
    //const myTimeline = new Timeline({});
    //myTimeline.play();
    //// TMP

    await Promise.all(this.extComponentPreloaders);
    // for (let i = 0; i < this.preloaders.length; i++) await this.preloaders[i];
    this.rootDiv.style.display = "block";
    this.pagePreloaderEls.forEach((item) => {
      item.el.style.display = "block";
      addClass(item.el, "wsSpinnerFadeIn");
    });
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

  public playSlide(
    slideIdx: number = 0,
    prevTlTime: number = 0,
    isManual = false
  ) {
    logger.notice("Play slide:  " + slideIdx);

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
          overlap: convertTimeUnitToMs(firstSlideTransition?.overlap!),
        }
      : undefined;

    const prevSlideEl = this.currentSlideEl;
    if (prevSlideEl) prevSlideEl.style.pointerEvents = "none";

    const slideEl = getSlideById(
      this.normalSlideDataArr?.[slideIdx]?.slide?.id
    ) as HTMLDivElement;
    slideEl.style.pointerEvents = "auto";

    //slideEl.style.display = "block";
    /*slideIdx === 1 &&
      bettwenSlideEff?.effect.id &&
      bettwenSlideEff?.effect.id !== "none"
        ? "none"
        : "block";*/
    this.currentSlideTimeline = this.timelines[slideIdx];
    this.currentSlideTimelineIdx = slideIdx;

    //console.log(this.currentSlideTimeline);

    const hasEffect = (bettwenSlideEff?: ISlideTransition) => {
      return (
        bettwenSlideEff?.effect.id && bettwenSlideEff?.effect.id !== "none"
      );
    };
    if (hasEffect(bettwenSlideEff)) {
      this.slideTransitionInProgress = true;

      logger.error("CREATE slideTransitionTimeline + " + slideIdx);
      this.slideTransitionTimeline = new RootTimeline({
        name: "SlideTransitionRootTimeline",
        duration: bettwenSlideEff!.duration,
      }); // gsap.timeline({ paused: true });

      this.slideTransitionTimeline.emitter.addListener("stop", () => {
        this.slideTransitionInProgress = false;
        this.slideTransitionTimeline?.emitter.removeAllListeners("stop");
      });

      //const tlEff = gsap.effects[bettwenSlideEff!.effect.id]([slideEl], {
      const transitionTl = new Timeline({
        name: "SlideTransitionTimeline",
        //element: slideEl,
        effectId: bettwenSlideEff!.effect.id,
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
        duration: bettwenSlideEff!.duration,
        //ease: bettwenSlideEff.ease,
        //childEase: bettwenSlideEff.childEase,
        //timeDistribution: bettwenSlideEff.timeDistribution,
        prevSlideEl: this.currentSlideEl,
        nextSlideEl: slideEl,
        nextZIndex: this.nextZIndex,
      });
      console.log(transitionTl);
      this.slideTransitionTimeline.add(transitionTl);
      this.slideTransitionTimeline.init();
      this.slideTransitionTimeline.play();

      if (isManual) {
        // TODO: or NOTE: this part is to turn of timeline when transition manually triggered
        const turnOffPrevTL = new RootTimeline({
          name: "TurnOffPrevTimeline",
          duration: bettwenSlideEff!.overlap,
        });
        turnOffPrevTL.emitter.addListener("stop", () => {
          if (isManual) prevSlideTimeline?.stop();
          slideEl.style.zIndex = `${this.nextZIndex++}`;
          turnOffPrevTL.destroy();
        });
        turnOffPrevTL.init();
        turnOffPrevTL.start();
      }
    } else {
      if (isManual) prevSlideTimeline?.stop();
      slideEl.style.zIndex = `${this.nextZIndex++}`;
    }

    if (this.oneSlide) {
      this.currentSlideTimeline.repeat(-1);
    }

    // PLAY SLIDE :)

    //slideEl.style.display = "block";

    //let isUpdated = false;

    const currentSlideTimelineUpdateCallback = () => {
      //console.log("asas");
      // eventCallback("onUpdate", () => {
      this.onUpdateCallback?.();

      /*if (!isUpdated) {
        slideEl.style.display = "block";
        isUpdated = true;
      }*/
      if (!hasEffect(bettwenSlideEff)) {
        // ako nema effekat
        //
      }
      //
    };
    this.currentSlideTimeline.emitter.removeAllListeners("update");
    this.currentSlideTimeline.emitter.addListener(
      "update",
      currentSlideTimelineUpdateCallback
    );

    const currentSlideTimelineStopCallback = () => {
      slideEl.style.display = "none";
    };
    this.currentSlideTimeline.emitter.removeAllListeners("stop");
    this.currentSlideTimeline.emitter.addListener(
      "stop",
      currentSlideTimelineStopCallback
    );

    this.currentSlideTimeline.emitter.removeAllListeners("beforeStart");
    this.currentSlideTimeline.emitter.addListener("start", () => {
      slideEl.style.display = "block";
    });

    // trigger on slide end

    /* TODO123 const currSlideTl = this.currentSlideTimeline; //
    currSlideTl
      .getById("slideDurationTimeline")
      .eventCallback("onComplete", () => {
        //this.transitionEndBreakpointHandler(
        //  slideIdx,
        //  this.currentSlideTimeline!
        //);
        currSlideTl?.kill();
        slideEl.style.display = "none";
      });
    */

    //if (hasEffect(bettwenSlideEff)) {
    // trigger when transition have to start

    const triggerTimeline: Timeline | undefined =
      this.currentSlideTimeline?.getChildById("triggerTimeline");

    console.log(triggerTimeline);
    if (!this.oneSlide) {
      console.log("ADD HANDLER: " + slideIdx);
      const triggerTimelineCallback = () => {
        triggerTimeline?.emitter.removeAllListeners("stop");

        logger.warn("UPDATE!!!");
        this.transitionEndBreakpointHandler(
          slideIdx,
          this.currentSlideTimeline!
        );
      };
      triggerTimeline?.emitter.removeAllListeners("stop");
      triggerTimeline?.emitter.addListener("stop", triggerTimelineCallback);
    }
    //}
    // OTHER
    //

    this.currentSlideEl = slideEl;
    this.currentSlide = slideIdx;

    this.currentSlideTimeline.init();
    this.currentSlideTimeline.play(prevTlTime);

    this.onCurrentTimelineChangeCallback?.();
  }

  public manualPlaySlide(slideIdx: number) {
    //const currentSlideTime = this.currentSlideTimeline?.time();
    const tl = this.timelines[slideIdx];
    if (this.currentSlideTimeline === tl) {
      return;
    }

    if (this.slideTransitionInProgress) {
      return;
    }

    const triggerTimeline =
      this.currentSlideTimeline?.getChildById("triggerTimeline");
    // NOTE:  remove stop event
    triggerTimeline?.emitter.removeAllListeners("stop");

    this.playSlide(slideIdx, undefined, true);
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
      el?.addEventListener(objectEvent?.linkEvent, () => {
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

    const staticTl = new RootTimeline({
      name: "StaticTimeline",
      duration: -1,
    });
    this.staticTimelines[no] = staticTl;

    data.transitionsData.forEach((transitionData) => {
      // TODO: use only per device (add per device for layer)
      const calObjSize =
        transitionData.calculatedObjectSizePerDevice?.[
          this.currentDeviceType
        ] || transitionData.calculatedObjectSize;

      // Note: prepare page loader/s
      this.populatePageSpinners(transitionData);

      // Note: create timelines
      const slideParallelTls = createTimelineForObject(transitionData);
      slideParallelTls.forEach((pTl, idx) => {
        staticTl.add(pTl);
      });

      this.eventTimelines = [
        ...this.eventTimelines,
        ...createEventTimelineForObject(transitionData),
      ];

      /*
      // Note: create logic for objects (start, stop, preloaders, ....)
      const objDef = getObjectDefinition(transitionData.itemType);

      if (!!objDef?.executionCode_Start) {
        const execTl = createTimelineForExecutionCode(
          transitionData,
          objDef.executionCode_Start!,
          objDef.executionCode_Stop!,
          transitionData.itemValues,
          calObjSize
        );
        tl.add(execTl, 0);
      }*/
    });
  }

  private getNextSlideIdx(currIdx: number) {
    const total = this.normalSlideDataArr?.length || -1;
    const nextSlideIdx = currIdx >= total - 1 ? 0 : currIdx + 1;
    return nextSlideIdx;
  }

  private getPrevSlideIdx(currIdx: number) {
    const total = this.normalSlideDataArr?.length || -1;

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
    slideEl.style.pointerEvents = "none";

    this.createEvents(slideIdx, data);

    const slideTimeline = new RootTimeline({
      name: "RootSlideTimeline-id:" + slideIdx,
      duration: convertTimeUnitToMs(data.slide.duration.customValue),
    }); // gsap.timeline({ paused: true });
    this.timelines[slideIdx] = slideTimeline;

    // add slide duration timeline (we ise it to kill if effects lats more than set time)
    /*const slideDurationTimeline = gsap.timeline({
      id: "slideDurationTimeline",
      duration: convertTimeUnitToMs(data.slide.duration.customValue) / 1000,
    });
    slideTimeline.add(slideDurationTimeline);
    */

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
        slideTimeline.add(pTl);
      });

      this.eventTimelines = [
        ...this.eventTimelines,
        ...createEventTimelineForObject(transitionData),
      ];

      //console.log(slideTimeline);
      // Note: create logic for objects (start, stop, preloaders, ....)
      const objDef = getPlayerObjectDefinition(transitionData.itemType);

      /*
      objDef?.sizeUpdate(
        {
          id: transitionData.itemId,
          values: transitionData.itemValues,
          className: transitionData.objectClass,
          calculatedObjectSize: calObjSize,
        },
        true
      );

      */

      // execution code for objects
      /* 
      TODO123 if (!!objDef?.executionCode_Start) {
        const execTl = createTimelineForExecutionCode(
          transitionData,
          objDef.execStart!,
          objDef.execStop!,
          transitionData.itemValues,
          calObjSize
        );
        slideTimeline.add(execTl, 0);
      }*/

      // preload
      if (transitionData.itemValues.preload && !!objDef?.preload) {
        const preloadPromise = objDef.preload({
          id: transitionData.itemId,
          values: transitionData.itemValues,
          className: transitionData.objectClass,
          calculatedObjectSize: calObjSize,
        });
        this.preloaders[objDef.preloadOrder || PreloadOrder.MIDDLE].push(
          preloadPromise
        );
      }
    });

    const nextSlideIdx = this.getNextSlideIdx(slideIdx);

    // 0. get effect definition
    const firstSlideTransition =
      this.normalSlideDataArr?.[nextSlideIdx]?.slide?.transitions.slide?.[0];
    const bettwenSlideEff: ISlideTransition | undefined = firstSlideTransition
      ? {
          effect: firstSlideTransition?.effect!,
          duration: convertTimeUnitToMs(firstSlideTransition?.duration),
          overlap: convertTimeUnitToMs(firstSlideTransition?.overlap!),
        }
      : undefined;

    //console.log(bettwenSlideEff);
    // create breakpoint for slide transition
    // 1. if no slide transition set to 0
    let overlap = 0;
    // 2. if effect exit use it
    if (bettwenSlideEff?.effect.id !== "none") {
      //console.log("!!!!+++!!! OVERLAP: " + bettwenSlideEff?.overlap);
      overlap = bettwenSlideEff?.overlap ? bettwenSlideEff?.overlap : 0;
    }
    // 3. add breakpoint timeline

    // trigger
    const triggerTimeline = new Timeline({
      id: "triggerTimeline",
      name: "TriggerTimeline-" + slideIdx,
      duration: convertTimeUnitToMs(data.slide.duration.customValue) - overlap,
    });
    slideTimeline.add(triggerTimeline);
  }

  private transitionEndBreakpointHandler(
    slideIdx: number,
    prevTl: RootTimeline
  ) {
    const total = this.normalSlideDataArr?.length || -1;

    if (total > 0) {
      const newSlideIdx = slideIdx >= total - 1 ? 0 : slideIdx + 1;

      // NOTE: IMPORTANT: FOR TESTING:
      //if (newSlideIdx === 0) return;

      // 0. get effect definition
      /*const bettwenSlideEff: ISlideTransition | undefined =
        this.normalSlideDataArr?.[newSlideIdx]?.slide?.transitions.slide?.[0];*/
      const firstSlideTransition =
        this.normalSlideDataArr?.[newSlideIdx]?.slide?.transitions.slide?.[0];
      const bettwenSlideEff: ISlideTransition | undefined = firstSlideTransition
        ? {
            effect: firstSlideTransition?.effect!,
            duration: convertTimeUnitToMs(firstSlideTransition?.duration!),
            overlap: convertTimeUnitToMs(firstSlideTransition?.overlap!),
          }
        : undefined;

      // create breakpoint for slide transition
      // 1. if no slide transition set to 0
      let overlap = 0;
      // 2. if effect exit use it
      if (bettwenSlideEff?.effect.id !== "none") {
        overlap = bettwenSlideEff?.duration || 0; //bettwenSlideEff?.overlap ? bettwenSlideEff?.overlap : 0;
      }

      const overlapPosition =
        convertTimeUnitToMs(
          this.normalSlideDataArr?.[slideIdx]?.slide?.duration?.customValue!
        ) - overlap;

      this.playSlide(newSlideIdx, prevTl.time() - overlapPosition); //- overlap ? overlap / 1000 : 0
    }
  }
}

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

function getAllSlider(rootDiv: HTMLDivElement): HTMLDivElement[] {
  return Array.from(
    rootDiv.getElementsByClassName("slide")
  ) as HTMLDivElement[];
}

// function initSliderElement(rootDiv: HTMLDivElement) {
//   getAllSlider(rootDiv).forEach((slideEl) => {
//     slideEl.style.pointerEvents = "none";
//   });
// }
