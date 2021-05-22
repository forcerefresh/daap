import { Button } from "@blueprintjs/core";
import React, { useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import EffectConfigurationForm from "./effect-configuration/EffectConfigurationForm";

import css from "./EffectPanel.module.scss";

const EffectPanelSections = {
  IN: "IN",
  OUT: "OUT",
  EFFECT: "EFFECT",
  LAYER: "LAYER",
};

type IEffectPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    id: string | null | undefined;
    objectType?: "object" | "layer" | "slide";
    sections: string[];
  };

const EffectPanel: React.FC<IEffectPanel> = (props) => {
  const { id: objectOrLayerId, objectType, sections } = props;

  const [visibleSectionIds, setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({ IN: true, OUT: true, EFFECT: true, LAYER: true });

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
            {sections.indexOf(EffectPanelSections.IN) !== -1 && (
              <section>
                <div className={css.sectionHeader}>
                  <Button
                    minimal
                    onClick={() => toggleSection(EffectPanelSections.IN)}
                    small={true}
                    icon={
                      visibleSectionIds[EffectPanelSections.IN]
                        ? "caret-down"
                        : "caret-right"
                    }
                  ></Button>
                  effect in
                </div>
                {visibleSectionIds[EffectPanelSections.IN] && (
                  <EffectConfigurationForm
                    effectType={"in"}
                    objectOrLayerId={objectOrLayerId}
                    objectType={objectType}
                  />
                )}
              </section>
            )}

            {sections.indexOf(EffectPanelSections.OUT) !== -1 && (
              <section>
                <div className={css.sectionHeader}>
                  <Button
                    minimal
                    onClick={() => toggleSection(EffectPanelSections.OUT)}
                    small={true}
                    icon={
                      visibleSectionIds[EffectPanelSections.OUT]
                        ? "caret-down"
                        : "caret-right"
                    }
                  ></Button>
                  effect out
                </div>
                {visibleSectionIds[EffectPanelSections.OUT] && (
                  <EffectConfigurationForm
                    effectType={"out"}
                    objectOrLayerId={objectOrLayerId}
                    objectType={objectType}
                  />
                )}
              </section>
            )}

            {sections.indexOf(EffectPanelSections.EFFECT) !== -1 && (
              <section>
                <div className={css.sectionHeader}>
                  <Button
                    minimal
                    onClick={() => toggleSection(EffectPanelSections.EFFECT)}
                    small={true}
                    icon={
                      visibleSectionIds[EffectPanelSections.EFFECT]
                        ? "caret-down"
                        : "caret-right"
                    }
                  ></Button>
                  effect
                </div>
                {visibleSectionIds[EffectPanelSections.EFFECT] && (
                  <EffectConfigurationForm
                    effectType={"effect"}
                    objectOrLayerId={objectOrLayerId}
                    objectType={objectType}
                  />
                )}
              </section>
            )}

            {sections.indexOf(EffectPanelSections.LAYER) !== -1 && (
              <section>
                <div className={css.sectionHeader}>
                  <Button
                    minimal
                    onClick={() => toggleSection(EffectPanelSections.LAYER)}
                    small={true}
                    icon={
                      visibleSectionIds[EffectPanelSections.LAYER]
                        ? "caret-down"
                        : "caret-right"
                    }
                  ></Button>
                  layer
                </div>
                {visibleSectionIds[EffectPanelSections.LAYER] && (
                  <EffectConfigurationForm
                    effectType={"layer"}
                    objectOrLayerId={objectOrLayerId}
                    objectType={objectType}
                  />
                )}
              </section>
            )}
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
