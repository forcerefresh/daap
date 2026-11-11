import classnames from "classnames";
import { cloneDeep, first, includes, isEmpty, last } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import { InfoInputForm } from "../../inputs/info-input/info-input";
import { getInputFormWithOptions } from "../../inputs/input-factory";
import {
  IInputMetadataValues,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import {
  activateLayer,
  deleteLayersThree,
  deleteObjects,
  deleteSlideThree,
  duplicateLayers,
  duplicateSlides,
  moveLayers,
  selectForProperties,
  selectForPropertiesProps,
  selectLayers,
  updateLayer,
  updateObject,
  updateObjectForPreview,
  updateSlide,
} from "../../store/actions/actions";
import { ILayer } from "../../store/reducers/i-layers";
import { IPage, PageType } from "../../store/reducers/i-pages";
import { IStore } from "../../store/store";
import FormWithLayout, {
  flattenForm,
} from "../../utils/form-layout/form-layout";
import { IFormLayoutItem } from "webslider-sdk/lib/form/i-form-layout";
import css from "./PropertiesPanel.module.scss";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";
import { Button } from "@blueprintjs/core";

type IObjectOrLayer = any; // IObject | ILayer;

type IPropertiesPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    className?: string;
  };

export const PropertiesPanel: React.FC<IPropertiesPanel> = (props) => {
  const {
    layerArr,
    object,
    objectLayer,
    layer,
    slide,
    selectionForProperties,
    _updateObjectForPreview,
    _updateObject,
    _deleteSlideThree,
    _deleteLayersThree,
    _activateLayer,
    _selectForProperties,
    _selectLayers,
    _duplicateSlides,
    _moveLayers,
    className,
    objects,
    _deleteObjects,
    _duplicateLayers,
  } = props;

  const renderSlideProperties = (slide: IPage) => {
    if (!slide.type || slide.type === PageType.Normal) {
      return (
        <>
          <div className={css.actionHolder}>
            <Button
              onClick={() => {
                _duplicateSlides([slide.id]);
              }}
              icon={"duplicate"}
            >
              Duplicate
            </Button>
          </div>
          <div className={css.actionHolder}>
            <Button
              style={{ alignSelf: "end" }}
              icon={"trash"}
              minimal
              intent={"danger"}
              onClick={() => {
                _deleteSlideThree(slide.id);
              }}
            ></Button>
          </div>
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
    const isFirst = first(layerArr)?.id === layer.id;
    const isLast = last(layerArr)?.id === layer.id;

    const idx = layerArr.findIndex((layerItem) => layerItem.id === layer.id);

    return (
      <>
        <div className={css.actionHolder}>
          <Button
            disabled={isLast}
            onClick={() => {
              _moveLayers(layerArr[idx + 1].id, "below", [layer.id]);
            }}
            icon="arrow-up"
          >
            Move up
          </Button>
          <Button
            disabled={isFirst}
            onClick={() => {
              _moveLayers(layerArr[idx - 1].id, "above", [layer.id]);
            }}
            icon="arrow-down"
          >
            Move down
          </Button>
        </div>
        <div className={css.actionHolder}>
          <Button
            onClick={() => {
              _duplicateLayers([layer.id]);
            }}
            icon={"duplicate"}
          >
            Duplicate
          </Button>
        </div>
        <div className={css.actionHolder}>
          <Button
            style={{ alignSelf: "end" }}
            icon={"trash"}
            minimal
            intent={"danger"}
            onClick={() => {
              let layerIdToSelect: ILayer | undefined = undefined;

              if (layerArr.length > 1) {
                if (layerArr[0].id === layer.id) {
                  layerIdToSelect = layerArr[1];
                } else {
                  const idx = layerArr.findIndex(
                    (layerItem) => layerItem.id === layer.id
                  );

                  layerIdToSelect = layerArr[idx - 1];
                }
              }

              _deleteLayersThree([layer.id]);

              if (layerIdToSelect) {
                _activateLayer(layerIdToSelect.id);
                _selectLayers([layerIdToSelect.id]);
                _selectForProperties({ type: "layer", id: layerIdToSelect.id });
              }
            }}
          ></Button>
        </div>
      </>
    );

    return null;
  };

  const renderObjectProperties = (object: IObject, _objectLayer: ILayer) => {
    if (isEmpty(object.properties)) {
      return <></>;
    }

    const definitionProperties = getAppObjectDefinition(
      object.type,
      "latest"
    )?.getObjectForm();
    const definitionValues = {
      ...object.properties,
    };
    const definitionValuesMetadata = {};

    return (
      <>
        {renderProperties(
          definitionProperties,
          definitionValues,
          definitionValuesMetadata,
          object,
          _updateObject,
          _updateObjectForPreview
        )}
        <div className={css.actionHolder}>
          <Button
            style={{ alignSelf: "end" }}
            icon={"trash"}
            minimal
            intent={"danger"}
            onClick={() => {
              _deleteObjects([object.id]);
            }}
          ></Button>
        </div>
      </>
    );
  };

  const renderProperties = (
    properties: any[],
    values: any,
    valuesMetadata: any,
    objectOrLayer: IObjectOrLayer,
    updateFunction: (objectOrLayer: IObjectOrLayer) => any,
    updateFunctionForPreview: (objectOrLayer: IObjectOrLayer) => any
  ) => {
    let flatForm = flattenForm(properties as IFormLayoutItem[]);

    // add devices inputs
    flatForm = flatForm.reduce((acc, curr, _idx) => {
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

    const inputs = flatForm.map((property, _idx) => {
      const propertyName = property.propertyName;

      function onChange(value: any) {
        const retObj = cloneDeep(objectOrLayer);

        if (retObj) {
          const values = retObj.properties as { [key: string]: any };
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

      function onPreview(value: any) {
        const retObj = cloneDeep(objectOrLayer);

        if (retObj) {
          const values = retObj.properties as { [key: string]: any };
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

          updateFunctionForPreview(retObj);
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
          { layerData: { layer: layer!, objects: layerObjects } },
          onPreview
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
        skipOpeningGroupByDefault={true}
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
  const { objects, layers, selection, pages } = state.project;

  const { activeObjectId, activeLayerId, activeSlideId } = selection;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  const objectLayer = layers.layerById[object?.layerId as any] || null;
  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;
  const slide = activeSlideId ? pages.pageById[activeSlideId] : null;

  let layerArr: ILayer[] = [];
  if (selection.activeSlideId) {
    const layerIds = pages.pageById[selection.activeSlideId].layerIds;
    layerArr = layerIds.map((layerId: string) => layers.layerById[layerId]);
  }

  return {
    layerArr,
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
  _updateObjectForPreview: (object: IObject) => updateObjectForPreview(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
  _updateSlide: (slide: IPage) => updateSlide(slide),
  _deleteLayersThree: (layerIds: string[]): any => deleteLayersThree(layerIds),
  _activateLayer: (layerId: string) => activateLayer(layerId),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _selectLayers: (layerIds: string[]) => selectLayers(layerIds),
  _duplicateSlides: (ids: string[]): any => duplicateSlides(ids),
  _duplicateLayers: (ids: string[]): any => duplicateLayers(ids),
  _moveLayers: (
    refId: string,
    where: "above" | "below" | "layer" | "slide" | "bottom",
    moveIds: string[]
  ) => moveLayers(refId, where, moveIds),
  _deleteSlideThree: (id: string): any => deleteSlideThree(id),
  _deleteObjects: (ids: string[]): any => deleteObjects(ids),
};

export default connect(mapStateToProps, mapDispatchToProps)(PropertiesPanel);
