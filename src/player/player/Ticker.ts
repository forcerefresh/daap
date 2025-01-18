import { EventEmitter } from "events";

const raf = global.requestAnimationFrame;
const currentTime =
  typeof global.performance?.now !== "undefined"
    ? function () {
        return performance.now();
      }
    : Date.now ||
      function () {
        return +new Date();
      };

interface ITickerConfig {
  //engine: "interval" | "timeout" | "requestAnimationFrame";
  framerate: number;
  limit: number;
}

export class Ticker {
  config: ITickerConfig;

  paused: boolean = false;
  started: boolean = false;

  requestStop: boolean = false;
  lastTime: number = 0;
  startTime: number = 0;
  time: number = 0;
  currentTickerTime: number = 0;

  fps: number;

  emitter: EventEmitter;
  raf: (a: FrameRequestCallback) => number;

  constructor(config: ITickerConfig) {
    this.config = config;

    this.emitter = new EventEmitter();

    this.fps = 1000 / (config.framerate || 60);
    // this.raf = !!raf
    //   ? raf
    //   :
    this.raf = (fn: FrameRequestCallback) => {
      return setTimeout(fn, this.fps);
    };
  }

  start() {
    if (!this.started) {
      this.lastTime = currentTime();
      this.startTime = currentTime();

      this.started = true;
      this.requestStop = false;

      this.loop();
    }
  }

  stop() {
    this.requestStop = true;
    this.started = false;
    this.paused = false;
  }

  pause(p: boolean) {
    this.paused = p;
  }

  loop() {
    if (this.requestStop) return;

    this.raf(this.loop.bind(this));

    var now = currentTime();
    var dt = now - this.lastTime;
    var n = this.config.limit;

    var diff = now - this.startTime;
    this.currentTickerTime = diff;

    this.emitter.emit("data", dt);

    this.time += dt;
    while (this.time > this.fps && n) {
      this.time -= this.fps;
      n -= 1;
      this.emitter.emit("tick", diff);
    }

    this.time = (this.time + this.fps * 1000) % this.fps;
    if (n !== this.config.limit)
      this.emitter.emit("draw", this.time / this.fps);
    this.lastTime = now;
  }
}

const ticker: { current?: Ticker } = {};
const getTickerInstance = (config?: ITickerConfig): Ticker => {
  if (!ticker.current) {
    ticker.current = new Ticker({
      framerate: config?.framerate || 60,
      limit: config?.limit || 1,
    });
  }
  return ticker.current as Ticker;
};

export default getTickerInstance;
