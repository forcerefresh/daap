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
import { updateObject } from "../../../store/actions/actions";
import { IStore } from "../../../store/store";

import css from "./EffectConfigurationForm.module.scss";

type IEffectConfigurationForm = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    objectId: string;
    effectType: "in" | "out";
  };

const EffectConfigurationForm: React.FC<IEffectConfigurationForm> = (props) => {
  const { objectId, objectById, _updateObject } = props;

  const object = objectById[objectId];

  const renderEffectForm = (
    effectId: string,
    object: IObject,
    valuesPath: string
  ) => {
    const effectDefinition = getEffectDefinition(effectId);

    return effectDefinition.definition.form.map((item) => {
      function onChange(value: any) {
        const retObj = cloneDeep(object);
        if (retObj) {
          const values = get(retObj, valuesPath) || {};
          values[item.propertyName] = value;
          set(retObj, valuesPath, values);
          _updateObject(retObj);
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
            get(object, "transitions.in.delay"),
            (value: any) => {
              const obj = cloneDeep(object);
              set(obj, "transitions.in.delay", value);
              _updateObject(obj);
            }
          )}
        </div>
        <div className="input60">
          {getNumericFiled(
            "Duration",
            get(object, "transitions.in.duration"),
            (value: any) => {
              const obj = cloneDeep(object);
              set(obj, "transitions.in.duration", value);
              _updateObject(obj);
            }
          )}
        </div>
      </div>

      {getSelectFiled(
        "Effect",
        get(object, "transitions.in.effect.id"),
        getEffectsOptions(),
        (value: any) => {
          const obj = cloneDeep(object);
          set(obj, "transitions.in.effect.id", value);

          const values = get(obj, "transitions.in.effect.values") || {};
          const effDef = getEffectDefinition(value);
          effDef.definition.form.forEach((item) => {
            values[item.propertyName] = effDef.defaults[item.propertyName];
          });
          set(obj, "transitions.in.effect.values", values);

          _updateObject(obj);
        }
      )}

      <div className={css.dynamicFields}>
        {renderEffectForm(
          get(object, "transitions.in.effect.id"),
          object,
          "transitions.in.effect.values"
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects } = state;
  return {
    objectById: objects.objectById,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EffectConfigurationForm);
