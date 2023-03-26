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
import { ISlide } from "../../../store/reducers/i-slides";
import { IStore } from "../../../store/store";
import FormWithLayout, {
  flattenForm,
} from "../../../utils/form-layout/form-layout";
import { IFormLayoutItem } from "webslider-sdk/lib/form/i-form-layout";
import css from "./CommonStyleProperties.module.scss";
import { createObject } from "../../../objects/create-object-factory";
import {
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";

type IObjectOrLayer = any; // IObject | ILayer;

type IPropertiesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    className?: string;
  };

const CommonStyleProperties: React.FC<IPropertiesPanel> = (props) => {
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
  } = props;

  const renderObjectProperties = (object: IObject, objectLayer: ILayer) => {
    const tmpObj = createObject(object.type, {});

    if (!object.commonStyleDefinition)
      return "Element does not have common style properties";

    // check for forward compatibility
    const commonStyleDefinitionProperties =
      tmpObj.commonStyleDefinition?.properties ?? [];
    const commonStyleDefinitionValues = {
      ...(tmpObj.commonStyleDefinition?.values ?? {}),
      ...(object.commonStyleDefinition?.values ?? {}),
    };
    const commonStyleDefinitionValuesMetadata = {
      ...(tmpObj.commonStyleDefinition?.valuesMetadata ?? {}),
      ...(object.commonStyleDefinition?.valuesMetadata ?? {}),
    };

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

  const renderLayerProperties = (layer: ILayer) => {
    if (!layer.commonStyleDefinition)
      return "Element does not have common style properties";

    return (
      <>
        {renderProperties(
          getCommonObjectPropertiesDefinition(), // TODO
          {
            ...getCommonPropertiesValues(),
            ...(layer.commonStyleDefinition?.values ?? {}),
          },
          {
            ...getCommonPropertiesMetadataValues(),
            ...(layer.commonStyleDefinition?.valuesMetadata ?? {}),
          },
          layer,
          _updateLayer
        )}
      </>
    );

    // return (
    //   <>
    //     {renderProperties(
    //       layer.commonStyleDefinition.properties!, // TODO
    //       layer.commonStyleDefinition.values,
    //       layer.commonStyleDefinition.valuesMetadata,
    //       layer,
    //       _updateLayer
    //     )}
    //   </>
    // );
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
      if (valuesMetadata[curr.propertyName!]?.devices?.length > 0) {
        valuesMetadata[curr.propertyName!].devices.map((device: DeviceType) => {
          const dPropertyName = curr.propertyName + "_D_" + device;
          const newInput = cloneDeep(curr);
          newInput.propertyName = dPropertyName;
          delete newInput?.extraOptions;
          delete newInput?.optional;
          acc.push(newInput);

          // NOTE: copy default value
          if (!values[dPropertyName]) {
            values[dPropertyName] = cloneDeep(values[curr.propertyName]);
          }
        });
      }
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

        if (retObj) {
          const values = retObj.commonStyleDefinition.values as {
            [key: string]: any;
          };
          values[propertyName] = value;

          // >>> exception for image TODO: REMOVE TO POST PROCESS FUNCTIONS
          // use image w and h for the object
          if (property.inputType === InputType.IMAGE) {
            // set placeholder to false
            values[propertyName].isPlaceholder = false;
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

    if (selectionForProperties?.type === "layer" && layer) {
      return renderLayerProperties(layer);
    }

    if (selectionForProperties?.type === "object" && object) {
      return renderObjectProperties(object, objectLayer);
    }

    if (selectionForProperties?.type === "slide" && slide) {
      return null;
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
  const { objects, layers, selection, settings, slides } = state.project;
  const { selectedDevice } = state.stage;

  const { activeObjectId, activeLayerId, activeSlideId } = selection;

  const { breakpoints } = settings;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  const objectLayer = layers.layerById[object?.layerId as any] || null;
  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;
  const slide = activeSlideId ? slides.slideById[activeSlideId] : null;

  let panelName:
    | { name: string; type: "object" | "layer" | "slide" }
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
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
  _updateSlide: (slide: ISlide) => updateSlide(slide),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommonStyleProperties);
