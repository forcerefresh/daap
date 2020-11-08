import {
  ActionTypes,
  SET_STAGE_SIZE,
  SET_STAGE_ZOOM,
} from "../actions/actions";

export interface IStageSize {
  width: number;
  height: number;
}

export interface IStage {
  stageSize: IStageSize;
  zoom: number;
}

export function stage(
  state: IStage = { stageSize: { width: 960, height: 485 }, zoom: 1 },
  action: ActionTypes
) {
  switch (action.type) {
    case SET_STAGE_SIZE: {
      return {
        ...state,
        stageSize: action.payload,
      };
    }
    case SET_STAGE_ZOOM: {
      return {
        ...state,
        zoom: action.payload,
      };
    }
    default:
      return state;
  }
}
