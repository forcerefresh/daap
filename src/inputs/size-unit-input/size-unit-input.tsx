import { Button, FormGroup, Icon, InputGroup, Intent } from "@blueprintjs/core";
import { isEqual, noop, pick } from "lodash-es";
import React, { useEffect, useRef, useState } from "react";
import { getUnitNumericFiled } from "../input-utils";
import {
  ISizeInput,
  IUpdateInput,
  Units,
} from "webslider-sdk/lib/inputs/i-inputs";
import css from "./size-unit-input.module.scss";

const SMALL_ICON_SIZE = 18;
const ALLOWED_UNITS: Units[] = ["px", "%"];

export const SizeUnitInputForm: React.FC<ISizeInput & IUpdateInput> = (
  props
) => {
  const { value, onChange = noop, inputProps = {} } = props;

  const labelW = (props.inputProps as any).labelW;
  const labelH = (props.inputProps as any).labelH;

  const [internalValue, setInternalValue] = useState<{
    width: string;
    height: string;
  }>(pick(value, "width", "height") as any);

  const [latestValidValue, setLatestValidValue] = useState<{
    width: string;
    height: string;
  }>(pick(value, "width", "height") as any);

  useEffect(() => {
    setKeepAspectRatio(!!value.keepAspectRatio);
  }, []);

  useEffect(() => {
    if (!isEqual(value, latestValidValue)) {
      setLatestValidValue(pick(value, "width", "height") as any);
      setInternalValue(pick(value, "width", "height") as any);
    }
  }, [value]);

  const [valid, setValid] = useState<{
    width: boolean;
    height: boolean;
  }>({ width: true, height: true });

  const [keepAspectRatio, setKeepAspectRatio] = useState(false);
  const [aspectRatioMultiplier, setAspectRatioMultiplier] = useState<{
    hMultiplier: number;
    vMultiplier: number;
  }>({ hMultiplier: 1, vMultiplier: 1 });

  const updateValue = (
    propertyName: "width" | "height",
    propertyValue: string
  ) => {
    internalValue[propertyName] = propertyValue;
    setInternalValue({ ...internalValue });

    const currValid = { ...valid };

    let propertyValueClean: string = propertyValue;

    ALLOWED_UNITS.forEach((unit: Units) => {
      propertyValueClean = propertyValueClean.replaceAll(unit as string, "");
    });

    const isNumber = new RegExp("^-?\\d*(\\.\\d+)?$").test(propertyValueClean);

    //validate is number
    if (isNumber && !isNaN(parseFloat(propertyValue))) {
      //validate is positive for width and height
      const isValidValue =
        propertyName === "width" || propertyName === "height"
          ? parseFloat(propertyValue) >= 0
          : true;

      currValid[propertyName] = isValidValue;

      if (isValidValue) {
        const value2 = { ...value } as any;
        value2[propertyName] = propertyValue;
        setLatestValidValue({ ...value2 });
        {
          /*if (keepAspectRatio) {
          if (propertyName === "width") {
            const _height =
              aspectRatioMultiplier.hMultiplier * parseFloat(propertyValue);
            internalValue.height = _height.toString();
            setInternalValue({ ...internalValue });
            currValid.height = true;
          }
          if (propertyName === "height") {
            const _width =
              aspectRatioMultiplier.vMultiplier * parseFloat(propertyValue);
            internalValue.width = _width.toString();
            setInternalValue({ ...internalValue });
            currValid.width = true;
          }
        }*/
        }
      }
    } else {
      currValid[propertyName] = false;
    }

    setValid({ ...currValid });

    onChange({
      ...value,
      ...(currValid.width && { width: internalValue.width }),
      ...(currValid.height && { height: internalValue.height }),
    });
  };

  return (
    <div className={css.main}>
      <div>
        <FormGroup label={labelW ?? "W"} labelFor="text-input-W" inline>
          {getUnitNumericFiled(
            "",
            internalValue?.width?.toString(),
            (value: string) => updateValue("width", value),
            "",
            {
              disabled: inputProps.disabled,
              id: "text-input-W",
              // intent: !valid.width ? Intent.WARNING : Intent.NONE,
            } as any,
            ALLOWED_UNITS
          )}
          {/*<InputGroup
          
            inputRef={(el) => {
              if (el) el!.autocomplete = "off";
            }}
            intent={!valid.width ? Intent.WARNING : Intent.NONE}
          />*/}
        </FormGroup>
        <FormGroup label={labelH ?? "H"} labelFor="text-input-H" inline>
          {getUnitNumericFiled(
            "",
            internalValue?.height?.toString(),
            (value: string) => updateValue("height", value),
            "",
            {
              disabled: inputProps.disabled,
              id: "text-input-H",
              //intent: !valid.height ? Intent.WARNING : Intent.NONE,
            } as any,
            ALLOWED_UNITS
          )}
        </FormGroup>
      </div>
      {/*<div>
        <div className={css.linkTop} />
        <Button
          small
          minimal
          onClick={() => {
            onChange({ ...value, keepAspectRatio: !value.keepAspectRatio });
            setKeepAspectRatio(!value.keepAspectRatio);
            if (!keepAspectRatio)
              //inverse
              setAspectRatioMultiplier({
                hMultiplier:
                  parseFloat(latestValidValue.height) /
                  parseFloat(latestValidValue.width),
                vMultiplier:
                  parseFloat(latestValidValue.width) /
                  parseFloat(latestValidValue.height),
              });
          }}
          active={keepAspectRatio}
        >
          <Icon icon="link" iconSize={SMALL_ICON_SIZE} color={"gray"} />
        </Button>
        <div className={css.linkBottom} />
      </div>*/}
    </div>
  );
};
