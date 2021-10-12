import {
  combineReducers,
  createStore,
  applyMiddleware,
} from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import diff from "../3rd-party-libs/undo-redo/reducer";

import { composeWithDevTools } from "redux-devtools-extension";
import { slides } from "./reducers/slides";
import { layers } from "./reducers/layers";
import { ISelection, selection } from "./reducers/selection";
import { IStage, stage } from "./reducers/stage";
import { objects } from "./reducers/objects";
import { ISettings, settings } from "./reducers/settings";
import initialState from "./initial-state.json";
import { IDocument, document } from "./reducers/document";
import { IGlobals, globals } from "./reducers/globals";
import { IFonts, fonts } from "./reducers/fonts";
import { IMeta, meta } from "./reducers/meta";
import { ISlides } from "./reducers/i-slides";
import { ILayers } from "./reducers/i-layers";
import { IObjects } from "./reducers/i-objects";
import { editor, IEditor } from "./reducers/editor";
import { updateEditor } from "./actions/actions";

export interface IStore {
  project: {
    slides: ISlides;
    layers: ILayers;
    objects: IObjects;
    selection: ISelection;
    document: IDocument;
    settings: ISettings;
    diff: {
      prev: any[];
      next: any[];
    };
  };
  editor: IEditor;
  meta: IMeta;
  stage: IStage;
  globals: IGlobals;
  fonts: IFonts;
}

const project = diff(
  combineReducers({
    slides,
    layers,
    objects,
    selection,
    document,
    settings,
  }),
  {
    skipAction: (action: { type: string; isUndoable: boolean }) => {
      // NOTE:
      //  1. @@INIT we get in Chrome browser
      // 2. @@redux/@@INIT... we get in Edge browser
      return (
        action.type === "@@INIT" ||
        action.type.indexOf("@@redux/@@INIT") !== -1 ||
        !action.isUndoable
      );
    },
  }
) as any;

const rootReducer = combineReducers({
  meta,
  project,
  stage,
  globals,
  fonts,
  editor,
}) as any;

const logger = (store: any) => (next: any) => (action: any) => {
  //console.log("dispatching", action);
  let result = next(action);
  //console.log("next state", store.getState());
  return result;
};

const documentChange = (store: any) => (next: any) => (action: any) => {
  if (action.isUndoable) {
    store.dispatch(updateEditor({ sliderChanged: true }));
  }

  let result = next(action);
  return result;
};

export const store = createStore(
  rootReducer,
  //initialState as unknown as IStore,
  composeWithDevTools(applyMiddleware(documentChange, logger, thunk))
);
