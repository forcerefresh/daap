import React from "react";
import SlidesPanel from "../../panels/slides-panel/SlidesPanel";
import LayersPanel from "../../panels/layers-panel/LayersPanel";
import MainLayout from "../../layouts/main-layout/MainLayout";
import ToolbarPanel from "../../panels/toolbar-panel/ToolbarPanel";
import ActionPanel from "../../panels/action-panel/ActionPanel";
import FloatingActionPanel from "../../panels/floating-actions-panel/FloatingActionsPanel";
import StaticAnimationPanel from "../../panels/animation-panel/StaticAnimationPanel";
import PropertiesPanelAll from "../../panels/properties-panel-all/PropertiesPanelAll";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PropertiesPanelContextProvider } from "../../panels/properties-panel-all/PropertiesPanelProvider";
import QuickBarPanel from "../../panels/quick-bar-panel/QuickBarPanel";
import { ToolsProvider } from "../../utils/tools/ToolsProvider";
import LayersSimplified from "../../panels/layers-simplified/LayersSimplified";
import { StagePanelNewWrapper } from "../../panels/stage-panel-new/StagePanelNewWrapper";
import FloatingPointerPanel from "../../panels/floating-pointer-panel/FloatingPointerPanel";
import PagesSimplified from "../../panels/pages-simplified/PagesSimplified";

function Editor() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ToolsProvider>
        <MainLayout
          slides={<SlidesPanel />}
          layers={<LayersPanel />}
          layersSimplified={<LayersSimplified />}
          pagesSimplified={<PagesSimplified />}
          properties={
            <PropertiesPanelContextProvider>
              <PropertiesPanelAll />
            </PropertiesPanelContextProvider>
          }
          action={<ActionPanel />}
          toolbar={<ToolbarPanel />}
          content={<StagePanelNewWrapper />}
          animations={<StaticAnimationPanel />}
          quickBar={<QuickBarPanel />}
          floatingActions={<FloatingActionPanel />}
          floatingPointer={<FloatingPointerPanel />}
        />
      </ToolsProvider>
    </DndProvider>
  );
}

export default Editor;
