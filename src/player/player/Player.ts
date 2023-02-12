import {
  IPlayerData,
  ISlideData,
  IItemsData,
} from "../../export/i-export-html";
import { loadAndRegisterExternalComponentForPlayer } from "../../objects/external-object-player-utils";
import { layerSizeUpdate } from "../../objects/layer/layer";
import {
  CoreObjectType,
  getPlayerObjectDefinition,
  PreloadOrder,
} from "webslider-sdk/lib/objects/objects-register";
import {
  ILayout,
  ISlideTransition,
  NavigationType,
} from "webslider-sdk/lib/objects/i-object";
import { INavigationValues } from "webslider-sdk/lib/objects/i-navigation-types";
import {
  calculateObjectSize,
  getRelativeTo,
  unitValueToPx,
} from "../../panels/stage-panel/StagePanelUtils";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import { addClass, removeClass } from "../../utils/doom-utils/common";
import {
  convertRGBColor2CSSProperties,
  convertTimeUnitToMs,
  getBooleanValue,
} from "../../utils/utils";
import {
  createEventTimelineForObject,
  createTimelineForExecutionCode,
  createTimelineForObject,
  DYNAMIC_OUT_EFF_TIMELINE_GROUP,
  IEventTimeline,
} from "../AppPlayerUtils";
import { BreakpointChecker } from "./BreakpointChecker";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import getTickerInstance from "./Ticker";
import { Timeline } from "./Timeline";
import { RootTimeline } from "./RootTimeline";
import gsap from "gsap";
import animejs from "animejs";
import {
  getLayerWrapperElementById,
  getObjectElementById,
  getObjectWrapperElementById,
} from "../../animations/animation-utils";

gsap.defaults(); // in order to bundle gsap
gsap.install(window);
(window as any).animejs = animejs;

export enum InTransitionEnum {
  NO = 0,
  EXIT_TRANSITION = 1,
  SLIDE_TRANSITION = 2,
}
export interface IPlayerConfig {
  isApp?: boolean;
  deviceAuto?: boolean;
  forceDevice?: DeviceType;
}
export class Player {
  protected playerData: IPlayerData | null;
  protected rootDiv: HTMLDivElement;
  protected currentSlide: number = -1;

  private timelines: RootTimeline[];
  private staticTimelines: RootTimeline[];
  private loadStaticTimelines: RootTimeline[];

  private outEffTimelines: RootTimeline[];

  private currentSlideTimeline?: RootTimeline;
  private currentSlideTimelineIdx: number = 0;
  private slideTransitionTimeline?: RootTimeline;

  private nextZIndex = 1;

  private normalSlideDataArr?: ISlideData[];
  private loadSlideDataArr?: ISlideData[];
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

  private manuallyRequestedSlideIdx: number = -1;
  //private inSlideTransition: InTransitionEnum = 0;

  //private preventExitTransitionToTrigger: boolean = false;

  // this is time adjuster when we broadcast progress time, user when user click to  navigate to another slide
  private pagePreloaderEls: {
    el: HTMLDivElement;
    inTime: number;
    outTime: number;
  }[];

  private eventTimelines: IEventTimeline[] = [];

  private debug: { showBoundaries?: boolean } = {};

  private bgEl: HTMLDivElement;

  private visibilityDisplayState: { [key: string]: string } = {};

  private forceDevice: DeviceType | undefined;

  //private timeOffsetCorrection = 0;
  constructor(
    playerData: IPlayerData | null,
    rootDiv: HTMLDivElement,
    playerConfig: IPlayerConfig = {
      isApp: false,
      deviceAuto: true,
    }
  ) {
    this.playerData = playerData;

    this.forceDevice = playerConfig.forceDevice;

    let breakpointReferenceDiv: HTMLDivElement | undefined;
    if (playerData?.config?.breakpointReference === "parent") {
      breakpointReferenceDiv = rootDiv.parentElement as HTMLDivElement;
    }

    this.breakpointChecker = new BreakpointChecker(
      playerData?.breakpoints || { breakpointsConfiguration: [] },
      breakpointReferenceDiv
    );
    this.breakpointChecker.init();
    this.breakpointChecker.setBPChangeHandler(
      this.breakpointChangeHandler.bind(this)
    );
    this.breakpointChecker.setSizeChangeHandler(
      this.sizeChangeHandler.bind(this)
    );
    this.currentDeviceType = this.breakpointChecker.getCurrentDeviceType()!;

    // current breakpoint configuration
    this.currentBp = this.playerData?.breakpoints.breakpointsConfiguration.find(
      (bp) => bp.type === (this.forceDevice || this.currentDeviceType)
    )!;

    this.playerConfig = playerConfig;

    this.oneSlide = playerData?.slides.length === 1;

    this.rootDiv = rootDiv;

    rootDiv.innerHTML = playerData?.html || "";

    this.normalSlideDataArr = this.playerData?.slides;
    this.loadSlideDataArr = this.playerData?.loadSlides ?? [];
    this.frontSlideDataArr = this.playerData?.frontSlides;
    this.backSlideDataArr = this.playerData?.backSlides;

    this.hideAllSlides();

    this.bgEl = rootDiv.getElementsByClassName(
      "sliderBackground"
    )[0] as HTMLDivElement;

    this.bgEl.style.position = "absolute";
    this.bgEl.style.background = convertRGBColor2CSSProperties(
      this.playerData?.config.sliderBackgroundColor
    ).backgroundColor as string;

    this.createNavigationEvents(rootDiv);

    this.timelines = [];
    this.staticTimelines = [];
    this.loadStaticTimelines = [];
    this.outEffTimelines = [];

    // NOTE: this implementation initialize all slides
    // TODO: lazy loading for requested slide should be implemented

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
      this.addListenersForEventsAnimations();
    } else {
      this.playerData?.extensions?.forEach((extension) => {
        this.extComponentPreloaders.push(
          loadAndRegisterExternalComponentForPlayer(extension)
        );
      });

      Promise.all(this.extComponentPreloaders)
        .then(() => {
          logger.player.info("All external components are loaded.");
        })
        .catch((err) => {
          logger.player.warn("External component loading has failed.");
          console.warn(err);
        })
        .finally(() => {
          this.createAllSlides();
          this.addListenersForEventsAnimations();
        });
    }

