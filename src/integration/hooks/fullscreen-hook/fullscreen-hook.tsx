import { useEffect } from "react";
import { platformFlags } from "@platform/platform-flags";

export function useFullscreen(
  fullScreen: boolean,
  scaleUI: (zoom: number) => Promise<void>,
  appZoom: number,
) {
  useEffect(() => {
    if (platformFlags.hasWpContainerClass) {
      let el: HTMLElement | null = null;

      el = document.getElementById("daap-forcerefresh-container");
      if (el) {
        if (fullScreen) {
          el.classList.remove("daap-forcerefresh-container-fullviewport");
          el.classList.add("daap-forcerefresh-container-fullviewport");
        } else {
          el.classList.remove("daap-forcerefresh-container-fullviewport");
        }
      }

      el = document.getElementById("daap-forcerefresh-root");
      if (el) {
        if (fullScreen) {
          el.classList.remove("daap-forcerefresh-root-fullviewport");
          el.classList.add("daap-forcerefresh-root-fullviewport");
        } else {
          el.classList.remove("daap-forcerefresh-root-fullviewport");
        }
      }

      scaleUI(appZoom);
    }
  }, [fullScreen]);
}
