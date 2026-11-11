import { get } from "lodash-es";
type LoadState = "notloaded" | "loading" | "loaded" | "error";

export interface IJSONSourceConnector {
  getDataByPath: (path: string) => Promise<string>;
  loadData: (url: string) => Promise<any>;
}

export class JSONSourceConnector implements IJSONSourceConnector {
  data: any;
  protected state: LoadState = "notloaded";
  protected dataSubscribers: Function[] = [];

  async loadData(url: string): Promise<any> {
    try {
      const res = await fetch(url);
      this.data = await res.json();
      this.dataSubscribers.forEach((f) => f());
      this.dataSubscribers = [];
      this.state = "loaded";
      return this.data;
    } catch (err) {
      this.state = "error";
    }
  }

  getDataByPath(path: string): Promise<string> {
    if (this.state === "loaded") return Promise.resolve(get(this.data, path));

    let subscriptionResolve = function (_str: string) {};
    const subscription = new Promise<string>((resolve) => {
      subscriptionResolve = () => {
        resolve(get(this.data, path));
      };
    });
    this.dataSubscribers.push(subscriptionResolve);

    return subscription;
  }
}
