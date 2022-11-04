import { Label } from "@blueprintjs/core";
import { cloneDeep } from "lodash-es";
import React, { useEffect } from "react";
import { IObject } from "webslider-sdk2/lib/objects/i-object";
import { ILayer } from "../../store/reducers/i-layers";
import { getCheckboxField, getNumericFiled } from "../input-utils";
import {
  IParallaxInput,
  IUpdateInput,
} from "webslider-sdk2/lib/inputs/i-inputs";
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

  const numericInput = (
    propertyName: "strengthX" | "strengthY" | "followTime",
    label: string,
    helperText: string
  ) => (
    <div className="input60">
      {getNumericFiled(
        label,
        value[propertyName],
        (val: any) => {
          const valueClone = cloneDeep(value);
          valueClone[propertyName] = val;
          onChange(valueClone);
        },
        helperText
      )}
    </div>
  );

  const booleanInput = (
    propertyName: "autoDepth" | "setToInitialPositionOnComplete",
    label: string,
    helperText: string
  ) => (
    <div className="input60">
      {getCheckboxField(
        label,
        value[propertyName],
        (val: any) => {
          const valueClone = cloneDeep(value);
          valueClone[propertyName] = val;
          onChange(valueClone);
        },
        helperText
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

  const getValueForId = (objectId: string) => {
    const ret = value.objects.find((item) => item.id === objectId);
    return ret ? ret.depth : DEFAULT_DEPTH;
  };

  return (
    <div className={css.container}>
      <div>
        <Label>{displayName}</Label>

        {booleanInput(
          "autoDepth",
          "Auto depth",
          "If set to true, dept will be applied by default by using  'Increment' value."
        )}
        {value.autoDepth && autoDepthIncInput()}

        {numericInput(
          "strengthX",
          "Strength X",
          "Set strength for horizontal movement"
        )}

        {numericInput(
          "strengthY",
          "Strength Y",
          "Set strength for vertical movement"
        )}

        {numericInput(
          "followTime",
          "Follow time",
          "Time after objects stops move"
        )}

        {booleanInput(
          "setToInitialPositionOnComplete",
          "Reset on complete",
          "Position object to initial position on complete"
        )}

        <Label style={{ width: "100%" }}>Object depths</Label>
        {objects.map((object: IObject) =>
          renderObject(object, getValueForId(object.id))
        )}
      </div>
    </div>
  );
};
