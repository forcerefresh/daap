import { Text } from "@blueprintjs/core";
import { cloneDeep, noop } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import { getInputForm } from "../../inputs/input-factory";
import { InputType } from "../../inputs/types";
import { IObject } from "../../objects/types";
import { updateObject } from "../../store/actions/actions";
import { IStore } from "../../store/store";
import css from "./PropertiesPanel.module.scss";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const PropertiesPanel: React.FC<ISlidesPanel> = (props) => {
  const { object, _updateObject } = props;

  const renderObjectProperties = (object: IObject) => {
    return (
      <>
        {renderPositionAndSize(object)}
        {renderProperties(object.definition.properties)}
      </>
    );
  };

  const renderPositionAndSize = (object: IObject) => {
    return (
      <>
        {getPositionFiled("X", "left")}
        {getPositionFiled("Y", "top")}
        {getPositionFiled("W", "width")}
        {getPositionFiled("H", "height")}
      </>
    );
  };

  const getPositionFiled = (label: string, propertyName: keyof IObject) => {
    const objectDef = {
      displayName: label,
      propertyName: propertyName,
      inputType: InputType.NUMBER,
      value: object?.[propertyName],
      defaultValue: 0,
    };

    const onInput = (value: any) => {
      console.log(value);
      const retObj = cloneDeep(object);
      if (retObj) {
        (retObj as any)[propertyName] = value;
        _updateObject(retObj);
      }
    };

    return getInputForm(InputType.NUMBER, objectDef, noop, onInput);
  };

  const renderProperties = (properties: any) => {
    return Object.keys(properties).map((key) => {
      function onChange(value: any) {
        const retObj = cloneDeep(object);
        if (retObj) {
          (retObj.definition.properties as any)[key].value = value;
          _updateObject(retObj);
        }
      }

      return getInputForm(properties[key].inputType, properties[key], onChange);
    });
  };

  console.log(object);
  return (
    <div className={css.propertiesPanel}>
      <div className={css.panelHeader}>
        <Text>PROPERTIES PANEL</Text>
      </div>
      <div className={css.propertiesHolder}>
        {object && renderObjectProperties(object)}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, selection } = state;
  const activeObjectId = selection.activeObjectId;
  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  return {
    // activeObjectId,
    object,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
};

export default connect(mapStateToProps, mapDispatchToProps)(PropertiesPanel);
