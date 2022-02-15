import { cloneDeep } from "lodash-es";
import React from "react";
import { getObjectStorageItemFormDefinition } from "./form-definition-factory";
import { getInputForm } from "../../inputs/input-factory";
import css from "./ObjectStorageItemForm.module.scss";

export type BucketType = "s3" | "linode" | "digitalocean" | string;

export type ObjectStorageItemFormProps = {
  type: BucketType;
  values: { [key: string]: any };
  onChange: (values: { [key: string]: any }) => void;
  externalErrors?: { [key: string]: any };
};

export const ObjectStorageItemForm: React.FC<ObjectStorageItemFormProps> = (
  props
) => {
  const { type, values, onChange, externalErrors = {} } = props;

  const formDefinition = getObjectStorageItemFormDefinition(type);

  return (
    <div className={css.formHolder}>
      {formDefinition?.map((inputDefinition) => {
        function onChangeLocal(value: any) {
          const newValues = cloneDeep(values);
          newValues[inputDefinition.propertyName] = value;
          onChange(newValues);
        }

        const val = values[inputDefinition.propertyName];

        return getInputForm(
          inputDefinition.inputType,
          {
            ...inputDefinition,
            value: val,
            externalError: externalErrors[inputDefinition.propertyName],
          },
          onChangeLocal
        );
      })}
    </div>
  );
};
