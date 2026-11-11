import React, { FC, useEffect, useState } from "react";
import { IObject } from "webslider-sdk/lib/objects/i-object";

export type ReplaceEventPayload = {
  objectId?: string;
  type: string;
  objectProps: Partial<IObject>;
  values: Record<string, unknown>;
};

interface GlobalEventsContextProps {
  replaceItem: ReplaceEventPayload | undefined;
  setReplaceItem: React.Dispatch<
    React.SetStateAction<ReplaceEventPayload | undefined>
  >;
}
export const GlobalEventsContext =
  React.createContext<GlobalEventsContextProps>({
    replaceItem: {} as ReplaceEventPayload | undefined,
    setReplaceItem: () => undefined,
  });

export const GlobalEventsProvider: FC<React.PropsWithChildren> = (props) => {
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
