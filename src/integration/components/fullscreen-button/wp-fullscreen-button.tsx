import { useCallback, useEffect } from "react";
import { getFullscreenButtonComponentProps } from "../../../integration";
import { Button, Icon } from "@blueprintjs/core";

export const WpFullscreenButton: React.FC<getFullscreenButtonComponentProps> = (
  props
) => {
  const { isFullscreen, toggle, className } = props;

  const handleFCChange = useCallback((isFC: boolean) => {
    let el: HTMLElement | null = null;

    el = document.getElementById("daap-forcerefresh-container");
    if (el) {
      if (isFC) {
        el.classList.add("daap-forcerefresh-container-fullviewport");
      } else {
        el.classList.remove("daap-forcerefresh-container-fullviewport");
      }
    }

    el = document.getElementById("daap-forcerefresh-root");
    if (el) {
      if (isFC) {
        el.classList.add("daap-forcerefresh-root-fullviewport");
      } else {
        el.classList.remove("daap-forcerefresh-root-fullviewport");
      }
    }
  }, []);

  return (
    <Button
      minimal
      large
      className={className}
      icon={<Icon icon="fullscreen" size={25} />}
      onClick={() => {
        handleFCChange(!isFullscreen);
        toggle();
      }}
    ></Button>
  );
};
