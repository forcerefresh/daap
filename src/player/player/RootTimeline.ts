import { EventEmitter } from "events";
import { Ticker } from "./Ticker";
import getTickerInstance from "./Ticker";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { isReverse, isTimelineInBounds } from "./timeline-utild";
import { Timeline } from "./Timeline";
import { Shield } from "aws-sdk";
import remove from "lodash-es/remove";

type IRootTimelineConfig = {
  duration?: number;
  delay?: number;
  name?: string;
  id?: string;
};

export class RootTimeline {
  emitter: EventEmitter;

  scale = 1;

  // dynamic properties
  playing = false;
  currentTime = 0;

  numberOfRepeats: number = 1;

  // static properties
  duration = -1;
  delay = 0;

  timelines: {
    playing: boolean; // when playhead is inside start and stop
    timeline: Timeline;
  }[];

  isPaused: boolean = false;

  // ticker
  ticker: Ticker;

  startTickerTime: number = 0;
  pauseTickerTime: number = 0;
  deltaTickerTime: number = 0;

  currentTimelineTime: number = 0;

  tick_Handler_Bind: (time: number) => void;

  config: IRootTimelineConfig;

  direction = 1;

  constructor(config: IRootTimelineConfig) {
    this.config = config;

    // configuration
    if (config.duration) this.duration = config.duration;
    if (config.delay) this.delay = config.delay;

    // ticker is a heartbeat for timeline
    this.ticker = getTickerInstance();

    // timeline trigger events (start/stop/update)
    this.emitter = new EventEmitter();

    // holder for child timelines
    this.timelines = [];

    this.tick_Handler_Bind = this.tick_Handler.bind(this);
  }

  timeScale(scale: number) {
    this.scale = scale;
  }
  // todo: remove this
  eventCallback(type: string, callback: any) {}

  play(_pos?: number) {
    this.start(_pos);
  }

  private tick_Handler(tickerTime: number) {
    //console.log(tickerTime);
    if (!this.isPaused && this.playing) {
      this.currentTimelineTime = tickerTime - this.deltaTickerTime;
      // check duration to call "stop"

      // start all timelines that needs to be started that
      /*this.timelines.forEach((child) => {
        const inBounds = isTimelineInBounds(
          this.currentTimelineTime,
          child.timeline.delay,
          child.timeline.duration
        );
        if (inBounds) {
          // if not started start it
          if (!child.playing) {
            child.playing = true;
            child.timeline.start();
          }
        }
      });*/

      // if not stopped call "update"
      this.update(this.currentTimelineTime);
    }
  }

  setDirection(direction: number) {
    logger.debug(`ROOT reverse (${this.config.name})`);
    this.direction = direction;

    this.timelines.forEach((child) => {
      child.timeline.setDirection(direction);
    });
  }

  // init all timelines
  init() {
    logger.debug(`ROOT init (${this.config.name})`);

    this.timelines.forEach((child) => {
      child.timeline.init();
    });
  }

  // destroy all timelines
  destroy() {
    logger.debug(`ROOT destroy (${this.config.name})`);

    this.emitter.removeAllListeners();

    logger.info("REMOVE LISTENER (destroy)");
    this.ticker.emitter.removeListener("tick", this.tick_Handler_Bind);

    this.timelines.forEach((child) => {
      child.timeline.destroy();
    });
  }

  // NOTE: only child that has delay===0 will be started (related to child timelines)
  start(_pos?: number) {
    logger.debug(`ROOT start (${this.config.name})`);
    console.time();
    console.timeLog();

    if (this.playing) {
      console.log("cannot start multiple times");
      return;
    }
    this.emitter.emit("beforeStart");

    this.playing = true;
    this.isPaused = false;

    this.startTickerTime = this.ticker.currentTickerTime;
    this.pauseTickerTime = 0;
    this.deltaTickerTime = this.ticker.currentTickerTime;
    this.currentTimelineTime = 0;

    logger.info("ADD LISTENER");

    this.ticker.emitter.addListener("tick", this.tick_Handler_Bind);

    logger.info(this.ticker.emitter.listenerCount("tick"));

    this.timelines.forEach((child) => {
      child.timeline.rootStart();
      // NOTE: START only timeline that have delay===0
      if (!child.playing && child.timeline.delay === 0) {
        child.playing = true;
        child.timeline.start();
      }
    });

    this.emitter.emit("start");
  }

