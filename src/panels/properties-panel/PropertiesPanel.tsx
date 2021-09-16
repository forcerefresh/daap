import { Text } from "@blueprintjs/core";
import { cloneDeep, pick, set } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import { getInputForm } from "../../inputs/input-factory";
import {
  getAbsoluteLayoutField,
  getCoverLayoutField,
  getGridLayoutField,
  getSelectField,
} from "../../inputs/input-utils";
import { InputType } from "../../inputs/types";
import { IAbsoluteLayout, IObject } from "../../objects/types";
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
        {renderLayoutOptions(object)}
        {object.layout === "cover" && getCoverLayoutField("", {}, () => {})}
        {object.layout === "grid" &&
          getGridLayoutField(
            "",
            { top: 0, bottom: 3, left: 3, right: 3 },
            () => {}
          )}
        {object.layout === "absolute" &&
          getAbsoluteLayoutField(
            "",
            object.absoluteLayout,
            (absoluteLayout?: IAbsoluteLayout) => {
              const retObj = cloneDeep(object);
              retObj.absoluteLayout = absoluteLayout;
              _updateObject(retObj);
            }
          )}

        {/*TO BE REMOVED*/}
        {/*!object.isCoverPlacement &&
          !object.isGridPlacement &&
        renderPositionAndSize(object)*/}

        {renderProperties(object.definition.properties)}
        <hr />
        {renderEvents(object)}
        <hr />
        {renderCommonObjectProperties(object)}
      </>
    );
  };

  const renderLayoutOptions = (object: IObject) => {
    const options = [];
    object.supportedLayout.absolute &&
      options.push({ label: "Absolute", value: "absolute" });
    object.supportedLayout.grid &&
      options.push({ label: "Grid", value: "grid" });
    //o//bject.supportedLayout.cover &&
    //options.push({ label: "Cover", value: "cover" });

    options.push({ label: "Fit Page", value: "fit_page" });
    options.push({ label: "Fit Stage", value: "fit_stage" });
    options.push({ label: "Fit Guidelines", value: "fit_guidelines" });

    const onChange = (layout: any) => {
      const retObj = cloneDeep(object);
      retObj.layout = layout;
      _updateObject(retObj);
    };

    return getSelectField("Layout", object.layout, options, onChange);
  };

  const renderEvents = (object: IObject) => {
    const objectDef = {
      inputType: InputType.EVENTS,
      value: pick(object, "events"),
    };

    const onChange = (value: any) => {
      const retObj = cloneDeep(object);
      if (retObj) {
        _updateObject({ ...retObj, ...value });
      }
    };

    //console.log(objectDef);
    return getInputForm(InputType.EVENTS, objectDef, onChange);
  };

  const renderCommonObjectProperties = (object: IObject) => {
    const objectDef = {
      displayName: "Corner radius",
      inputType: InputType.CORNER_RADIUS,
      value: object?.commonProperties?.borderRadius || { common: "0px" },
    };

    const onChange = (value: any) => {
      const retObj = cloneDeep(object);
      set(retObj, "commonProperties.borderRadius", value);
      if (retObj) {
        _updateObject(retObj);
      }
    };

    //console.log(objectDef);
    return getInputForm(InputType.CORNER_RADIUS, objectDef, onChange);
  };

  const renderPositionAndSize = (object: IObject) => {
    const objectDef = {
      inputType: InputType.TRANSFORM,
      value: pick(object, "left", "top", "width", "height"),
    };

    const onChange = (value: any) => {
      const retObj = cloneDeep(object);
      if (retObj) {
        _updateObject({ ...retObj, ...value });
      }
    };

    return getInputForm(InputType.TRANSFORM, objectDef, onChange);
  };

  const renderProperties = (properties: any) => {
    return Object.keys(properties).map((key) => {
      function onChange(value: any) {
        const retObj = cloneDeep(object);

        if (retObj) {
          const properties = retObj.definition.properties as any;
          properties[key].value = value;

          // >>> exception for image
          // use image w and h for the object
          if (properties[key].inputType === InputType.IMAGE) {
            // set placeholder to false
            properties[key].value.isPlaceholder = false;
            if (retObj.width === 0) {
              retObj.width = value.width;
            }
            if (retObj.height === 0) {
              retObj.height = value.height;
            }
          }
          // >>> exception for image

          _updateObject(retObj);
        }
      }

      return getInputForm(properties[key].inputType, properties[key], onChange);
    });
  };

  return (
    <div className={css.propertiesPanel} key={object?.id}>
      <div className={css.panelHeader}>
        <Text>PROPERTIES PANEL</Text>
      </div>
      <div className={css.propertiesHolder}>
        {object ? (
          renderObjectProperties(object)
        ) : (
          <div>No object selected</div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, selection } = state.project;
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
