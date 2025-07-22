import React, { useEffect, useState } from "react";
import { IObject } from "webslider-sdk/lib/objects/i-object";

export type ReplaceEventPayload = {
  objectId?: string;
  type: string;
  objectProps: Partial<IObject>;
  values: Record<string, unknown>;
};

export const GlobalEventsContext = React.createContext({
  replaceItem: {} as ReplaceEventPayload | undefined,
  setReplaceItem: (item: ReplaceEventPayload | undefined) => undefined,
});

export const GlobalEventsProvider = (
  props: React.PropsWithChildren<React.ReactNode>
) => {
  const [replaceItem, setReplaceItem] = useState<
    ReplaceEventPayload | undefined
  >(undefined);

  useEffect(() => {
    const replaceObjectCallback = (e: Event) => {
      const customEvent = e as CustomEvent<ReplaceEventPayload>;
      const payload = customEvent.detail;
      setReplaceItem(payload);

      switch (payload.type) {
        case "image":
        case "background": {
          window.dispatchEvent(new CustomEvent("OPEN_MEDIA_IMAGES_PANEL"));
          return;
        }
        case "shape": {
          window.dispatchEvent(new CustomEvent("OPEN_SHAPES_PANEL"));
          return;
        }
        case "text": {
          window.dispatchEvent(new CustomEvent("OPEN_TEXT_PANEL"));
          return;
        }
      }
    };

    window.addEventListener("REPLACE_OBJECT", replaceObjectCallback);

    return () => {
      window.removeEventListener("REPLACE_OBJECT", replaceObjectCallback);
    };
  });

  return (
    <GlobalEventsContext.Provider
      value={{
        replaceItem,
        setReplaceItem,
      }}
    >
      {props.children}
    </GlobalEventsContext.Provider>
  );
};
