type LoadState = "notloaded" | "loading" | "loaded" | "error";

export interface IVideoSourceConnector {
  getVideo: () => Promise<HTMLVideoElement>;
  startVideo: (props: { url: string; loop: boolean }) => Promise<any>;
  getMetaData: () => MetaData | undefined;
}
type MetaData = {
  width: number;
  height: number;
  status: "notloaded" | "metadata";
};
export class VIDEOSourceConnector implements IVideoSourceConnector {
  protected state: LoadState = "notloaded";
  protected dataSubscribers: Function[] = [];
  video: HTMLVideoElement | undefined;
  metaData: MetaData | undefined;

  getMetaData() {
    return this.metaData;
  }

  async startVideo(props: { url: string; loop: boolean }): Promise<any> {
    try {
      const { url, loop } = props;
      this.video = document.createElement("video");
      this.video.src = url;
      this.video.muted = true;
      this.video.autoplay = true;
      this.video.loop = loop;
      this.video.play();
      this.video.addEventListener("loadedmetadata", () => {
        if (this.video) {
          this.metaData = {
            width: this.video.videoWidth,
            height: this.video.videoHeight,
            status: "metadata",
          };
        }
      });
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
