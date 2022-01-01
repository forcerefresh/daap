import { Button, Tab, Tabs, Tag } from "@blueprintjs/core";
import classnames from "classnames";
import React from "react";
import { connect } from "react-redux";

import { IObject } from "../../objects/types";
import { updateLayer, updateObject } from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/i-layers";
import { IStore } from "../../store/store";
import StaticEffectPanel from "../effect-panel/StaticEffectPanel";
import PropertiesPanel from "../properties-panel/PropertiesPanel";

import css from "./PropertiesPanelAll.module.scss";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const PropertiesPanelAll: React.FC<ISlidesPanel> = (props) => {
  const { panelName, totalEffectCounter } = props;

  return (
    <div className={css.propertiesPanelAll} key={panelName?.id}>
      <div className={css.panelHeader}>
        {panelName?.type === "layer" ? "LAYER" : "OBJECT"}
        {panelName && (
          <span
            className={classnames(css.panelName, {
              [css.panelNameLayer]: panelName.type === "layer",
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
          panel={<PropertiesPanel hideHeader className={css.propertiesPanel} />}
        />
        <Tab
          id="global"
          title={
            <>
              <span>Effect</span> &nbsp;
              <Tag round intent="none" minimal className={css.tag}>
                {totalEffectCounter}
              </Tag>
            </>
          }
          panel={
            <StaticEffectPanel hideHeader className={css.propertiesPanel} />
          }
        />

        {/*<Tabs.Expander />
        <Button minimal icon="cog" />*/}
      </Tabs>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, layers, selection } = state.project;
  const { activeObjectId, activeLayerId } = selection;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;

  let totalEffectCounter = 0;

  let panelName:
    | { name: string; type: "object" | "layer"; id: string }
    | undefined;

  if (selection.selectionForProperties?.type === "layer" && layer) {
    panelName = { name: layer.name, type: "layer", id: layer.id };
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
