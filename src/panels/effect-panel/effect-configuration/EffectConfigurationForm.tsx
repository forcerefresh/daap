import { Button, FormGroup, HTMLSelect } from "@blueprintjs/core";
import { cloneDeep, get, noop, set } from "lodash-es";
import React, { useState } from "react";
import { connect } from "react-redux";
import { getInputForm } from "../../../inputs/input-factory";
import { getNumericFiled, getSelectFiled } from "../../../inputs/input-utils";
import { InputType } from "../../../inputs/types";
import { IObject } from "../../../objects/types";
import { updateObject } from "../../../store/actions/actions";
import { objects } from "../../../store/reducers/objects";
import { IStore } from "../../../store/store";

import css from "./EffectConfigurationForm.module.scss";

type IEffectConfigurationForm = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    objectId: string;
    effectType: "in" | "out";
  };

const options = [
  { label: "Fade", value: "fade" },
  { label: "Slide", value: "slide" },
  { label: "Bounce", value: "bounce" },
  { label: "Flash", value: "flash" },
  { label: "Zoom", value: "zoom" },
];
/*
const getNumericFiled = (
  object: IObject,
  label: string,
  path: string,
  _updateObject: (object: IObject) => void
) => {
  const objectDef = {
    displayName: label,
    propertyName: path,
    inputType: InputType.NUMBER,
    value: get(object, path),
    defaultValue: 0,
  };

  const onInput = (value: any) => {
    const obj = cloneDeep(object);
    set(obj, path, value);
    _updateObject(obj);
  };

  return getInputForm(InputType.NUMBER, objectDef, noop, onInput);
};*/

const EffectConfigurationForm: React.FC<IEffectConfigurationForm> = (props) => {
  const { objectId, effectType, objectById, _updateObject } = props;

  const object = objectById[objectId];
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
        [
          { label: "None", value: "none" },
          { label: "Fade", value: "fade" },
          { label: "Zoom", value: "zoom" },
          { label: "Slide", value: "slide" },
        ],
        (value: any) => {
          const obj = cloneDeep(object);
          set(obj, "transitions.in.effect.id", value);
          _updateObject(obj);
        }
      )}
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
