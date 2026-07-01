import { useSelector } from "react-redux";
import { IStore } from "../../../store/store";

export const useExitHook = () => {
  const sliderChanged = useSelector(
    (state: IStore) => state.editor.sliderChanged
  );

  // NOTE: sets global DAAP_isDirty which will be used in WP plugin
  window.DAAP_isDirty = sliderChanged;
};
