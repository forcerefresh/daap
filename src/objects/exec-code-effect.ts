import gsap from "gsap";
import { calculateObjectSize } from "../panels/stage-panel/StagePanelUtils";
import { executionCodeFuncType } from "./objects-factory";

export interface ExecCodeConfig {
  execCodeFunc: executionCodeFuncType;
  values: { [key: string]: any };
  className: string;
  calculatedObjectSize: any;
  slideDuration: number;
}

gsap.registerEffect({
  name: "execCode",
  effect: function (targets: any, config: ExecCodeConfig) {
    const {
      values,
      className,
      slideDuration,
      calculatedObjectSize,
      execCodeFunc,
    } = config;
    let isStarted = false;

    const onStart = () => {
      execCodeFunc(className, values, calculateObjectSize);
    };
    const onStop = () => {};

    var effConfig = {
      duration: config.slideDuration,

      onComplete: () => {
        onStop();
        isStarted = false;
      },
      onStart: () => {
        if (!isStarted) {
          onStart();
          isStarted = true;
        }
      },
      onUpdate: () => {
        if (!isStarted) {
          onStart();
          isStarted = true;
        }
      },
    };

    return gsap.to({}, effConfig);
  },
  defaults: {},
  extendTimeline: true,
});
