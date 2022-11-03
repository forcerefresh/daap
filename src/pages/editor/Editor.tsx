import React from "react";
import SlidesPanel from "../../panels/slides-panel/SlidesPanel";
import LayersPanel from "../../panels/layers-panel/LayersPanel";
import MainLayout from "../../layouts/main-layout/MainLayout";
import ToolbarPanel from "../../panels/toolbar-panel/ToolbarPanel";
import ActionPanel from "../../panels/action-panel/ActionPanel";
import StagePanel from "../../panels/stage-panel/StagePanel";
import StaticAnimationPanel from "../../panels/animation-panel/StaticAnimationPanel";
import PropertiesPanelAll from "../../panels/properties-panel-all/PropertiesPanelAll";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PropertiesPanelContextProvider } from "../../panels/properties-panel-all/PropertiesPanelProvider";

function Editor() {
  return (
    <DndProvider backend={HTML5Backend}>
      <MainLayout
        slides={<SlidesPanel />}
        layers={<LayersPanel />}
        properties={
          <PropertiesPanelContextProvider>
            <PropertiesPanelAll />
          </PropertiesPanelContextProvider>
        }
        action={<ActionPanel />}
        toolbar={<ToolbarPanel />}
        content={<StagePanel />}
        animations={<StaticAnimationPanel />}
      />
    </DndProvider>
  );
}

export default Editor;
