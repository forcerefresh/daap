import { Tab, Tabs, Tag } from "@blueprintjs/core";
import classnames from "classnames";
import React, { useContext } from "react";
import { connect } from "react-redux";

import { IObject } from "webslider-sdk/lib/objects/i-object";
import { updateLayer, updateObject } from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/i-layers";
import { IStore } from "../../store/store";
import StaticAnimationPanel from "../animation-panel/StaticAnimationPanel";
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
import { PanelHeader } from "../common/panel-header/PanelHeader";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const PropertiesPanelAll: React.FC<ISlidesPanel> = (props) => {
  const { panelName, totalAnimationCounter } = props;

  const { activeSection } = useContext(PropertiesPanelContext);

  const entityType2Name: Record<string, string> = {
    object: "Object",
    layer: "Layer",
    slide: "Page",
  };

  return (
    <div className={css.propertiesPanelAll} key={panelName?.id}>
      {/* <PanelHeader>
        {entityType2Name[panelName?.type ?? ""]?.toUpperCase() || "PROPERTIES"}
        {panelName && <span className={css.panelName}>{panelName.name}</span>}
      </PanelHeader> */}
      <PropertiesSectionsPanel />

      <div className={css.propertiesPanelPropertiesHolder}>
        {/* {activeSection === PropertiesPanelSection.Layout && <LayoutProperties />} */}

        {/* {activeSection === PropertiesPanelSection.Basic && <BasicProperties />} */}

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
            <PropertiesPanel
              className={"propertiesPanel " + css.propertiesPanel}
            />
          </>
        )}

        {/* {activeSection === PropertiesPanelSection.Animation && (
        <StaticAnimationPanel
          hideHeader
          className={"propertiesPanel " + css.propertiesPanel}
        />
      )} */}

        {activeSection === PropertiesPanelSection.Linking && (
          <NavigationPanel />
        )}

        {/*<Tabs className={css.tabs}>
        <Tab
          id="properties-panel"
          title="Properties"
          panel={
            <PropertiesPanel
              hideHeader
              className={"propertiesPanel " + css.propertiesPanel}
            />
          }
        />
        <Tab
          id="animation-panel"
          title={
            <>
              <span>Animation</span> &nbsp;
              <Tag round intent="none" minimal className={css.tag}>
                {totalAnimationCounter}
              </Tag>
            </>
          }
          panel={
            <StaticAnimationPanel
              hideHeader
              className={"propertiesPanel " + css.propertiesPanel}
            />
          }
        />

        {panelName?.type === "object" && (
          <Tab
            id="nav-panel"
            title={
              <>
                <span>Navigation</span>
              </>
            }
            panel={<NavigationPanel />}
          />
        )}
      </Tabs>*/}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, layers, slides, selection } = state.project;
  const { activeObjectId, activeLayerId, activeSlideId } = selection;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;
  const slide = activeSlideId ? slides.slideById[activeSlideId] : null;

  let totalAnimationCounter = 0;

  let panelName:
    | { name: string; type: "object" | "layer" | "slide"; id: string }
    | undefined;

  if (selection.selectionForProperties?.type === "layer" && layer) {
    panelName = { name: layer.name, type: "layer", id: layer.id };
    totalAnimationCounter =
      (layer?.transitions?.in?.length || 0) +
      (layer?.transitions?.out?.length || 0) +
      (layer?.transitions?.layer?.length || 0);
  }

  if (selection.selectionForProperties?.type === "slide" && slide) {
    panelName = { name: slide.name, type: "slide", id: slide.id };
    totalAnimationCounter = slide?.transitions?.slide?.length || 0;
  }

  if (selection.selectionForProperties?.type === "object" && object) {
    panelName = { name: object.name, type: "object", id: object.id };
    totalAnimationCounter =
      (object?.transitions?.in?.length || 0) +
      (object?.transitions?.out?.length || 0) +
      (object?.transitions?.animation?.length || 0) +
      (object?.transitions?.event?.length || 0);
  }

  return {
    panelName,
    totalAnimationCounter,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
};

export default connect(mapStateToProps, mapDispatchToProps)(PropertiesPanelAll);
