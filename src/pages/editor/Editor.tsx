import React from "react";
import SlidesPanel from "../../panels/slides-panel/SlidesPanel";
import LayersPanel from "../../panels/layers-panel/LayersPanel";
import PropertiesPanel from "../../panels/properties-panel/PropertiesPanel";
import MainLayout from "../../layouts/main-layout/MainLayout";
import ToolbarPanel from "../../panels/toolbar-panel/ToolbarPanel";
import ActionPanel from "../../panels/action-panel/ActionPanel";
import StagePanel from "../../panels/stage-panel/StagePanel";
import StaticEffectPanel from "../../panels/effect-panel/StaticEffectPanel";

function Editor() {
  return (
    <MainLayout
      slides={<SlidesPanel />}
      layers={<LayersPanel />}
      properties={<PropertiesPanel />}
      action={<ActionPanel />}
      toolbar={<ToolbarPanel />}
      content={<StagePanel />}
      effects={<StaticEffectPanel />}
    />
  );
}

export default Editor;
