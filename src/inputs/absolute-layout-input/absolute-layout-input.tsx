import { Button, Icon } from "@blueprintjs/core";
import { cloneDeep, isEqual, noop, pick } from "lodash-es";
import cx from "classnames";
import React, { useEffect, useState } from "react";
import { roundNumber } from "../../utils/doom-utils/common";
import { getUnitNumericFiled } from "../input-utils";
import {
  IAbsoluteLayoutInput,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { ICON_COLORS } from "../input-icon-colors";
import css from "./absolute-layout-input.module.scss";

const SMALL_ICON_SIZE = 18;

export const AbsolutePlacementForm: React.FC<
  IAbsoluteLayoutInput & IUpdateInput
> = (props) => {
  const {
    value,
    onChange = noop,
    breakpoints = { breakpointsConfiguration: [] },
  } = props;
  const { type, perDevice } = value;
  const bpcArr = breakpoints.breakpointsConfiguration;

  useEffect(() => {
    if (type === "perDevice") {
      let updateValue = false;
      const newValue = cloneDeep(value);
      // check if there are values for all devices
      bpcArr.forEach((bpc) => {
        const v = perDevice.find((item) => item.deviceType === bpc.type);
        if (!v) {
          newValue.perDevice.push({ ...value.common, deviceType: bpc.type });
          updateValue = true;
        }
      });

      if (updateValue) {
        onChange(newValue);
      }
    }
  }, [type]);

  const [internalValue, setInternalValue] = useState<{
    left: string;
    top: string;
    width: string;
    height: string;
  }>(pick(value.common, "left", "top", "width", "height") as any);

  const [latestValidValue, setLatestValidValue] = useState<{
    left: string;
    top: string;
    width: string;
    height: string;
  }>(pick(value.common, "left", "top", "width", "height") as any);

  useEffect(() => {
    if (
      !isEqual(
        pick(value.common, "left", "top", "width", "height"),
        latestValidValue
      )
    ) {
      setLatestValidValue(
        pick(value.common, "left", "top", "width", "height") as any
      );
      setInternalValue(
        pick(value.common, "left", "top", "width", "height") as any
      );
    }
  }, [value]);

  const [valid, setValid] = useState<{
    left: boolean;
    top: boolean;
    width: boolean;
    height: boolean;
  }>({ left: true, top: true, width: true, height: true });

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

    const currValid = { ...valid };

    currValid[propertyName] = true;

    const value2 = { ...value } as any;
    value2[propertyName] = propertyValue;
    setLatestValidValue({ ...value2 });
    if (keepAspectRatio) {
      if (propertyName === "width") {
        const heightUnit =
          internalValue.height.indexOf("px") !== -1 ? "px" : "%";
        const _height = roundNumber(
          aspectRatioMultiplier.hMultiplier * parseFloat(propertyValue),
          1
        );
        internalValue.height = _height.toString() + heightUnit;
        setInternalValue({ ...internalValue });
        currValid.height = true;
      }
      if (propertyName === "height") {
        const widthUnit = internalValue.width.indexOf("px") !== -1 ? "px" : "%";
        const _width = roundNumber(
          aspectRatioMultiplier.vMultiplier * parseFloat(propertyValue),
          1
        );
        internalValue.width = _width.toString() + widthUnit;
        setInternalValue({ ...internalValue });
        currValid.width = true;
      }
    }

    setValid({ ...currValid });

    onChange({
      ...value,
      ...{
        common: {
          ...value.common,
          ...(currValid.left && { left: internalValue.left }),
          ...(currValid.top && { top: internalValue.top }),
          ...(currValid.width && { width: internalValue.width }),
          ...(currValid.height && { height: internalValue.height }),
        },
      },
    });
  };

  const renderCommon = () => {
    return (
      <div className={css.common}>
        <div>
          {getUnitNumericFiled(
            "X",
            internalValue?.left,
            (v: string) => {
              updateValue("left", v);
            },
            "",
            {}
          )}
          {getUnitNumericFiled(
            "Y",
            internalValue?.top,
            (v: string) => {
              updateValue("top", v);
            },
            "",
            {}
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
            {},
            ["%", "px", "height"]
          )}
          {getUnitNumericFiled(
            "H",
            internalValue?.height,
            (v: string) => {
              updateValue("height", v);
            },
            "",
            {},
            ["%", "px", "width"]
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

  return (
    <div className={cx("input60", css.main)}>
      {renderCommon()}
    </div>
  );
};
