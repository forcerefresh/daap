import { ExecutionCodeFuncType } from "../webslider-sdk/src/objects/objects-register";
import { getConnectorBySourceId } from "../webslider-sdk/src/connectors/connector-manager";
import { logger } from "../webslider-sdk/src/utils/logger/logger";

export interface IExecCodeConfig {
  execStart: ExecutionCodeFuncType;
  execStop: ExecutionCodeFuncType;
  values: { [key: string]: any };
  id: string;
  className: string;
  calculatedObjectSize: any;
}

export function execCodeAnimation() {
  let getConnector: unknown;

  function init(config: IExecCodeConfig) {
    logger.debug("execCode init");

    getConnector = (sourceId: string) => getConnectorBySourceId(sourceId);
  }

  function rootStart(config: any) {
    logger.debug("execCode rootStart");
  }

  function rootStop(config: any) {
    logger.debug("execCode rootStop");
  }

  function start(config: any, isManual?: boolean) {
    logger.debug("execCode start");

    const { id, values, className, calculatedObjectSize, execStart } = config;

    execStart?.({
      id,
      className,
      values,
      calculatedObjectSize,
      getConnector: (sourceId: any) => {
        // console.log(sourceId);
        return getConnectorBySourceId(sourceId);
      },
    });
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug("execCode stop");

    const { id, values, className, calculatedObjectSize, execStop } = config;

    execStop?.({
      id,
      className,
      values,
      calculatedObjectSize,
      getConnector,
    });
  }

  function update(config: any, time: number, isManual?: boolean) {}

  function pause(config: any) {
    logger.debug("execCode pause");
  }

  function resume(config: any) {
    logger.debug("execCode resume");
  }

  function direction(config: any, direction: number) {
    logger.debug("execCode reverse");
  }

  function destroy(config: any) {
    logger.debug("execCode destroy");

    const { id, values, className, calculatedObjectSize, execStop } = config;

    execStop?.({
      id,
      className,
      values,
      calculatedObjectSize,
      getConnector,
    });
  }

  return {
    init,
    rootStart,
    start,
    update,
    stop,
    rootStop,
    pause,
    resume,
    direction,
    destroy,
  };
}

export const execCodeAppDef = {
  effectId: "exec-code",
  formDefaults: {},
  formDefinition: {
    id: "exec-code",
    name: "",
    form: [],
  },
};

export const execCodePlayerDef = {
  animationId: "exec-code",
  animationFunc: execCodeAnimation,
};
