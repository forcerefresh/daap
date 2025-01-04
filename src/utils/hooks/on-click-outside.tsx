import { isArray } from "lodash-es";
import { RefObject, useEffect, useMemo } from "react";

// Hook
type Event = MouseEvent | TouchEvent;
function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void,
  skipClassName?: string | string[]
) {
  const skipClassNames = useMemo(
    () =>
      isArray(skipClassName)
        ? skipClassName
        : skipClassName
        ? [skipClassName]
        : undefined,
    [skipClassName]
  );

  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref?.current;
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains((event?.target as Node) || null)) {
        return;
      }

      console.log(skipClassNames);
      if (skipClassNames) {
        const foundSkip = skipClassNames.find((skipClassName) => {
          return !!(event?.target as HTMLElement)?.closest("." + skipClassName);
        });

        console.log(foundSkip);

        if (foundSkip) return;
      }

      handler(event);
    };

    document.addEventListener(`mousedown`, listener, { capture: true });
    document.addEventListener(`touchstart`, listener, { capture: true });
    return () => {
      document.removeEventListener(`mousedown`, listener, { capture: true });
      document.removeEventListener(`touchstart`, listener, { capture: true });
    };
    // Reload only if ref or handler changes
  }, [ref, handler, skipClassNames]);
}
export default useOnClickOutside;
