import classnames from "classnames";
import { cloneDeep } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import { InfoInputForm } from "../../inputs/info-input/info-input";
import { getInputFormWithOptions } from "../../inputs/input-factory";
import { getInheritTimeField } from "../../inputs/input-utils";
import {
  IInputMetadataValues,
  InputType,
} from "webslider-sdk2/lib/inputs/i-inputs";
import { IObject } from "webslider-sdk2/lib/objects/i-object";
import {
  updateLayer,
  updateObject,
  updateSlide,
} from "../../store/actions/actions";
import { ILayer, layerDefinition } from "../../store/reducers/i-layers";
import { ISlide, SlideType } from "../../store/reducers/i-slides";
import { ISlideDuration } from "webslider-sdk2/lib/common/i-slider-duration";
import { IStore } from "../../store/store";
import FormWithLayout, {
  flattenForm,
} from "../../utils/form-layout/form-layout";
import { IFormLayoutItem } from "webslider-sdk2/lib/form/i-form-layout";
import css from "./PropertiesPanel.module.scss";

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
    return (
      <>
        {renderProperties(
          layerDefinition,
          layer.definition.values,
          layer.definition.valuesMetadata,
          layer,
          _updateLayer
        )}
      </>
    );
  };

  const renderObjectProperties = (object: IObject, objectLayer: ILayer) => {
    // TODO const objDef = getAppObjectDefinition(object.type)

    if (object.definition.properties?.length === 0) {
      return <div>Object '{object.type}' has no properties.</div>;
    }

    return (
      <>
        {renderProperties(
          object.definition.properties!,
          object.definition.values,
          object.definition.valuesMetadata,
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
    const flatForm = flattenForm(properties as IFormLayoutItem[]);

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
