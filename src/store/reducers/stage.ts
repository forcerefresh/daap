import {
  ActionTypes,
  SET_STAGE_PREVIEW,
  SET_STAGE_ZOOM,
} from "../actions/actions";

export interface IPreviewState {
  isPreview: boolean;
  previewState: "play" | "pause" | "stop";
  previewSpeed: number;
  repeat: boolean;
}

export interface IStage {
  zoom: number;
  previewState: IPreviewState;
}

export function stage(
  state: IStage = {
    zoom: 1,
    previewState: {
      previewState: "stop",
      isPreview: false,
      previewSpeed: 1,
      repeat: true,
    },
  },
  action: ActionTypes
) {
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
    default:
      return state;
  }
}
