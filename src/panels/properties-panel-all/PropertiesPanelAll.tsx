import React, { useContext } from "react";
import { connect } from "react-redux";

import { IStore } from "../../store/store";
import NavigationPanel from "../navigation-panel/NavigationPanel";
import PropertiesPanel from "../properties-panel/PropertiesPanel";

import css from "./PropertiesPanelAll.module.scss";
import PropertiesSectionsPanel from "../properties-sections-panel/PropertiesSectionsPanel";
import {
  PropertiesPanelContext,
  PropertiesPanelSection,
} from "./PropertiesPanelProvider";
import LayoutProperties from "../properties-panel/layout-properties/LayoutProperties";
import BasicProperties from "../properties-panel/basic-properties/BasicProperties";
import CommonStyleProperties from "../properties-panel/common-style/CommonStyleProperties";
import TransformProperties from "../properties-panel/transform-properties/TransformProperties";
import AlignPanel from "../align-panel/AlignPanel";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const PropertiesPanelAll: React.FC<ISlidesPanel> = (props) => {
  const { panelName } = props;

  const { activeSection } = useContext(PropertiesPanelContext);

  return (
    <div className={css.propertiesPanelAll} key={panelName?.id}>
      <PropertiesSectionsPanel />

      <div className={css.propertiesPanelPropertiesHolder}>
        {activeSection === PropertiesPanelSection.CommonStyle && (
          <CommonStyleProperties />
        )}

        {activeSection === PropertiesPanelSection.Transform && (
          <TransformProperties />
        )}

        {activeSection === PropertiesPanelSection.Properties && (
          <>
            <BasicProperties />
            <LayoutProperties />
            <div className={css.delimiter} />
            <PropertiesPanel
              className={"propertiesPanel " + css.propertiesPanel}
            />
          </>
        )}

        {activeSection === PropertiesPanelSection.Linking && (
          <NavigationPanel />
        )}

        {activeSection === PropertiesPanelSection.More && <AlignPanel onRequestClose={() => {}} />}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, layers, pages, selection } = state.project;
  const { activeObjectId, activeLayerId, activeSlideId } = selection;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;
  const slide = activeSlideId ? pages.pageById[activeSlideId] : null;

  let panelName:
    | { name?: string; type: "object" | "layer" | "slide"; id: string }
    | undefined;

  if (selection.selectionForProperties?.type === "layer" && layer) {
    panelName = { name: layer.name, type: "layer", id: layer.id };
  }

  if (selection.selectionForProperties?.type === "slide" && slide) {
    panelName = { name: slide.name, type: "slide", id: slide.id };
  }

  if (selection.selectionForProperties?.type === "object" && object) {
    panelName = { name: object.name, type: "object", id: object.id };
  }

  return {
    panelName,
    selectionForProperties: selection.selectionForProperties,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(PropertiesPanelAll);
