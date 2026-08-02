import { Button, FormGroup, Icon, InputGroup, Intent } from "@blueprintjs/core";
import { cloneDeep, indexOf, isEqual, noop, pick } from "lodash-es";
import cx from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { IAbsoluteLayoutItem } from "webslider-sdk/lib/objects/i-object";
import { getIconSize } from "../../panels/action-panel/ActionPanel";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import { getIconByType } from "../../store/reducers/settings";
import { roundNumber } from "../../utils/doom-utils/common";
import { getResponsiveIcon } from "../../utils/icons/responsive-icons-factory";
import {
  getButtonGroupField,
  getNumericFiled,
  getSelectField,
  getSizePosLayoutField,
  getUnitNumericFiled,
} from "../input-utils";
import {
  IAbsoluteLayoutInput,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { ICON_COLORS } from "../input-icon-colors";
import css from "./absolute-layout-input.module.scss";

// const RELATIVE_TO_OPTIONS = [
//   { label: "Page", value: "page" },
//   { label: "Stage", value: "stage" },
//   { label: "Guidelines", value: "guidelines" },
// ];

const SMALL_ICON_SIZE = 18;

export const AbsolutePlacementForm: React.FC<
  IAbsoluteLayoutInput & IUpdateInput
> = (props) => {
  const {
    value,
    onChange = noop,
    inputProps = {},
    breakpoints = { breakpointsConfiguration: [] },
    selectedDevice = "",
    onChangeDevice = (device: string) => undefined,
    relativeToLayer,
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

    //const isNumber = new RegExp("^-?\\d*(\\.\\d+)?$").test(propertyValue);

    //validate is number
    // if (isNumber && !isNaN(parseFloat(propertyValue))) {
    //   //validate is positive for width and height
    //   const isValidValue =
    //     propertyName === "width" || propertyName === "height"
    //       ? parseFloat(propertyValue) >= 0
    //       : true;

    //   currValid[propertyName] = isValidValue;

    //   if (isValidValue) {

    // TODO: we don't need this, we are getting proper value
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
    //   }
    // } else {
    //   currValid[propertyName] = false;
    // }

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
            {
              // className: css.perDeviceInput,
            }
          )}
          {getUnitNumericFiled(
            "Y",
            internalValue?.top,
            (v: string) => {
              updateValue("top", v);
            },
            "",
            {
              // className: css.perDeviceInput,
            }
          )}
          {/* <FormGroup label={"X"} labelFor="text-input-X" inline>
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
          </FormGroup> */}
        </div>
        <div>
          {getUnitNumericFiled(
            "W",
            internalValue?.width,
            (v: string) => {
              updateValue("width", v);
            },
            "",
            {
              // className: css.perDeviceInput,
            },
            ["%", "px", "height"]
          )}
          {getUnitNumericFiled(
            "H",
            internalValue?.height,
            (v: string) => {
              updateValue("height", v);
            },
            "",
            {
              // className: css.perDeviceInput,
            },
            ["%", "px", "width"]
          )}
          {/* <FormGroup label={"W"} labelFor="text-input-W" inline>
            <InputGroup
              disabled={inputProps.selfSize || inputProps.disableSize}
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
              disabled={inputProps.selfSize || inputProps.disableSize}
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
          </FormGroup> */}
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
    const { breakpointsConfiguration: bcArr } = breakpoints;

    return (
      <>
        <table>
          <>
            <tr className={css.headerRow}>
              <td></td>
              <td style={{ width: "55px" }}></td>
              <td style={{ width: "55px" }}></td>
              <td style={{ width: "25px" }}></td>
            </tr>
            {bcArr.map((bc) => {
              if (!bc.enabled) return null;

              // const renderPerDev =
              //   value.relativeToDevice &&
              //   value.relativeToDevice?.length > 0 &&
              //   value.relativeToDevice?.indexOf(bc.type) !== -1;

              // let oneValue = perDevice.find(
              //   (item) => item.deviceType === bc.type
              // );

              return (
                <>
                  {/* {renderPerDev && (
                    <tr>
                      <td></td>
                      <td colSpan={3}>
                        {getSelectField(
                          "Relative",
                          oneValue?.relativeTo ?? "page",
                          RELATIVE_TO_OPTIONS,
                          (newRelativeTo) => {
                            const newValue = cloneDeep(value);
                            const oneV = newValue.perDevice.find(
                              (item) => item.deviceType === bc.type
                            );
                            if (oneV) {
                              oneV.relativeTo = newRelativeTo;
                            }
                            onChange(newValue);
                          },
                          { disabled: inputProps.disablePosition }
                        )}
                      </td>
                    </tr>
                  )} */}
                  <tr key={bc.type}>
                    <td>
                      <Button
                        style={{ width: "20px" }}
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
                </>
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
    <div className={cx("input60", css.main)}>
      {/* {value.type === "perDevice" ? (
        <ExtraOptionsInput
          extraOptions={{
            devices: true,
          }}
          metadataValues={{ devices: value.relativeToDevice ?? [] }}
          onMetadataChange={(metaVal) => {
            onChange({ ...value, relativeToDevice: metaVal.devices });
          }}
        >
          {getSelectField(
            "Relative",
            value.relativeTo,
            RELATIVE_TO_OPTIONS,
            (newRelativeTo) => {
              onChange({ ...value, relativeTo: newRelativeTo });
            },
            { disabled: inputProps.disablePosition }
          )}
        </ExtraOptionsInput>
      ) : ( */}
      {/* {getSelectField(
        "Relative",
        value.relativeTo,
        RELATIVE_TO_OPTIONS,
        (newRelativeTo) => {
          onChange({ ...value, relativeTo: newRelativeTo });
        },
        {
          disabled: inputProps.disablePosition || relativeToLayer,
          customReadonlySelectedLabel: relativeToLayer ? "Layer" : undefined,
        },
        relativeToLayer
          ? "Object position is relative to layer when it has layout configured."
          : ""
      )} */}

      {/* )} */}
      {/* {getButtonGroupField(
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
      )} */}
      {/* {type === "common" && renderCommon()} */}
      {/* {type === "perDevice" && renderPerDevice()} */}
      {renderCommon()}
    </div>
  );
};

function getMultiplier(sizeObj: IAbsoluteLayoutItem) {
  return {
    hMultiplier:
      parseFloat(sizeObj.height as any) / parseFloat(sizeObj.width as any),
    vMultiplier:
      parseFloat(sizeObj.width as any) / parseFloat(sizeObj.height as any),
  };
}
