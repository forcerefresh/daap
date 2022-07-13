import React, { useState } from "react";
import { DevelopmentItem } from "../../panels/development-panel/i-development-types";

type UpdateType = React.Dispatch<React.SetStateAction<IPreviewTimeline>>;
const defaultUpdate: UpdateType = () => ({ progress: 0, time: 0, slideIdx: 0 });

export interface IPreviewTimeline {
  progress: number;
  time: number;
  slideIdx: number;
}

export const PreviewTimelineContext = React.createContext({
  previewTimelineState: { progress: 0, time: 0, slideIdx: 0 },
  setPreviewTimelineState: defaultUpdate,
});

export const PreviewTimelineContextProvider = (
  props: React.PropsWithChildren<React.ReactNode>
) => {
  const [previewTimelineState, setPreviewTimelineState] =
    useState<IPreviewTimeline>({ progress: 0, time: 0, slideIdx: 0 });

  return (
    <PreviewTimelineContext.Provider
      value={{
        previewTimelineState,
        setPreviewTimelineState,
      }}
    >
      {props.children}
    </PreviewTimelineContext.Provider>
  );
};
