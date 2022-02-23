import classnames from "classnames";
import { cloneDeep, pick } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import { getInputFormWithOptions } from "../../inputs/input-factory";

import FormWithLayout, {
  flattenForm,
} from "../../utils/form-layout/form-layout";

import { IInputMetadataValues, InputType } from "../../inputs/types";
import { IObject, navigationDefinition } from "../../objects/types";
import { updateObject } from "../../store/actions/actions";
import { IStore } from "../../store/store";
import css from "./NavigationPanel.module.scss";
import { IFormLayoutItem } from "../../utils/form-layout/i-form-layout";

type IPropertiesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const NavigationPanel: React.FC<IPropertiesPanel> = (props) => {
  const { object, _updateObject } = props;

  const renderProperties = (
    properties: any[],
    values: any,
    valuesMetadata: any,
    objectOrLayer: IObject,
    updateFunction: (objectOrLayer: IObject) => any
  ) => {
    const flatForm = flattenForm(properties as IFormLayoutItem[]);

    const inputs = flatForm.map((property, idx) => {
      const { propertyName } = property;

      function onChange(value: any) {
        console.log(value);
        const retObj = cloneDeep(objectOrLayer);

        if (retObj) {
          const values = retObj.navigationDefinition.values as {
            [key: string]: any;
          };
          values[propertyName] = value;
          updateFunction(retObj);
        }
      }

      function onMetadataChange(metadata: IInputMetadataValues) {
        console.log(metadata);
        const retObj = cloneDeep(objectOrLayer);

        if (retObj) {
          const valuesMetadata = retObj.navigationDefinition.valuesMetadata as {
            [key: string]: any;
          };
          valuesMetadata[propertyName] = metadata;

          updateFunction(retObj);
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
        form={properties as IFormLayoutItem[]}
        formId={objectOrLayer?.type as string}
      />
    );
  };

  const renderObjectProperties = (object: IObject) => {
    return (
      <>
        {renderProperties(
          navigationDefinition,
          object.navigationDefinition.values,
          object.navigationDefinition.valuesMetadata,
          object,
          _updateObject
        )}
      </>
    );
  };

  const renderObject = () => {
    if (!object) {
      return <div>No object selected</div>;
    }

    return renderObjectProperties(object);
  };

  return (
    <div className={classnames(css.propertiesPanel)} key={object?.id}>
      <div className={css.propertiesHolder}>{renderObject()}</div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, selection } = state.project;
  const { activeObjectId } = selection;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;

  return {
    object,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationPanel);
