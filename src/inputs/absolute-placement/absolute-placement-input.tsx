import { Button, FormGroup, Icon, InputGroup, Intent } from "@blueprintjs/core";
import { cloneDeep, isEqual, noop, pick } from "lodash-es";
import React, { useEffect, useRef, useState } from "react";
import { IAbsoluteLayout } from "../../objects/types";
import { getIconSize } from "../../panels/action-panel/ActionPanel";
import {
  BreakpointConfiguration,
  DeviceType,
} from "../../store/reducers/i-settings";
import { getIconByType } from "../../store/reducers/settings";
import { roundNumber } from "../../utils/doom-utils/common";
import { getResponsiveIcon } from "../../utils/icons/responsive-icons-factory";
import {
  getButtonGroupField,
  getNumericFiled,
  getSizePosLayoutField,
} from "../input-utils";
import { IAbsolutePlacamentInput, IUpdateInput } from "../types";
import css from "./absolute-placement-input.module.scss";

const SMALL_ICON_SIZE = 18;

export const AbsolutePlacementForm: React.FC<
  IAbsolutePlacamentInput & IUpdateInput
> = (props) => {
  const {
    value,
    onChange = noop,
    inputProps = {},
    breakpoints = { breakpointsConfiguration: [] },
    selectedDevice = "",
    onChangeDevice = (device: string) => undefined,
  } = props;
  const { type, perDevice, common } = value;
  const switchValue = type === "common" ? "common" : "perDevice";
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

    const isNumber = new RegExp("^-?\\d*(\\.\\d+)?$").test(propertyValue);

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
        if (keepAspectRatio) {
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
        }
      }
    } else {
      currValid[propertyName] = false;
    }

    setValid({ ...currValid });

    onChange({
      ...value,
      ...{
        common: {
          ...value.common,
          ...(currValid.left && { left: parseFloat(internalValue.left) }),
          ...(currValid.top && { top: parseFloat(internalValue.top) }),
          ...(currValid.width && { width: parseFloat(internalValue.width) }),
          ...(currValid.height && { height: parseFloat(internalValue.height) }),
        },
      },
    });
  };

  const renderCommon = () => {
    return (
      <div className={css.main}>
        <div>
          <FormGroup label={"X"} labelFor="text-input-X" inline>
            <InputGroup
              disabled={inputProps.disablePosition}
              inputRef={(el) => {
                if (el) el!.autocomplete = "off";
              }}
              intent={!valid.left ? Intent.WARNING : Intent.NONE}
              id="text-input-X"
              placeholder=""
              value={internalValue?.left?.toString()}
              onChange={(event: any) => updateValue("left", event.target.value)}
              onInput={(event: any) => updateValue("left", event.target.value)}
            />
          </FormGroup>
          <FormGroup label={"Y"} labelFor="text-input-Y" inline>
            <InputGroup
              disabled={inputProps.disablePosition}
              inputRef={(el) => {
                if (el) el!.autocomplete = "off";
              }}
              intent={!valid.top ? Intent.WARNING : Intent.NONE}
              id="text-input-Y"
              placeholder=""
              value={internalValue?.top?.toString()}
              onChange={(event: any) => updateValue("top", event.target.value)}
              onInput={(event: any) => updateValue("top", event.target.value)}
            />
          </FormGroup>
        </div>
        <div>
          <FormGroup label={"W"} labelFor="text-input-W" inline>
            <InputGroup
              disabled={inputProps.selfSize}
              inputRef={(el) => {
                if (el) el!.autocomplete = "off";
              }}
              intent={!valid.width ? Intent.WARNING : Intent.NONE}
              id="text-input-W"
              placeholder=""
              value={internalValue?.width?.toString()}
              onChange={(event: any) =>
                updateValue("width", event.target.value)
              }
              onInput={(event: any) => updateValue("width", event.target.value)}
            />
          </FormGroup>
          <FormGroup label={"H"} labelFor="text-input-H" inline>
            <InputGroup
              disabled={inputProps.selfSize}
              inputRef={(el) => {
                if (el) el!.autocomplete = "off";
              }}
              intent={!valid.height ? Intent.WARNING : Intent.NONE}
              id="text-input-H"
              placeholder=""
              value={internalValue?.height?.toString()}
              onChange={(event: any) =>
                updateValue("height", event.target.value)
              }
              onInput={(event: any) =>
                updateValue("height", event.target.value)
              }
            />
          </FormGroup>
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
            <Icon icon="link" iconSize={SMALL_ICON_SIZE} color={"gray"} />
          </Button>
          <div className={css.linkBottom} />
        </div>
      </div>
    );
  };

  const getIcon = (bpConfig: BreakpointConfiguration) => {
    const iconName = getIconByType(bpConfig.type);
    const size = getIconSize(iconName);
    const iconStyle = {}; // getIconStyle(iconName);

    const icon = getResponsiveIcon(
      iconName,
      size.w,
      size.h,
      "lightgray",
      bpConfig.portrait,
      { verticalAlign: "text-bottom", ...iconStyle }
    );

    return icon;
  };

  const renderPerDevice = () => {
    console.log(breakpoints.breakpointsConfiguration);
    const { breakpointsConfiguration: bcArr } = breakpoints;

    return (
      <>
        <table>
          <>
            <tr className={css.headerRow}>
              <td></td>
              <td style={{ width: "55px" }}>X</td>
              <td style={{ width: "55px" }}>Y</td>
              <td style={{ width: "55px" }}>Width</td>
              <td style={{ width: "55px" }}>Height</td>
              <td style={{ width: "25px" }}></td>
            </tr>
            {bcArr.map((bc) => {
              return (
                <tr>
                  <td>
                    <Button
                      minimal
                      active={bc.type === selectedDevice}
                      onClick={() => {
                        onChangeDevice(bc.type);
                      }}
                    >
                      {getIcon(bc)}
                    </Button>
                  </td>

                  {renderOneInput(bc.type)}
                </tr>
              );
            })}
          </>
        </table>
      </>
    );
  };

  const renderOneInput = (t: DeviceType) => {
    let oneValue = perDevice.find((item) => item.deviceType === t);
    if (!oneValue) {
      return null;
    }

    return (
      <td colSpan={5}>
        {getSizePosLayoutField(
          "",
          oneValue,
          (v: any) => {
            const newValue = cloneDeep(value);
            const oneV = newValue.perDevice.find(
              (item) => item.deviceType === t
            );
            if (oneV) {
              oneV.left = v.left;
              oneV.top = v.top;
              oneV.width = v.width;
              oneV.height = v.height;
              oneV.keepAspectRatio = v.keepAspectRatio;
            }
            onChange(newValue);
          },
          {
            disabled: t !== selectedDevice,
          }
        )}
      </td>
    );
  };

  return (
    <>
      {getButtonGroupField(
        "",
        switchValue,
        (type: any) => {
          onChange({ ...value, type });
        },
        [
          {
            value: "common",
            label: `Common`,
          },
          { value: "perDevice", label: `Per device` },
        ]
      )}
      {type === "common" && renderCommon()}
      {type === "perDevice" && renderPerDevice()}
    </>
  );
};

function getMultiplier(sizeObj: IAbsoluteLayout) {
  return {
    hMultiplier:
      parseFloat(sizeObj.height as any) / parseFloat(sizeObj.width as any),
    vMultiplier:
      parseFloat(sizeObj.width as any) / parseFloat(sizeObj.height as any),
  };
}
