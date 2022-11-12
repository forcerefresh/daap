import { HTMLSelect, Icon, Tab, Tabs, Tag } from "@blueprintjs/core";
import classnames from "classnames";
import { cloneDeep } from "lodash-es";
import React, { ChangeEvent, useState } from "react";
import { connect } from "react-redux";
import { AnimationType } from "../../animations/types";
import {
  IObject,
  ItemType,
  ITransition,
  ITransitions,
} from "webslider-sdk/lib/objects/i-object";
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
import { IFormLayoutItem } from "webslider-sdk/lib/form/i-form-layout";
import { AnimationConfigurationForm } from "../animation-configuration/AnimationConfigurationForm";

import css from "./AnimationPanelTabs.module.scss";
import {
  animationType2Name,
  getDefaultAnimationConfigForType,
  getAnimationTypesForItem,
} from "./AnimationPanelUtils";
import {
  getAppAnimationDefinition,
  getAnimationsOptions,
} from "webslider-sdk/lib/animations/animations-register";

type IAnimationPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    id: string | undefined;
    itemType: ItemType | undefined;
    //
    hideHeader?: boolean;
    className?: string;
  };

const AnimationPanelTabs: React.FC<IAnimationPanel> = (props) => {
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
    layer,
    layerObjects,
  } = props;

  const sections = getAnimationTypesForItem(itemType);

  const [selectedNo, setSelectedNo] = useState<{ [key: string]: number }>({
    in: 0,
    out: 0,
    animation: 0,
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

  const removeHandler = (animationType: AnimationType, idx: number) => {
    const newItem = cloneDeep(item);
    newItem.transitions[animationType].splice(idx, 1);
    if (itemType === "object") _updateObject(newItem);
    if (itemType === "layer") _updateLayer(newItem);
    if (itemType === "slide") _updateSlide(newItem);
    setSelectedNo({ ...selectedNo, [animationType]: Math.max(0, idx - 1) });
  };

  const transitionChangeHandler = (
    idx: number,
    animationType: AnimationType,
    value: ITransition
  ) => {
    const newItem = cloneDeep(item);
    newItem.transitions[animationType][idx] = value;
    if (itemType === "object") _updateObject(newItem);
    if (itemType === "layer") _updateLayer(newItem);
    if (itemType === "slide") _updateSlide(newItem);
  };

  const addAnimationToSection = (
    effId: string,
    animationType: AnimationType
  ) => {
    const effDef = getAppAnimationDefinition(effId);
    const isStructural = !effDef?.formDefaults.canBeCombined;

    const newItem = cloneDeep(item);
    const length = newItem.transitions[animationType].length;
    setSelectedNo({ ...selectedNo, [animationType]: length });

    const transition = getDefaultAnimationConfigForType(
      animationType,
      isStructural,
      itemType
    );
    transition.animation.id = effId;

    const values = {} as {
      [key: string]: any;
    };

    const flatEffDef = flattenForm(
      effDef?.formDefinition.form as IFormLayoutItem[]
    );
    flatEffDef.forEach((item) => {
      values[item.propertyName] = effDef?.formDefaults[item.propertyName];
    });
    transition.animation.values = values;

    newItem.transitions[animationType].push(transition);
    if (itemType === "object") _updateObject(newItem);
    if (itemType === "layer") _updateLayer(newItem);
    if (itemType === "slide") _updateSlide(newItem);
  };

  const getAnimationName = (
    animationType: AnimationType,
    animationId: string
  ) =>
    getAnimationsOptions(animationType).find(
      (item) => item.value === animationId
    )?.label;

  const renderSection = (section: AnimationType) => {
    const effLen = transitions?.[section]?.length || 0;
    const animations = transitions?.[section] || [];

    const hasStructuredEff = !!animations.find((eff) => !eff.canBeCombined);
    const isAddDisabled = hasStructuredEff ? true : false;
    const disabledMessage = hasStructuredEff
      ? "Only one Structure Animation is allowed"
      : "";

    const hideAddStructuralAnimation =
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
            {animationType2Name(section)} &nbsp;
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
                      label: "Attribute animations",
                      value: "Disabled1",
                      disabled: true,
                    },
                    ...getAnimationsOptions(section, true, objectType),
                    {
                      label: "Structural animation",
                      value: "Disabled2",
                      disabled: true,
                    },
                    ...getAnimationsOptions(section, false, objectType),
                  ] as any
                }
                value={""}
                onChange={(event: ChangeEvent) => {
                  addAnimationToSection(
                    (event.currentTarget as any).value,
                    section
                  );
                }}
              />
            </div>

            <div className={css.effLabels}>
              {animations.map((animation, animationIdx) => {
                return (
                  <Tag
                    key={animation.animation.id + "_" + animationIdx}
                    active={selectedNo[section] === animationIdx}
                    minimal
                    onClick={() => {
                      setSelectedNo({ ...selectedNo, [section]: animationIdx });
                    }}
                  >
                    {animationIdx + 1}.
                    <Icon
                      icon={animation.canBeCombined ? "graph" : "grid-view"}
                      size={12}
                      style={{
                        paddingLeft: "5px",
                        paddingRight: "5px",
                        verticalAlign: "baseline",
                      }}
                    ></Icon>
                    {getAnimationName(section, animation.animation.id!)}
                  </Tag>
                );
              })}
            </div>
            {/*<div>
              {!hideAddStructuralAnimation && (
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
                    className={css.addAnimation}
                    icon={"grid-view"}
                    onClick={() => {
                      addAnimationToSection(section, true);
                    }}
                  >
                    Add Structural Animation
                  </Button>
                </Tooltip>
              )}
              <Button
                small
                minimal
                className={css.addAnimation}
                icon={"graph"}
                onClick={() => {
                  addAnimationToSection(section, false);
                }}
              >
                Add Attribute Animation
              </Button>
              </div>*/}
            <div className={css.animationConfigurationFormHolder}>
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
                  <AnimationConfigurationForm
                    animationType={section}
                    transition={transition}
                    onTransitionChange={(value) => {
                      transitionChangeHandler(idx, section, value);
                    }}
                  />
                  ))*/}

              {effLen === 0 ? <div>{/*Helper text goes here...*/}</div> : null}

              {transitions?.[section]?.[selectedNo[section]] !== undefined && (
                <AnimationConfigurationForm
                  animationType={section}
                  objectType={objectType}
                  transition={transitions?.[section]?.[selectedNo[section]]!}
                  layer={layer}
                  layerObjects={layerObjects}
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
    <div className={classnames(css.animation, className)}>
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

  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;
  let layerObjects: IObject[] | null = null;
  if (layer) {
    layerObjects = layer?.objectIds.map((id: any) => objects.objectById[id]);
  }

  let objectType;
  if (selection.selectionForProperties?.type === "object" && object) {
    objectType = object.type;
  }

  return {
    objectType,
    objectById: objects.objectById,
    layerById: layers.layerById,
    slideById: slides.slideById,
    layer,
    layerObjects,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
  _updateSlide: (slide: ISlide) => updateSlide(slide),
};

export default connect(mapStateToProps, mapDispatchToProps)(AnimationPanelTabs);
