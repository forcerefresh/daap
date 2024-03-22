import { cloneDeep, isEmpty } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import FormWithLayoutConnected, {
  flattenForm,
} from "../../../utils/form-layout/form-layout";
import {
  getAbsoluteLayoutField,
  getSnapLayoutField,
  getGridLayoutField,
  getSelectField,
  getFitLayoutField,
  getInsetLayoutField,
} from "../../../inputs/input-utils";
import {
  ILayout,
  IObject,
  IGridLayout,
  IAbsoluteLayout,
  ISnapLayout,
  IFitLayout,
  IInsetLayout,
  IDefinition,
} from "webslider-sdk/lib/objects/i-object";
import {
  setDevice,
  updateLayer,
  updateObject,
} from "../../../store/actions/actions";
import { ILayer, layerDefinition } from "../../../store/reducers/i-layers";
import { IStore } from "../../../store/store";
import css from "./LayoutProperties.module.scss";
import { InfoInputForm } from "../../../inputs/info-input/info-input";
import {
  IInputMetadataValues,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
import {
  getInputForm,
  getInputFormWithOptions,
} from "../../../inputs/input-factory";
import {
  FormType,
  IFormLayoutItem,
} from "webslider-sdk/lib/form/i-form-layout";
import { layoutAdvancedDefinition } from "../../../objects/layout-advanced-form";
import { getDefaultLayoutAdvance } from "webslider-sdk/lib/objects/create-common-object";
import { Breakpoints } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { DeviceType } from "aws-sdk/clients/ec2";

type ILayoutProperties = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    hideHeader?: boolean;
    className?: string;
  };

