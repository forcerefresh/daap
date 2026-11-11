import {
  combineReducers,
  createStore,
  applyMiddleware,
  Middleware,
  AnyAction,
  Reducer,
} from "@reduxjs/toolkit";
import thunk from "redux-thunk";
// @ts-ignore
import diff from "../3rd-party-libs/undo-redo/reducer";

import { composeWithDevTools } from "redux-devtools-extension";
import { pages } from "./reducers/pages";
import { layers } from "./reducers/layers";
import { ISelection, selection } from "./reducers/selection";
import { IStage, stage } from "./reducers/stage";
import { objects } from "./reducers/objects";
import { settings } from "./reducers/settings";
import { IAppSettings, globals } from "./reducers/globals";
import { IFonts, fonts } from "./reducers/fonts";
import { IMeta, meta } from "./reducers/meta";
import { IPages } from "./reducers/i-pages";
import { ILayers } from "./reducers/i-layers";
import { IObjects } from "./reducers/i-objects";
import { editor, IEditor } from "./reducers/editor";
import { updateEditor } from "./actions/actions";
import { IUIForms, uiforms } from "./reducers/uiforms";
import { ISettings } from "./reducers/i-settings";
import { IClipboard } from "./reducers/i-clipboard";
import { clipboard } from "./reducers/clipboard";
import { account, IAccount } from "./reducers/account";
import { ai, IAI } from "./reducers/ai";
import { IColors } from "./reducers/i-colors";
import { colors } from "./reducers/colors";

export interface IStore {
  project: {
    colors: IColors;
    clipboard: IClipboard;
    pages: IPages;
    layers: ILayers;
    objects: IObjects;
    selection: ISelection;
    settings: ISettings;
    diff: {
      prev: unknown[];
      next: unknown[];
    };
  };
  account: IAccount;
  editor: IEditor;
  meta: IMeta;
  stage: IStage;
  globals: IAppSettings;
  uiforms: IUIForms;
  fonts: IFonts;
  ai: IAI;
}

const project = diff(
  combineReducers({
    clipboard,
    pages,
    layers,
    objects,
    selection,
    settings,
    colors
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
) as Reducer<IStore["project"], AnyAction>;

const rootReducer = combineReducers({
  meta,
  project,
  stage,
  globals,
  fonts,
  editor,
  account,
  uiforms,
  ai,
}) as unknown as Reducer<IStore, AnyAction>;

const documentChange: Middleware = (store) => (next) => (action) => {
  const a = action as AnyAction;
  if (a.isUndoable && !a.skipHistory) {
    store.dispatch(updateEditor({ sliderChanged: true }));
  }
  return next(action);
};

export const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(documentChange, thunk))
);
