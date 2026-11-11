import React from "react";
import { getCoverLayoutField } from "../../inputs/input-utils";
import { cloneDeep } from "lodash-es";
import { IToolbarProps } from "../../utils/tools/types";
import { ImageValues } from "./image";
import css from "./ImageToolbar.module.scss";

export function ImageToolbar(props: IToolbarProps): React.ReactElement {
  const { object, updateObject } = props;

  const values = object?.properties as ImageValues | undefined;

  return (
    <>
      {object && values && (
        <div className={css.inputsHolder}>
          {getCoverLayoutField("", values.fit, (v) => {
            if (object) {
              const newObject = cloneDeep(object);
              newObject.properties.fit = v;
              updateObject(newObject);
            }
          })}
        </div>
      )}
    </>
  );
}
