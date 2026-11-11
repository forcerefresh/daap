import {
  createNewProject,
  CreateNewProjectActionPayload,
  createNewProjectFromExisting,
  Dispatch,
  doClearHistory,
  initializeSlideAndLayer,
  updateEditor,
} from "./actions";

export function setupNewProject(props: CreateNewProjectActionPayload): any {
  return function (dispatch: Dispatch | any) {
    dispatch(createNewProject(props));
    dispatch(doClearHistory());
    dispatch(initializeSlideAndLayer());
    dispatch(updateEditor({ isExistingProject: false, sliderChanged: false }));
    dispatch(doClearHistory());
  };
}

export function setupNewProjectFromExisting(
  props: CreateNewProjectActionPayload
): any {
  return function (dispatch: Dispatch | any) {
    dispatch(createNewProjectFromExisting(props));
    dispatch(doClearHistory());
    dispatch(updateEditor({ isExistingProject: false, sliderChanged: false }));
    dispatch(doClearHistory());
  };
}
