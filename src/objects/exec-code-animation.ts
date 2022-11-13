import { ExecutionCodeFuncType } from "webslider-sdk/lib/objects/objects-register";
import { getConnectorBySourceId } from "webslider-sdk/lib/connectors/connector-manager";
import { logger } from "webslider-sdk/lib/utils/logger/logger";

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
    logger.object.debug("execCode init");

    getConnector = (sourceId: string) => getConnectorBySourceId(sourceId);
  }

  function rootStart(config: any) {
    logger.object.debug("execCode rootStart");
  }

  function rootStop(config: any) {
    logger.object.debug("execCode rootStop");
  }

  function start(config: any, isManual?: boolean) {
    logger.object.debug("execCode start");

    const { id, values, className, calculatedObjectSize, execStart } = config;

    execStart?.({
      id,
      className,
      values,
      calculatedObjectSize,
      getConnector: (sourceId: any) => {
        return getConnectorBySourceId(sourceId);
      },
    });
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.object.debug("execCode stop");

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
    logger.object.debug("execCode pause");
  }

  function resume(config: any) {
    logger.object.debug("execCode resume");
  }

  function direction(config: any, direction: number) {
    logger.object.debug("execCode reverse");
  }

  function destroy(config: any) {
    logger.object.debug("execCode destroy");

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
  animationId: "exec-code",
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
