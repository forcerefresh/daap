import {
  combineReducers,
  createStore,
  applyMiddleware,
} from "@reduxjs/toolkit";
import thunk from "redux-thunk";
//import undoable from "redux-undo";
import diff from "../libraries/redux-deep-diff/src/reducer";

import { composeWithDevTools } from "redux-devtools-extension";
import { ISlides, slides } from "./reducers/slides";
import { ILayers, layers } from "./reducers/layers";
import { ISelection, selection } from "./reducers/selection";
import { IStage, stage } from "./reducers/stage";
import { IObjects, objects } from "./reducers/objects";
import { ISettings, settings } from "./reducers/settings";
import initialState from "./initial-state.json";

export interface IStore {
  slides: ISlides;
  layers: ILayers;
  objects: IObjects;
  selection: ISelection;
  stage: IStage;
  settings: ISettings;
}

const rootReducer = diff(
  combineReducers({
    slides,
    layers,
    objects,
    selection,
    stage,
    settings,
  })
) as any;

const logger = (store: any) => (next: any) => (action: any) => {
  console.log("dispatching", action);
  let result = next(action);
  console.log("next state", store.getState());
  return result;
};

export const store = createStore(
  rootReducer,
  initialState as IStore,
  composeWithDevTools(applyMiddleware(logger, thunk))
);
