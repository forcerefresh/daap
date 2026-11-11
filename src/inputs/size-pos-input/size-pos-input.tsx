import { Button, Icon } from "@blueprintjs/core";
import { isEqual, noop, pick } from "lodash-es";
import React, { useEffect, useState } from "react";
import { ISizePosInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
import { getUnitNumericFiled } from "../input-utils";
import { ICON_COLORS } from "../input-icon-colors";
import css from "./size-pos-input.module.scss";

const SMALL_ICON_SIZE = 18;

export const SizePosInputForm: React.FC<ISizePosInput & IUpdateInput> = (
  props
) => {
  const { value, onChange = noop, inputProps = {} } = props;

  const [internalValue, setInternalValue] = useState<{
    left: string;
    top: string;
    width: string;
    height: string;
  }>(pick(value, "left", "top", "width", "height") as any);

  const [latestValidValue, setLatestValidValue] = useState<{
    left: string;
    top: string;
    width: string;
    height: string;
  }>(pick(value, "left", "top", "width", "height") as any);

  useEffect(() => {
    setKeepAspectRatio(!!value.keepAspectRatio);
  }, []);

  useEffect(() => {
    if (!isEqual(value, latestValidValue)) {
      setLatestValidValue(pick(value, "left", "top", "width", "height") as any);
      setInternalValue(pick(value, "left", "top", "width", "height") as any);
    }
  }, [value]);

  const [keepAspectRatio, setKeepAspectRatio] = useState(false);
  const [aspectRatioMultiplier, setAspectRatioMultiplier] = useState<{
    hMultiplier: number;
    vMultiplier: number;
  }>({ hMultiplier: 1, vMultiplier: 1 });

  const updateValue = (
    propertyName: "left" | "top" | "width" | "height",
    propertyValue: string
  ) => {
    internalValue[propertyName] = propertyValue;
    setInternalValue({ ...internalValue });

    const value2 = { ...value } as any;
    value2[propertyName] = propertyValue;
    setLatestValidValue({ ...value2 });
    if (keepAspectRatio) {
      if (propertyName === "width") {
        const heightUnit =
          internalValue.height.indexOf("px") !== -1 ? "px" : "%";
        const _height =
          aspectRatioMultiplier.hMultiplier * parseFloat(propertyValue);
        internalValue.height = _height.toString() + heightUnit;
        setInternalValue({ ...internalValue });
      }
      if (propertyName === "height") {
        const widthUnit = internalValue.width.indexOf("px") !== -1 ? "px" : "%";
        const _width =
          aspectRatioMultiplier.vMultiplier * parseFloat(propertyValue);
        internalValue.width = _width.toString() + widthUnit;
        setInternalValue({ ...internalValue });
      }
    }

    onChange({
      ...value,
      ...{ width: internalValue.width },
      ...{ height: internalValue.height },
      ...{ left: internalValue.left },
      ...{ top: internalValue.top },
    });
  };

  return (
    <div className={css.main}>
      <div>
        {getUnitNumericFiled(
          "X",
          internalValue?.left,
          (v: string) => {
            updateValue("left", v);
          },
          "",
          { disabled: inputProps.disabled }
        )}
        {getUnitNumericFiled(
          "Y",
          internalValue?.top,
          (v: string) => {
            updateValue("top", v);
          },
          "",
          { disabled: inputProps.disabled }
        )}
      </div>
      <div>
        {getUnitNumericFiled(
          "W",
          internalValue?.width,
          (v: string) => {
            updateValue("width", v);
          },
          "",
          { disabled: inputProps.disabled },
          ["px", "%", "height"]
        )}
        {getUnitNumericFiled(
          "H",
          internalValue?.height,
          (v: string) => {
            updateValue("height", v);
          },
          "",
          { disabled: inputProps.disabled },
          ["px", "%", "width"]
        )}
      </div>
      <div>
        <div className={css.linkTop} />
        <Button
          small
          minimal
          onClick={() => {
            setKeepAspectRatio(!keepAspectRatio);
            if (!keepAspectRatio)
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
          <Icon icon="link" iconSize={SMALL_ICON_SIZE} color={ICON_COLORS.inactive} />
        </Button>
        <div className={css.linkBottom} />
      </div>
    </div>
  );
};
