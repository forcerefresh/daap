type LoadState = "notloaded" | "loading" | "loaded";

export class YTIFrameAPILoader {
  protected is = false;
  protected state: LoadState = "notloaded";
  protected subscribers: Function[] = [];

  public subscribe(): Promise<void> {
    if (this.state === "loaded") return Promise.resolve();

    if (this.state === "notloaded") {
      this.loadAPI();
      this.state = "loading";
    }

    let subscriptionResolve = function () {};
    const subscription = new Promise<void>((resolve) => {
      subscriptionResolve = resolve;
    });
    this.subscribers.push(subscriptionResolve);
    return subscription;
  }

  private loadAPI() {
    console.info("load API :):):):):):):)");

    (window as any).onYouTubeIframeAPIReady = () => {
      this.onLoaded();
    };

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag!.parentNode!.insertBefore(tag, firstScriptTag);
  }

  private onLoaded() {
    //setTimeout(() => {
    this.state = "loaded";
    console.log("exec preloader func");

    console.log(this.subscribers.length);
    this.subscribers.forEach((f) => f());
    //}, 1000);
  }
}
