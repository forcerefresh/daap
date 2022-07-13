import { noop } from "lodash-es";
import {
  BreakpointConfiguration,
  Breakpoints,
} from "../../webslider-sdk/src/common/i-breakpoint-configuration";

export class BreakpointChecker {
  private breakpoints: Breakpoints;
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

  constructor(breakpoints: Breakpoints) {
    this.breakpoints = breakpoints;
  }

  init() {
    setInterval(() => {
      this.check();
      this.checkVieport();
    }, 10);

    this.check();
    this.checkVieport();
  }

  getCurrentDeviceType() {
    return this.currentBreakpointConfiguration?.type;
  }

  setBreakpoints(breakpoints: Breakpoints) {
    this.breakpoints = breakpoints;
  }

  setBPChangeHandler(
    fn: ((breakpoitconfiguration: BreakpointConfiguration) => void) | null
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
    const vSize = this.getVieportSize();
    if (
      !this.currentViewportSize ||
      this.currentViewportSize.width !== vSize.width ||
      this.currentViewportSize?.height !== vSize.height
    ) {
      this.currentViewportSize = vSize;
      this.sizeChangeHandlerFn?.(vSize, this.currentBreakpointConfiguration!);
    }
  }

  private getVieportSize() {
    var elem =
      document.compatMode === "CSS1Compat"
        ? document.documentElement
        : document.body;

    var height = elem.clientHeight;
    var width = elem.clientWidth;
    return { height, width };
  }
  private check() {
    this.breakpoints.breakpointsConfiguration.forEach((bp) => {
      const { from, to, toMax, fromMin } = bp.normal.breakpoint.width;

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
    });
  }
}
