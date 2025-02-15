import { cloneDeep } from "lodash-es";
import React from "react";
import { connect } from "react-redux";

import {
  getNumericFiled,
  getTextArea,
  getTextField,
} from "../../../inputs/input-utils";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import {
  setDevice,
  updateLayer,
  updateObject,
  updateSlide,
} from "../../../store/actions/actions";
import { ILayer } from "../../../store/reducers/i-layers";
import { IStore } from "../../../store/store";
import css from "./BasicProperties.module.scss";
import { IPage, PageType } from "../../../store/reducers/i-pages";

type IBasicProperties = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    hideHeader?: boolean;
    className?: string;
  };

const BasicProperties: React.FC<IBasicProperties> = (props) => {
  const {
    object,
    objectLayer,
    layer,
    slide,
    selectionForProperties,
    _updateObject,
    _updateLayer,
    _updateSlide,
  } = props;

  const renderSlideProperties = (slide: IPage) => {
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
          undefined
          // { disabled: !slide.type || slide.type !== PageType.Normal }
        )}
        {/* {getTextField("ID", slide.customId, (customId: string) => {
          const retObj = cloneDeep(slide);
          retObj.customId = customId;
          _updateSlide(retObj);
        })}
        {getTextArea("Title", slide.title ?? "", (title: string) => {
          const retObj = cloneDeep(slide);
          retObj.title = title;
          _updateSlide(retObj);
        })}
        {getTextArea(
          "Description",
          slide.description ?? "",
          (description: string) => {
            const retObj = cloneDeep(slide);
            retObj.description = description;
            _updateSlide(retObj);
          }
        )} */}
      </>
    );
  };

  const renderLayerProperties = (layer: ILayer) => {
    return (
      <>
        {getTextField("Name", layer.name, (name: string) => {
          const retObj = cloneDeep(layer);
          retObj.name = name;
          _updateLayer(retObj);
        })}
        {/* {getTextField("ID", layer.customId, (customId: string) => {
          const retObj = cloneDeep(layer);
          retObj.customId = customId;
          _updateLayer(retObj);
        })}
        {getTextArea("Title", layer.title ?? "", (title: string) => {
          const retObj = cloneDeep(layer);
          retObj.title = title;
          _updateLayer(retObj);
        })}
        {getTextArea(
          "Description",
          layer.description ?? "",
          (description: string) => {
            const retObj = cloneDeep(layer);
            retObj.description = description;
            _updateLayer(retObj);
          }
        )} */}
      </>
    );
  };

  const renderObjectProperties = (object: IObject, objectLayer: ILayer) => {
    //const layoutedByParent = objectLayer.definition.values.hasLayoutChildren;
    //const parentHasLayout = objectLayer.layout !== "none";

    return (
      <>
        {getTextField("Name", object.name, (name: string) => {
          const retObj = cloneDeep(object);
          retObj.name = name;
          _updateObject(retObj);
        })}
        {/* {getTextField("ID", object.customId, (customId: string) => {
          const retObj = cloneDeep(object);
          retObj.customId = customId;
          _updateObject(retObj);
        })}
        {getTextArea("Title", object.title ?? "", (title: string) => {
          const retObj = cloneDeep(object);
          retObj.title = title;
          _updateObject(retObj);
        })}
        {getTextArea(
          "Description",
          object.description ?? "",
          (description: string) => {
            const retObj = cloneDeep(object);
            retObj.description = description;
            _updateObject(retObj);
          }
        )} */}
      </>
    );
  };

  const renderObjectOrLayerOrSlide = () => {
    if (!selectionForProperties) {
      return null;
    }

    if (selectionForProperties?.type === "layer" && layer) {
      if (!layer) {
        return <div>No layer is selected.</div>;
      }
      return renderLayerProperties(layer);
    }

    if (selectionForProperties?.type === "object") {
      if (!object) {
        return <div>No object is selected</div>;
      }
      return renderObjectProperties(object, objectLayer);
    }

    if (selectionForProperties?.type === "slide") {
      if (!slide) {
        return <div>No page is selected</div>;
      }
      return renderSlideProperties(slide);
    }
  };

  return (
    <div className={css.propertiesHolder}>{renderObjectOrLayerOrSlide()}</div>
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
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
  _updateSlide: (slide: IPage) => updateSlide(slide),
};

export default connect(mapStateToProps, mapDispatchToProps)(BasicProperties);
