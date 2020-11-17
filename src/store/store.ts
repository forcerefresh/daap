import {
  combineReducers,
  createStore,
  applyMiddleware,
} from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { ISlides, slides } from "./reducers/slides";
import { ILayers, layers } from "./reducers/layers";
import { ISelection, selection } from "./reducers/selection";
import { IStage, stage } from "./reducers/stage";
import { IObjects, objects } from "./reducers/objects";
import initialState from "./initial-state.json";

export interface IStore {
  slides: ISlides;
  layers: ILayers;
  objects: IObjects;
  selection: ISelection;
  stage: IStage;
}

const rootReducer = combineReducers({
  slides,
  layers,
  objects,
  selection,
  stage,
});

export const store = createStore(
  rootReducer,
  initialState as IStore,
  composeWithDevTools(applyMiddleware(thunk))
);
