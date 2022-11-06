import { EventEmitter } from "events";
import { getPlayerAnimationDefinition } from "webslider-sdk/lib/animations/animations-register";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { isTimelineInBounds } from "./timeline-utild";

export type ITimelineConfig = {
  duration?: number;
  delay?: number;
  name?: string;
  id?: string;
} & { [key: string]: any };

export class Timeline {
  id?: string;
  group?: string;
  config: ITimelineConfig;

  emitter: EventEmitter;

  // dynamic properties
  //playing = false;
  currentTime = 0;

  numberOfRepeats: number = 1;

  // static properties
  duration = -1;
  delay = 0;

  animIns: any;

  timelines: {
    playing: boolean; // when playhead is inside start and stop
    timeline: Timeline;
  }[];

  isPaused: boolean = false;

  //startTickerTime: number = 0;
  //pauseTickerTime: number = 0;
  //deltaTickerTime: number = 0;

  currentTimelineTime: number = 0;

  direction = 1;

  disable = false;

  timeCorrection = 0;

  constructor(config: ITimelineConfig) {
    // configuration
    this.config = config;
    if (config.id) this.id = config.id;
    if (config.group) this.group = config.group;
    if (config.duration) this.duration = config.duration;
    if (config.delay) this.delay = config.delay;

    // timeline trigger events (start/stop/update)
    this.emitter = new EventEmitter();

    // holder for child timelines
    this.timelines = [];
  }

  eventCallback(type: string, callback: any) {}

  decreaseDelay(time: number) {
    this.delay = this.config.delay! - time;
  }

  decreaseDuration(time: number, customDuration?: number) {
    this.duration = (customDuration || this.config.duration!) - time;
  }

  resetDelayToOriginal() {
    this.delay = this.config.delay!;
  }
  resetDurationToOriginal() {
    this.duration = this.config.duration!;
  }

  // play(_pos?: number) {
  //   this.start();
  // }

  /*tick_Handler(tickerTime: number) {
    //console.log(tickerTime);
    if (!this.isPaused && this.playing) {
      this.currentTimelineTime = tickerTime - this.deltaTickerTime;
      // check duration to call "stop"

      // start all timelines that needs to be started that
      this.timelines.forEach((child) => {
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
      });

      if (this.duration !== -1) {
        if (this.currentTimelineTime > this.duration) {
          this.stop();
          if (this.numberOfRepeats === -1) {
            this.start();
          }
          return;
        }
      }

      // if not stopped call "update"
      this.update(this.currentTimelineTime);
    }
  }*/

  setDirection(direction: number) {
    logger.debug(`Timeline reverse (${this.config.name})`);
    this.direction = direction;

    this.execSetDirection();

    this.timelines.forEach((child) => {
      child.timeline.setDirection(direction);
    });
  }

  init() {
    logger.debug(`Timeline init (${this.config.name})`);

    const animationDef = getPlayerAnimationDefinition(this.config.animationId);

    if (animationDef) {
      this.animIns = animationDef.animationFunc();
    }

    this.execInit();

    this.timelines.forEach((child) => {
      child.timeline.init();
    });
  }

  destroy() {
    logger.debug(`Timeline destroy (${this.config.name})`);

    this.execDestroy();

    this.emitter.removeAllListeners();
    //this.emitter.removeAllListeners("stop");

    this.timelines.forEach((child) => {
      child.timeline.destroy();
    });
  }

  start(isManual?: boolean, timeCorrection = 0) {
    logger.debug(`Timeline start (${this.config.name})`);

    this.emit("beforeStart");

    this.timeCorrection = timeCorrection;
    //this.playing = true;
    if (!isManual) this.isPaused = false;

    this.execStart(isManual, timeCorrection);

    this.timelines.forEach((child) => {
      // START only timeline that have delay===0
      if (!child.playing && child.timeline.delay === 0) {
        child.playing = true;
        child.timeline.start(isManual, timeCorrection);
      }
    });
    this.emit("start");
  }

  rootStart() {
    logger.debug(`Timeline rootStart (${this.config.name})`);

    this.execRootStart();
  }
  rootStop() {
    logger.debug(`Timeline rootStop (${this.config.name})`);

    this.execRootStop();
  }

  stop(isManual?: boolean, isReverse?: boolean) {
    logger.debug(`Timeline stop (${this.config.name})`);

    this.emit("beforeStop");

    //this.playing = false;

    this.execStop(isManual, isReverse);

    this.timelines.forEach((child) => {
      child.timeline.stop(isManual, isReverse);
    });

    this.emit("stop");
  }

