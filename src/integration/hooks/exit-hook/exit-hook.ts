import { useSelector } from "react-redux";
import { IStore } from "../../../store/store";
import { useEffect, useRef } from "react";

export const useExitHook = () => {
  const sliderChanged = useSelector(
    (state: IStore) => state.editor.sliderChanged
  );

  const sliderChangedRef = useRef(sliderChanged);
  sliderChangedRef.current = sliderChanged;

  useEffect(() => {
    let handlingNavigation = false;

    function handleNavigation(e: MouseEvent) {
      if (!sliderChangedRef.current) return;

      // Skip if this is already being handled
      if (handlingNavigation) return;

      const el = e.currentTarget as HTMLElement;

      // Skip anchor links, JavaScript links, and same-page hashes
      const href = el?.getAttribute?.("href");
      if (!href || href === "#" || href.startsWith("javascript:")) return;

      // Skip download links
      if (el?.getAttribute?.("download")) return;

      // Skip links that open in new tabs
      if (el?.getAttribute?.("target") === "_blank") return;

      handlingNavigation = true;

      if (
        !confirm("You have unsaved changes. Are you sure you want to leave?")
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }

      setTimeout(() => {
        handlingNavigation = false;
      }, 10);
    }

    document.addEventListener("click", handleNavigation);

    window.addEventListener("beforeunload", function (e) {
      if (sliderChangedRef.current && !handlingNavigation) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    });
  }, []);
};