  // NOTE: stop will stop timeline and all child timelines
  stop() {
    logger.debug(`ROOT stop (${this.config.name})`);
    console.timeLog();

    if (!this.playing) {
      console.log("cannot stop multiple times");
      return;
    }

    this.emitter.emit("beforeStop");

    this.playing = false;

    logger.info("REMOVE LISTENER (stop)");
    this.ticker.emitter.removeListener("tick", this.tick_Handler_Bind);

    this.timelines.forEach((child) => {
      if (child.playing) {
        child.playing = false;
        child.timeline.stop();
      }
      child.timeline.rootStop();
    });

    this.emitter.emit("stop");
  }

  pause() {
    logger.debug(`ROOT pause (${this.config.name})`);

    this.isPaused = true;
    this.pauseTickerTime = this.ticker.currentTickerTime;

    this.timelines.forEach((child) => {
      child.timeline.pause();
    });
  }

  resume() {
    logger.debug(`ROOT resume (${this.config.name})`);

    if (this.isPaused === false) {
      return;
    }

    this.isPaused = false;
    this.deltaTickerTime +=
      this.ticker.currentTickerTime - this.pauseTickerTime;

    this.timelines.forEach((child) => {
      const inBounds = isTimelineInBounds(
        this.currentTimelineTime,
        child.timeline.delay,
        child.timeline.duration
      );
      if (inBounds) {
        child.timeline.resume();
      } else {
        child.timeline.isPaused = false;
      }
    });
  }

  // PRIVATE
  private update(time: number, isManual?: boolean) {
    //logger.debug(`ROOT update (${this.config.name})`);

    this.emitter.emit("beforeUpdate", time);

    if (this.duration !== -1) {
      if (this.currentTimelineTime > this.duration) {
        this.stop();
        if (this.numberOfRepeats === -1) {
          this.start();
        }
        return;
      }
    }

    // start all timelines that needs to be started that
    this.timelines.forEach((child, idx: number) => {
      const inBounds = isTimelineInBounds(
        this.currentTimelineTime,
        child.timeline.delay,
        child.timeline.duration
      );

      //console.log(child.timeline.config.name + ", inB: " + inBounds);
      if (inBounds) {
        if (!child.playing) {
          child.playing = true;
          child.timeline.start(isManual);
        }

        // log time
        //console.log(idx + ": " + (time - child.timeline.delay));

        child.timeline.update(time - child.timeline.delay, isManual);
      } else {
        if (child.playing) {
          if (child.timeline.config.name === "ExitTriggerTimeline-0") {
            //debugger;
          }
          child.playing = false;
          child.timeline.stop(
            isManual,
            isReverse(this.currentTimelineTime, child.timeline.delay)
          );
        }
      }
    });

    this.emitter.emit("update", time);
  }

  clear() {
    this.stop();
  }
  kill() {}

  repeat(numberOfRepeats: number) {
    this.numberOfRepeats = numberOfRepeats;
  }

  progress(position?: number, flag?: boolean) {
    // get
    if (!position) {
      return this.currentTimelineTime === 0
        ? 0
        : this.currentTimelineTime / this.duration;
    }

    // set
    this.currentTimelineTime = position * this.duration;
    this.deltaTickerTime = this.ticker.currentTickerTime;
    this.pauseTickerTime =
      this.ticker.currentTickerTime + position * this.duration;

    this.update(this.currentTimelineTime, true);
  }

  time() {
    return this.currentTimelineTime;
  }

  paused(p: boolean) {
    if (p === true) {
      this.pause();
    } else {
      this.resume();
    }
  }

  // tmp for gsap compatibility
  add(tl: Timeline) {
    this.addTimeline(tl);
  }

  addTimeline(tl: Timeline) {
    this.timelines.push({ playing: false, timeline: tl });
  }

  getChildById(id: string) {
    return this.timelines.find((tl) => tl.timeline.id === id)?.timeline;
  }

  getChildrenByGroup(groupName: string) {
    return this.timelines
      .filter((tl) => tl.timeline.group === groupName)
      .map((tlObj) => tlObj.timeline);
  }

  // setChildrenDisable(d: boolean) {
  //   return this.timelines.forEach((tl) => tl.timeline.setDisable(d));
  // }

  // removeTimeline(tl: Timeline) {
  //   remove(this.timelines, (t) => t.timeline === tl);
  // }
}
