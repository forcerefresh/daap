import { ActionTypes, SET_DOCUMENT_SIZE } from "../actions/actions";

export interface IDocumentSize {
  width: number;
  height: number;
}

export interface IDocument {
  documentSize: IDocumentSize;
}

export function document(
  state: IDocument = {
    documentSize: { width: 960, height: 485 },
  },
  action: ActionTypes
) {
  switch (action.type) {
    case SET_DOCUMENT_SIZE: {
      return {
        ...state,
        stageSize: action.payload,
      };
    }
    default:
      return state;
  }
}
