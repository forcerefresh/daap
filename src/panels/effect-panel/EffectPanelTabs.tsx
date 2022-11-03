import {
  Button,
  HTMLSelect,
  Icon,
  Tab,
  Tabs,
  Tag,
  Tooltip,
} from "@blueprintjs/core";
import classnames from "classnames";
import { cloneDeep } from "lodash-es";
import React, { ChangeEvent, useState } from "react";
import { connect } from "react-redux";
import { EffectType } from "../../effects/types";
import {
  IObject,
  ItemType,
  ITransition,
  ITransitions,
} from "../../webslider-sdk/src/objects/i-object";
import {
  updateLayer,
  updateObject,
  updateSlide,
  _updateObject,
} from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/i-layers";
import { ISlide, SlideType } from "../../store/reducers/i-slides";
import { IStore } from "../../store/store";
import { flattenForm } from "../../utils/form-layout/form-layout";
import { IFormLayoutItem } from "../../webslider-sdk/src/form/i-form-layout";
import { EffectConfigurationForm } from "../effect-configuration/EffectConfigurationForm";

import css from "./EffectPanelTabs.module.scss";
import {
  effectType2Name,
  getDefaultEffectConfigForType,
  getEffectTypesForItem,
} from "./EffectPanelUtils";
import {
  getAppAnimationDefinition,
  getAnimationsOptions,
} from "../../webslider-sdk/src/animations/animations-register";
import { getCheckboxField } from "../../inputs/input-utils";

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
    objectType,
  } = props;

  const sections = getEffectTypesForItem(itemType);

  const [selectedNo, setSelectedNo] = useState<{ [key: string]: number }>({
    in: 0,
    out: 0,
    effect: 0,
    layer: 0,
    slide: 0,
    event: 0,
  });

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

  const addEffectToSection = (effId: string, effectType: EffectType) => {
    const effDef = getAppAnimationDefinition(effId);
    const isStructural = !effDef?.formDefaults.canBeCombined;

    const newItem = cloneDeep(item);
    const length = newItem.transitions[effectType].length;
    setSelectedNo({ ...selectedNo, [effectType]: length });

    const transition = getDefaultEffectConfigForType(
      effectType,
      isStructural,
      itemType
    );
    transition.effect.id = effId;

    const values = {} as {
      [key: string]: any;
    };

    const flatEffDef = flattenForm(
      effDef?.formDefinition.form as IFormLayoutItem[]
    );
    flatEffDef.forEach((item) => {
      values[item.propertyName] = effDef?.formDefaults[item.propertyName];
    });
    transition.effect.values = values;

    newItem.transitions[effectType].push(transition);
    if (itemType === "object") _updateObject(newItem);
    if (itemType === "layer") _updateLayer(newItem);
    if (itemType === "slide") _updateSlide(newItem);
  };

  const getEffectName = (effectType: EffectType, effectId: string) =>
    getAnimationsOptions(effectType).find((item) => item.value === effectId)
      ?.label;

  const renderSection = (section: EffectType) => {
    const effLen = transitions?.[section]?.length || 0;
    const effects = transitions?.[section] || [];

    const hasStructuredEff = !!effects.find((eff) => !eff.canBeCombined);
    const isAddDisabled = hasStructuredEff ? true : false;
    const disabledMessage = hasStructuredEff
      ? "Only one Structure Effect is allowed"
      : "";

    const hideAddStructuralEffect =
      itemType === "slide" &&
      ((item as ISlide).slideType === SlideType.Back ||
        (item as ISlide).slideType === SlideType.Front);

    /*const objectOrLayerOrSlide =
      objectType === "object"
        ? objectById[id!]
        : objectType === "layer"
        ? layerById[id!]
        : slideById[id!];*/

    //let layer: ILayer | undefined;
    // let layerObjects: IObject[] | undefined;
    // if (objectType === "layer") {
    //   const layer = layerById[id!];
    //   layerObjects = layer?.objectIds.map((id) => objectById[id]);
    // }

    return (
      <Tab
        key={section}
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
            <div
              style={{
                marginTop: "10px",

                marginLeft: "5px",
              }}
            >
              <HTMLSelect
                options={
                  [
                    {
                      label: `Add ${section.toLocaleUpperCase()} animation to object...`,
                      value: "",
                      readOnly: true,
                    },
                    {
                      label: "Attribute effects",
                      value: "Disabled1",
                      disabled: true,
                    },
                    ...getAnimationsOptions(section, true, objectType),
                    {
                      label: "Structural effect",
                      value: "Disabled2",
                      disabled: true,
                    },
                    ...getAnimationsOptions(section, false, objectType),
                  ] as any
                }
                value={""}
                onChange={(event: ChangeEvent) => {
                  addEffectToSection(
                    (event.currentTarget as any).value,
                    section
                  );
                }}
              />
            </div>

            <div className={css.effLabels}>
              {effects.map((effect, effectIdx) => {
                return (
                  <Tag
                    key={effect.effect.id + "_" + effectIdx}
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
            {/*<div>
              {!hideAddStructuralEffect && (
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
              )}
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
              </div>*/}
            <div className={css.effectConfigurationFormHolder}>
              {/*<div
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
                <div>{//Empty div, do not remove it}</div>
              </div>*/}

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
                  objectType={objectType}
                  transition={transitions?.[section]?.[selectedNo[section]]!}
                  //layerObjects={layerObjects}
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
  const { objects, layers, slides, selection } = state.project;

  const { activeObjectId, activeLayerId, activeSlideId } = selection;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;

  let objectType;
  if (selection.selectionForProperties?.type === "object" && object) {
    objectType = object.type;
  }

  return {
    objectType,
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
