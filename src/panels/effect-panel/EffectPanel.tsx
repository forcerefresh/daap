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
    id: string | null | undefined;
    objectType?: "object" | "layer";
  };

const EffectPanel: React.FC<IEffectPanel> = (props) => {
  const { id: objectOrLayerId, objectType } = props;

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
      <div className={css.effectsHolder}>
        {objectOrLayerId ? (
          <>
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
                <EffectConfigurationForm
                  effectType={"in"}
                  objectOrLayerId={objectOrLayerId}
                  objectType={objectType}
                />
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
                <EffectConfigurationForm
                  effectType={"out"}
                  objectOrLayerId={objectOrLayerId}
                  objectType={objectType}
                />
              )}
            </section>
          </>
        ) : (
          <div>No object selected</div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  return {};
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(EffectPanel);
