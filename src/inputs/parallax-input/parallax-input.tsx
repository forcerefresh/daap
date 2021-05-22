import { Label, Text } from "@blueprintjs/core";
import cx from "classnames";
import { cloneDeep, isEqual, uniqWith } from "lodash-es";
import React, { useEffect } from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { IObject } from "../../objects/types";
import { ILayer } from "../../store/reducers/layers";
import { getCheckboxField, getNumericFiled } from "../input-utils";
import { IParallaxInput, IUpdateInput } from "../types";
import css from "./parallax-input.module.scss";

const DEFAULT_DEPTH = 5;

export const ParallaxInputForm: React.FC<
  IParallaxInput &
    IUpdateInput & {
      layerData?: {
        layer?: ILayer;
        objects?: IObject[];
      };
    }
> = (props) => {
  const { displayName, value, onChange, layerData } = props;

  const objects = layerData?.objects || [];

  useEffect(() => {
    let changed = false;
    const valueClone = cloneDeep(value);
    layerData?.objects?.forEach((object, idx) => {
      const obj = value.objects.find((item) => item.id === object.id);
      if (!obj) {
        changed = true;
        valueClone.objects.push({ id: object.id, depth: idx * DEFAULT_DEPTH });
      }
    });

    if (changed) {
      onChange(valueClone);
    }
  }, [value]);

  const autoDepthInput = () => (
    <div className="input60">
      {getCheckboxField(
        "Auto depth",
        value.autoDepth,
        (autoDepth: any) => {
          const valueClone = cloneDeep(value);
          valueClone.autoDepth = autoDepth;
          onChange(valueClone);
        },
        "If set to true, dept will be applied by default by using  'Increment' value."
      )}
    </div>
  );
  const autoDepthIncInput = () => (
    <div className="input60">
      {getNumericFiled(
        "Increment",
        value.autoDepthInc,
        (autoDepthInc: any) => {
          const valueClone = cloneDeep(value);
          valueClone.autoDepthInc = autoDepthInc;
          onChange(valueClone);
        },
        "Increment used when 'Auto depth' is set to true"
      )}
    </div>
  );

  const renderObject = (object: IObject, depth: number) => {
    return (
      <div>
        <div>
          {getNumericFiled(object.name, depth, (depth: any) => {
            const valueClone = cloneDeep(value);
            const obj = valueClone.objects.find(
              (item) => item.id === object.id
            );
            if (obj) obj.depth = depth;
            onChange(valueClone);
          })}
        </div>
      </div>
    );
  };

  //<div className="bp3-form-helper-text">{helperText}</div>
  //<div className="bp3-form-helper-text">{layerData?.layer?.id}</div>
  //<div className="bp3-form-helper-text">{layerData?.layer?.name}</div>
  //<div className="bp3-form-helper-text">
  //  {layerData?.layer?.objectIds}
  //</div>

  const getValueForId = (objectId: string) => {
    const ret = value.objects.find((item) => item.id === objectId);
    return ret ? ret.depth : DEFAULT_DEPTH;
  };
  return (
    <div className={css.container}>
      <div>
        <Label>{displayName}</Label>
        {autoDepthInput()}
        {value.autoDepth && autoDepthIncInput()}
        <Label style={{ width: "100%" }}>Object depths</Label>
        {objects.map((object: IObject) =>
          renderObject(object, getValueForId(object.id))
        )}

        {false && (
          <div className={cx("bp3-form-helper-text", "error", css.error)}>
            Each side or rectangle should have at least 1 point, otherwise some
            part of image will be cut out.
          </div>
        )}
      </div>
    </div>
  );
};
