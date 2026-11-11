import { IItemsData } from "../export/i-export-html";
import {
  IExecCodeConfig,
  EXEC_CODE_ANIMATION,
} from "../objects/exec-code-animation";
import {
  ExecutionCodeFuncType,
  UpdateTimeFuncType,
} from "webslider-sdk/lib/objects/objects-register";
import { ITimelineConfig, Timeline } from "daap-player/dist/Timeline";
import { RootTimeline } from "daap-player/dist/RootTimeline";
export const DYNAMIC_OUT_EFF_TIMELINE_GROUP = "dynamic-out-eff-timeline-group";

export interface IEventTimeline {
  event: string;
  eventTargetId: string;
  reverseEvent: string;
  reverseEventTargetId: string;
  rootTimeline: RootTimeline;
}
export function createEventTimelineForObject(
  _data: IItemsData
): IEventTimeline[] {
  const eventTimelines: IEventTimeline[] = [];

  return eventTimelines;
}

export function createTimelineForObject(_data: IItemsData): {
  effTls: Timeline[];
  outEffTlExist: boolean;
} {
  const effTls: Timeline[] = [];
  let outEffTlExist = false;

  return {
    effTls,
    outEffTlExist,
  };
}

export function createTimelineForExecutionCode(
  data: IItemsData,
  onStart: ExecutionCodeFuncType | undefined,
  onStop: ExecutionCodeFuncType | undefined,
  onTimeUpdate: UpdateTimeFuncType | undefined,
  values: { [key: string]: any },
  calculatedObjectSize: any
): Timeline {
  const conf: IExecCodeConfig & ITimelineConfig = {
    name: "ExecCode",
    animationId: EXEC_CODE_ANIMATION,
    delay: 0,
    duration: 10000,
    //
    onStart,
    onStop,
    onTimeUpdate,
    values: values,
    id: data.itemId,
    className: data.objectClass,
    calculatedObjectSize,
  };

  const tl = new Timeline(conf);

  return tl;
}
