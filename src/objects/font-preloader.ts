import { load } from "webfontloader";
import { getGlobals } from "../globals";
import { getMediaBaseUrl } from "@platform/utils/media";
import { addStyle } from "../utils/doom-utils/css-utils";

type LoadState = "notloaded" | "loading" | "loaded";

export class FontPreloader {
  protected states: { [key: string]: LoadState } = {};
  protected subscribers: { [key: string]: Function[] } = {};

  public subscribe(fontFamily: string): Promise<void> {
    if (this.states[fontFamily] === "loaded") return Promise.resolve();

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
      .getMyFonts?.()
      ?.find((font) => font.name === fontFamily);

    if (fontObj) {
      const fontFileName = fontObj.mediaSizes.find(
        (size) => size.sizeType === "original"
      )?.sourceFilename;

      if (fontFileName) {
        addStyle(`
          @font-face{
            font-family: "${fontFamily}";
            src: url("${getMediaBaseUrl(fontFileName)}");
          }
        `);
      }
    }

    const source = fontObj ? "custom" : "google";

    if (source === "google") {
      loadCSSContent(
        "https://fonts.googleapis.com/css?family=" +
          fontFamily.replace(" ", "+"),
        fontFamily
      ).then((loadedFontFamily) => {
        this.onLoaded(loadedFontFamily);
      });
    } else {
      load({
        [source]: {
          families: [fontFamily],
        },
        classes: false,
        fontloading: (_familyName: string, _fvd: string) => {},
        fontactive: (_familyName: string, _fvd: string) => {
          this.onLoaded(fontFamily);
        },
      });
    }
  }

  private onLoaded(fontFamily: string) {
    this.states[fontFamily] = "loaded";
    Object.values(this.subscribers).forEach((arr) => arr.forEach((f) => f()));
  }
}

window.WSFontPreloader = new FontPreloader();

function loadCSSContent(url: string, fontFamily: string) {
  return new Promise<string>((resolve, reject) => {
    fetch(url)
      .then((response) => response.text())
      .then((css) => {
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
        resolve(fontFamily);
      })
      .catch(reject);
  });
}
