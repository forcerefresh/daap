import { omit } from "lodash";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import { ObjectType } from "webslider-sdk/lib/objects/i-object";
import {
  ActionTypes,
  CREATE_NEW_PROJECT,
  SET_DEVICE,
  SET_STAGE_PREVIEW,
  SET_STAGE_TOOL,
  SET_STAGE_ZOOM,
  VIEWPORT_SIZE,
  FORCE_REFRESH,
  ZOOM_FIT,
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
  //DRAW = "DRAW",
}

export interface IStage {
  stageViewportSize: { w: number; h: number };
  zoomFit: boolean;
  zoom: number;
  previewState: IPreviewState;
  stageTool: { tool: StageTools; objectType?: ObjectType };
  selectedDevice: DeviceType;
  forceRefreshRand: number;
}

const getStageDefault = (): IStage => ({
  stageViewportSize: { w: 0, h: 0 },
  zoomFit: true,
  zoom: 1,
  previewState: {
    previewState: "stop",
    isPreview: false,
    scope: null,
    previewSpeed: 1,
    repeat: true,
  },
  stageTool: { tool: StageTools.SELECT },
  selectedDevice: "large-1",
  forceRefreshRand: 0,
});

export function stage(state: IStage = getStageDefault(), action: ActionTypes) {
  switch (action.type) {
    case VIEWPORT_SIZE: {
      return {
        ...state,
        stageViewportSize: action.payload,
      };
    }
    case FORCE_REFRESH: {
      return {
        ...state,
        forceRefreshRand: Math.random(),
      };
    }
    case SET_STAGE_ZOOM: {
      return {
        ...state,
        zoom: action.payload,
      };
    }
    case ZOOM_FIT: {
      return {
        ...state,
        zoomFit: action.payload,
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
    case SET_DEVICE: {
      return {
        ...state,
        selectedDevice: action.payload,
      };
    }
    case CREATE_NEW_PROJECT: {
      return { ...state, ...omit(getStageDefault(), "stageViewportSize") };
    }
    default:
      return state;
  }
}
