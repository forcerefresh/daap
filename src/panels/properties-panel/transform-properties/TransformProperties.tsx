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
  updateSlide,
} from "../../../store/actions/actions";
import { ILayer } from "../../../store/reducers/i-layers";
import { IPage } from "../../../store/reducers/i-pages";
import { IStore } from "../../../store/store";
import FormWithLayout, {
  flattenForm,
} from "../../../utils/form-layout/form-layout";
import { IFormLayoutItem } from "webslider-sdk/lib/form/i-form-layout";
import css from "./TransformProperties.module.scss";
import { createObject } from "../../../objects/create-object-factory";
import {
  getTransformObjectPropertiesDefinition,
  getTransformPropertiesValues,
} from "webslider-sdk/lib/objects/transform-properties";
import { DeviceType } from "aws-sdk/clients/ec2";

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
    _updateSlide,
    className,
    objects,
    breakpoints,
  } = props;

  const renderObjectProperties = (object: IObject, objectLayer: ILayer) => {
    // const tmpObj = createObject(object.type, {});

    // if (!object.transformDefinition && !tmpObj.transformDefinition) {
    //   return "Element does not have common transform properties";
    // }

    // check for forward compatibility
    const transformDefinitionProperties =
      getTransformObjectPropertiesDefinition();
    // tmpObj.transformDefinition?.properties ?? [];

    const transformDefinitionValues = {
      // ...(tmpObj.transform ?? {}),
      ...getTransformPropertiesValues(),
      ...(object.transform ?? {}),
    };
    const transformDefinitionValuesMetadata = {
      // ...(tmpObj.transformDefinition?.valuesMetadata ?? {}),
      // ...(object.transformDefinition?.valuesMetadata ?? {}),
    };

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
    // properties: [...getTransformObjectPropertiesDefinition()],
    // values: { ...getTransformPropertiesValues() },
    // if (!layer.transformDefinition)
    //   return "Element does not have common transform properties";

    return (
      <>
        {renderProperties(
          getTransformObjectPropertiesDefinition(true), // TODO
          {
            ...getTransformPropertiesValues(),
            ...(layer.transform ?? {}),
          },
          {
            ...{},
            // ...(layer.transformDefinition?.valuesMetadata ?? {}),
          },
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

    // add devices inputs
    flatForm = flatForm.reduce((acc, curr, idx) => {
      acc.push(curr);

      // add if not exist
      // if (valuesMetadata[curr.propertyName!]?.devices?.length > 0) {
      //   valuesMetadata[curr.propertyName!].devices.map((device: DeviceType) => {
      //     const dPropertyName = curr.propertyName + "_D_" + device;
      //     const newInput = cloneDeep(curr);
      //     newInput.propertyName = dPropertyName;
      //     delete newInput?.extraOptions;
      //     delete newInput?.optional;
      //     acc.push(newInput);

      //     // NOTE: copy default value
      //     if (!values[dPropertyName]) {
      //       values[dPropertyName] = cloneDeep(values[curr.propertyName]);
      //     }
      //   });
      // }
      return acc;
    }, [] as IFormLayoutItem[]);

    let layerObjects: IObject[] = [];
    if (objectOrLayer.type === "layer") {
      layerObjects = objectOrLayer?.objectIds.map(
        (id: any) => objects.objectById[id]
      );
    }

    const inputs = flatForm.map((property, idx) => {
      const { propertyName } = property;

      function onChange(value: any) {
        const retObj = cloneDeep(objectOrLayer);
        const retValues = cloneDeep(values);

        if (retObj) {
          //const values = retObj.transformDefinition.values as {
          //[key: string]: any;
          //};

          retValues[propertyName] = value;

          // if (!retObj.transformDefinition) {
          //   retObj.transformDefinition = {
          //     properties,
          //     values,
          //     valuesMetadata,
          //   };
          // }

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
  const { selectedDevice } = state.stage;

  const { activeObjectId, activeLayerId, activeSlideId } = selection;

  const { breakpoints } = settings;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  const objectLayer = layers.layerById[object?.layerId as any] || null;
  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;
  const slide = activeSlideId ? pages.pageById[activeSlideId] : null;

  let panelName:
    | { name?: string; type: "object" | "layer" | "slide" }
    | undefined;

  if (selection.selectionForProperties?.type === "layer" && layer) {
    panelName = { name: layer.name, type: "layer" };
  }

  if (selection.selectionForProperties?.type === "object" && object) {
    panelName = { name: object.name, type: "object" };
  }

  if (selection.selectionForProperties?.type === "slide" && slide) {
    panelName = { name: slide.name, type: "slide" };
  }

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
  _updateSlide: (slide: IPage) => updateSlide(slide),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransformProperties);
