import classnames from "classnames";
import { cloneDeep, pick } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import { getInputFormWithOptions } from "../../inputs/input-factory";

import FormWithLayout, {
  flattenForm,
} from "../../utils/form-layout/form-layout";

import {
  IInputMetadataValues,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { navigationDefinition } from "../../objects/navigation-form";
import { updateObject } from "../../store/actions/actions";
import { IStore } from "../../store/store";
import css from "./NavigationPanel.module.scss";
import { IFormLayoutItem } from "webslider-sdk/lib/form/i-form-layout";

type IPropertiesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const NavigationPanel: React.FC<IPropertiesPanel> = (props) => {
  const { object, layer, slide, _updateObject, selectionForProperties } = props;

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

  const renderObjectOrLayerOrSlide = () => {
    if (!selectionForProperties) {
      return <div>No object selected</div>;
    }

    if (selectionForProperties?.type === "layer" && layer) {
      return <div>Layer has no layout options.</div>;
    }

    if (selectionForProperties?.type === "object" && object) {
      return renderObjectProperties(object);
    }

    if (selectionForProperties?.type === "slide" && slide) {
      return <div>Slide has no layout options.</div>;
    }
  };

  return (
    <div
      className={classnames("propertiesPanel", css.propertiesPanel)}
      key={object?.id}
    >
      <div className={css.propertiesHolder}>{renderObject()}</div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, layers, slides, selection } = state.project;
  const { activeObjectId, activeLayerId, activeSlideId } = selection;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;
  const slide = activeSlideId ? slides.slideById[activeSlideId] : null;

  return {
    object,
    layer,
    slide,
    selectionForProperties: selection.selectionForProperties,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationPanel);
