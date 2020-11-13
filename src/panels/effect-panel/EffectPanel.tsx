import { Button } from "@blueprintjs/core";
import React, { useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import EffectConfigurationForm from "./effect-configuration/EffectConfigurationForm";

import css from "./EffectPanel.module.scss";

const EffectPanelSections = {
  EFFECT_IN: "EFFECT_IN",
  EFFECT_OUT: "EFFECT_OUT",
};

type IEffectPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    objectId: string;
  };

const EffectPanel: React.FC<IEffectPanel> = (props) => {
  const { objectId } = props;

  const [visibleSectionIds, setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({ EFFECT_IN: true, EFFECT_OUT: true });

  const toggleSection = (section: string) => {
    setVisibleSectionIds({
      ...visibleSectionIds,
      [section]: !visibleSectionIds[section],
    });
  };

  return (
    <div className={css.effect}>
      <div className={css.panelHeader}>EFFECT PANEL</div>
      <div className={css.contentHolder}>
        <section>
          <div className={css.sectionHeader}>
            <Button
              minimal
              onClick={() => toggleSection(EffectPanelSections.EFFECT_IN)}
              small={true}
              icon={
                visibleSectionIds[EffectPanelSections.EFFECT_IN]
                  ? "caret-down"
                  : "caret-right"
              }
            ></Button>
            effect in
          </div>
          {visibleSectionIds[EffectPanelSections.EFFECT_IN] && (
            <EffectConfigurationForm effectType={"in"} objectId={objectId} />
          )}
        </section>
        <section>
          <div className={css.sectionHeader}>
            <Button
              minimal
              onClick={() => toggleSection(EffectPanelSections.EFFECT_OUT)}
              small={true}
              icon={
                visibleSectionIds[EffectPanelSections.EFFECT_OUT]
                  ? "caret-down"
                  : "caret-right"
              }
            ></Button>
            effect out
          </div>
          {visibleSectionIds[EffectPanelSections.EFFECT_OUT] && (
            <div> section content</div>
          )}
        </section>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  // const { object } = state;
  return {};
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(EffectPanel);
