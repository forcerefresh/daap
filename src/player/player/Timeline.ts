import { Shield } from "aws-sdk";
import { EventEmitter } from "events";
import { getAnimationDefinition } from "../../effects/register-animation";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { isTimelineInBounds } from "./timeline-utild";

type ITimelineConfig = {
  duration?: number;
  delay?: number;
  name?: string;
  id?: string;
} & { [key: string]: any };

export class Timeline {
  id?: string;
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
  constructor(config: ITimelineConfig) {
    // configuration
    this.config = config;
    if (config.id) this.id = config.id;
    if (config.duration) this.duration = config.duration;
    if (config.delay) this.delay = config.delay;

    // timeline trigger events (start/stop/update)
    this.emitter = new EventEmitter();

    // holder for child timelines
    this.timelines = [];
  }

  eventCallback(type: string, callback: any) {}

  play(_pos?: number) {
    this.start();
  }

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

    console.log(this.config.effectId);
    const animationDef = getAnimationDefinition(this.config.effectId);
    console.log(animationDef);

    if (animationDef) {
      this.animIns = animationDef.effectFunc();
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

  start(isManual?: boolean) {
    logger.debug(`Timeline start (${this.config.name})`);
    console.timeLog();

    this.emitter.emit("beforeStart");

    //this.playing = true;
    if (!isManual) this.isPaused = false;

    this.execStart(isManual);

    this.timelines.forEach((child) => {
      // START only timeline that have delay===0
      if (!child.playing && child.timeline.delay === 0) {
        child.playing = true;
        child.timeline.start(isManual);
      }
    });
    this.emitter.emit("start");
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
    console.timeLog();

    console.log("111111");
    this.emitter.emit("beforeStop");
    console.log("22222");

    //this.playing = false;

    this.execStop(isManual, isReverse);
    console.log("333");

    this.timelines.forEach((child) => {
      child.timeline.stop(isManual, isReverse);
    });
    console.log("444");

    this.emitter.emit("stop");
    console.log("5555");
  }

  update(time: number, isManual?: boolean) {
    logger.debug(`Timeline update (${this.config.name}); time: ${time}`);

    this.emitter.emit("beforeUpdate", time);

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
          child.timeline.start(isManual);
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

    this.emitter.emit("update", time);
  }

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

  execStart(isManual?: boolean) {
    this.animIns?.start?.(this.config, isManual);

    // if (this.config.effectId) {
    //   const animationDef = getAnimationDefinition(this.config.effectId);
    //   console.log(animationDef);
    //   animationDef?.start?.(this.config, isManual);
    // }
  }

  execStop(isManual?: boolean, isReverse?: boolean) {
    this.animIns?.stop?.(this.config, isManual, isReverse);

    // if (this.config.effectId) {
    //   const animationDef = getAnimationDefinition(this.config.effectId);
    //   console.log(animationDef);
    //   animationDef?.stop?.(this.config);
    // }
  }

  execUpdate(time: number, isManual?: boolean) {
    this.animIns?.update?.(this.config, time, isManual);

    // console.log("update1");

    // if (this.config.effectId) {
    //   console.log(time);
    //   const animationDef = getAnimationDefinition(this.config.effectId);
    //   animationDef?.update?.(this.config, time, isManual);
    //   console.log("update2");
    // }
  }

  execPause() {
    this.animIns?.pause?.(this.config);

    // console.log(this.config.effectId);
    // if (this.config.effectId) {
    //   const animationDef = getAnimationDefinition(this.config.effectId);
    //   console.log("PAUSE 1");
    //   animationDef?.pause?.(this.config);
    //   //console.log("update");
    // }
  }

  execResume() {
    this.animIns?.resume?.(this.config);

    // if (this.config.effectId) {
    //   const animationDef = getAnimationDefinition(this.config.effectId);
    //   animationDef?.resume?.(this.config);
    //   //console.log("update");
    // }
  }

  execInit() {
    this.animIns?.init?.(this.config);

    // if (this.config.effectId) {
    //   const animationDef = getAnimationDefinition(this.config.effectId);
    //   animationDef?.init?.(this.config);
    // }
  }

  execDestroy() {
    this.animIns?.destroy?.(this.config);
    // if (this.config.effectId) {
    //   const animationDef = getAnimationDefinition(this.config.effectId);
    //   animationDef?.destroy?.(this.config);
    // }
  }

  execRootStart() {
    this.animIns?.rootStart?.(this.config);
  }
  execRootStop() {
    this.animIns?.rootStop?.(this.config);
  }

  execSetDirection() {
    this.animIns?.direction?.(this.config, this.direction);
  }
}
