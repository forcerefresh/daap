import { omit } from "lodash-es";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
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
  NEXT_TEXT_POSITION,
  SET_STAGE_PAN,
  OVERRIDE_STAGE_TOOL,
  CANCEL_OVERRIDE_STAGE_TOOL,
  SHOW_SIMPLIFIED_LAYERS,
  SHOW_SIMPLIFIED_PAGES,
  CREATE_NEW_PROJECT_FROM_EXISTING,
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
  pan: { x: number; y: number; currentX: number; currentY: number };
  previewState: IPreviewState;
  stageTool: { tool: StageTools; objectType?: string };
  activeStageTool: { tool: StageTools; objectType?: string };
  selectedDevice: DeviceType;
  forceRefreshRand: number;
  // text position
  nextTextPositionY: number;
  showSimplifiedLayerPanel: boolean;
  showSimplifiedPagesPanel: boolean;
}

const getStageDefault = (): IStage => ({
  stageViewportSize: { w: 0, h: 0 },
  zoomFit: true,
  zoom: 1,
  pan: { x: 0, y: 0, currentX: 0, currentY: 0 },
  previewState: {
    previewState: "stop",
    isPreview: false,
    scope: null,
    previewSpeed: 1,
    repeat: true,
  },
  stageTool: { tool: StageTools.SELECT },
  activeStageTool: { tool: StageTools.SELECT },
  selectedDevice: "device-independent",
  forceRefreshRand: 0,
  nextTextPositionY: 100,
  showSimplifiedLayerPanel: true,
  showSimplifiedPagesPanel: true,
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
    case SET_STAGE_PAN: {
      return {
        ...state,
        pan: { ...state.pan, ...action.payload },
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
        stageTool: { ...action.payload },
        activeStageTool: { ...action.payload },
      };
    }
    case OVERRIDE_STAGE_TOOL: {
      return {
        ...state,
        activeStageTool: { ...action.payload },
      };
    }
    case CANCEL_OVERRIDE_STAGE_TOOL: {
      return {
        ...state,
        activeStageTool: { ...state.stageTool },
      };
    }
    case SET_DEVICE: {
      return {
        ...state,
        selectedDevice: action.payload,
      };
    }
    case CREATE_NEW_PROJECT:
    case CREATE_NEW_PROJECT_FROM_EXISTING: {
      return { ...state, ...omit(getStageDefault(), "stageViewportSize") };
    }
    case NEXT_TEXT_POSITION: {
      return { ...state, nextTextPositionY: action.payload };
    }
    case SHOW_SIMPLIFIED_LAYERS: {
      return { ...state, showSimplifiedLayerPanel: action.payload };
    }
    case SHOW_SIMPLIFIED_PAGES: {
      return { ...state, showSimplifiedPagesPanel: action.payload };
    }
    default:
      return state;
  }
}
