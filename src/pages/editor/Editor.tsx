import React from "react";
import SlidesPanel from "../../components/slides-panel/SlidesPanel";
import LayersPanel from "../../components/layers-panel/LayersPanel";
import PropertiesPanel from "../../components/properties-panel/PropertiesPanel";
import TimelinePanel from "../../components/timeline-panel/TimelinePanel";
import MainLayout from "../../components/main-layout/MainLayout";
import { Button, Icon } from "@blueprintjs/core";
import ToolbarPanel from "../../components/toolbar-panel/ToolbarPanel";
import ActionPanel from "../../components/action-panel/ActionPanel";

function Editor() {
  return (
    <MainLayout
      properties={
        <>
          <SlidesPanel />
          <LayersPanel />
          <PropertiesPanel />
          <ActionPanel />
        </>
      }
      timeline={<TimelinePanel />}
      toolbar={<ToolbarPanel />}
    />
  );
}

export default Editor;
