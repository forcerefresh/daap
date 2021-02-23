import { cloneDeep, get, set } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import {
  getEffectDefinition,
  getEffectsOptions,
} from "../../../effects/effects";
import { EasingOptions } from "../../../effects/types";
import { getInputForm } from "../../../inputs/input-factory";
import { getNumericFiled, getSelectField } from "../../../inputs/input-utils";
import { IObject } from "../../../objects/types";
import { updateLayer, updateObject } from "../../../store/actions/actions";
import { ILayer } from "../../../store/reducers/layers";
import { IStore } from "../../../store/store";

import css from "./EffectConfigurationForm.module.scss";

type IEffectConfigurationForm = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    objectOrLayerId: string;
    objectType?: "object" | "layer";
    effectType: "in" | "out";
  };

const EffectConfigurationForm: React.FC<IEffectConfigurationForm> = (props) => {
  const {
    objectOrLayerId: objectId,
    objectType,
    objectById,
    layerById,
    effectType,
    _updateObject,
    _updateLayer,
  } = props;

  const objectOrLayer =
    objectType === "object" ? objectById[objectId] : layerById[objectId];

  const renderEffectForm = (
    effectId: string,
    object: IObject | ILayer,
    valuesPath: string,
    objectType?: "object" | "layer"
  ) => {
    const effectDefinition = getEffectDefinition(effectId);

    return effectDefinition.definition.form.map((item) => {
      function onChange(value: any) {
        const retObj = cloneDeep(object);
        console.log(retObj);
        if (retObj) {
          const values = get(retObj, valuesPath) || {};
          console.log(item.propertyName);
          console.log(value);
          console.log(valuesPath);
          console.log(values);
          values[item.propertyName] = value;
          set(retObj, valuesPath, values);
          if (objectType === "object") _updateObject(retObj as IObject);
          else if (objectType === "layer") _updateLayer(retObj as ILayer);
        }
      }

      const value = get(object, valuesPath)[item.propertyName];
      const defaultValue = effectDefinition.defaults[item.propertyName];
      const inputProps = {
        ...item,
        value: typeof value !== "undefined" ? value : defaultValue,
      };
      return getInputForm(item.inputType, inputProps, onChange, onChange);
    });
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
        effectType === "in" ? "Delay" : "Gap",
        get(objectOrLayer, `transitions.${effectType}.delay`),
        (value: any) => {
          const obj = cloneDeep(objectOrLayer);
          set(obj, `transitions.${effectType}.delay`, value);
          if (objectType === "object") _updateObject(obj as IObject);
          else if (objectType === "layer") _updateLayer(obj as ILayer);
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
        }
      )}
    </div>
  );

  return (
    <div className={css.effectConfigurationForm}>
      <div className={css.inlineFlex}>
        {effectType === "in" && (
          <>
            {delayInput()}
            {durationInput()}
          </>
        )}
        {effectType === "out" && (
          <>
            {durationInput()}
            {delayInput()}
          </>
        )}
      </div>

      {getSelectField(
        "Effect",
        get(objectOrLayer, `transitions.${effectType}.effect.id`),
        getEffectsOptions(),
        (value: any) => {
          const obj = cloneDeep(objectOrLayer);
          set(obj, `transitions.${effectType}.effect.id`, value);

          const values =
            get(obj, `transitions.${effectType}.effect.values`) || {};
          const effDef = getEffectDefinition(value);
          effDef.definition.form.forEach((item) => {
            values[item.propertyName] = effDef.defaults[item.propertyName];
          });
          set(obj, `transitions.${effectType}.effect.values`, values);

          if (objectType === "object") _updateObject(obj as IObject);
          else if (objectType === "layer") _updateLayer(obj as ILayer);
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
              },
              "Percentage that every item will take related to effect time (default 50%)"
            )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, layers } = state.project;
  return {
    objectById: objects.objectById,
    layerById: layers.layerById,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EffectConfigurationForm);
