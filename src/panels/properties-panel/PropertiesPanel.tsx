import { Text } from "@blueprintjs/core";
import classnames from "classnames";
import { cloneDeep, pick, set } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import {
  getInputForm,
  getInputFormWithOptions,
} from "../../inputs/input-factory";
import {
  getAbsoluteLayoutField,
  getCoverLayoutField,
  getSnapLayoutField,
  getGridLayoutField,
  getSelectField,
} from "../../inputs/input-utils";
import { IInputMetadataValues, InputType } from "../../inputs/types";
import {
  IAbsoluteLayout,
  ISnapLayout,
  IGridLayout,
  ILayout,
  IObject,
} from "../../objects/types";
import { updateLayer, updateObject } from "../../store/actions/actions";
import { ILayer, layerDefinition } from "../../store/reducers/i-layers";
import { IStore } from "../../store/store";
import FormWithLayout, {
  flattenForm,
  IFormItem,
} from "../../utils/form-layout/form-layout";
import css from "./PropertiesPanel.module.scss";

type IObjectOrLayer = any; // IObject | ILayer;

type ISlidesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

export const PropertiesPanel: React.FC<ISlidesPanel> = (props) => {
  const {
    object,
    objectLayer,
    layer,
    forceShowLayer,
    panelName,
    _updateObject,
    _updateLayer,
  } = props;

  const renderLayerProperties = (layer: ILayer) => {
    return (
      <>
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
    return (
      <>
        {renderLayoutOptions(object, _updateObject, layoutedByParent)}
        {renderLayoutOptionProperties(object, _updateObject, layoutedByParent)}

        {renderProperties(
          object.definition.properties,
          object.definition.values,
          object.definition.valuesMetadata,
          object,
          _updateObject
        )}
        <hr />
        {renderEvents(object)}
        <hr />
        {renderCommonObjectProperties(object)}
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
            objectOrLayer.gridLayout,
            (gridLayout?: IGridLayout) => {
              const retObj = cloneDeep(objectOrLayer);
              retObj.gridLayout = gridLayout;
              updateFunction(retObj);
            },
            { disablePosition: layoutedByParent }
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
            }
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
            }
          )}
      </>
    );
  };
  const renderLayoutOptions = (
    object: ILayout,
    updateFunction: any,
    layoutedByParent = false
  ) => {
    const options = [];
    object.supportedLayout.none &&
      options.push({ label: "No layout", value: "none" });
    object.supportedLayout.absolute &&
      options.push({ label: "Absolute", value: "absolute" });
    object.supportedLayout.grid &&
      options.push({ label: "Grid", value: "grid" });
    object.supportedLayout.fit &&
      options.push({ label: "Fit Page", value: "fit_page" });
    object.supportedLayout.fit &&
      options.push({ label: "Fit Stage", value: "fit_stage" });
    object.supportedLayout.fit &&
      options.push({ label: "Fit Guidelines", value: "fit_guidelines" });

    options.push({ label: "Snap", value: "snap" });

    const onChange = (layout: any) => {
      const retObj = cloneDeep(object);
      retObj.layout = layout;
      updateFunction(retObj);
    };

    const helperText = layoutedByParent
      ? "Object is layouted by parent layer. Some configuration might be disabled (Width and Height are used, Left and Top are ignored)."
      : undefined;
    return getSelectField(
      "Layout",
      object.layout,
      options,
      onChange,
      {},
      helperText
    );
  };

  const renderEvents = (object: IObject) => {
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
  };

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
    return getInputForm(InputType.CORNER_RADIUS, objectDef, onChange);
  };

  const renderProperties = (
    properties: any[],
    values: any,
    valuesMetadata: any,
    objectOrLayer: IObjectOrLayer,
    updateFunction: (objectOrLayer: IObjectOrLayer) => any
  ) => {
    const flatForm = flattenForm(properties as IFormItem[]);

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
        form={properties as IFormItem[]}
        formId={objectOrLayer?.type as string}
      />
    );
    //
    //
    //
    //
  };

  const renderObjectOrLayer = () => {
    if (!forceShowLayer && !object) {
      return <div>No object selected</div>;
    }

    if (forceShowLayer && layer) {
      return renderLayerProperties(layer);
    }

    if (!forceShowLayer && object) {
      return renderObjectProperties(object, objectLayer);
    }
  };

  return (
    <div className={css.propertiesPanel} key={object?.id}>
      <div className={css.panelHeader}>
        PROPERTIES PANEL
        {panelName && (
          <span
            className={classnames(css.panelName, {
              [css.panelNameLayer]: panelName.type === "layer",
            })}
          >
            {" [ " + panelName.name + " ] "}
          </span>
        )}
      </div>
      <div className={css.propertiesHolder}>{renderObjectOrLayer()}</div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, layers, selection } = state.project;
  const { activeObjectId, activeLayerId } = selection;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  const objectLayer = layers.layerById[object?.layerId as any] || null;
  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;

  let panelName: { name: string; type: "object" | "layer" } | undefined;

  if (selection.forceShowLayer && layer) {
    panelName = { name: layer.name, type: "layer" };
  }

  if (!selection.forceShowLayer && object) {
    panelName = { name: object.name, type: "object" };
  }

  return {
    // activeObjectId,
    object,
    objectLayer,
    layer,
    forceShowLayer: selection.forceShowLayer,
    panelName,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
};

export default connect(mapStateToProps, mapDispatchToProps)(PropertiesPanel);
