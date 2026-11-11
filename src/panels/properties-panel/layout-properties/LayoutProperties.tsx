import { cloneDeep } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import {
  getNumericFiled,
  getSizePosLayoutField,
  getP1P2LayoutField,
} from "../../../inputs/input-utils";
import {
  ILayout,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import {
  setDevice,
  updateLayer,
  updateObject,
  updateObjectForPreview,
} from "../../../store/actions/actions";
import { ILayer } from "../../../store/reducers/i-layers";
import { IStore } from "../../../store/store";
import css from "./LayoutProperties.module.scss";
import { Breakpoints } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { DeviceType } from "aws-sdk/clients/ec2";
import { getAncestorLayer } from "../../../store/actions/actions-utils";
import { getAppObjectDefinition } from "webslider-sdk/lib/objects/objects-register";
import { getBounds } from "../../../objects/line/line";

type ILayoutProperties = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    hideHeader?: boolean;
    className?: string;
  };

export const LayoutProperties: React.FC<ILayoutProperties> = (props) => {
  const {
    object,
    objectLayer,
    layer,
    slide,
    selectionForProperties,
    _updateObject,
  } = props;

  const renderLayerProperties = (_lay: ILayer) => {
    return null;
  };

  const renderObjectProperties = (obj: IObject, objectLayer: ILayer | null) => {
    // TODO: V2
    const layoutedByParent = false; // objectLayer.definition.values.hasLayoutChildren;
    const parentHasLayout = false; // objectLayer.layout !== "none";

    return (
      <>
        {renderLayoutOptionProperties(
          obj,
          _updateObject,
          layoutedByParent,
          objectLayer,
          parentHasLayout
        )}

        {getNumericFiled(
          "Scale",
          `${obj.scale ?? 1}`,
          (scale: string) => {
            const retObj = cloneDeep(obj);
            if (scale === "1") {
              delete retObj.scale;
            } else {
              retObj.scale = parseFloat(scale);
            }
            _updateObject(retObj);
          },
          "",
          { stepSize: 0.1, majorStepSize: 1 }
        )}
        {getNumericFiled(
          "Rotation",
          `${obj.rotation ?? 0}`,
          (rotation: string) => {
            const retObj = cloneDeep(obj);
            if (rotation === "0") {
              delete retObj.rotation;
            } else {
              retObj.rotation = parseFloat(rotation);
            }
            _updateObject(retObj);
          }
        )}
      </>
    );
  };

  const isBreakpointTypeVisibleForLayer = (
    _deviceType: DeviceType,
    _l: ILayer
  ) => {
    return true;
  };

  const renderLayoutOptionProperties = (
    objectOrLayer: ILayout,
    updateFunction: any,
    _layoutedByParent = false,
    _objectLayer?: ILayer | null,
    _parentHasLayout?: boolean
  ) => {

    const objectMeta = getAppObjectDefinition(
      (objectOrLayer as IObject)?.type,
      "latest" // (objectOrLayer as IObject)?.version
    )?.meta;
    const sizeType = objectMeta?.sizeType ?? "rect";

    const getAbsolutePintsForLine = (props: {
      x1: number;
      x2: number;
      y1: number;
      y2: number;
      top: number;
      left: number;
    }) => {
      return {
        x1: props.x1 + props.left,
        x2: props.x2 + props.left,
        y1: props.y1 + props.top,
        y2: props.y2 + props.top,
      };
    };

    const getLeftTopAndRelativePointsFromAbsolute = (props: {
      x1: number;
      x2: number;
      y1: number;
      y2: number;
    }) => {
      const numObj: { x1?: number; x2?: number; y1?: number; y2?: number } = {};
      numObj.x1 = props.x1;
      numObj.y1 = props.y1;
      numObj.x2 = props.x2;
      numObj.y2 = props.y2;

      const b = getBounds(numObj as any);

      return {
        left: b.x,
        top: b.y,
        width: b.width,
        height: b.height,

        x1: numObj.x1 - b.x,
        x2: numObj.x2 - b.x,
        y1: numObj.y1 - b.y,
        y2: numObj.y2 - b.y,
      };
    };

    const absPoints = getAbsolutePintsForLine(objectOrLayer as any);
    return (
      <>
        {sizeType === "line"
          ? getP1P2LayoutField(
              "",
              {
                x1: absPoints.x1 + "px",
                y1: absPoints.y1 + "px",
                x2: absPoints.x2 + "px",
                y2: absPoints.y2 + "px",
              },
              (v: any) => {
                const calcValue = getLeftTopAndRelativePointsFromAbsolute(v);
                const retObj = cloneDeep(objectOrLayer);
                retObj.x1 = calcValue.x1;
                retObj.y1 = calcValue.y1;
                retObj.x2 = calcValue.x2;
                retObj.y2 = calcValue.y2;
                retObj.left = calcValue.left;
                retObj.top = calcValue.top;
                retObj.width = calcValue.width;
                retObj.height = calcValue.height;
                updateFunction(retObj);
              }
            )
          : getSizePosLayoutField(
              "",
              {
                left: objectOrLayer.left + "px",
                top: objectOrLayer.top + "px",
                width: objectOrLayer.width + "px",
                height: objectOrLayer.height + "px",
              },
              (v: any) => {
                const retObj = cloneDeep(objectOrLayer);
                retObj.left = parseFloat(v.left);
                retObj.top = parseFloat(v.top);
                retObj.width = parseFloat(v.width);
                retObj.height = parseFloat(v.height);
                updateFunction(retObj);
              }
            )}

      </>
    );
  };

  const renderObjectOrLayerOrSlide = () => {
    if (!selectionForProperties) {
      return null; // <div>No object selected</div>;
    }

    if (selectionForProperties?.type === "layer" && layer) {
      return renderLayerProperties(layer);
    }

    if (selectionForProperties?.type === "object" && object) {
      return renderObjectProperties(object, objectLayer);
    }

    if (selectionForProperties?.type === "slide" && slide) {
      return null; // <div>Page has no layout options.</div>;
    }
  };

  return (
    <div className={css.propertiesHolder}>{renderObjectOrLayerOrSlide()}</div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, layers, selection, settings, pages } = state.project;
  const { selectedDevice } = state.stage;

  const { activeObjectId, activeLayerId, activeSlideId } = selection;

  const { breakpoints } = settings;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;

  const objectLayer = object
    ? getAncestorLayer(object, layers.layerById, objects.objectById)
    : null; //layers.layerById[object?.layerId as any] || null;

  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;
  const slide = activeSlideId ? pages.pageById[activeSlideId] : null;

  return {
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
  _updateObjectForPreview: (object: IObject) => updateObjectForPreview(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
  _setDevice: setDevice,
};

export default connect(mapStateToProps, mapDispatchToProps)(LayoutProperties);
