import { load } from "webfontloader";
import { getGlobals } from "../globals";
import { addStyle } from "../utils/doom-utils/css-utils";

type LoadState = "notloaded" | "loading" | "loaded";

export class FontPreloader {
  protected states: { [key: string]: LoadState } = {};
  protected subscribers: { [key: string]: Function[] } = {};

  public subscribe(fontFamily: string): Promise<void> {
    if (this.states[fontFamily] === "loaded") return Promise.resolve();

    //=== "notloaded"
    if (!this.states[fontFamily]) {
      this.loadFont(fontFamily);
      this.states[fontFamily] = "loading";
    }

    let subscriptionResolve = function () {};
    const subscription = new Promise<void>((resolve) => {
      subscriptionResolve = resolve;
    });

    if (!this.subscribers[fontFamily]) this.subscribers[fontFamily] = [];
    this.subscribers[fontFamily].push(subscriptionResolve);
    return subscription;
  }

  private loadFont(fontFamily: string) {
    const fontObj = getGlobals()
      .getMyFonts()
      .find((font) => font.name === fontFamily);

    if (fontObj) {
      const fontFileName = fontObj.mediaSizes.find(
        (size) => size.sizeType === "original"
      )?.sourceFilename;

      let fontUrl = `/api/v1/media/${fontFileName}`;
      // TODO
      if (import.meta.env.VITE_APP_INTEGRATION === "wp") {
        fontUrl = `${daapForcerefreshSettings.baseMediaUrl}/${fontFileName}`;
      }

      // add css first
      addStyle(`
        @font-face{
          font-family: "${fontFamily}";
          src: url("${fontUrl}");
        }
      `);
    }

    const source = fontObj ? "custom" : "google";

    load({
      [source]: {
        families: [fontFamily],
      },
      classes: false,
      fontloading: (familyName: string, fvd: string) => {},
      fontactive: (familyName: string, fvd: string) => {
        this.onLoaded(fontFamily);
      },
    });
  }

  private onLoaded(fontFamily: string) {
    this.states[fontFamily] = "loaded";
    Object.values(this.subscribers).forEach((arr) => arr.forEach((f) => f()));
  }
}

(window as any).WSFontPreloader = new FontPreloader();
