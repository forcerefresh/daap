import React from "react";
import StagePanelNew from "./StagePanelNew";
import StageManagerProvider from "./StageManagerProvider";

export interface IStagePanelNewWrapper {}

export function StagePanelNewWrapper(props: IStagePanelNewWrapper) {
  return (
    <StageManagerProvider>
      <StagePanelNew />
    </StageManagerProvider>
  );
}
