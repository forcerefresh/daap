import { ObjectType } from "../../objects/types";
import {
  ActionTypes,
  CREATE_NEW_PROJECT,
  SET_STAGE_PREVIEW,
  SET_STAGE_TOOL,
  SET_STAGE_ZOOM,
} from "../actions/actions";

export interface IPreviewScope {
  entityType: "project" | "slide" | "layer" | "object";
  entityId: string;
}

export interface IPreviewState {
  isPreview: boolean;
  previewState: "play" | "pause" | "stop";
  paused?: boolean;
  //scrollbar?: boolean; // used only for testing temporary in the past
  previewSpeed: number;
  repeat: boolean;
  scope: IPreviewScope | null;
}

export enum StageTools {
  SELECT = "SELECT",
  PAN = "PAN",
  DRAW = "DRAW",
}

export interface IStage {
  zoom: number;
  previewState: IPreviewState;
  stageTool: { tool: StageTools; objectType?: ObjectType };
}

const getStageDefault = (): IStage => ({
  zoom: 1,
  previewState: {
    previewState: "stop",
    isPreview: false,
    scope: null,
    previewSpeed: 1,
    repeat: true,
  },
  stageTool: { tool: StageTools.SELECT },
});

export function stage(state: IStage = getStageDefault(), action: ActionTypes) {
  switch (action.type) {
    case SET_STAGE_ZOOM: {
      return {
        ...state,
        zoom: action.payload,
      };
    }
    case SET_STAGE_PREVIEW: {
      return {
        ...state,
        previewState: { ...state.previewState, ...action.payload },
      };
    }
    case SET_STAGE_TOOL: {
      return {
        ...state,
        stageTool: action.payload,
      };
    }
    case CREATE_NEW_PROJECT: {
      return getStageDefault();
    }
    default:
      return state;
  }
}
