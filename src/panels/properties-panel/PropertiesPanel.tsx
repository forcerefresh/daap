import { Text } from "@blueprintjs/core";
import { cloneDeep, pick, set } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import {
  getInputForm,
  getInputFormWithOptions,
} from "../../inputs/input-factory";
import {
  getAbsoluteLayoutField,
  getCoverLayoutField,
  getEdgeLayoutField,
  getGridLayoutField,
  getSelectField,
} from "../../inputs/input-utils";
import { IInputMetadataValues, InputType } from "../../inputs/types";
import {
  IAbsoluteLayout,
  IEdgeLayout,
  IGridLayout,
  IObject,
} from "../../objects/types";
import { updateObject } from "../../store/actions/actions";
import { IStore } from "../../store/store";
import FormWithLayout, {
  flattenForm,
  IFormItem,
} from "../../utils/form-layout/form-layout";
import css from "./PropertiesPanel.module.scss";

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const PropertiesPanel: React.FC<ISlidesPanel> = (props) => {
  const { object, _updateObject } = props;

  const renderObjectProperties = (object: IObject) => {
    return (
      <>
        {renderLayoutOptions(object)}
        {object.layout === "grid" &&
          getGridLayoutField(
            "",
            object.gridLayout,
            (gridLayout?: IGridLayout) => {
              const retObj = cloneDeep(object);
              retObj.gridLayout = gridLayout;
              _updateObject(retObj);
            }
          )}
        {object.layout === "absolute" &&
          getAbsoluteLayoutField(
            "",
            object.absoluteLayout,
            (absoluteLayout?: IAbsoluteLayout) => {
              const retObj = cloneDeep(object);
              retObj.absoluteLayout = absoluteLayout;
              _updateObject(retObj);
            },
            { selfSize: object.selfSize }
          )}

        {object.layout === "snap" &&
          getEdgeLayoutField(
            "",
            object.edgeLayout,
            (edgeLayout?: IEdgeLayout) => {
              const retObj = cloneDeep(object);
              retObj.edgeLayout = edgeLayout;
              _updateObject(retObj);
            },
            { selfSize: object.selfSize }
          )}

        {renderProperties(
          object.definition.properties,
          object.definition.values,
          object.definition.valuesMetadata
        )}
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
    object.supportedLayout.cover &&
      options.push({ label: "Fit Page", value: "fit_page" });
    object.supportedLayout.cover &&
      options.push({ label: "Fit Stage", value: "fit_stage" });
    object.supportedLayout.cover &&
      options.push({ label: "Fit Guidelines", value: "fit_guidelines" });

    options.push({ label: "Snap", value: "snap" });

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

  const renderProperties = (
    properties: any[],
    values: any,
    valuesMetadata: any
  ) => {
    const flatForm = flattenForm(properties as IFormItem[]);

    const inputs = flatForm.map((property, idx) => {
      const { propertyName } = property;

      function onChange(value: any) {
        const retObj = cloneDeep(object);

        if (retObj) {
          const values = retObj.definition.values as { [key: string]: any };
          values[propertyName] = value;

          // >>> exception for image
          // use image w and h for the object
          if (property.inputType === InputType.IMAGE) {
            // set placeholder to false
            values[propertyName].isPlaceholder = false;
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

      function onMetadataChange(metadata: IInputMetadataValues) {
        console.log(metadata);
        const retObj = cloneDeep(object);

        if (retObj) {
          const valuesMetadata = retObj.definition.valuesMetadata as {
            [key: string]: any;
          };
          valuesMetadata[propertyName] = metadata;

          _updateObject(retObj);
        }
      }

      const inputProps = {
        ...property,
        value: values[propertyName],
        metadata: valuesMetadata[propertyName],
      };

      return {
        input: getInputFormWithOptions(
          property.inputType,
          inputProps,
          onChange,
          onChange,
          onMetadataChange
        ),
        propertyName: property.propertyName,
        duplicate: property.duplicate ? property.duplicate : "",
      };
    });

    return (
      <FormWithLayout
        values={values}
        inputs={inputs}
        form={properties as IFormItem[]}
        formId={object?.type as string}
      />
    );
    //
    //
    //
    //
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
