import { IStore } from "../store";
import {
  createNewProject,
  CreateNewProjectActionPayload,
  Dispatch,
  doClearHistory,
  initializeSlideAndLayer,
  updateEditor,
} from "./actions";

export function setupNewProject(props: CreateNewProjectActionPayload): any {
  return function (dispatch: Dispatch | any, getState: () => IStore) {
    dispatch(createNewProject(props));
    dispatch(doClearHistory());
    dispatch(initializeSlideAndLayer());
    dispatch(updateEditor({ isExistingProject: false, sliderChanged: false }));
    dispatch(doClearHistory());
  };
}
