import classnames from "classnames";
import { cloneDeep } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import { getInputFormWithOptions } from "../../../inputs/input-factory";
import {
  IInputMetadataValues,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import {
  updateObject,
} from "../../../store/actions/actions";
import { ILayer } from "../../../store/reducers/i-layers";
import { IStore } from "../../../store/store";
import FormWithLayout, {
  flattenForm,
} from "../../../utils/form-layout/form-layout";
import { IFormLayoutItem } from "webslider-sdk/lib/form/i-form-layout";
import css from "./CommonStyleProperties.module.scss";
import {
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";

type IObjectOrLayer = any; // IObject | ILayer;

type IPropertiesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    className?: string;
  };

const CommonStyleProperties: React.FC<IPropertiesPanel> = (props) => {
  const {
    object,
    objectLayer,
    selectionForProperties,
    _updateObject,
    className,
    objects,
    layer,
  } = props;

  const renderObjectProperties = (object: IObject, _objectLayer: ILayer) => {
    const commonStyleDefinitionProperties =
      getCommonObjectPropertiesDefinition();
    const commonStyleDefinitionValues = {
      ...getCommonPropertiesValues(),
      ...(object.style ?? {}),
    };
    const commonStyleDefinitionValuesMetadata = {};

    return (
      <>
        {renderProperties(
          commonStyleDefinitionProperties,
          commonStyleDefinitionValues,
          commonStyleDefinitionValuesMetadata,
          object,
          _updateObject
        )}
      </>
    );
  };

  const renderProperties = (
    properties: any[],
    values: any,
    valuesMetadata: any,
    objectOrLayer: IObjectOrLayer,
    updateFunction: (objectOrLayer: IObjectOrLayer) => any
  ) => {
    let flatForm = flattenForm(properties as IFormLayoutItem[]);

    flatForm = flatForm.reduce((acc, curr, _idx) => {
      acc.push(curr);
      return acc;
    }, [] as IFormLayoutItem[]);

    let layerObjects: IObject[] = [];
    if (objectOrLayer.type === "layer") {
      layerObjects = objectOrLayer?.objectIds.map(
        (id: any) => objects.objectById[id]
      );
    }

    const inputs = flatForm.map((property, _idx) => {
      const { propertyName } = property;

      function onChange(value: any) {
        const retObj = cloneDeep(objectOrLayer);

        if (retObj) {
          if (!retObj.style) retObj.style = {};
          retObj.style[propertyName] = value;

          // >>> exception for image TODO: REMOVE TO POST PROCESS FUNCTIONS
          // use image w and h for the object
          if (property.inputType === InputType.IMAGE) {
            // set placeholder to false
            retObj.style[propertyName].isPlaceholder = false;
            if ((retObj as IObject).width === 0) {
              (retObj as IObject).width = value.width;
            }
            if ((retObj as IObject).height === 0) {
              (retObj as IObject).height = value.height;
            }
          }
          // >>> exception for image

          updateFunction(retObj);
        }
      }

      function onMetadataChange(metadata: IInputMetadataValues) {
        const retObj = cloneDeep(objectOrLayer);

        if (retObj) {
          const valuesMetadata = retObj.commonStyleDefinition
            .valuesMetadata as {
            [key: string]: any;
          };
          valuesMetadata[propertyName] = metadata;

          updateFunction(retObj);
        }
      }

      const inputProps: any = {
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
          onMetadataChange,
          { layerData: { layer: layer!, objects: layerObjects } }
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

  const renderObjectOrLayerOrSlide = () => {
    if (!selectionForProperties) {
      return <div>No object selected</div>;
    }

    if (selectionForProperties?.type === "object" && object) {
      return renderObjectProperties(object, objectLayer);
    }

    return <div>Element does not have style properties</div>;
  };

  return (
    <div
      className={classnames("propertiesPanel", css.propertiesPanel, className)}
      key={object?.id}
    >
      <div className={css.propertiesHolder}>{renderObjectOrLayerOrSlide()}</div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, layers, selection } = state.project;

  const { activeObjectId, activeLayerId } = selection;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  const objectLayer = layers.layerById[object?.layerId as any] || null;
  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;

  return {
    objects,
    object,
    objectLayer,
    layer,
    selectionForProperties: selection.selectionForProperties,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommonStyleProperties);
