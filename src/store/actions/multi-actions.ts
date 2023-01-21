import { IStore } from "../store";
import {
  createNewProject,
  Dispatch,
  doClearHistory,
  initializeSlideAndLayer,
  updateEditor,
} from "./actions";

export function setupNewProject(): any {
  return function (dispatch: Dispatch | any, getState: () => IStore) {
    dispatch(createNewProject());
    dispatch(doClearHistory());
    dispatch(initializeSlideAndLayer());
    dispatch(updateEditor({ isExistingProject: false, sliderChanged: false }));
    dispatch(doClearHistory());
  };
}
