import classnames from "classnames";
import { cloneDeep, pick, set } from "lodash-es";
import React from "react";
import { RGBColor } from "react-color";
import { connect } from "react-redux";
import { InfoInputForm } from "../../inputs/info-input/info-input";
import {
  getInputForm,
  getInputFormWithOptions,
} from "../../inputs/input-factory";
import {
  getAbsoluteLayoutField,
  getSnapLayoutField,
  getGridLayoutField,
  getSelectField,
  getTextField,
  getSlideDurationField,
  getColorField,
} from "../../inputs/input-utils";
import { IInputMetadataValues, InputType } from "../../inputs/types";
import {
  ISnapLayout,
  ILayout,
  IObject,
  IGridLayouts,
  IAbsoluteLayouts,
  ISnapLayouts,
} from "../../objects/types";
import {
  setDevice,
  updateLayer,
  updateObject,
  updateSlide,
} from "../../store/actions/actions";
import { ILayer, layerDefinition } from "../../store/reducers/i-layers";
import {
  ISlide,
  ISlideDuration,
  SlideType,
} from "../../store/reducers/i-slides";
import { IStore } from "../../store/store";
import FormWithLayout, {
  flattenForm,
} from "../../utils/form-layout/form-layout";
import {
  IFormItem,
  IFormLayoutItem,
} from "../../utils/form-layout/i-form-layout";
import css from "./PropertiesPanel.module.scss";

type IObjectOrLayer = any; // IObject | ILayer;

type IPropertiesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    hideHeader?: boolean;
    className?: string;
  };

