import React from "react";
import SlidesPanel from "../../panels/slides-panel/SlidesPanel";
import LayersPanel from "../../panels/layers-panel/LayersPanel";
import PropertiesPanel from "../../panels/properties-panel/PropertiesPanel";
//import TimelinePanel from "../../panels/timeline-panel/TimelinePanel";
import MainLayout from "../../layouts/main-layout/MainLayout";
import ToolbarPanel from "../../panels/toolbar-panel/ToolbarPanel";
import ActionPanel from "../../panels/action-panel/ActionPanel";
import StagePanel from "../../panels/stage-panel/StagePanel";

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
      timeline={<div></div>}
      toolbar={<ToolbarPanel />}
      content={<StagePanel />}
    />
  );
}

export default Editor;
