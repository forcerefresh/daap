import { Tab, Tabs, Tag } from "@blueprintjs/core";
import classnames from "classnames";
import React from "react";
import { connect } from "react-redux";

import { IObject } from "../../webslider-sdk/src/objects/i-object";
import { updateLayer, updateObject } from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/i-layers";
import { IStore } from "../../store/store";
import StaticEffectPanel from "../effect-panel/StaticEffectPanel";
import NavigationPanel from "../navigation-panel/NavigationPanel";
import PropertiesPanel from "../properties-panel/PropertiesPanel";

import css from "./PropertiesPanelAll.module.scss";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const PropertiesPanelAll: React.FC<ISlidesPanel> = (props) => {
  const { panelName, totalEffectCounter } = props;

  return (
    <div className={css.propertiesPanelAll} key={panelName?.id}>
      <div className={css.panelHeader}>
        {panelName?.type.toUpperCase() || "PROPERTIES"}
        {panelName && (
          <span
            className={classnames(css.panelName, {
              /*[css.panelNameLayer]: panelName.type === "layer",*/
            })}
          >
            {" [ " + panelName.name + " ] "}
          </span>
        )}
      </div>

      <Tabs className={css.tabs}>
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
          id="effects-panel"
          title={
            <>
              <span>Effect</span> &nbsp;
              <Tag round intent="none" minimal className={css.tag}>
                {totalEffectCounter}
              </Tag>
            </>
          }
          panel={
            <StaticEffectPanel
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

        {/*<Tabs.Expander />
        <Button minimal icon="cog" />*/}
      </Tabs>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, layers, slides, selection } = state.project;
  const { activeObjectId, activeLayerId, activeSlideId } = selection;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;
  const slide = activeSlideId ? slides.slideById[activeSlideId] : null;

  let totalEffectCounter = 0;

  let panelName:
    | { name: string; type: "object" | "layer" | "slide"; id: string }
    | undefined;

  if (selection.selectionForProperties?.type === "layer" && layer) {
    panelName = { name: layer.name, type: "layer", id: layer.id };
    totalEffectCounter =
      (layer?.transitions?.in?.length || 0) +
      (layer?.transitions?.out?.length || 0) +
      (layer?.transitions?.layer?.length || 0);
  }

  if (selection.selectionForProperties?.type === "slide" && slide) {
    panelName = { name: slide.name, type: "slide", id: slide.id };
    totalEffectCounter = slide?.transitions?.slide?.length || 0;
  }

  if (selection.selectionForProperties?.type === "object" && object) {
    panelName = { name: object.name, type: "object", id: object.id };
    totalEffectCounter =
      (object?.transitions?.in?.length || 0) +
      (object?.transitions?.out?.length || 0) +
      (object?.transitions?.effect?.length || 0);
  }

  return {
    panelName,
    totalEffectCounter,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
};

export default connect(mapStateToProps, mapDispatchToProps)(PropertiesPanelAll);
