import { cloneDeep } from "lodash-es";
import React from "react";
import { connect } from "react-redux";

import {
  getAbsoluteLayoutField,
  getSnapLayoutField,
  getGridLayoutField,
  getSelectField,
} from "../../../inputs/input-utils";
import {
  ILayout,
  IObject,
  IGridLayouts,
  IAbsoluteLayouts,
  ISnapLayouts,
} from "../../../webslider-sdk/src/objects/i-object";
import {
  setDevice,
  updateLayer,
  updateObject,
} from "../../../store/actions/actions";
import { ILayer } from "../../../store/reducers/i-layers";
import { IStore } from "../../../store/store";
import css from "./LayoutProperties.module.scss";
import { InfoInputForm } from "../../../inputs/info-input/info-input";
import { InputType } from "../../../webslider-sdk/src/inputs/i-inputs";

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
  } = props;

  const renderLayerProperties = (layer: ILayer) => {
    return (
      <>
        {renderLayoutOptions(layer, _updateLayer)}
        {renderLayoutOptionProperties(layer, _updateLayer)}
      </>
    );
  };

  const renderObjectProperties = (object: IObject, objectLayer: ILayer) => {
    const layoutedByParent = objectLayer.definition.values.hasLayoutChildren;
    const parentHasLayout = objectLayer.layout !== "none";

    return (
      <>
        {renderLayoutOptions(
          object,
          _updateObject,
          layoutedByParent,
          parentHasLayout
        )}
        {renderLayoutOptionProperties(object, _updateObject, layoutedByParent)}
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
      return (
        <InfoInputForm
          displayName=""
          helperText={`Slide has no layout options.`}
          inputType={InputType.INFO}
        />
      );
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
