import { HTMLSelect, Icon, Tab, Tabs, Tag } from "@blueprintjs/core";
import { v4 as uuid } from "uuid";
import classnames from "classnames";
import { cloneDeep } from "lodash-es";
import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  IObject,
  ItemType,
  ITransition,
  ITransitionAble,
  ITransitions,
} from "webslider-sdk/lib/objects/i-object";
import { IPage, PageType } from "../../store/reducers/i-pages";
import { IStore } from "../../store/store";
import { flattenForm } from "../../utils/form-layout/form-layout";
import { IFormLayoutItem } from "webslider-sdk/lib/form/i-form-layout";
import { AnimationConfigurationForm } from "../animation-configuration/AnimationConfigurationForm";

import css from "./AnimationPanelTabs.module.scss";
import {
  animationType2Name,
  getDefaultAnimationConfigForType,
  getAnimationTypesForItem,
  isAnimationTypeDisabled,
  animationType2ShortName,
} from "./AnimationPanelUtils";
import {
  getAppAnimationDefinition,
  getAnimationsOptions,
} from "webslider-sdk/lib/animations/animations-register";
import { AnimationType } from "webslider-sdk/lib/animations/i-animation-types";
import { PanelHeader } from "../common/panel-header/PanelHeader";
import { IntegrationContext } from "../../integration";

type IAnimationPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    id: string | undefined;
    itemType: ItemType | undefined;
    hideHeader?: boolean;
    className?: string;
  };

const AnimationPanelTabs: React.FC<IAnimationPanel> = (props) => {
  const {
    id,
    itemType,
    hideHeader,
    className,
    objectType,
    layer,
    layerObjects,
  } = props;
  const globalContext = useContext(IntegrationContext);
  const { getLicenseDetails } = globalContext.useLicenseHook();
  const [hasLicense, setHasLicense] = useState<boolean | undefined>();

  useEffect(() => {
    getLicenseDetails().then((data) => {
      setHasLicense(!!data.apiKey);
    });
  }, []);

  const sections = getAnimationTypesForItem(itemType, hasLicense);

  const [selectedNo, setSelectedNo] = useState<{ [key: string]: number }>({
    in: 0,
    out: 0,
    animation: 0,
    layer: 0,
    slide: 0,
    event: 0,
  });

  let item: ITransitionAble;
  let transitions: ITransitions | undefined;

  const removeHandler = (animationType: AnimationType, idx: number) => {
    const newItem = cloneDeep(item);
    newItem.transitions[animationType]!.splice(idx, 1);

    setTimeout(() => {
      setSelectedNo({ ...selectedNo, [animationType]: Math.max(0, idx - 1) });
    }, 1);
  };

  const transitionChangeHandler = (
    idx: number,
    animationType: AnimationType,
    value: ITransition
  ) => {
    const newItem = cloneDeep(item);
    newItem.transitions[animationType]![idx] = value;
  };

  const addAnimationToSection = (
    effId: string,
    animationType: AnimationType
  ) => {
    const effDef = getAppAnimationDefinition(effId);
    const isStructural = !effDef?.formDefaults.canBeCombined;

    const newItem = cloneDeep(item);
    const length = newItem.transitions[animationType]!.length;
    setSelectedNo({ ...selectedNo, [animationType]: length });

    const transition: ITransition = getDefaultAnimationConfigForType(
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

    transition.uid = uuid();
    newItem.transitions[animationType]!.push(transition);
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
    let isAddStructuralDisabled = hasStructuredEff ? true : false;

    isAddStructuralDisabled =
      isAddStructuralDisabled ||
      (itemType === "slide" &&
        ((item as unknown as IPage).type === PageType.Back ||
          (item as unknown as IPage).type === PageType.Front));

    const animationAddOptions: any[] = [
      {
        label: `Add ${animationType2ShortName(section)} animation`,
        value: "",
        readOnly: true,
      },
      {
        label: "Attribute animations",
        value: "Disabled1",
        disabled: true,
      },
      ...getAnimationsOptions(section, true, objectType, itemType === "layer"),
      {
        label: "Structural animation",
        value: "Disabled2",
        disabled: true,
      },
      ...getAnimationsOptions(
        section,
        false,
        objectType,
        itemType === "layer"
      ).map((item) => {
        const retItem = { ...item } as any;
        retItem.disabled = isAddStructuralDisabled;
        return retItem;
      }),
    ] as any;

    if (!hasLicense && isAnimationTypeDisabled(section as string, hasLicense)) {
      animationAddOptions.forEach((item, idx) => {
        item.disabled = idx > 0;
      });
      animationAddOptions.splice(
        1,
        0,
        {
          label: `**************************`,
          value: "not-available",
          disabled: true,
        },
        {
          label: `${section.toLocaleUpperCase()} animations are not
         available in FREE version`,
          value: "not-available2",
          disabled: true,
        },
        {
          label: `**************************`,
          value: "not-available3",
          disabled: true,
        }
      );
    }

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
                options={animationAddOptions}
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
                      setSelectedNo({
                        ...selectedNo,
                        [section]: animationIdx,
                      });
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
                    {getAnimationName(section, animation.animation.id!) ||
                      animation.animation.id}
                  </Tag>
                );
              })}
            </div>
            <div className={css.animationConfigurationFormHolder}>
              {effLen === 0 ? <div></div> : null}

              {transitions?.[section]?.[selectedNo[section]] !== undefined && (
                <AnimationConfigurationForm
                  key={
                    (transitions?.[section]?.[selectedNo[section]] as any).uid
                  }
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

  if (typeof hasLicense === "undefined") {
    return null;
  }
  return (
    <div className={classnames(css.animation, className)}>
      {!hideHeader && <PanelHeader title="ANIMATION PANEL" />}
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
  const { objects, layers, selection } = state.project;

  const { activeObjectId, activeLayerId } = selection;

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
    layer,
    layerObjects,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AnimationPanelTabs);
