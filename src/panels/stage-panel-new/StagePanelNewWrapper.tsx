import React from "react";
import StagePanelNew from "./StagePanelNew";
import StageManagerProvider from "./StageManagerProvider";
import CursorProvider from "./CursorProvider";

export interface IStagePanelNewWrapper {}

export function StagePanelNewWrapper(props: IStagePanelNewWrapper) {
  return (
    <StageManagerProvider>
      <CursorProvider>
        <StagePanelNew />
      </CursorProvider>
    </StageManagerProvider>
  );
}
