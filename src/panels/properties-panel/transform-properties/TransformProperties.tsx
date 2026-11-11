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
  updateLayer,
  updateObject,
} from "../../../store/actions/actions";
import { ILayer } from "../../../store/reducers/i-layers";
import { IStore } from "../../../store/store";
import FormWithLayout, {
  flattenForm,
} from "../../../utils/form-layout/form-layout";
import { IFormLayoutItem } from "webslider-sdk/lib/form/i-form-layout";
import css from "./TransformProperties.module.scss";
import {
  getTransformObjectPropertiesDefinition,
  getTransformPropertiesValues,
} from "webslider-sdk/lib/objects/transform-properties";

type IObjectOrLayer = any; // IObject | ILayer;

type IPropertiesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    className?: string;
  };

const TransformProperties: React.FC<IPropertiesPanel> = (props) => {
  const {
    object,
    objectLayer,
    layer,
    slide,
    selectionForProperties,
    _updateObject,
    _updateLayer,
    className,
    objects,
    breakpoints,
  } = props;

  const renderObjectProperties = (object: IObject, _objectLayer: ILayer) => {
    const transformDefinitionProperties =
      getTransformObjectPropertiesDefinition();

    const transformDefinitionValues = {
      ...getTransformPropertiesValues(),
      ...(object.transform ?? {}),
    };
    const transformDefinitionValuesMetadata = {};

    return (
      <>
        {renderProperties(
          transformDefinitionProperties,
          transformDefinitionValues,
          transformDefinitionValuesMetadata,
          object,
          _updateObject
        )}
      </>
    );
  };

  const renderLayerProperties = (layer: ILayer) => {
    return (
      <>
        {renderProperties(
          getTransformObjectPropertiesDefinition(true),
          {
            ...getTransformPropertiesValues(),
            ...(layer.transform ?? {}),
          },
          {},
          layer,
          _updateLayer
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
        const retValues = cloneDeep(values);

        if (retObj) {
          retValues[propertyName] = value;
          retObj.transform = retValues;

          // >>> exception for image TODO: REMOVE TO POST PROCESS FUNCTIONS
          // use image w and h for the object
          if (property.inputType === InputType.IMAGE) {
            // set placeholder to false
            retValues[propertyName].isPlaceholder = false;
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
          const valuesMetadata = retObj.transformDefinition.valuesMetadata as {
            [key: string]: any;
          };
          valuesMetadata[propertyName] = metadata;

          const values = retObj.transformDefinition.values as {
            [key: string]: any;
          };
          // delete value when deselect device
          breakpoints.breakpointsConfiguration
            .map((item) => item.type)
            .forEach((allType) => {
              if (
                valuesMetadata[propertyName]?.devices.indexOf(allType) === -1
              ) {
                delete values[propertyName + "_D_" + allType];
              }
            });

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

    if (selectionForProperties?.type === "layer" && layer) {
      return renderLayerProperties(layer);
    }

    if (selectionForProperties?.type === "object" && object) {
      return renderObjectProperties(object, objectLayer);
    }

    if (selectionForProperties?.type === "slide" && slide) {
      return <div>Slider has no transform properties.</div>;
    }
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
  const { objects, layers, selection, settings, pages } = state.project;

  const { activeObjectId, activeLayerId, activeSlideId } = selection;

  const { breakpoints } = settings;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  const objectLayer = layers.layerById[object?.layerId as any] || null;
  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;
  const slide = activeSlideId ? pages.pageById[activeSlideId] : null;

  return {
    objects,
    object,
    objectLayer,
    layer,
    slide,
    selectionForProperties: selection.selectionForProperties,
    breakpoints,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransformProperties);
