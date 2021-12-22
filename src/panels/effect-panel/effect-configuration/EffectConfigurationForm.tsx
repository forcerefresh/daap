import { cloneDeep, get, set, without } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import {
  getEffectDefinition,
  getEffectsOptions,
} from "../../../effects/effects";
import { EasingOptions, EffectType } from "../../../effects/types";
import { getInputForm } from "../../../inputs/input-factory";
import { getNumericFiled, getSelectField } from "../../../inputs/input-utils";
import { IObject } from "../../../objects/types";
import {
  updateLayer,
  updateObject,
  updateSlide,
} from "../../../store/actions/actions";
import { ILayer } from "../../../store/reducers/i-layers";
import { ISlide } from "../../../store/reducers/i-slides";
import { IStore } from "../../../store/store";
import FormWithLayout, {
  flattenForm,
  IFormItem,
  FormType,
} from "../../../utils/form-layout/form-layout";

import css from "./EffectConfigurationForm.module.scss";

type IEffectConfigurationForm = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    objectOrLayerId: string;
    objectType?: "object" | "layer" | "slide";
    effectType: EffectType;
  };

const EffectConfigurationForm: React.FC<IEffectConfigurationForm> = (props) => {
  const {
    objectOrLayerId: objectId,
    objectType,
    objectById,
    layerById,
    slideById,
    effectType,
    _updateObject,
    _updateLayer,
    _updateSlide,
  } = props;

  const objectOrLayer =
    objectType === "object"
      ? objectById[objectId]
      : objectType === "layer"
      ? layerById[objectId]
      : slideById[objectId];

  let layer: ILayer | undefined;
  let layerObjects: IObject[] | undefined;
  if (objectType === "layer") {
    layer = layerById[objectId];
    layerObjects = layer?.objectIds.map((id) => objectById[id]);
  }

  const renderEffectForm = (
    effectId: string,
    object: IObject | ILayer | ISlide,
    valuesPath: string,
    objectType?: "object" | "layer" | "slide"
  ) => {
    const effectDefinition = getEffectDefinition(effectId);

    const flatForm = flattenForm(
      effectDefinition.definition.form as IFormItem[]
    );

    const inputs = flatForm
      //.filter((item) => !item.formType || item.formType === FormType.INPUT)
      .map((item: any) => {
        function onChange(value: any) {
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
          }
        }

        const value = get(object, valuesPath)[item.propertyName];
        const defaultValue = effectDefinition.defaults[item.propertyName];
        const inputProps = {
          ...item,
          value: typeof value !== "undefined" ? value : defaultValue,
        };
        return {
          input: getInputForm(item.inputType, inputProps, onChange, onChange, {
            layerData: {
              layer: objectOrLayer as ILayer,
              objects: layerObjects,
            },
          }),
          propertyName: item.propertyName,
          duplicate: "",
        };
      });

    return (
      <FormWithLayout
        values={get(object, valuesPath) || {}}
        inputs={inputs}
        form={effectDefinition.definition.form as IFormItem[]}
        formId={`${valuesPath}_${effectDefinition.definition.id}`}
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
    return getEffectDefinition(
      get(objectOrLayer, "transitions." + type + ".effect.id")
    );
  };

  /*const effectDefinition = getEffectDefinition(
    get(objectOrLayer, "transitions.in.effect.id")
  );*/

  const delayInput = () => (
    <div className="input60">
      {getNumericFiled(
        effectType === "out" ? "Gap" : "Delay",
        get(objectOrLayer, `transitions.${effectType}.delay`),
        (value: any) => {
          const obj = cloneDeep(objectOrLayer);
          set(obj, `transitions.${effectType}.delay`, value);
          if (objectType === "object") _updateObject(obj as IObject);
          else if (objectType === "layer") _updateLayer(obj as ILayer);
          else if (objectType === "slide") _updateSlide(obj as any as ISlide);
        }
      )}
    </div>
  );

  const durationInput = () => (
    <div className="input60">
      {getNumericFiled(
        "Duration",
        get(objectOrLayer, `transitions.${effectType}.duration`),
        (value: any) => {
          const obj = cloneDeep(objectOrLayer);
          set(obj, `transitions.${effectType}.duration`, value);
          if (objectType === "object") _updateObject(obj as IObject);
          else if (objectType === "layer") _updateLayer(obj as ILayer);
          else if (objectType === "slide") _updateSlide(obj as any as ISlide);
        }
      )}
    </div>
  );

  const a = get(objectOrLayer, `transitions.${effectType}.effect.id`);

  return (
    <div className={css.effectConfigurationForm}>
      <div className={css.inlineFlex}>
        {(effectType === "in" ||
          effectType === "effect" ||
          effectType === "layer") && (
          <>
            {delayInput()}
            {effDef(effectType).defaults.hasDuration && durationInput()}
          </>
        )}
        {effectType === "out" && (
          <>
            {effDef(effectType).defaults.hasDuration && durationInput()}
            {delayInput()}
          </>
        )}
      </div>

      {effectType === "effect" && <div className="bp3-form-helper-text"></div>}

      {getSelectField(
        "Effect",
        get(objectOrLayer, `transitions.${effectType}.effect.id`),
        getEffectsOptions(effectType),
        (value: any) => {
          const obj = cloneDeep(objectOrLayer);
          set(obj, `transitions.${effectType}.effect.id`, value);

          const values =
            get(obj, `transitions.${effectType}.effect.values`) || {};
          const effDef = getEffectDefinition(value);
          const flatEffDef = flattenForm(effDef.definition.form as IFormItem[]);
          flatEffDef.forEach((item) => {
            values[item.propertyName] = effDef.defaults[item.propertyName];
          });
          set(obj, `transitions.${effectType}.effect.values`, values);

          if (objectType === "object") _updateObject(obj as IObject);
          else if (objectType === "layer") _updateLayer(obj as ILayer);
          else if (objectType === "slide") _updateSlide(obj as any as ISlide);
        }
      )}

      <div className={css.dynamicFields}>
        {renderEffectForm(
          get(objectOrLayer, `transitions.${effectType}.effect.id`),
          objectOrLayer,
          `transitions.${effectType}.effect.values`,
          objectType
        )}
      </div>

      <div>
        {effDef(effectType).defaults.hasEase &&
          getSelectField(
            "Easing",
            get(objectOrLayer, `transitions.${effectType}.ease`),
            EasingOptions,
            (value: any) => {
              const obj = cloneDeep(objectOrLayer);
              set(obj, `transitions.${effectType}.ease`, value);
              if (objectType === "object") _updateObject(obj as IObject);
              else if (objectType === "layer") _updateLayer(obj as ILayer);
              else if (objectType === "slide")
                _updateSlide(obj as any as ISlide);
            }
          )}
        {effDef(effectType).defaults.hasChildEase &&
          getSelectField(
            "Child easing",
            get(objectOrLayer, `transitions.${effectType}.childEase`),
            EasingOptions,
            (value: any) => {
              const obj = cloneDeep(objectOrLayer);
              set(obj, `transitions.${effectType}.childEase`, value);
              if (objectType === "object") _updateObject(obj as IObject);
              else if (objectType === "layer") _updateLayer(obj as ILayer);
              else if (objectType === "slide")
                _updateSlide(obj as any as ISlide);
            }
          )}
        <div className="input60">
          {effDef(effectType).defaults.hasTimeDistribution &&
            getNumericFiled(
              "Time distribution",
              get(objectOrLayer, `transitions.${effectType}.timeDistribution`),
              (value: any) => {
                const obj = cloneDeep(objectOrLayer);
                set(obj, `transitions.${effectType}.timeDistribution`, value);
                if (objectType === "object") _updateObject(obj as IObject);
                else if (objectType === "layer") _updateLayer(obj as ILayer);
                else if (objectType === "slide")
                  _updateSlide(obj as any as ISlide);
              },
              "Percentage that every item will take related to effect time (default 50%)"
            )}
        </div>
      </div>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EffectConfigurationForm);