export const PropertiesPanel: React.FC<IPropertiesPanel> = (props) => {
  const {
    selectedDevice,
    breakpoints,
    object,
    objectLayer,
    layer,
    slide,
    selectionForProperties,
    panelName,
    commonSlideDuration,
    _updateObject,
    _updateLayer,
    _updateSlide,
    _setDevice,
    hideHeader,
    className,
    objects,
  } = props;

  const renderSlideProperties = (slide: ISlide) => {
    if (slide.slideType === SlideType.Normal) {
      return (
        <>
          {getTextField("Name", slide.name, (name: string) => {
            const retObj = cloneDeep(slide);
            retObj.name = name;
            _updateSlide(retObj);
          })}
          {getTextField("Custom ID", slide.customId, (customId: string) => {
            const retObj = cloneDeep(slide);
            retObj.customId = customId;
            _updateSlide(retObj);
          })}
          {getSlideDurationField(
            "",
            slide.duration,
            (duration: ISlideDuration) => {
              const retObj = cloneDeep(slide);
              retObj.duration = duration;
              _updateSlide(retObj);
            },
            commonSlideDuration
          )}
        </>
      );
    } else {
      return (
        <>
          {getTextField(
            "Name",
            slide.name,
            (name: string) => {
              const retObj = cloneDeep(slide);
              retObj.name = name;
              _updateSlide(retObj);
            },
            undefined,
            { disabled: true }
          )}
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
        {getTextField("Name", layer.name, (name: string) => {
          const retObj = cloneDeep(layer);
          retObj.name = name;
          _updateLayer(retObj);
        })}
        {renderLayoutOptions(layer, _updateLayer)}
        {renderLayoutOptionProperties(layer, _updateLayer)}

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
    const layoutedByParent = objectLayer.definition.values.hasLayoutChildren;
    const parentHasLayout = objectLayer.layout !== "none";

    return (
      <>
        {getTextField("Name", object.name, (name: string) => {
          const retObj = cloneDeep(object);
          retObj.name = name;
          _updateObject(retObj);
        })}
        {renderLayoutOptions(
          object,
          _updateObject,
          layoutedByParent,
          parentHasLayout
        )}
        {renderLayoutOptionProperties(object, _updateObject, layoutedByParent)}

        {renderProperties(
          object.definition.properties,
          object.definition.values,
          object.definition.valuesMetadata,
          object,
          _updateObject
        )}
        {/*renderCommonObjectProperties(object)*/}
      </>
    );
  };

  const renderLayoutOptionProperties = (
    objectOrLayer: ILayout,
    updateFunction: any,
    layoutedByParent = false
  ) => {
    return (
      <>
        {objectOrLayer.layout === "grid" &&
          getGridLayoutField(
            "",
            objectOrLayer.gridLayouts,
            (gridLayouts?: IGridLayouts) => {
              const retObj = cloneDeep(objectOrLayer);
              retObj.gridLayouts = gridLayouts;
              updateFunction(retObj);
            },
            { disablePosition: layoutedByParent },
            breakpoints,
            selectedDevice,
            (device: string) => {
              _setDevice(device);
            }
          )}
        {objectOrLayer.layout === "absolute" &&
          getAbsoluteLayoutField(
            "",
            objectOrLayer.absoluteLayout,
            (absoluteLayout?: IAbsoluteLayouts) => {
              const retObj = cloneDeep(objectOrLayer);
              retObj.absoluteLayout = absoluteLayout;
              updateFunction(retObj);
            },
            {
              selfSize: objectOrLayer.selfSize,
              disablePosition: layoutedByParent,
              disableSize: objectOrLayer.selfSize,
            },
            breakpoints,
            selectedDevice,
            (device: string) => {
              _setDevice(device);
            }
          )}
        {objectOrLayer.layout === "snap" &&
          getSnapLayoutField(
            "",
            objectOrLayer.snapLayout,
            (edgeLayout?: ISnapLayouts) => {
              const retObj = cloneDeep(objectOrLayer);
              retObj.snapLayout = edgeLayout;
              updateFunction(retObj);
            },
            {
              selfSize: objectOrLayer.selfSize,
              disablePosition: layoutedByParent,
            },
            breakpoints,
            selectedDevice,
            (device: string) => {
              _setDevice(device);
            }
          )}
      </>
    );
  };
  const renderLayoutOptions = (
    object: ILayout,
    updateFunction: any,
    layoutedByParent = false,
    parentHasLayout = false
  ) => {
    const options = [];
    object.supportedLayout.none &&
      options.push({ label: "No layout", value: "none" });
    object.supportedLayout.absolute &&
      options.push({ label: "Absolute", value: "absolute" });
    object.supportedLayout.grid &&
      options.push({ label: "Grid", value: "grid" });
    options.push({ label: "Snap", value: "snap" });
    object.supportedLayout.fit &&
      options.push({ label: "Fit Page", value: "fit_page" });
    object.supportedLayout.fit &&
      options.push({ label: "Fit Stage", value: "fit_stage" });
    object.supportedLayout.fit &&
      options.push({ label: "Fit Guidebox", value: "fit_guidelines" });

    const onChange = (layout: any) => {
      const retObj = cloneDeep(object);
      retObj.layout = layout;
      updateFunction(retObj);
    };

    let helperText: any;
    if (layoutedByParent || parentHasLayout) {
      helperText = (
        <>
          {parentHasLayout && (
            <div>Note: Object position is relative to layer.</div>
          )}
          {layoutedByParent && (
            <div>
              Note: Object is layouted by parent layer. Some configuration might
              be disabled (Width and Height are used, Left and Top are ignored).
            </div>
          )}
        </>
      );
    }

    return getSelectField(
      "Layout",
      object.layout,
      options,
      onChange,
      {},
      helperText
    );
  };

  /*const renderEvents = (object: IObject) => {
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
  };*/

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
    return <>{getInputForm(InputType.CORNER_RADIUS, objectDef, onChange)}</>;
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
        console.log(value);
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
        console.log(metadata);
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
    //
    //
    //
    //
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
      {!hideHeader && (
        <div className={css.panelHeader}>
          {panelName?.type.toUpperCase()}
          {panelName && (
            <span
              className={classnames(css.panelName, {
                //[css.panelNameLayer]: panelName.type === "layer",
              })}
            >
              {" [ " + panelName.name + " ] "}
            </span>
          )}
        </div>
      )}
      <div className={css.propertiesHolder}>{renderObjectOrLayerOrSlide()}</div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, layers, selection, settings, slides } = state.project;
  const { selectedDevice } = state.stage;

  const { activeObjectId, activeLayerId, activeSlideId } = selection;

  const { breakpoints, slideDuration: commonSlideDuration } = settings;

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
    selectedDevice,
    breakpoints,
    object,
    objectLayer,
    layer,
    slide,
    selectionForProperties: selection.selectionForProperties,
    panelName,
    commonSlideDuration,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
  _updateSlide: (slide: ISlide) => updateSlide(slide),
  _setDevice: setDevice,
};

export default connect(mapStateToProps, mapDispatchToProps)(PropertiesPanel);
