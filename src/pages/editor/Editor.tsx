import React from "react";
import SlidesPanel from "../../panels/slides-panel/SlidesPanel";
import LayersPanel from "../../panels/layers-panel/LayersPanel";
import PropertiesPanel from "../../panels/properties-panel/PropertiesPanel";
import MainLayout from "../../layouts/main-layout/MainLayout";
import ToolbarPanel from "../../panels/toolbar-panel/ToolbarPanel";
import ActionPanel from "../../panels/action-panel/ActionPanel";
import StagePanel from "../../panels/stage-panel/StagePanel";
import StaticEffectPanel from "../../panels/effect-panel/StaticEffectPanel";
import PropertiesPanelAll from "../../panels/properties-panel-all/PropertiesPanelAll";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function Editor() {
  return (
    <DndProvider backend={HTML5Backend}>
      <MainLayout
        slides={<SlidesPanel />}
        layers={<LayersPanel />}
        properties={<PropertiesPanelAll />}
        action={<ActionPanel />}
        toolbar={<ToolbarPanel />}
        content={<StagePanel />}
        effects={<StaticEffectPanel />}
      />
    </DndProvider>
  );
}

export default Editor;
