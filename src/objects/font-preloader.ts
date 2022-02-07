import { load } from "webfontloader";

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
    load({
      google: {
        families: [fontFamily],
      },
      classes: false,
      fontloading: (familyName: string, fvd: string) => {
        //console.log(familyName);
        //console.log(fvd);
      },
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
