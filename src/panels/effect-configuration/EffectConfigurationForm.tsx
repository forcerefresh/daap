import { Alert, Button, Icon, Intent } from "@blueprintjs/core";
import classnames from "classnames";
import { cloneDeep, get, set, without } from "lodash-es";
import React, { useState } from "react";
import { connect } from "react-redux";
import { getEffectDefinition, getEffectsOptions } from "../../effects/effects";
import { EasingOptions, EffectType } from "../../effects/types";
import { getInputForm } from "../../inputs/input-factory";
import { getNumericFiled, getSelectField } from "../../inputs/input-utils";
import { IObject, ITransition } from "../../objects/types";
import {
  updateLayer,
  updateObject,
  updateSlide,
} from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/i-layers";
import { ISlide } from "../../store/reducers/i-slides";
import { IStore } from "../../store/store";
import FormWithLayout, {
  flattenForm,
  IFormItem,
  FormType,
} from "../../utils/form-layout/form-layout";

import css from "./EffectConfigurationForm.module.scss";
/*
type IEffectConfigurationForm = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    objectOrLayerId: string;
    objectType?: "object" | "layer" | "slide";
    effectType: EffectType;
  };*/

export interface IEffectConfigurationForm {
  effectType: EffectType;
  transition: ITransition;
  onTransitionChange: (transition: ITransition) => void;
  onRemove: () => void;
}

