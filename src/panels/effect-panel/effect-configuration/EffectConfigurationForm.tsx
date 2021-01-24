import { cloneDeep, get, set } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import {
  getEffectDefinition,
  getEffectsOptions,
} from "../../../effects/effects";
import { getInputForm } from "../../../inputs/input-factory";
import { getNumericFiled, getSelectFiled } from "../../../inputs/input-utils";
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
        if (retObj) {
          const values = get(retObj, valuesPath) || {};
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
        value: value || defaultValue,
      };
      return getInputForm(item.inputType, inputProps, onChange, onChange);
    });
  };

  return (
    <div className={css.effectConfigurationForm}>
      <div className={css.inlineFlex}>
        <div className="input60">
          {getNumericFiled(
            "Delay",
            get(objectOrLayer, "transitions.in.delay"),
            (value: any) => {
              const obj = cloneDeep(objectOrLayer);
              set(obj, "transitions.in.delay", value);
              if (objectType === "object") _updateObject(obj as IObject);
              else if (objectType === "layer") _updateLayer(obj as ILayer);
            }
          )}
        </div>
        <div className="input60">
          {getNumericFiled(
            "Duration",
            get(objectOrLayer, "transitions.in.duration"),
            (value: any) => {
              const obj = cloneDeep(objectOrLayer);
              set(obj, "transitions.in.duration", value);
              if (objectType === "object") _updateObject(obj as IObject);
              else if (objectType === "layer") _updateLayer(obj as ILayer);
            }
          )}
        </div>
      </div>

      {getSelectFiled(
        "Effect",
        get(objectOrLayer, "transitions.in.effect.id"),
        getEffectsOptions(),
        (value: any) => {
          const obj = cloneDeep(objectOrLayer);
          set(obj, "transitions.in.effect.id", value);

          const values = get(obj, "transitions.in.effect.values") || {};
          const effDef = getEffectDefinition(value);
          effDef.definition.form.forEach((item) => {
            values[item.propertyName] = effDef.defaults[item.propertyName];
          });
          set(obj, "transitions.in.effect.values", values);

          if (objectType === "object") _updateObject(obj as IObject);
          else if (objectType === "layer") _updateLayer(obj as ILayer);
        }
      )}

      <div className={css.dynamicFields}>
        {renderEffectForm(
          get(objectOrLayer, "transitions.in.effect.id"),
          objectOrLayer,
          "transitions.in.effect.values",
          objectType
        )}
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
