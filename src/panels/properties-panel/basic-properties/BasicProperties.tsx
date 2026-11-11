import { cloneDeep } from "lodash-es";
import React from "react";
import { connect } from "react-redux";

import {
  getTextField,
} from "../../../inputs/input-utils";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import {
  updateLayer,
  updateObject,
  updateSlide,
} from "../../../store/actions/actions";
import { ILayer } from "../../../store/reducers/i-layers";
import { IStore } from "../../../store/store";
import css from "./BasicProperties.module.scss";
import { IPage } from "../../../store/reducers/i-pages";

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
        )}
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
      </>
    );
  };

  const renderObjectProperties = (object: IObject, _objectLayer: ILayer) => {
    return (
      <>
        {getTextField("Name", object.name, (name: string) => {
          const retObj = cloneDeep(object);
          retObj.name = name;
          _updateObject(retObj);
        })}
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
  const { objects, layers, selection, pages } = state.project;

  const { activeObjectId, activeLayerId, activeSlideId } = selection;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  const objectLayer = layers.layerById[object?.layerId as any] || null;
  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;
  const slide = activeSlideId ? pages.pageById[activeSlideId] : null;

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
