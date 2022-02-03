import gsap from "gsap";
import { executionCodeFuncType } from "./objects-factory";

export interface ExecCodeConfig {
  execCodeFunc_Start: executionCodeFuncType;
  execCodeFunc_Stop: executionCodeFuncType;
  values: { [key: string]: any };
  id: string;
  className: string;
  calculatedObjectSize: any;
  slideDuration: number;
}

gsap.registerEffect({
  name: "execCode",
  effect: function (targets: any, config: ExecCodeConfig) {
    const {
      id,
      values,
      className,
      slideDuration,
      calculatedObjectSize,
      execCodeFunc_Start,
      execCodeFunc_Stop,
    } = config;
    let isStarted = false;

    const onStart = () => {
      console.log("onstart exec code");
      execCodeFunc_Start({ id, className, values, calculatedObjectSize });
    };
    const onStop = () => {
      console.log("onstop exec code");
      execCodeFunc_Stop({ id, className, values, calculatedObjectSize });
    };

    var effConfig = {
      duration: slideDuration,

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