    //initSliderElement(this.rootDiv);
  }

  public setDebug(debug: { showBoundaries?: boolean }) {
    this.debug = debug;
  }

  private addListenersForEventsAnimations() {
    this.eventTimelines.forEach((tlObj) => {
      const className = `custom-id-${tlObj.eventTargetId}`;

      if (
        tlObj.reverseEvent === tlObj.event &&
        tlObj.reverseEventTargetId === tlObj.eventTargetId
      ) {
        // NOTE (case 1): if same event for forward and reverse
        const el = this.rootDiv.getElementsByClassName(className)[0];
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
        el?.addEventListener(tlObj.event, () => {
          tlObj.rootTimeline.resume();
          tlObj.rootTimeline.setDirection(1);
        });

        // reverse
        const classNameR = `custom-id-${tlObj.reverseEventTargetId}`; //this.targetId2Classname[tlObj.reverseEventTargetId];
        const elR = this.rootDiv.getElementsByClassName(classNameR)[0];
        elR?.addEventListener(tlObj.reverseEvent, () => {
          tlObj.rootTimeline.resume();
          tlObj.rootTimeline.setDirection(-1);
        });
      }

      tlObj.rootTimeline.init();
      tlObj.rootTimeline.start();
      tlObj.rootTimeline.pause();
    });
  }
  // this we are calling after we load external components
  private createAllSlides() {
    this.backSlideDataArr?.forEach((data, idx) => {
      const visibleItems = this.excludeNonVisibleItems(data);
      this.createStaticSlide(idx, { ...data, items: visibleItems });
    });
    this.loadSlideDataArr?.forEach((data, idx) => {
      const visibleItems = this.excludeNonVisibleItems(data);
      this.createStaticSlide(idx, { ...data, items: visibleItems }, true);
    });
    this.frontSlideDataArr?.forEach((data, idx) => {
      const visibleItems = this.excludeNonVisibleItems(data);
      this.createStaticSlide(idx, { ...data, items: visibleItems });
    });
    this.normalSlideDataArr?.forEach((data, idx) => {
      const visibleItems = this.excludeNonVisibleItems(data);
      this.createSlide(idx, { ...data, items: visibleItems });
    });

    this.resizeAll(true);

    this.loadStaticTimelines.forEach((tl) => {
      tl.init();
      tl.start();
    });
  }

  private excludeNonVisibleItems(data: ISlideData) {
    const newItems = data.items.filter((item) => {
      const itemVisibility = this.playerData?.itemsVisibility.find(
        (itemVis) => itemVis.id === item.itemId
      );
      if (!itemVisibility) {
        return true;
      }
      if (itemVisibility.displayOn.includes(this.currentBp.type)) {
        return true;
      }
      return false;
    });

    return newItems;
  }

  private bpUpdateSlideAnimations(isInitial = false) {
    if (!this.slideTransitionTimeline) return;

    const bp = this.currentBp;

    if (bp?.normal._maxSliderSize) {
      this.slideTransitionTimeline.updateSize({
        slideWidth: bp?.normal._maxSliderSize.width,
        slideHeight: bp?.normal._maxSliderSize.height,
        pageWidth: bp?.normal._page?.width!,
        pageHeight: bp?.normal._page?.height!,
      });
    }
  }

  private bpUpdateSlide(isInitial = false) {
    const bp = this.currentBp;

    //TODO: set sliderRoot height
    const sliderRoot = this.rootDiv.getElementsByClassName(
      "sliderRoot"
    )[0] as HTMLDivElement;
    if (sliderRoot) {
      sliderRoot.style.height = bp?.normal._page!.height + "px";
      sliderRoot.style.width = bp?.normal._page!.width + "px";
      sliderRoot.style.overflow = this.playerData?.config.hideOutsideContent
        ? "hidden"
        : "visible";
    }

    const slideEls = this.rootDiv.getElementsByClassName("slide");
    const slideWrapperEls =
      this.rootDiv.getElementsByClassName("slide-wrapper");

    const bgEl = this.rootDiv.getElementsByClassName(".sliderBackground")[0] as
      | HTMLDivElement
      | undefined;
    if (bgEl) {
      bgEl.style.left =
        -(bp?.normal._page!.width - bp?.normal._maxSliderSize!.width) / 2 +
        "px";
      //* this.scaleParams?.wScale!
      bgEl.style.width = bp?.normal._page!.width + "px"; //* this.scaleParams?.wScale!
      bgEl.style.height = bp?.normal._page!.height + "px"; //* this.scaleParams?.hScale!
    }

    // NOTE: if debug.showBoundaries is true show border
    const pageBorder = this.debug.showBoundaries
      ? "1px dotted #ff2121"
      : "1px dotted rgba(255,255,255,0)";
    const slideBorder = this.debug.showBoundaries
      ? "1px dotted #45c750"
      : "1px dotted rgba(255,255,255,0)";
    const guidelinesBorder = this.debug.showBoundaries
      ? "1px dotted #00d6ff"
      : "1px dotted rgba(255,255,255,0)";

    (Array.from(slideWrapperEls) as HTMLDivElement[]).forEach((el) => {
      el.style.height = bp?.normal._page!.height + "px";
      el.style.width = bp?.normal._page!.width + "px";
      el.style.overflow = this.playerData?.config.hideOutsideContent
        ? "hidden"
        : "visible";
      el.style.pointerEvents = "none";
    });

    (Array.from(slideEls) as HTMLDivElement[]).forEach((el) => {
      el.style.height = bp?.normal._page!.height + "px";
      el.style.width = bp?.normal._page!.width + "px";
      // el.style.overflow = this.playerData?.config.hideOutsideContent
      //   ? "hidden"
      //   : "visible";
      el.style.pointerEvents = "none";

      // SLIDE
      el.style.left =
        (bp?.normal._page!.width - bp?.normal._maxSliderSize!.width) / 2 + "px";
      // DEBUG SLIDER FRAME - SLIDER
      const debugSlideFrame = createOrSelect(el, "slide-debug-frame-slide");
      debugSlideFrame.style.pointerEvents = "none";
      debugSlideFrame.style.position = "absolute";
      debugSlideFrame.style.top = "1px";
      debugSlideFrame.style.left = "1px";
      // debugSlideFrame.style.top =
      //   (bp?.normal._page!.height - bp?.normal._maxSliderSize!.height) / 2 +
      //   "px";
      //* this.scaleParams?.wScale!
      //debugSlideFrame.style.left =
      //  (bp?.normal._page!.width - bp?.normal._maxSliderSize!.width) / 2 + "px"; //* this.scaleParams?.wScale!
      debugSlideFrame.style.width = bp?.normal._maxSliderSize!.width - 2 + "px"; //* this.scaleParams?.wScale!
      debugSlideFrame.style.height =
        bp?.normal._maxSliderSize!.height - 2 + "px"; //* this.scaleParams?.hScale!
      // debugSlideFrame.style.background = "rgba(0,0,0,0.05)";
      debugSlideFrame.style.border = slideBorder;
      debugSlideFrame.style.boxSizing = "border-box";

      // DEBUG SLIDER FRAME - PAGE
      const debugSlideFramePage = createOrSelect(el, "slide-debug-frame-page");
      debugSlideFramePage.style.pointerEvents = "none";
      debugSlideFramePage.style.position = "absolute";
      // debugSlideFramePage.style.top =
      //   (bp?.normal._page!.height - bp?.normal._maxSliderSize!.height) / 2 +
      //   "px";
      //* this.scaleParams?.wScale!
      debugSlideFramePage.style.left =
        -(bp?.normal._page!.width - bp?.normal._maxSliderSize!.width) / 2 +
        "px";
      //* this.scaleParams?.wScale!
      debugSlideFramePage.style.width = bp?.normal._page!.width + "px"; //* this.scaleParams?.wScale!
      debugSlideFramePage.style.height = bp?.normal._page!.height + "px"; //* this.scaleParams?.hScale!
      //debugSlideFramePage.style.background = "rgba(0,0,0,0.05)";
      debugSlideFramePage.style.border = pageBorder;
      debugSlideFramePage.style.boxSizing = "border-box";

      // DEBUG SLIDER FRAME - GUIDEBOX
      const debugSlideFrameGuide = createOrSelect(
        el,
        "slide-debug-frame-guidelines"
      );
      debugSlideFrameGuide.style.pointerEvents = "none";
      debugSlideFrameGuide.style.position = "absolute";
      debugSlideFrameGuide.style.top = bp.normal.guidelinesPadding.top + "px";
      debugSlideFrameGuide.style.left = bp.normal.guidelinesPadding.left + "px";
      debugSlideFrameGuide.style.width =
        bp?.normal._maxSliderSize!.width -
        (bp.normal.guidelinesPadding.left + bp.normal.guidelinesPadding.right) +
        "px"; //* this.scaleParams?.wScale!
      debugSlideFrameGuide.style.height =
        bp?.normal._maxSliderSize!.height -
        (bp.normal.guidelinesPadding.top + bp.normal.guidelinesPadding.bottom) +
        "px"; //* this.scaleParams?.hScale!
      //debugSlideFrameGuide.style.background = "rgba(0,0,0,0.05)";
      debugSlideFrameGuide.style.border = guidelinesBorder;
      debugSlideFrameGuide.style.boxSizing = "border-box";
    });
  }

  private calculateSizeParameters(
    bp: BreakpointConfiguration,
    bounds: { width: number; height: number }
  ) {
    const wScale = this.getScale(bp.normal.page.width, bounds.width);
    let hScale = this.getScale(bp.normal.page.height, bounds.height);

    let _pageH = bp.normal.page.height;
    let _pageW = bp.normal.page.width;

    //let _maxPageH = bp.normal.page.height;

    let _maxSliderH = bp.normal.maxSliderSize.height;
    let _maxSliderW = bp.normal.maxSliderSize.width;

    // WIDTH behaviour
    if (bp.normal.breakpoint.width.toMax) {
      _pageW = bounds.width;
    } else {
      _pageW = Math.min(_pageW, bounds.width);
    }

    //override
    if (bp.normal.widthBehavior.type === "useMaxWidth") {
      _pageW = Math.min(bp.normal.maxSliderSize.width, bounds.width);
    }

    _maxSliderW = Math.min(_maxSliderW, bounds.width);

    // if (bp.normal.widthBehavior.type === "useMaxWidth") {
    //   _maxPageW = Math.min(_maxSliderW, bounds.width);
    // } else if (bp.normal.widthBehavior.type === "fullwidth") {
    //   _maxPageW = Math.max(_maxSliderW, bounds.width);
    // }

    const whRatio = bp.normal.page.width / bp.normal.page.height;
    const wRatio = _pageW / bp.normal.page.width;
    const wRatioSlide = bounds.width / bp.normal.maxSliderSize.width;

    // HEIGHT  behaviour
    if (bp.normal.heightBehavior.type === "fullheight") {
      _pageH = bounds.height;
      _maxSliderH = bounds.height; //Math.min(bp.normal.maxSliderSize.height, bounds.height);
    } else if (bp.normal.heightBehavior.type === "fixed") {
      _pageH = bp.normal.page.height;
      _maxSliderH = bp.normal.maxSliderSize.height;
    } else if (bp.normal.heightBehavior.type === "keepAspectRatio") {
      _pageH = bp.normal.page.height * wRatio;
      _pageW = bp.normal.page.width * wRatio;
      _maxSliderH = bp.normal.maxSliderSize.height * wRatio;

      hScale = wScale;
    } else if (
      bp.normal.heightBehavior.type === "keepAspectRatioBelowMaxSliderSize"
    ) {
      _pageH = bp.normal.page.height;
      _maxSliderH = bp.normal.maxSliderSize.height;
      if (bounds.width < bp.normal.maxSliderSize.width) {
        _pageH = bp.normal.page.height * wRatioSlide;
        _maxSliderH = bp.normal.maxSliderSize.height * wRatioSlide;
      }
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

    //logger.player.notice("wScale:  " + wScale);
    //logger.player.notice("hScale:  " + hScale);

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
    this.loadSlideDataArr?.forEach((data, idx) => {
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
    data.items.forEach((transitionData) => {
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

      // if (textValues.applyObjectScale) {
      //   (
      //     div.getElementsByClassName("object-content")[0] as HTMLElement
      //   ).style.transform = "scale(" + scale?.wScale + ")";
      // } else {

      if (
        getBooleanValue(
          transitionData.layout.layoutAdvance?.hasLayoutAdvance
        ) &&
        getBooleanValue(
          transitionData.layout.layoutAdvance?.updateScale,
          true
        ) &&
        this.scaleParams?.wScale
      ) {
        const wrapperObjectOrLayerEl =
          transitionData.itemType === "layer"
            ? getLayerWrapperElementById(transitionData.itemId)
            : getObjectWrapperElementById(transitionData.itemId);

        if (wrapperObjectOrLayerEl) {
          wrapperObjectOrLayerEl.style.transform =
            "scale(" + this.scaleParams?.wScale + ")";
        }
      }

      const forceUpdateSize =
        !transitionData.layout.layoutAdvance?.hasLayoutAdvance ||
        getBooleanValue(transitionData.layout.layoutAdvance?.updateSize, true);

      objDef?.sizeUpdate(
        {
          id: transitionData.itemId,
          values: transitionData.itemValues,
          className: transitionData.objectClass,
          calculatedObjectSize: calObjSize,
          scale: this.scaleParams,
          skipSizeUpdate: !forceUpdateSize,
          deviceType: this.currentBp.type,
          // calculateSize: (
          //   value: string,
          //   propertyName: "width" | "height" | "left" | "top"
          // ) => {
          //   const relativeTo = getRelativeTo(
          //     transitionData.layout as ILayout,
          //     this.currentBp
          //   );

          //   return unitValueToPx(
          //     value,
          //     propertyName,
          //     relativeTo,
          //     this.currentBp
          //   );
          // },
          isInitial,
        },
        true
      );
    });
  }

  private breakpointChangeHandler(bp: BreakpointConfiguration) {
    // if deviceAuto is true
    if (this.playerConfig.deviceAuto) {
      this.setBp(bp);
    }
  }

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

  public setBreakpointReference(bpRef: "viewport" | "parent") {
    if (this.playerData) {
      this.playerData.config.breakpointReference = bpRef;

      let breakpointReferenceDiv: HTMLDivElement | undefined;
      if (this.playerData.config.breakpointReference === "parent") {
        breakpointReferenceDiv = this.rootDiv.parentElement as HTMLDivElement;
      }

      this.breakpointChecker.setReferenceDiv(
        bpRef === "viewport" ? undefined : breakpointReferenceDiv
      );
      this.resizeAll();
    }
  }

  public setDevice(device: DeviceType) {
    this.currentDeviceType = device;

    this.setBp(
      this.playerData?.breakpoints.breakpointsConfiguration.find(
        (bp) => bp.type === this.currentDeviceType
      )!
    );
  }

  public customResize(customViewPortSize: { width?: number; height?: number }) {
    this.breakpointChecker.stop();
    this.breakpointChecker.currentViewportSize = {
      ...this.breakpointChecker.currentViewportSize,
      ...customViewPortSize,
    } as any;

    this.scaleParams = this.calculateSizeParameters(
      this.currentBp!,
      this.breakpointChecker.currentViewportSize!
    );

    this.bpUpdateSlide();
    this.bpUpdateSlideAnimations();
    this.bpUpdateObjectsSize();
  }

  private updateVisibility() {
    const type = this.currentBp.type;
    this.playerData?.itemsVisibility.forEach((itemVisibility) => {
      const itemEl = this.rootDiv.getElementsByClassName(
        itemVisibility.itemType + "-" + itemVisibility.id
      )[0] as HTMLDivElement | undefined;

      if (itemEl) {
        if (!this.visibilityDisplayState[itemVisibility.id]) {
          this.visibilityDisplayState[itemVisibility.id] =
            itemEl.style.display || "block";
        }

        const newDisplay = itemVisibility.displayOn.includes(type)
          ? this.visibilityDisplayState[itemVisibility.id]
          : "none";

        itemEl.style.display = newDisplay;
      }
    });
  }

  private resizeAll(isInitial = false) {
    this.updateVisibility();

    if (this.playerConfig.isApp) return;

    this.scaleParams = this.calculateSizeParameters(
      this.currentBp!,
      this.breakpointChecker.currentViewportSize!
    );

    this.bpUpdateSlide(isInitial);
    this.bpUpdateSlideAnimations(isInitial);
    this.bpUpdateObjectsSize(isInitial);

    // update background
    const bp = this.currentBp;
    this.bgEl.style.left =
      -(bp?.normal._page!.width - bp?.normal._maxSliderSize!.width) / 2 + "px";
    //* this.scaleParams?.wScale!
    this.bgEl.style.width = bp?.normal._page!.width + "px"; //* this.scaleParams?.wScale!
    this.bgEl.style.height = bp?.normal._page!.height + "px"; //* this.scaleParams?.hScale!
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

      this.loadStaticTimelines.forEach((tl) => {
        tl.pause();
      });

      this.outEffTimelines.forEach((tl) => {
        tl?.pause();
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

    this.loadStaticTimelines.forEach((tl) => {
      tl.paused(p);
    });

    this.outEffTimelines.forEach((tl) => {
      tl?.paused(p);
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

    this.loadStaticTimelines.forEach((tl) => {
      tl.clear();
      tl.kill();
    });
    this.loadStaticTimelines = [];

    this.timelines.forEach((tl) => {
      tl.destroy();
    });
    this.timelines = [];

    this.outEffTimelines.forEach((tl) => {
      tl?.destroy();
    });
    this.outEffTimelines = [];

    this.eventTimelines.forEach((tlObj) => {
      tlObj.rootTimeline.destroy();
    });
    this.eventTimelines = [];

    this.slideTransitionTimeline?.destroy();
    this.slideTransitionTimeline = undefined;

    //this.breakpointChecker.setBPChangeHandler(null);
    this.breakpointChecker.setSizeChangeHandler(null);

    this.currentSlideTimelineIdx = 0;

    this.currentSlideTimeline?.destroy();
    this.currentSlideTimeline = undefined;
  }

  public initSpinners() {}
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
      //addClass(item.el, "wsSpinnerFadeIn");
      const cEl = item.el.getElementsByClassName(
        "object-content"
      )[0] as HTMLDivElement;
      cEl.style.transitionDuration = item.inTime + "ms";
      addClass(cEl, "wsSpinnerVisible");
    });
    const ctime = Date.now();

    await Promise.all(this.preloaders[PreloadOrder.FIRST]);
    await Promise.all(this.preloaders[PreloadOrder.MIDDLE]);
    await Promise.all(this.preloaders[PreloadOrder.LAST]);

    this.pagePreloaderEls.forEach(function (item) {
      if (Date.now() - ctime < 50) {
        item.el.style.display = "none";
      } else {
        const cEl = item.el.getElementsByClassName(
          "object-content"
        )[0] as HTMLDivElement;
        cEl.style.transitionDuration = item.outTime + "ms";
        removeClass(cEl, "wsSpinnerVisible");

        setTimeout(() => {
          item.el.style.display = "none";
        }, item.outTime);
      }
    });

    this.staticTimelines.forEach((tl) => {
      tl.init();
      tl.start();
    });

    if (this.playerData?.config.autoPlay === true) {
      this.playSlide(0);
    }
  }

  private skippedFirstSlide = false;
  private shouldPlaySlideTransition(slideIdx: number) {
    if (slideIdx !== 0) return true;
    if (!this.playerData?.config?.skipFirstSlideAnimation) return true;
    if (!this.skippedFirstSlide) {
      this.skippedFirstSlide = true;
      return false;
    }
    return true;
  }

  public playSlide(
    slideIdx: number = 0,
    prevTlTime: number = 0,
    isManual = false
  ) {
    logger.player.notice("Play slide:  " + slideIdx);

    this.addClassToBullet(this.rootDiv, slideIdx);

    if (!this.normalSlideDataArr?.[slideIdx]) {
      // slide does not exist
      logger.player.error(`Slide with index [${slideIdx}] does not exists`);
      return;
    }

    // prev
    const prevSlideTimeline = this.currentSlideTimeline;
    const prevSlideEl = this.currentSlideEl;

    // Turn off events on previous slide
    if (prevSlideEl) prevSlideEl.style.pointerEvents = "none";

    // next
    const slide = this.normalSlideDataArr?.[slideIdx]?.slide;
    const slideEl = getSlideById(slide?.id);

    // move slide to top if moveToTop is true
    if (slide?.moveToTop) slideEl.style.zIndex = `${this.nextZIndex++}`;

    // Turn on events on next slide
    slideEl.style.pointerEvents = "auto";

    // NOTE: Transition between slides start when slide starts
    // TODO: SLIDE TRANSITION >>>
    const slideTransitions = slide?.transitions.slide;
    let betweenSlideEffArr: ISlideTransition[] = [];
    if (slideTransitions) {
      betweenSlideEffArr = slideTransitions.map((slideTransition) => {
        return {
          animation: slideTransition?.animation!,
          duration: convertTimeUnitToMs(slideTransition?.duration!),
          delay: convertTimeUnitToMs(slideTransition?.delay!),
          ease: slideTransition?.ease,
        };
      });
    }
    // TODO: <<< SLIDE TRANSITION

    // set next as current
    this.currentSlideTimeline = this.timelines[slideIdx];
    this.currentSlideTimelineIdx = slideIdx;

    if (slide.transitionEnabled && this.shouldPlaySlideTransition(slideIdx)) {
      this.slideTransitionInProgress = true;

      this.slideTransitionTimeline = new RootTimeline({
        name: "SlideTransitionRootTimeline",
        duration: slide.transitionDurationTime,
      });

      this.slideTransitionTimeline.emitter.addListener("stop", () => {
        const prevTriggerTimeline: Timeline | undefined =
          prevSlideTimeline?.getChildById("triggerTimeline");
        prevTriggerTimeline?.resetDurationToOriginal();

        prevSlideTimeline?.stop();

        this.slideTransitionInProgress = false;
        this.slideTransitionTimeline?.emitter.removeAllListeners("stop");
        delete this.slideTransitionTimeline;
      });

      // TODO ovo je samo za prvi, dodati za sve
      if (betweenSlideEffArr) {
        betweenSlideEffArr.forEach((betweenSlideEff) => {
          const transitionTl = new Timeline({
            id: slide.id,
            name: "SlideTransitionTimeline",
            animationId: betweenSlideEff!.animation.id,
            ...betweenSlideEff!.animation.values,
            objectProperties: {
              width: 960,
              height: 485,
            },
            breakpointData: {
              width: this.playerData?.breakpointData.width,
              height: this.playerData?.breakpointData.height,
              pageWidth: this.playerData?.breakpointData.pageWidth,
            },
            type: "animation",
            duration: betweenSlideEff!.duration,
            delay: betweenSlideEff!.delay!,
            ease: betweenSlideEff!.ease,
            //childEase: bettwenSlideEff.childEase,
            //timeDistribution: bettwenSlideEff.timeDistribution,
            prevSlideEl: this.currentSlideEl,
            nextSlideEl: slideEl,
            nextZIndex: this.nextZIndex++,
            slideWidth: this.currentBp?.normal._maxSliderSize?.width,
            slideHeight: this.currentBp?.normal._maxSliderSize?.height,
            pageWidth: this.currentBp?.normal._page?.width,
            pageHeight: this.currentBp?.normal._page?.height,
          });

          this.slideTransitionTimeline!.add(transitionTl);
        });
      }

      this.slideTransitionTimeline.init();
      //const diff = Date.now() - this.timeOffsetCorrection;
      //  debugger;
      this.slideTransitionTimeline.start(); //(prevTlTime + 30);
      // this will call sizeUpdate for slideTransitionTimeline
      this.bpUpdateSlideAnimations();

      if (isManual) {
        // TODO: or NOTE: this part is to turn of timeline when transition manually triggered
        const turnOffPrevTL = new RootTimeline({
          name: "TurnOffPrevTimeline",
          duration: slide.transitionOverlapTime,
        });
        turnOffPrevTL.emitter.addListener("stop", () => {
          if (isManual) prevSlideTimeline?.stop();
          slideEl.style.zIndex = `${this.nextZIndex++}`;
          turnOffPrevTL.destroy();
        });
        turnOffPrevTL.init();
        turnOffPrevTL.start();
      } else {
        //slideEl.style.zIndex = `${this.nextZIndex++}`; // TODO: COnsider zindex engine
      }
    } else {
      if (isManual) {
        const prevTriggerTimeline: Timeline | undefined =
          prevSlideTimeline?.getChildById("triggerTimeline");
        //prevTriggerTimeline?.resetDurationToOriginal();
        prevTriggerTimeline?.emitter.removeAllListeners("stop");

        prevSlideTimeline?.stop();
      }
      slideEl.style.zIndex = `${this.nextZIndex++}`;

      // proveriti ovo: current imp: ako je procesuirano setujemo na -1
      this.manuallyRequestedSlideIdx = -1;
    }

    if (this.oneSlide) {
      this.currentSlideTimeline.repeat(-1);
    }

    // PLAY SLIDE :)

    //slideEl.style.display = "block";

    //let isUpdated = false;

    const currentSlideTimelineUpdateCallback = () => {
      // eventCallback("onUpdate", () => {
      this.onUpdateCallback?.();

      /*if (!isUpdated) {
        slideEl.style.display = "block";
        isUpdated = true;
      }*/

      //if (!hasSlideAnimation(betweenSlideEff)) {
      // ako nema effekat
      //
      //}
      //
    };
    this.currentSlideTimeline.emitter.removeAllListeners("update");
    this.currentSlideTimeline.emitter.addListener(
      "update",
      currentSlideTimelineUpdateCallback
    );

    const currentSlideTimelineStopCallback = () => {
      // FOR DEBUG: comment this to see all slides // IMPORTANT  S
      slideEl.style.display = "none";
    };
    this.currentSlideTimeline.emitter.removeAllListeners("stop");
    this.currentSlideTimeline.emitter.addListener(
      "stop",
      currentSlideTimelineStopCallback
    );

    this.currentSlideTimeline.emitter.removeAllListeners("start");
    this.currentSlideTimeline.emitter.addListener("start", () => {
      // Note: showSlide
      slideEl.style.display = "block";
      // Note: show static slides
      this.showFrontBack();
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

    //if (hasAnimation(bettwenSlideEff)) {
    // trigger when transition have to start

    // NOTE: Slide EXIT transition trigger
    // const exitTriggerTimeline: Timeline | undefined =
    //   this.currentSlideTimeline?.getChildById("exitTriggerTimeline");

    // if (!this.oneSlide) {
    //   const exitTriggerTimelineCallback = () => {
    //     // start all exit transitions
    //     // TODO: IMPLEMENT
    //     logger.player.info("exitTriggerTimeline123");
    //     // TODO: remove following
    //     // this.transitionEndBreakpointHandler(
    //     //   slideIdx,
    //     //   this.currentSlideTimeline!
    //     // );

    //     exitTriggerTimeline?.emitter.removeAllListeners("beforeStop");
    //   };
    //   exitTriggerTimeline?.emitter.removeAllListeners("beforeStop");
    //   exitTriggerTimeline?.emitter.addListener(
    //     "beforeStop",
    //     exitTriggerTimelineCallback
    //   );
    // }

    // NOTE: Slide transition trigger
    const triggerTimeline: Timeline | undefined =
      this.currentSlideTimeline?.getChildById("triggerTimeline");

    if (!this.oneSlide) {
      const triggerTimelineCallback = () => {
        triggerTimeline?.emitter.removeAllListeners("stop");

        this.triggerTransitionNextSlideHandler(
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

    //this.currentSlideTimeline.setChildrenDisable(false);
    this.currentSlideTimeline.init();
    this.currentSlideTimeline.start(); // (prevTlTime); <<this was before TODO IMPORTANT

    this.onCurrentTimelineChangeCallback?.();
  }

  public manualPlaySlide(slideIdx: number) {
    //const currentSlideTime = this.currentSlideTimeline?.time();
    const prevSlideTl = this.currentSlideTimeline;

    const tl = this.timelines[slideIdx];
    if (this.currentSlideTimeline === tl) {
      return;
    }

    if (this.slideTransitionInProgress) {
      logger.player.info(
        "Slide transition is in progress. Slide transition canceled."
      );

      return;
    }

    this.slideTransitionInProgress = true;
    this.manuallyRequestedSlideIdx = slideIdx;

    // THIS WAS SERIOUS
    //const triggerTimeline =
    //  this.currentSlideTimeline?.getChildById("triggerTimeline");
    // NOTE:  remove stop event
    //triggerTimeline?.emitter.removeAllListeners("stop");

    // TODO TODO
    // TODO: ako se vec izvrsavaju neizvrsaval ovo

    const exitTransTl = this.outEffTimelines[this.currentSlideTimelineIdx];
    const nextSlide = this.playerData?.slides?.[slideIdx]?.slide;
    const nextSlideOverlap = nextSlide?.transitionEnabled
      ? nextSlide?.transitionOverlapTime
      : undefined;

    let maxExitTime = 0;
    if (!nextSlideOverlap && exitTransTl) {
      maxExitTime = exitTransTl.duration;
    } else if (!exitTransTl && nextSlideOverlap) {
      maxExitTime = nextSlideOverlap;
    } else if (exitTransTl && nextSlideOverlap) {
      maxExitTime = Math.max(exitTransTl.duration, nextSlideOverlap);
    }

    // NOTE: if zero means we don't have any out animation to play and there is no slide transition
    if (maxExitTime !== 0) {
      // case 1
      //this.inSlideTransition = 1;

      // 1. decreaseDelay for out animation timelines
      const timelinesForOutAnimation =
        this.currentSlideTimeline!.getChildrenByGroup(
          DYNAMIC_OUT_EFF_TIMELINE_GROUP
        );

      if (timelinesForOutAnimation.length > 0) {
        timelinesForOutAnimation.forEach((tl) => {
          //const timeDiff =
          //  tl.delay - this.currentSlideTimeline!.currentTimelineTime!;
          const timeDiff =
            this.currentSlideTimeline!.duration -
            maxExitTime -
            this.currentSlideTimeline!.currentTimelineTime!;

          tl.decreaseDelay(timeDiff);
        });
      }

      // 2. decreaseDelay for between slide timeline
      const triggerTimeline =
        this.currentSlideTimeline?.getChildById("triggerTimeline");

      if (triggerTimeline) {
        //debugger;

        // NOTE: ! When manually play slide we can chose any; we need to update duration first
        // this will force update duration
        const newDur =
          this.currentSlideTimeline?.duration! - this.getSlideOverlap(slideIdx);

        const timeDiff =
          this.currentSlideTimeline!.duration -
          maxExitTime -
          this.currentSlideTimeline!.currentTimelineTime!;

        triggerTimeline.decreaseDuration(timeDiff, newDur);
      }

      // 3. revert all times on exitTransTl "stop"
      exitTransTl?.emitter.addListener("stop", () => {
        // reset to original delays
        if (timelinesForOutAnimation.length > 0) {
          timelinesForOutAnimation.forEach((tl) => {
            tl.resetDelayToOriginal();
          });
        }
        triggerTimeline?.resetDurationToOriginal();
        //debugger;
        // NOTE: If there are no overlap bettwen slider
        if (!nextSlideOverlap) this.slideTransitionInProgress = false;

        prevSlideTl?.stop();
      });

      exitTransTl?.init(); //TODO: Check do we need to init() every time???
      exitTransTl?.start(0);
    } else {
      this.slideTransitionInProgress = false;
      this.playSlide(slideIdx, undefined, true);
    }
  }

  private createEvent(
    no: number,
    className: string,
    objectEvent?: INavigationValues
  ) {
    if (!objectEvent) {
      return;
    }

    let el: HTMLDivElement | undefined;
    if (objectEvent.navigationType === NavigationType.None) {
      return;
    } else if (objectEvent.navigationType === NavigationType.Link) {
      el = document.getElementsByClassName(className)[0] as HTMLDivElement;
      el?.addEventListener(objectEvent?.linkEvent, () => {
        if (objectEvent.enableAudioPlay) this.enableAudio();

        let a = document.createElement("a");
        // NOTE: when player runs in  app open in new window (_blank)
        a.target = this.playerConfig.isApp ? "_blank" : objectEvent.linkTarget;
        a.href = objectEvent.linkHref;
        a.click();
      });
    } else if (objectEvent.navigationType === NavigationType.Slide) {
      el = document.getElementsByClassName(className)[0] as HTMLDivElement;

      const clickHandler = () => {
        if (objectEvent.enableAudioPlay) this.enableAudio();

        if (objectEvent.slideReferenceType === "slideNo") {
          this.manualPlaySlide(parseInt(objectEvent?.slideNo, 10) - 1);
        } else if (objectEvent.slideReferenceType === "slideId") {
          const slideIdx = this.getSlideIdxByID(objectEvent.slideId);
          if (slideIdx) this.manualPlaySlide(slideIdx);
        } else if (objectEvent.slideReferenceType === "next") {
          //debugger;
          const slideIdx = this.getNextSlideIdx(this.currentSlide);
          this.manualPlaySlide(slideIdx);
        } else if (objectEvent.slideReferenceType === "prev") {
          const slideIdx = this.getPrevSlideIdx(this.currentSlide);
          this.manualPlaySlide(slideIdx);
        } else if (objectEvent.slideReferenceType === "slider") {
          if (objectEvent.hideOnEvent) {
            el?.parentNode?.removeChild(el);
          }
          if (objectEvent.sliderActionOnEvent === "start") {
            // TODO: IMPORTANT:!!!!
            getTickerInstance().start();

            this.staticTimelines.forEach((tl) => {
              tl.init();
              tl.start();
            });

            this.playSlide(0);
            // TODO
          } else if (objectEvent.sliderActionOnEvent === "stop") {
            this.clear(false);
          }
        }
      };
      el?.addEventListener(objectEvent?.slideEvent, clickHandler.bind(this));
    }
    if (el) el.style.cursor = objectEvent.cursor;
  }

  private enableAudio() {
    const audioEls = this.rootDiv.getElementsByTagName("audio");
    Array.from(audioEls).forEach((audioEl) => {
      //audioEl.volume = 0;
      //audioEl.play();
      audioEl.pause();
      audioEl.volume = 0.8;
      audioEl.currentTime = 0;
    });
  }

  private getSlideIdxByID(customId: string): number | undefined {
    const slide = this.normalSlideDataArr?.find((slideData) => {
      return slideData.slide.customId === customId;
    });

    return slide ? this.normalSlideDataArr?.indexOf(slide) : undefined;
  }

  private createEvents(slideIdx: number, data: ISlideData) {
    data.items.forEach((itemData) => {
      this.createEvent(slideIdx, itemData.objectClass, itemData.events);
    });
  }

  private createStaticSlide(no: number, data: ISlideData, isLoadSlide = false) {
    this.createEvents(no, data);

    const staticTl = new RootTimeline({
      name: "StaticTimeline",
      duration: -1,
    });
    if (isLoadSlide) {
      this.loadStaticTimelines[no] = staticTl;
    } else {
      this.staticTimelines[no] = staticTl;
    }

    data.items.forEach((itemData) => {
      // TODO: use only per device (add per device for layer)
      const calObjSize =
        itemData.calculatedObjectSizePerDevice?.[this.currentDeviceType] ||
        itemData.calculatedObjectSize;

      // Note: prepare page loader/s
      this.populatePageSpinners(itemData);

      // Note: create timelines
      const slideParallelTls = createTimelineForObject(itemData);
      slideParallelTls.effTls.forEach((pTl, idx) => {
        staticTl.add(pTl);
      });

      this.eventTimelines = [
        ...this.eventTimelines,
        ...createEventTimelineForObject(itemData),
      ];

      // Note: create logic for objects (start, stop, preloaders, ....)
      const objDef = getPlayerObjectDefinition(itemData.itemType);

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
      if (!!objDef?.execStart || !!objDef?.execStop || !!objDef?.updateTime) {
        const execTl = createTimelineForExecutionCode(
          itemData,
          objDef.execStart,
          objDef.execStop,
          objDef.updateTime,
          itemData.itemValues,
          calObjSize
        );
        staticTl.add(execTl);
      }

      // preload
      if (itemData.itemValues.preload && !!objDef?.preload) {
        const preloadPromise = objDef.preload({
          id: itemData.itemId,
          values: itemData.itemValues,
          className: itemData.objectClass,
          calculatedObjectSize: calObjSize,
        });
        this.preloaders[objDef.preloadOrder || PreloadOrder.MIDDLE].push(
          preloadPromise
        );
      }
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

  private populatePageSpinners(transitionData: IItemsData) {
    if (
      transitionData.itemSystemType === CoreObjectType.SPINNER &&
      transitionData.itemValues.applyTo === "page"
    ) {
      const ppEl = document.querySelector(".object-" + transitionData.itemId);
      if (ppEl) {
        const inTime = convertTimeUnitToMs(
          (transitionData.itemValues as any).fadeInTime
        );
        const outTime = convertTimeUnitToMs(
          (transitionData.itemValues as any).fadeOutTime
        );

        // ppEl.style.display = "none";
        this.pagePreloaderEls.push({
          el: ppEl as HTMLDivElement,
          inTime,
          outTime,
        });
      }
    }
  }

  private showFrontBack() {
    this.backSlideDataArr?.forEach((data) => {
      this.showSlide(data);
    });
    this.frontSlideDataArr?.forEach((data) => {
      this.showSlide(data);
    });
  }

  private hideAllSlides() {
    this.backSlideDataArr?.forEach((data) => {
      this.hideSlide(data);
    });
    this.frontSlideDataArr?.forEach((data) => {
      this.hideSlide(data);
    });
    this.loadSlideDataArr?.forEach((data) => {
      //this.hideSlide(data);
    });
    this.normalSlideDataArr?.forEach((data) => {
      this.hideSlide(data);
    });
  }

  private hideSlide(data: ISlideData) {
    const slideEl = getSlideById(data.slide.id);
    slideEl.style.display = "none";
    slideEl.style.pointerEvents = "none";
  }

  private showSlide(data: ISlideData) {
    const slideEl = getSlideById(data.slide.id);
    slideEl.style.display = "block";
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

    // add slide duration timeline (we ise it to kill if animations lats more than set time)
    /*const slideDurationTimeline = gsap.timeline({
      id: "slideDurationTimeline",
      duration: convertTimeUnitToMs(data.slide.duration.customValue) / 1000,
    });
    slideTimeline.add(slideDurationTimeline);
    */

    // add objects animations timelines
    data.items.forEach((itemData) => {
      // TODO: use only per device (add per device for layer)
      const calObjSize =
        itemData.calculatedObjectSizePerDevice?.[this.currentDeviceType] ||
        itemData.calculatedObjectSize;

      // Note: prepare page loader/s
      this.populatePageSpinners(itemData);

      // NOTE: create animations tls
      const slideParallelTls = createTimelineForObject(itemData);
      slideParallelTls.effTls.forEach((pTl, idx) => {
        slideTimeline.add(pTl);
      });
      // NOTE: create root timeline for out animation
      if (slideParallelTls.outEffTlExist) {
        const manTlDur = convertTimeUnitToMs(
          itemData.data.exitSlideDuration.customValue
        );
        const outAnimationManualRootTimeline = new RootTimeline({
          name: "RootTimelineForManualOutAnimation-" + slideIdx,
          duration: manTlDur,
        });

        this.outEffTimelines[slideIdx] = outAnimationManualRootTimeline;
      }

      this.eventTimelines = [
        ...this.eventTimelines,
        ...createEventTimelineForObject(itemData),
      ];

      // Note: create logic for objects (start, stop, preloaders, ....)
      const objDef = getPlayerObjectDefinition(itemData.itemType);

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
      if (!!objDef?.execStart || !!objDef?.execStop || !!objDef?.updateTime) {
        const execTl = createTimelineForExecutionCode(
          itemData,
          objDef.execStart,
          objDef.execStop,
          objDef.updateTime,
          itemData.itemValues,
          calObjSize
        );
        slideTimeline.add(execTl);
      }

      // preload
      if (itemData.itemValues.preload && !!objDef?.preload) {
        const preloadPromise = objDef.preload({
          id: itemData.itemId,
          values: itemData.itemValues,
          className: itemData.objectClass,
          calculatedObjectSize: calObjSize,
        });
        this.preloaders[objDef.preloadOrder || PreloadOrder.MIDDLE].push(
          preloadPromise
        );
      }
    });

    const nextSlideIdx = this.getNextSlideIdx(slideIdx);

    // 0. get animation definition
    const slide = this.normalSlideDataArr?.[nextSlideIdx]?.slide;
    // const slideTransition =
    //   this.normalSlideDataArr?.[nextSlideIdx]?.slide?.transitions.slide?.[0];
    // const bettwenSlideEff: ISlideTransition | undefined = slideTransition
    //   ? {
    //       animation: slideTransition?.animation!,
    //       duration: convertTimeUnitToMs(slideTransition?.duration),
    //       overlap: convertTimeUnitToMs(slideTransition?.overlap!),
    //     }
    //   : undefined;

    // create breakpoint for slide transition

    // 1. if no slide transition set to 0

    let overlap = 0;
    // 2. if animation exit use it
    if (slide?.transitionEnabled) {
      overlap = slide.transitionOverlapTime;
    }
    //if (bettwenSlideEff?.animation.id !== "none") {
    //overlap = bettwenSlideEff?.overlap ? bettwenSlideEff?.overlap : 0;
    //}

    // 3. add slide exit transitions trigger timeline
    const exitTriggerTimeline = new Timeline({
      id: "exitTriggerTimeline",
      name: "ExitTriggerTimeline-" + slideIdx,
      duration:
        convertTimeUnitToMs(data.slide.duration.customValue) -
        (convertTimeUnitToMs(data.slide.exitDuration.customValue) + overlap),
    });
    slideTimeline.add(exitTriggerTimeline);

    // 3. add slide transitions trigger timeline
    const triggerTimeline = new Timeline({
      id: "triggerTimeline",
      name: "TriggerTimeline-" + slideIdx,
      duration: convertTimeUnitToMs(data.slide.duration.customValue) - overlap,
    });
    slideTimeline.add(triggerTimeline);
  }

  private triggerTransitionNextSlideHandler(
    slideIdx: number,
    prevTl: RootTimeline
  ) {
    const total = this.normalSlideDataArr?.length || -1;

    if (total > 0) {
      let newSlideIdx = slideIdx >= total - 1 ? 0 : slideIdx + 1;
      if (this.manuallyRequestedSlideIdx !== -1) {
        // override with manualy
        newSlideIdx = this.manuallyRequestedSlideIdx;
        this.manuallyRequestedSlideIdx = -1;
      }

      // NOTE: IMPORTANT: FOR TESTING:
      //if (newSlideIdx === 0) return;

      // 0. get animation definition
      /*const bettwenSlideEff: ISlideTransition | undefined =
        this.normalSlideDataArr?.[newSlideIdx]?.slide?.transitions.slide?.[0];*/
      // const firstSlideTransition =
      //   this.normalSlideDataArr?.[newSlideIdx]?.slide?.transitions.slide?.[0];
      // const bettwenSlideEff: ISlideTransition | undefined = firstSlideTransition
      //   ? {
      //       animation: firstSlideTransition?.animation!,
      //       duration: convertTimeUnitToMs(firstSlideTransition?.duration!),
      //       overlap: convertTimeUnitToMs(firstSlideTransition?.overlap!),
      //     }
      //   : undefined;

      // create breakpoint for slide transition
      // 1. if no slide transition set to 0
      let overlap = 0;
      const slide = this.normalSlideDataArr?.[newSlideIdx]?.slide;
      if (slide?.transitionEnabled) {
        overlap = slide.transitionOverlapTime;
      }
      // 2. if animation exit use it
      // if (bettwenSlideEff?.animation.id !== "none") {
      //   overlap = bettwenSlideEff?.duration || 0; //bettwenSlideEff?.overlap ? bettwenSlideEff?.overlap : 0;
      // }

      const overlapPosition =
        convertTimeUnitToMs(
          this.normalSlideDataArr?.[slideIdx]?.slide?.duration?.customValue!
        ) - overlap;

      //this.timeOffsetCorrection = Date.now();
      this.playSlide(newSlideIdx, prevTl.time() - overlapPosition); // ); // TODO TODO//- overlap ? overlap / 1000 : 0
    }
  }

  getSlideOverlap(slideId: number) {
    const slide = this.normalSlideDataArr?.[slideId]?.slide;
    let overlap = 0;
    if (slide?.transitionEnabled) {
      overlap = slide.transitionOverlapTime;
    }
    return overlap;

    // TODO: delete commented code

    // 0. get animation definition
    // const slideTransition =
    //   slide?.transitions.slide?.[0];
    // const bettwenSlideEff: ISlideTransition | undefined = slideTransition
    //   ? {
    //       animation: slideTransition?.animation!,
    //       duration: convertTimeUnitToMs(slideTransition?.duration),
    //       overlap: convertTimeUnitToMs(slideTransition?.overlap!),
    //     }
    //   : undefined;

    // // create breakpoint for slide transition

    // // 1. if no slide transition set to 0

    // let overlap = 0;
    // // 2. if animation exit use it
    // if (bettwenSlideEff?.animation.id !== "none") {
    //   overlap = bettwenSlideEff?.overlap ? bettwenSlideEff?.overlap : 0;
    // }
  }
}

function getSlideById(id?: string) {
  if (!id) {
    throw new Error("Id is not provided");
  }
  const slideClassname = "slide-" + id;
  const slideEl = document.getElementsByClassName(
    slideClassname
  )[0] as HTMLDivElement;
  return slideEl;
}

function getAllSlider(rootDiv: HTMLDivElement): HTMLDivElement[] {
  return Array.from(
    rootDiv.getElementsByClassName("slide")
  ) as HTMLDivElement[];
}

function hasSlideAnimation(betweenSlideEff?: ISlideTransition) {
  return (
    betweenSlideEff?.animation.id && betweenSlideEff?.animation.id !== "none"
  );
}

// function initSliderElement(rootDiv: HTMLDivElement) {
//   getAllSlider(rootDiv).forEach((slideEl) => {
//     slideEl.style.pointerEvents = "none";
//   });
// }

function createOrSelect(holder: Element, className: string): HTMLDivElement {
  const els = holder.getElementsByClassName(className);
  if (els[0]) return els[0] as HTMLDivElement;

  const el = document.createElement("div");
  el.setAttribute("class", className);
  holder.appendChild(el);
  return el;
}
