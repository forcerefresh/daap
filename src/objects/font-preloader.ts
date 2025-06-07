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

    if (source === "google") {
      loadCSSContent(
        "https://fonts.googleapis.com/css?family=" +
          fontFamily.replace(" ", "+"),
        fontFamily
      ).then((loadedFontFamily) => {
        this.onLoaded(loadedFontFamily);
      });
      // const f = async function () {

      // const url =
      //   "https://fonts.googleapis.com/css?family=" +
      //   fontFamily.replace(" ", "+");
      // const response = await fetch(url);
      // const fontArrayBuffer = await response.arrayBuffer();
      // console.log(fontArrayBuffer);
      // console.log(ab2str(fontArrayBuffer));
      // debugger;
      // const style = document.createElement("style");
      // style.textContent = `
      //       @font-face {
      //         font-family: '${fontFamily}';
      //         src: url(${url});
      //       }
      //     `;
      // document.head.appendChild(style);
      // };

      // f();
    } else {
      load({
        [source]: {
          families: [fontFamily],
        },
        classes: false,
        fontloading: (familyName: string, fvd: string) => {},
        fontactive: (familyName: string, fvd: string) => {
          this.onLoaded(fontFamily);
          // const links = document.querySelectorAll("link");
          // console.log(links);

          // const styleLink = links[0];
          // if (styleLink) {
          //   fetch(styleLink.href)
          //     .then((response) => {
          //       if (!response.ok) {
          //         throw new Error("Network response was not ok");
          //       }
          //       return response.text();
          //     })
          //     .then((cssText) => {
          //       addStyle(cssText); // OVDE

          //       console.log("CSS Content:", cssText);
          //       // Do something with the CSS content
          //     })
          //     .catch((error) => {
          //       console.error("Error fetching CSS:", error);
          //     });
          // }
        },
      });
    }
  }

  private onLoaded(fontFamily: string) {
    this.states[fontFamily] = "loaded";
    Object.values(this.subscribers).forEach((arr) => arr.forEach((f) => f()));
  }
}

(window as any).WSFontPreloader = new FontPreloader();

// function ab2str(ab: ArrayBuffer) {
//   return String.fromCharCode.apply(null, new Uint16Array(ab));
// }

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
