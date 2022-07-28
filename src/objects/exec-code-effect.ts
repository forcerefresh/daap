import gsap from "gsap";
import { ExecutionCodeFuncType } from "../webslider-sdk/src/objects/objects-register";
import { getConnectorBySourceId } from "../webslider-sdk/src/connectors/connector-manager";

export interface ExecCodeConfig {
  execStart: ExecutionCodeFuncType;
  execStop: ExecutionCodeFuncType;
  values: { [key: string]: any };
  id: string;
  className: string;
  calculatedObjectSize: any;
  slideDuration: number;
}

gsap.registerEffect({
  name: "execCode",
  effect: function (targets: any, config: ExecCodeConfig) {
    const getConnector = (sourceId: string) => getConnectorBySourceId(sourceId);

    const {
      id,
      values,
      className,
      slideDuration,
      calculatedObjectSize,
      execStart,
      execStop,
    } = config;
    let isStarted = false;

    const onStart = () => {
      execStart?.({
        id,
        className,
        values,
        calculatedObjectSize,
        getConnector: (sourceId) => {
          // console.log(sourceId);
          return getConnectorBySourceId(sourceId);
        },
      });
    };
    const onStop = () => {
      execStop?.({
        id,
        className,
        values,
        calculatedObjectSize,
        getConnector,
      });
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
