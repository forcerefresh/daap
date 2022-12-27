import {
  ExecutionCodeFuncType,
  UpdateTimeFuncType,
} from "webslider-sdk/lib/objects/objects-register";
import { getConnectorBySourceId } from "webslider-sdk/lib/connectors/connector-manager";
import { logger } from "webslider-sdk/lib/utils/logger/logger";

export const EXEC_CODE_ANIMATION = "exec-code";

export interface IExecCodeConfig {
  execStart?: ExecutionCodeFuncType;
  execStop?: ExecutionCodeFuncType;
  updateTime?: UpdateTimeFuncType;
  values: { [key: string]: any };
  id: string;
  className: string;
  calculatedObjectSize: any;
}

export function execCodeAnimation() {
  let getConnector: unknown;

  function init(config: IExecCodeConfig) {
    logger.player.debug("exec-code:init");

    getConnector = (sourceId: string) => getConnectorBySourceId(sourceId);
  }

  function rootStart(config: any) {
    logger.player.debug("exec-code:rootStart");
  }

  function rootStop(config: any) {
    logger.player.debug("exec-code:rootStop");
  }

  function start(config: any, isManual?: boolean) {
    logger.player.debug("exec-code: start");

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
    logger.player.debug("exec-code: stop");

    const { id, values, className, calculatedObjectSize, execStop } = config;

    execStop?.({
      id,
      className,
      values,
      calculatedObjectSize,
      getConnector,
    });
  }

  function update(config: any, time: number, isManual?: boolean) {
    logger.player.debug("exec-code: update");

    const {
      id,
      values,
      className,
      calculatedObjectSize,
      duration,
      updateTime,
    } = config;

    updateTime?.({
      id,
      className,
      values,
      calculatedObjectSize,
      getConnector,
      duration,
      currentTime: time,
    });
  }

  function pause(config: any) {
    logger.player.debug("exec-code:pause");
  }

  function resume(config: any) {
    logger.player.debug("exec-code:resume");
  }

  function direction(config: any, direction: number) {
    logger.player.debug("exec-code:reverse");
  }

  function destroy(config: any) {
    logger.player.debug("exec-code:destroy");

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
  animationId: EXEC_CODE_ANIMATION,
  formDefaults: {},
  formDefinition: {
    id: EXEC_CODE_ANIMATION,
    name: "",
    form: [],
  },
};

export const execCodePlayerDef = {
  animationId: EXEC_CODE_ANIMATION,
  animationFunc: execCodeAnimation,
};
