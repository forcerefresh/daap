type LoadState = "notloaded" | "loading" | "loaded" | "error";

export interface IVideoSourceConnector {
  getVideo: () => Promise<HTMLVideoElement>; // ovo je za target
  startVideo: (url: string) => Promise<any>; // ova je za source
}

export class VIDEOSourceConnector implements IVideoSourceConnector {
  protected state: LoadState = "notloaded";
  protected dataSubscribers: Function[] = [];
  video: HTMLVideoElement | undefined;

  async startVideo(url: string): Promise<any> {
    try {
      this.video = document.createElement("video");
      this.video.src = "./bike.mp4";
      this.video.muted = true;
      this.video.autoplay = true;
      // this.video.preload = "auto";
      // this.video.hidden = true;
      // this.video.style.display = "none";
      this.dataSubscribers.forEach((f) => f());
      this.dataSubscribers = [];
      this.state = "loaded";
      return this.video;
    } catch (err) {
      this.state = "error";
    }
  }

  getVideo(): Promise<HTMLVideoElement> {
    if (this.state === "loaded") return Promise.resolve(this.video!);

    let subscriptionResolve = function (str: string) {};
    const subscription = new Promise<HTMLVideoElement>((resolve) => {
      subscriptionResolve = () => {
        resolve(this.video!);
      };
    });
    this.dataSubscribers.push(subscriptionResolve);

    return subscription;
  }
}
