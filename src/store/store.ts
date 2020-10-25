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
import { IObjects, objects } from "./reducers/objects";
import initialState from "./initial-state.json";
/*
const reduxDevTools =
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION__();*/

export interface IStore {
  slides: ISlides;
  layers: ILayers;
  objects: IObjects;
  selection: ISelection;
}
const rootReducer = combineReducers({
  slides,
  layers,
  objects,
  selection,
});
export const store = createStore(
  rootReducer,
  initialState as IStore,
  composeWithDevTools(applyMiddleware(thunk))
);