  update(time: number, isManual?: boolean) {
    //logger.debug(`Timeline update (${this.config.name}); time: ${time}`);
    this.currentTimelineTime = time;
    this.emit("beforeUpdate", time);

    this.execUpdate(time, isManual);

    // start all timelines that needs to be started that
    this.timelines.forEach((child) => {
      const inBounds = isTimelineInBounds(
        this.currentTimelineTime,
        child.timeline.delay,
        child.timeline.duration
      );
      if (inBounds) {
        // if not started start it
        // NOTE: if manual position do not exec start
        if (!child.playing) {
          child.playing = true;
          child.timeline.start(isManual, this.timeCorrection);
          //if (this.isPaused) child.timeline.pause();
        }

        child.timeline.update(time - child.timeline.delay, isManual);
      } /*else {
        if (child.playing) {
          child.playing = false;
          child.timeline.stop();
          //if (this.isPaused) child.timeline.pause();
        }
      }*/
    });

    this.emit("update", time);
  }

  updateSize = (props: { slideWidth: number; slideHeight: number }) => {
    this.execUpdateSize(props);
  };

  clear() {
    this.stop();
  }
  kill() {
    //this.stop();
  }

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

    this.update(this.currentTimelineTime, true);
  }

  timeScale(scale: number) {}

  time() {
    return this.currentTimelineTime;
  }

  pause() {
    logger.debug(`Timeline pause (${this.config.name})`);

    this.isPaused = true;

    this.timelines.forEach((child) => {
      child.timeline.pause();
    });

    this.execPause();
  }

  resume() {
    logger.debug(`Timeline resume (${this.config.name})`);

    this.isPaused = false;

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

    this.execResume();
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

  execStart(isManual?: boolean, timeCorrection = 0) {
    if (this.disable) return;

    this.animIns?.start?.(this.config, isManual, timeCorrection);

    // if (this.config.animationId) {
    //   const animationDef = getAnimationDefinition(this.config.animationId);
    //   console.log(animationDef);
    //   animationDef?.start?.(this.config, isManual);
    // }
  }

  execStop(isManual?: boolean, isReverse?: boolean) {
    if (this.disable) return;

    this.animIns?.stop?.(this.config, isManual, isReverse);

    // if (this.config.animationId) {
    //   const animationDef = getAnimationDefinition(this.config.animationId);
    //   console.log(animationDef);
    //   animationDef?.stop?.(this.config);
    // }
  }

  execUpdate(time: number, isManual?: boolean) {
    if (this.disable) return;

    this.animIns?.update?.(this.config, time, isManual);

    // console.log("update1");

    // if (this.config.animationId) {
    //   console.log(time);
    //   const animationDef = getAnimationDefinition(this.config.animationId);
    //   animationDef?.update?.(this.config, time, isManual);
    //   console.log("update2");
    // }
  }

  execPause() {
    if (this.disable) return;

    this.animIns?.pause?.(this.config);

    // console.log(this.config.animationId);
    // if (this.config.animationId) {
    //   const animationDef = getAnimationDefinition(this.config.animationId);
    //   console.log("PAUSE 1");
    //   animationDef?.pause?.(this.config);
    //   //console.log("update");
    // }
  }

  execResume() {
    if (this.disable) return;

    this.animIns?.resume?.(this.config);

    // if (this.config.animationId) {
    //   const animationDef = getAnimationDefinition(this.config.animationId);
    //   animationDef?.resume?.(this.config);
    //   //console.log("update");
    // }
  }

  execInit() {
    if (this.disable) return;
    this.animIns?.init?.(this.config);

    // if (this.config.animationId) {
    //   const animationDef = getAnimationDefinition(this.config.animationId);
    //   animationDef?.init?.(this.config);
    // }
  }

  execDestroy() {
    this.animIns?.destroy?.(this.config);
    // if (this.config.animationId) {
    //   const animationDef = getAnimationDefinition(this.config.animationId);
    //   animationDef?.destroy?.(this.config);
    // }
  }

  execRootStart() {
    if (this.disable) return;

    this.animIns?.rootStart?.(this.config);
  }
  execRootStop() {
    if (this.disable) return;

    this.animIns?.rootStop?.(this.config);
  }

  execSetDirection() {
    if (this.disable) return;
    this.animIns?.direction?.(this.config, this.direction);
  }

  execUpdateSize = (props: { slideWidth: number; slideHeight: number }) => {
    if (this.disable) return;
    this.animIns?.updateSize?.(this.config, props);
  };

  setDisable(d: boolean) {
    this.disable = d;
  }

  emit<T>(ev: string, data?: T) {
    if (!this.disable) {
      this.emitter.emit(ev, data);
    }
  }
}