export const EffectConfigurationForm: React.FC<IEffectConfigurationForm> = (
  props
) => {
  const {
    transition,
    effectType,
    onTransitionChange,
    onRemove,
    /*objectOrLayerId: objectId,
    objectType,
    objectById,
    layerById,
    slideById,
    effectType,
    _updateObject,
    _updateLayer,
    _updateSlide,*/
  } = props;

  const [isRemoveEffectConfirmationOpen, setIsRemoveEffectConfirmationOpen] =
    useState(false);

  /*const objectOrLayer =
    objectType === "object"
      ? objectById[objectId]
      : objectType === "layer"
      ? layerById[objectId]
      : slideById[objectId];*/

  /*let layer: ILayer | undefined;
  let layerObjects: IObject[] | undefined;
  if (objectType === "layer") {
    layer = layerById[objectId];
    layerObjects = layer?.objectIds.map((id) => objectById[id]);
  }*/

  const renderEffectForm = () => {
    const effectDefinition = getEffectDefinition(transition.effect.id);

    const flatForm = flattenForm(
      effectDefinition.definition.form as IFormItem[]
    );

    const inputs = flatForm
      //.filter((item) => !item.formType || item.formType === FormType.INPUT)
      .map((item) => {
        function onChange(value: any) {
          const newTransition = cloneDeep(transition);
          (newTransition.effect.values as any)[item.propertyName] = value;
          onTransitionChange(newTransition);
          /*
          const retObj = cloneDeep(object);
          if (retObj) {
            const values = get(retObj, valuesPath) || {};
            values[item.propertyName] = value;
            set(retObj, valuesPath, values);
            if (objectType === "object")
              _updateObject(retObj as any as IObject);
            else if (objectType === "layer")
              _updateLayer(retObj as any as ILayer);
            else if (objectType === "slide")
              _updateSlide(retObj as any as ISlide);
          }*/
        }

        const value = (transition.effect.values as any)[item.propertyName];
        const defaultValue = effectDefinition.defaults[item.propertyName];
        const inputProps = {
          ...item,
          value: typeof value !== "undefined" ? value : defaultValue,
        };
        return {
          input: getInputForm(item.inputType, inputProps, onChange, onChange, {
            /*layerData: {
              layer: objectOrLayer as ILayer,
              objects: layerObjects,
            },*/
          }),
          propertyName: item.propertyName,
          duplicate: "",
        };
      });

    return (
      <FormWithLayout
        values={transition.effect.values || {}}
        inputs={inputs}
        form={effectDefinition.definition.form as IFormItem[]}
        formId={`${effectType}_${effectDefinition.definition.id}`}
      />
    );

    //return inputs.map((item: any) => item.input);

    //if (!effectDefinition.formConfiguration) {
    //return inputs.map((item: any) => item.input);
    /*} else {
      return (
        <FormWithLayout
          values={get(object, valuesPath) || {}}
          inputs={inputs}
          formConfiguration={effectDefinition.formConfiguration}
        />
      );
    }*/
  };

  const effDef = (type: string) => {
    return getEffectDefinition(transition.effect.id);
    /* return getEffectDefinition(
      get(objectOrLayer, "transitions." + type + "[0].effect.id")
    );*/
  };

  /*const effectDefinition = getEffectDefinition(
    get(objectOrLayer, "transitions.in.effect.id")
  );*/

  const delayInput = () => (
    <div className="input60">
      {getNumericFiled(
        effectType === "out" ? "Gap" : "Delay",
        transition.delay,
        (value: any) => {
          const newTransition = cloneDeep(transition);
          newTransition.delay = value;
          onTransitionChange(newTransition);
        }
      )}
    </div>
  );

  const durationInput = () => (
    <div className="input60">
      {getNumericFiled("Duration", transition.duration, (value: any) => {
        const newTransition = cloneDeep(transition);
        newTransition.duration = value;
        onTransitionChange(newTransition);
      })}
    </div>
  );

  const selectedEffectName = getEffectsOptions(
    effectType,
    transition.canBeCombined
  ).find((item) => item.value === transition.effect.id)?.label;

  return (
    <>
      <div className={css.effectConfigurationForm}>
        <div className={classnames(css.inlineFlex, css.selectEffectRow)}>
          {getSelectField(
            transition.canBeCombined ? "Attribute Effect" : "Structural Effect",
            transition.effect.id,
            getEffectsOptions(effectType, transition.canBeCombined),
            (value: any) => {
              const newTransition = cloneDeep(transition);
              newTransition.effect.id = value;

              console.log(transition.effect.values);
              const values = (transition.effect.values || {}) as {
                [key: string]: any;
              };
              const effDef = getEffectDefinition(value);
              const flatEffDef = flattenForm(
                effDef.definition.form as IFormItem[]
              );
              console.log(flatEffDef);
              flatEffDef.forEach((item) => {
                values[item.propertyName] = effDef.defaults[item.propertyName];
              });
              newTransition.effect.values = values;

              onTransitionChange(newTransition);
            },
            { disabled: true }
          )}
          <div>
            <Button
              icon="delete"
              small
              minimal
              className={classnames(css.smallDelete)}
              onClick={() => {
                setIsRemoveEffectConfirmationOpen(true);
              }}
            ></Button>
          </div>
        </div>

        <div className={css.inlineFlex}>
          {(effectType === "in" ||
            effectType === "effect" ||
            effectType === "layer") && (
            <>
              {effDef(effectType).defaults.hasDelay && delayInput()}
              {effDef(effectType).defaults.hasDuration && durationInput()}
            </>
          )}
          {effectType === "out" && (
            <>
              {effDef(effectType).defaults.hasDuration && durationInput()}
              {effDef(effectType).defaults.hasDelay && delayInput()}
            </>
          )}
        </div>

        {effectType === "effect" && (
          <div className="bp3-form-helper-text"></div>
        )}

        <div className={css.dynamicFields}>{renderEffectForm()}</div>

        <div>
          {effDef(effectType).defaults.hasEase &&
            getSelectField(
              "Easing",
              transition.ease,
              EasingOptions,
              (value: any) => {
                const newTransition = cloneDeep(transition);
                newTransition.ease = value;
                onTransitionChange(newTransition);
              }
            )}
          {effDef(effectType).defaults.hasChildEase &&
            getSelectField(
              "Child easing",
              transition.childEase,
              EasingOptions,
              (value: any) => {
                const newTransition = cloneDeep(transition);
                newTransition.childEase = value;
                onTransitionChange(newTransition);
              }
            )}
          <div className="input60">
            {effDef(effectType).defaults.hasTimeDistribution &&
              getNumericFiled(
                "Time distribution",
                transition.timeDistribution,
                (value: any) => {
                  const newTransition = cloneDeep(transition);
                  newTransition.timeDistribution = value;
                  onTransitionChange(newTransition);
                },
                "Percentage that every item will take related to effect time (default 50%)"
              )}
          </div>
        </div>
      </div>
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Remove"
        canOutsideClickCancel={false}
        icon={<Icon icon="info-sign" size={36} intent={Intent.WARNING} />}
        intent={Intent.PRIMARY}
        isOpen={isRemoveEffectConfirmationOpen}
        onCancel={() => setIsRemoveEffectConfirmationOpen(false)}
        onConfirm={() => {
          setIsRemoveEffectConfirmationOpen(false);
          onRemove();
        }}
        className="bp3-dark"
      >
        <p>Remove "{selectedEffectName}" effect from list?</p>
      </Alert>
    </>
  );
};
/*
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EffectConfigurationForm);*/