export const LayoutProperties: React.FC<ILayoutProperties> = (props) => {
  const {
    selectedDevice,
    breakpoints,
    object,
    objectLayer,
    layer,
    slide,
    selectionForProperties,
    _updateObject,
    _updateLayer,
    _setDevice,
    objects,
  } = props;

  const renderLayerProperties = (lay: ILayer) => {
    return (
      <>
        {renderLayoutOptions(lay, _updateLayer)}
        {renderLayoutOptionProperties(lay, _updateLayer)}
        {renderNamedProperties(
          "definition",
          layerDefinition,
          lay.definition.values,
          lay.definition.valuesMetadata,
          lay,
          _updateLayer
        )}
        {renderNamedProperties(
          "layoutAdvance",
          layoutAdvancedDefinition,
          lay.layoutAdvance?.values ?? {},
          lay.layoutAdvance?.valuesMetadata ?? {},
          lay,
          _updateLayer
        )}
      </>
    );
  };

  const renderObjectProperties = (obj: IObject, objectLayer: ILayer) => {
    // TODO: V2
    const layoutedByParent = false; // objectLayer.definition.values.hasLayoutChildren;
    const parentHasLayout = false; // objectLayer.layout !== "none";

    return (
      <>
        {renderLayoutOptions(
          obj,
          _updateObject,
          layoutedByParent,
          parentHasLayout
        )}
        {renderLayoutOptionProperties(
          obj,
          _updateObject,
          layoutedByParent,
          objectLayer,
          parentHasLayout
        )}
        {renderNamedProperties(
          "layoutAdvance",
          layoutAdvancedDefinition,
          obj.layoutAdvance?.values ?? {},
          obj.layoutAdvance?.valuesMetadata ?? {},
          obj,
          _updateObject
        )}
      </>
    );
  };

  const renderNamedProperties = (
    namedProperty: "layoutAdvance" | "definition",
    properties: any[],
    values: any,
    valuesMetadata: any,
    objectOrLayer: ILayout & { definition: IDefinition },
    updateFunction: (objectOrLayer: any) => any
  ) => {
    let layerObjects: IObject[] = [];
    if ((objectOrLayer as any)?.type === "layer") {
      layerObjects = (objectOrLayer as any)?.objectIds.map(
        (id: any) => objects.objectById[id]
      );
    }

    const flatForm = flattenForm(properties as IFormLayoutItem[]);

    const inputs = flatForm.map((property, idx) => {
      const { propertyName } = property;

      function onChange(value: any) {
        const retObj = cloneDeep(objectOrLayer);

        // add default values to get form rendered
        if (!retObj.layoutAdvance) {
          retObj.layoutAdvance = {
            values: getDefaultLayoutAdvance(),
            valuesMetadata: {},
          };
        }

        if (retObj) {
          const values =
            (retObj[namedProperty]?.values as {
              [key: string]: any;
            }) ?? {};
          values[propertyName] = value;
          updateFunction(retObj);
        }
      }

      function onMetadataChange(metadata: IInputMetadataValues) {
        const retObj = cloneDeep(objectOrLayer);

        if (retObj) {
          const valuesMetadata =
            (retObj[namedProperty]?.valuesMetadata as {
              [key: string]: any;
            }) ?? {};
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
      <FormWithLayoutConnected
        values={values}
        inputs={inputs}
        form={properties as IFormLayoutItem[]}
        formId={namedProperty as string}
        skipOpeningGroupByDefault={true}
      />
    );
  };

  const isBreakpointTypeVisibleForLayer = (
    deviceType: DeviceType,
    l: ILayer
  ) => {
    if (l.responsiveVisibility.showAll) return true;
    return l.responsiveVisibility.displayOn.indexOf(deviceType as any) !== -1;
  };

  const getBreakpointConfigForLayer = (l?: ILayer, b?: Breakpoints) => {
    if (!l || !b) return b;

    return {
      breakpointsConfiguration: b.breakpointsConfiguration.filter((bc) =>
        isBreakpointTypeVisibleForLayer(bc.type, l)
      ),
    };
  };

  const renderLayoutOptionProperties = (
    objectOrLayer: ILayout,
    updateFunction: any,
    layoutedByParent = false,
    objectLayer?: ILayer,
    parentHasLayout?: boolean
  ) => {
    const usedBreakpoints = getBreakpointConfigForLayer(
      objectLayer ?? (objectOrLayer as ILayer),
      breakpoints
    );
    return (
      <>
        {objectOrLayer.layout === "grid" &&
          getGridLayoutField(
            "",
            objectOrLayer.gridLayout,
            (gridLayout?: IGridLayout) => {
              const retObj = cloneDeep(objectOrLayer);
              retObj.gridLayout = gridLayout;
              updateFunction(retObj);
            },
            { disablePosition: layoutedByParent },
            usedBreakpoints,
            selectedDevice,
            (device: string) => {
              _setDevice(device);
            }
          )}
        {objectOrLayer.layout === "absolute" &&
          getAbsoluteLayoutField(
            "",
            objectOrLayer.absoluteLayout,
            (absoluteLayout?: IAbsoluteLayout) => {
              const retObj = cloneDeep(objectOrLayer);
              retObj.absoluteLayout = absoluteLayout;
              updateFunction(retObj);
            },
            {
              selfSize: objectOrLayer.selfSize,
              disablePosition: layoutedByParent,
              disableSize: objectOrLayer.selfSize,
            },
            usedBreakpoints,
            selectedDevice,
            (device: string) => {
              _setDevice(device);
            },
            parentHasLayout
          )}
        {objectOrLayer.layout === "snap" &&
          getSnapLayoutField(
            "",
            objectOrLayer.snapLayout,
            (edgeLayout?: ISnapLayout) => {
              const retObj = cloneDeep(objectOrLayer);
              retObj.snapLayout = edgeLayout;
              updateFunction(retObj);
            },
            {
              selfSize: objectOrLayer.selfSize,
              disablePosition: layoutedByParent,
            },
            usedBreakpoints,
            selectedDevice,
            (device: string) => {
              _setDevice(device);
            },
            parentHasLayout
          )}

        {objectOrLayer.layout === "fit" &&
          getFitLayoutField(
            "",
            objectOrLayer.fitLayout,
            (fitLayout?: IFitLayout) => {
              const retObj = cloneDeep(objectOrLayer);
              retObj.fitLayout = fitLayout;
              updateFunction(retObj);
            },
            {
              selfSize: objectOrLayer.selfSize,
              disablePosition: layoutedByParent,
            },
            usedBreakpoints,
            selectedDevice,
            (device: string) => {
              _setDevice(device);
            },
            parentHasLayout
          )}

        {objectOrLayer.layout === "inset" &&
          getInsetLayoutField(
            "",
            objectOrLayer.insetLayout,
            (insetLayout?: IInsetLayout) => {
              const retObj = cloneDeep(objectOrLayer);
              retObj.insetLayout = insetLayout;
              updateFunction(retObj);
            },
            {
              selfSize: objectOrLayer.selfSize,
              disablePosition: layoutedByParent,
            },
            usedBreakpoints,
            selectedDevice,
            (device: string) => {
              _setDevice(device);
            },
            parentHasLayout
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
    const type = (object as unknown as { type: "object" | "layer" }).type;
    const options = [];
    object.supportedLayout.none &&
      options.push({ label: "No layout", value: "none" });
    object.supportedLayout.absolute &&
      options.push({ label: "Absolute", value: "absolute" });
    object.supportedLayout.grid &&
      type === "layer" &&
      options.push({ label: "Grid", value: "grid" });
    options.push({ label: "Snap", value: "snap" });
    object.supportedLayout.fit && options.push({ label: "Fit", value: "fit" });
    object.supportedLayout.inset &&
      options.push({ label: "Inset", value: "inset" });

    const onChange = (layout: any) => {
      const retObj = cloneDeep(object);
      retObj.layout = layout;
      updateFunction(retObj);
    };

    let helperText: any;
    if (layoutedByParent || parentHasLayout) {
      helperText = (
        <>
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

  // >>>> ---- copy from PropertiesPanel START
  // <<<< ---- copy from PropertiesPanel STOP

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
      return <div>Slide has no layout options.</div>;
    }
  };

  return (
    <div className={css.propertiesHolder}>{renderObjectOrLayerOrSlide()}</div>
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
    selectedDevice,
    breakpoints,
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
  _setDevice: setDevice,
};

export default connect(mapStateToProps, mapDispatchToProps)(LayoutProperties);
