import { Button, NavbarGroup, Text } from "@blueprintjs/core";
import { cloneDeep } from "lodash-es";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getInputForm } from "../../inputs/input-factory";
import {
  IColorInput,
  INumberInput,
  ITextInput,
  IUpdateInput,
} from "../../inputs/types";
import { IObject } from "../../objects/types";
import { updateObject } from "../../store/actions/actions";
import { IStore } from "../../store/store";
import css from "./PropertiesPanel.module.scss";
import { ReactComponent as TabletPreviewIcon } from "../../assets/icons/tablet-preview.svg";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const PropertiesPanel: React.FC<ISlidesPanel> = (props) => {
  const { activeObjectId, object, _updateObject } = props;
  console.log(activeObjectId);
  console.log(object);
  console.log(object);
  const renderProperties = (properties: any) => {
    console.log(properties);
    return Object.keys(properties).map((key) => {
      console.log(key);
      console.log(properties[key]);

      function onChange(value: any) {
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAA");
        console.log(value);

        const retObj = cloneDeep(object);
        if (retObj) {
          (retObj.definition.properties as any)[key].value = value;
          console.log(retObj);
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
        {object && renderProperties(object.definition.properties)}
      </div>
      <div>
        <div className={css.previewButtons}>
          <Button intent="success" large icon="desktop" />
          <Button intent="success" large>
            <TabletPreviewIcon
              style={{ width: "16px", height: "16px", fill: "white" }}
            />
          </Button>
          <Button intent="success" large icon="mobile-phone" />
        </div>
        <Button intent="primary" large style={{ width: "100%" }}>
          SAVE
        </Button>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides, layers, objects, selection } = state;
  const activeObjectId = selection.activeObjectId;
  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  return {
    activeObjectId,
    object,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
};

export default connect(mapStateToProps, mapDispatchToProps)(PropertiesPanel);
