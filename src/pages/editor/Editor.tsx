import React from "react";
import SlidesPanel from "../../components/slides-panel/SlidesPanel";
import LayersPanel from "../../components/layers-panel/LayersPanel";
import PropertiesPanel from "../../components/properties-panel/PropertiesPanel";
import TimelinePanel from "../../components/timeline-panel/TimelinePanel";
import MainLayout from "../../components/main-layout/MainLayout";
import { Button, Icon } from "@blueprintjs/core";

function Editor() {
  return (
    <MainLayout
      properties={
        <>
          <SlidesPanel />
          <LayersPanel />
          <PropertiesPanel />
        </>
      }
      timeline={<TimelinePanel />}
      toolbar={
        <div style={{ textAlign: "center", padding: "8px 0px", color: "gray" }}>
          <Button minimal>
            <Icon
              icon="new-text-box"
              iconSize={32}
              style={{ padding: "16px" }}
            />
          </Button>
          <Button minimal>
            <Icon icon="add" iconSize={32} style={{ padding: "16px" }} />
          </Button>
          <Button minimal>
            <Icon icon="refresh" iconSize={32} style={{ padding: "16px" }} />
          </Button>
          <Button minimal>
            <Icon
              icon="group-objects"
              iconSize={32}
              style={{ padding: "16px" }}
            />
          </Button>
        </div>
      }
    />
  );
}

export default Editor;
