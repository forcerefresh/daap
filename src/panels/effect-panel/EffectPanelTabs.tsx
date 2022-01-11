import { Button, Icon, Tab, Tabs, Tag, Tooltip } from "@blueprintjs/core";
import classnames from "classnames";
import { cloneDeep } from "lodash-es";
import React, { useState } from "react";
import { connect } from "react-redux";
import { getEffectsOptions } from "../../effects/effects";
import { EffectType } from "../../effects/types";
import {
  IObject,
  ItemType,
  ITransition,
  ITransitions,
} from "../../objects/types";
import {
  updateLayer,
  updateObject,
  updateSlide,
  _updateObject,
} from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/i-layers";
import { ISlide } from "../../store/reducers/i-slides";
import { IStore } from "../../store/store";
import { EffectConfigurationForm } from "../effect-configuration/EffectConfigurationForm";

import css from "./EffectPanelTabs.module.scss";
import {
  effectType2Name,
  getDefaultEffectConfigForType,
  getEffectTypesForItem,
} from "./EffectPanelUtils";

type IEffectPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    id: string | undefined;
    itemType: ItemType | undefined;
    //
    hideHeader?: boolean;
    className?: string;
  };

const EffectPanelTabs: React.FC<IEffectPanel> = (props) => {
  const {
    id,
    itemType,
    hideHeader,
    className,
    objectById,
    layerById,
    slideById,
    _updateLayer,
    _updateObject,
    _updateSlide,
  } = props;

  const sections = getEffectTypesForItem(itemType);

  const [selectedNo, setSelectedNo] = useState<{ [key: string]: number }>({
    in: 0,
    out: 0,
    effect: 0,
    layer: 0,
    slide: 0,
  });

  console.log(id);

  console.log(sections);

  let item: any | undefined;
  let transitions: ITransitions | undefined;
  if (id) {
    switch (itemType) {
      case "object": {
        item = objectById[id];
        transitions = (objectById[id] as IObject).transitions;
        break;
      }
      case "layer": {
        item = layerById[id];
        transitions = (layerById[id] as ILayer).transitions;
        break;
      }
      case "slide": {
        item = slideById[id];
        transitions = (slideById[id] as ISlide).transitions;
        break;
      }
    }
  }

  const removeHandler = (effectType: EffectType, idx: number) => {
    const newItem = cloneDeep(item);
    newItem.transitions[effectType].splice(idx, 1);
    if (itemType === "object") _updateObject(newItem);
    if (itemType === "layer") _updateLayer(newItem);
    if (itemType === "slide") _updateSlide(newItem);
    setSelectedNo({ ...selectedNo, [effectType]: Math.max(0, idx - 1) });
  };

  const transitionChangeHandler = (
    idx: number,
    effectType: EffectType,
    value: ITransition
  ) => {
    const newItem = cloneDeep(item);
    newItem.transitions[effectType][idx] = value;
    if (itemType === "object") _updateObject(newItem);
    if (itemType === "layer") _updateLayer(newItem);
    if (itemType === "slide") _updateSlide(newItem);
  };

  const addEffectToSection = (
    effectType: EffectType,
    isStructural: boolean
  ) => {
    const newItem = cloneDeep(item);
    const length = newItem.transitions[effectType].length;
    setSelectedNo({ ...selectedNo, [effectType]: length });

    newItem.transitions[effectType].push(
      getDefaultEffectConfigForType(effectType, isStructural)
    );
    if (itemType === "object") _updateObject(newItem);
    if (itemType === "layer") _updateLayer(newItem);
    if (itemType === "slide") _updateSlide(newItem);
  };

  const getEffectName = (effectType: EffectType, effectId: string) =>
    getEffectsOptions(effectType).find((item) => item.value === effectId)
      ?.label;

  const renderSection = (section: EffectType) => {
    const effLen = transitions?.[section]?.length || 0;
    const effects = transitions?.[section] || [];

    const hasStructuredEff = !!effects.find((eff) => !eff.canBeCombined);
    const isAddDisabled = hasStructuredEff ? true : false;
    const disabledMessage = hasStructuredEff
      ? "Only one Structure Effect is allowed"
      : "";

    return (
      <Tab
        className={css.tab}
        defaultChecked={true}
        id={section}
        title={
          <span>
            {effectType2Name(section)} &nbsp;
            <Tag round intent="none" minimal className={css.tag}>
              {transitions?.[section]?.length}
            </Tag>
          </span>
        }
        panel={
          <>
            <div className={css.effLabels}>
              {effects.map((effect, effectIdx) => {
                return (
                  <Tag
                    active={selectedNo[section] === effectIdx}
                    minimal
                    onClick={() => {
                      setSelectedNo({ ...selectedNo, [section]: effectIdx });
                    }}
                  >
                    {effectIdx + 1}.
                    <Icon
                      icon={effect.canBeCombined ? "graph" : "grid-view"}
                      size={12}
                      style={{
                        paddingLeft: "5px",
                        paddingRight: "5px",
                        verticalAlign: "baseline",
                      }}
                    ></Icon>
                    {getEffectName(section, effect.effect.id!)}
                  </Tag>
                );
              })}
            </div>
            <div>
              <Tooltip
                disabled={!isAddDisabled}
                content={disabledMessage}
                position={"left"}
                openOnTargetFocus={false}
              >
                <Button
                  disabled={isAddDisabled}
                  small
                  minimal
                  className={css.addEffect}
                  icon={"grid-view"}
                  onClick={() => {
                    addEffectToSection(section, true);
                  }}
                >
                  Add Structural Effect
                </Button>
              </Tooltip>
              <Button
                small
                minimal
                className={css.addEffect}
                icon={"graph"}
                onClick={() => {
                  addEffectToSection(section, false);
                }}
              >
                Add Attribute Effect
              </Button>
            </div>

            <div className={css.effectConfigurationFormHolder}>
              <div
                className={classnames(css.noHolder, {
                  [css.noHolderEmpty]: effLen <= 1,
                })}
              >
                {Array.from({ length: effLen }).map((_, idx) => {
                  return (
                    <div
                      className={classnames({
                        [css.active]: selectedNo[section] === idx,
                      })}
                      onClick={() => {
                        setSelectedNo({ ...selectedNo, [section]: idx });
                      }}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
                <div>{/*Empty div, do not remove it*/}</div>
              </div>

              {/*transitions?.[section]?.map((transition, idx) => (
                  <EffectConfigurationForm
                    effectType={section}
                    transition={transition}
                    onTransitionChange={(value) => {
                      transitionChangeHandler(idx, section, value);
                    }}
                  />
                  ))*/}

              {effLen === 0 ? <div>{/*Helper text goes here...*/}</div> : null}

              {transitions?.[section]?.[selectedNo[section]] !== undefined && (
                <EffectConfigurationForm
                  effectType={section}
                  transition={transitions?.[section]?.[selectedNo[section]]!}
                  onTransitionChange={(value) => {
                    transitionChangeHandler(
                      selectedNo[section],
                      section,
                      value
                    );
                  }}
                  onRemove={() => {
                    removeHandler(section, selectedNo[section]);
                  }}
                />
              )}
            </div>
          </>
        }
      />
    );
  };

  return (
    <div className={classnames(css.effect, className)}>
      {!hideHeader && <div className={css.panelHeader}>EFFECT PANEL</div>}
      {id ? (
        <Tabs className={css.tabs}>
          {sections.map((section) => {
            return renderSection(section);
          })}
        </Tabs>
      ) : (
        <div style={{ padding: "10px" }}>No object selected</div>
      )}
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, layers, slides } = state.project;
  return {
    objectById: objects.objectById,
    layerById: layers.layerById,
    slideById: slides.slideById,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
  _updateSlide: (slide: ISlide) => updateSlide(slide),
};

export default connect(mapStateToProps, mapDispatchToProps)(EffectPanelTabs);
