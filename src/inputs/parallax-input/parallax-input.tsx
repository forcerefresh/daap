import { Label } from "@blueprintjs/core";
import { cloneDeep } from "lodash-es";
import React, { useEffect } from "react";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { ILayer } from "../../store/reducers/i-layers";
import {
  getButtonGroupField,
  getCheckboxField,
  getNumericFiled,
} from "../input-utils";
import {
  IParallaxInput,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import css from "./parallax-input.module.scss";

const DEFAULT_DEPTH = 5;

export const ParallaxInputForm: React.FC<
  IParallaxInput &
    IUpdateInput & {
      layerData?: {
        layer?: ILayer | null;
        objects?: IObject[] | null;
      };
    }
> = (props) => {
  const { displayName, value, onChange, layerData } = props;

  console.log(layerData);
  console.log(value, "petar");

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
    propertyName: "strength" | "followTime",
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
    propertyName: "setToInitialPositionOnComplete",
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

  const renderDepth = () => {
    return (
      <div>
        {getButtonGroupField(
          "Depth",
          value.depthType,
          (depthTypeStr: "auto" | "custom") => {
            const valueClone = cloneDeep(value);
            valueClone.depthType = depthTypeStr;
            onChange(valueClone);
          },
          [
            { value: "auto", label: "Auto" },
            { value: "custom", label: "Custom" },
          ]
        )}
      </div>
    );
  };

  const renderCustom = () => {
    return (
      <div>
        <Label style={{ width: "100%" }}>Object depths</Label>
        {objects.map((object: IObject) =>
          renderObject(object, getValueForId(object.id))
        )}
      </div>
    );
  };

  return (
    <div className={css.container}>
      <div>
        <Label>{displayName}</Label>
        {value.depthType === "auto" ? (
          <div>
            {renderDepth()} {autoDepthIncInput()}
          </div>
        ) : (
          <div>
            {renderDepth()} {renderCustom()}
          </div>
        )}

        {numericInput(
          "strength",
          "Strength",
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
      </div>
    </div>
  );
};
