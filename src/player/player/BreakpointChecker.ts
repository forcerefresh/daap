import {
  BreakpointConfiguration,
  Breakpoints,
} from "webslider-sdk/lib/common/i-breakpoint-configuration";

export class BreakpointChecker {
  private breakpoints: Breakpoints;
  private refDiv: HTMLDivElement | undefined;

  private changeHandlerFn:
    | ((breakpoitConfiguration: BreakpointConfiguration) => void)
    | null = null;

  private sizeChangeHandlerFn:
    | ((
        size: { width: number; height: number },
        breakpoitconfiguration: BreakpointConfiguration
      ) => void)
    | null = null;

  // current breakpoint configuration
  private currentBreakpointConfiguration: BreakpointConfiguration | undefined;

  // current vieport size
  public currentViewportSize: { width: number; height: number } | undefined;

  constructor(breakpoints: Breakpoints, refDiv?: HTMLDivElement) {
    this.breakpoints = breakpoints;
    this.refDiv = refDiv;
  }

  private int: any;
  init() {
    if (this.int) {
      clearInterval(this.int);
    }

    this.int = setInterval(() => {
      this.checkVieport();
      this.check();
    }, 10);
    this.checkVieport();
    this.check();
  }

  stop() {
    clearInterval(this.int);
  }

  setReferenceDiv(refDiv: HTMLDivElement | undefined) {
    this.refDiv = refDiv;
  }

  getCurrentDeviceType() {
    return this.currentBreakpointConfiguration?.type;
  }

  setBreakpoints(breakpoints: Breakpoints) {
    this.breakpoints = breakpoints;
  }

  // TODO: check if setBPChangeHandler and setSizeChangeHandler causing more rerender than needed
  setBPChangeHandler(
    fn: ((breakpointConfiguration: BreakpointConfiguration) => void) | null
  ) {
    this.changeHandlerFn = fn;
  }

  setSizeChangeHandler(
    fn:
      | ((
          size: { width: number; height: number },
          breakpoitconfiguration: BreakpointConfiguration
        ) => void)
      | null
  ) {
    this.sizeChangeHandlerFn = fn;
  }

  private checkVieport() {
    const vSize = this.refDiv ? this.getRefDivSize() : this.getViewportSize();

    if (
      !this.currentViewportSize ||
      this.currentViewportSize.width !== vSize.width ||
      this.currentViewportSize.height !== vSize.height
    ) {
      this.currentViewportSize = vSize;
      this.sizeChangeHandlerFn?.(vSize, this.currentBreakpointConfiguration!);
    }
  }

  private getRefDivSize() {
    let elem = this.refDiv!;

    let height = elem.clientHeight;
    let width = elem.clientWidth;
    return { height, width };
  }

  private getViewportSize() {
    let elem =
      document.compatMode === "CSS1Compat"
        ? document.documentElement
        : document.body;

    let height = elem.clientHeight;
    let width = elem.clientWidth;
    return { height, width };
  }

  private check() {
    this.breakpoints.breakpointsConfiguration.forEach((bp) => {
      const { from, to, toMax, fromMin } = bp.normal.breakpoint.width;

      // TODO: IMPORTANT CHECK FRO PARENT !!!!!!
      if (this.currentViewportSize) {
        const w = this.currentViewportSize.width;
        const fromW = fromMin ? 0 : from;
        const toW = toMax ? 100000 : to;
        if (w > fromW && w < toW) {
          if (this.currentBreakpointConfiguration !== bp) {
            this.currentBreakpointConfiguration = bp;
            this.changeHandlerFn?.(bp);
          }
        }
      } else {
        const mediaQuery = window.matchMedia(
          `(min-width: ${fromMin ? 0 : from}px) and (max-width: ${
            toMax ? 100000 : to
          }px)`
        );

        if (mediaQuery.matches === true) {
          if (this.currentBreakpointConfiguration !== bp) {
            this.currentBreakpointConfiguration = bp;
            this.changeHandlerFn?.(bp);
          }
        }
      }
    });
  }
}
