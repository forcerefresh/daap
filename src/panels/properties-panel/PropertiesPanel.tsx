import classnames from "classnames";
import { cloneDeep, includes } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import { InfoInputForm } from "../../inputs/info-input/info-input";
import { getInputFormWithOptions } from "../../inputs/input-factory";
import { getInheritTimeField } from "../../inputs/input-utils";
import {
  IInputMetadataValues,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import {
  updateLayer,
  updateObject,
  updateSlide,
} from "../../store/actions/actions";
import { ILayer, layerDefinition } from "../../store/reducers/i-layers";
import { ISlide, SlideType } from "../../store/reducers/i-slides";
import { ISlideDuration } from "webslider-sdk/lib/common/i-slider-duration";
import { IStore } from "../../store/store";
import FormWithLayout, {
  flattenForm,
} from "../../utils/form-layout/form-layout";
import { IFormLayoutItem } from "webslider-sdk/lib/form/i-form-layout";
import css from "./PropertiesPanel.module.scss";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import { createObject } from "../../objects/create-object-factory";

type IObjectOrLayer = any; // IObject | ILayer;

type IPropertiesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    className?: string;
  };

export const PropertiesPanel: React.FC<IPropertiesPanel> = (props) => {
  const {
    object,
    objectLayer,
    layer,
    slide,
    selectionForProperties,
    panelName,
    commonSlideDuration,
    commonSlideExitDuration,
    _updateObject,
    _updateLayer,
    _updateSlide,
    className,
    objects,
  } = props;

  const renderSlideProperties = (slide: ISlide) => {
    if (slide.slideType === SlideType.Normal) {
      return (
        <>
          {getInheritTimeField(
            "Duration",
            slide.duration,
            [
              { label: "Inherit from default settings", value: "inherit" },
              { label: "Custom", value: "custom" },
            ],
            (duration: ISlideDuration) => {
              const retObj = cloneDeep(slide);
              retObj.duration = duration;
              _updateSlide(retObj);
            },
            commonSlideDuration
          )}
          {getInheritTimeField(
            "Exit",
            slide.exitDuration,
            [
              { label: "Inherit from default settings", value: "inherit" },
              { label: "Custom", value: "custom" },
            ],
            (exitDuration: ISlideDuration) => {
              const retObj = cloneDeep(slide);
              retObj.exitDuration = exitDuration;
              _updateSlide(retObj);
            },
            commonSlideExitDuration
          )}
        </>
      );
    } else {
      return (
        <>
          <InfoInputForm
            displayName=""
            helperText={`${slide.name} slide has no properties. It's place is above all other slider and has unlimited duration.`}
            inputType={InputType.INFO}
          />
        </>
      );
    }
  };

  const renderLayerProperties = (layer: ILayer) => {
    return "Layer does not have properties.";

    // return (
    //   <>
    //     {/* {renderProperties(
    //       layerDefinition,
    //       layer.definition.values,
    //       layer.definition.valuesMetadata,
    //       layer,
    //       _updateLayer
    //     )} */}
    //   </>
    // );
  };

  const renderObjectProperties = (object: IObject, objectLayer: ILayer) => {
    const tmpObj = createObject(object.type, {});

    if (!object.definition && !tmpObj.definition) {
      return <div>Object '{object.type}' has no properties.</div>;
    }

    // check for forward compatibility
    const definitionProperties = tmpObj.definition?.properties ?? [];
    const definitionValues = {
      ...(tmpObj.definition?.values ?? {}),
      ...(object.definition?.values ?? {}),
    };
    const definitionValuesMetadata = {
      ...(tmpObj.definition?.valuesMetadata ?? {}),
      ...(object.definition?.valuesMetadata ?? {}),
    };

    return (
      <>
        {renderProperties(
          definitionProperties,
          definitionValues,
          definitionValuesMetadata,
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

    // add devices inputs
    flatForm = flatForm.reduce((acc, curr, idx) => {
      acc.push(curr);

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
      const propertyName = property.propertyName;

      function onChange(value: any) {
        const retObj = cloneDeep(objectOrLayer);

        if (retObj) {
          const values = retObj.definition.values as { [key: string]: any };
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
          const valuesMetadata = retObj.definition.valuesMetadata as {
            [key: string]: any;
          };
          valuesMetadata[propertyName] = metadata;

          // cleanup if device is removed >>
          const devicePropertiesNames: string[] = [];
          Object.keys(retObj.definition.values).forEach((pName) => {
            if (pName?.startsWith(propertyName + "_D_")) {
              devicePropertiesNames.push(pName);
            }
          });
          if (devicePropertiesNames && metadata.devices) {
            debugger;
            devicePropertiesNames.forEach((possibleRemoveDevice) => {
              if (
                !includes(
                  metadata.devices,
                  possibleRemoveDevice.split("_D_")[1]
                )
              ) {
                delete retObj.definition.values[possibleRemoveDevice];
              }
            });
          }
          // end cleanup

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
      return renderSlideProperties(slide);
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

  const {
    breakpoints,
    slideDuration: commonSlideDuration,
    exitSlideDuration: commonSlideExitDuration,
  } = settings;

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
    // activeObjectId,
    objects,
    object,
    objectLayer,
    layer,
    slide,
    selectionForProperties: selection.selectionForProperties,
    panelName,
    commonSlideDuration,
    commonSlideExitDuration,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
  _updateSlide: (slide: ISlide) => updateSlide(slide),
};

export default connect(mapStateToProps, mapDispatchToProps)(PropertiesPanel);
