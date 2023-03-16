import { Button, FormGroup, Icon, InputGroup, Intent } from "@blueprintjs/core";
import { cloneDeep, isEqual, noop, pick } from "lodash-es";
import React, { useEffect, useState } from "react";
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
  getSizeLayoutField,
  getSizeUnitLayoutField,
  getUnitNumericFiled,
} from "../input-utils";
import {
  ISnapLayoutInput,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import css from "./snap-layout-input.module.scss";

const RELATIVE_TO_OPTIONS = [
  { label: "Page", value: "page" },
  { label: "Stage", value: "stage" },
  { label: "Guidelines", value: "guidelines" },
];

const EDGE_OPTIONS = [
  { label: "Top", value: "top" },
  { label: "Bottom", value: "bottom" },
  { label: "Left", value: "left" },
  { label: "Right", value: "right" },
  { label: "Top-Left", value: "top-left" },
  { label: "Top-Right", value: "top-right" },
  { label: "Bottom-Left", value: "bottom-left" },
  { label: "Bottom-Right", value: "bottom-right" },
  { label: "Center", value: "center" },
];

export const SnapInputForm: React.FC<ISnapLayoutInput & IUpdateInput> = (
  props
) => {
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

  const renderCommon = () => {
    return (
      <>
        {getSelectField(
          "Snap to",
          value.common.edge,
          EDGE_OPTIONS,
          (newEdge) => {
            onChange(
              { ...value, common: { ...value.common, edge: newEdge } },
              { disabled: inputProps.disablePosition } // TODO << this is probably not needed
            );
          },
          { disabled: inputProps.disablePosition }
        )}
        {getSizeUnitLayoutField(
          "Size",
          { width: value.common.width, height: value.common.height },
          (newWH) => {
            onChange({
              ...value,
              common: {
                ...value.common,
                width: newWH.width,
                height: newWH.height,
              },
            });
          },
          ["px", "%"],
          { disabled: inputProps.selfSize }
        )}

        {getUnitNumericFiled(
          "Offset X",
          value.common.offsetX ?? "0px", // INFO: backward compatibility
          (offsetX) => {
            onChange({
              ...value,
              common: {
                ...value.common,
                offsetX: offsetX,
              },
            });
          },
          "",
          { disabled: inputProps.disablePosition }
        )}
        {getUnitNumericFiled(
          "Offset Y",
          value.common.offsetY ?? "0px",
          (offsetY) => {
            onChange({
              ...value,
              common: {
                ...value.common,
                offsetY: offsetY,
              },
            });
          },
          "",
          { disabled: inputProps.disablePosition }
        )}
        {/* {getNumericFiled(
          "Offset",
          value.common.gap,
          (newGap) => {
            onChange({
              ...value,
              common: {
                ...value.common,
                gap: newGap,
              },
            });
          },
          "Offset is deprecated",
          { disabled: true }
        )} */}
      </>
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
        <table className={css.main}>
          <>
            <tr className={css.headerRow}>
              <td></td>
              <td>Size</td>
              <td className={css.gapTD}>Offset</td>
            </tr>
            {bcArr.map((bc) => {
              if (!bc.enabled) return null;

              return (
                <>
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
                    {renderOneSizeInput(bc.type)}
                    {renderOneGapInput(bc.type)}
                    <td></td>
                  </tr>
                  <tr>
                    <td></td>
                    {renderOneSnapToInput(bc.type)}
                    <td></td>
                    <td></td>
                  </tr>
                </>
              );
            })}
          </>
        </table>
      </>
    );
  };

  const renderOneGapInput = (t: DeviceType) => {
    let oneValue = perDevice.find((item) => item.deviceType === t);
    if (!oneValue) {
      return null;
    }

    return (
      <td className={css.gapTD}>
        {getSizeUnitLayoutField(
          "Offset",
          {
            width: oneValue.offsetX ?? "0px", // INFO: backward compatibility
            height: oneValue.offsetY ?? "0px", // INFO: backward compatibility
          },
          (newWH) => {
            const newValue = cloneDeep(value);
            const oneV = newValue.perDevice.find(
              (item) => item.deviceType === t
            );
            if (oneV) {
              oneV.offsetX = newWH.width; //roundNumber(newWH.width, 1);
              oneV.offsetY = newWH.height; //roundNumber(, 1);
            }
            onChange(newValue);
          },
          ["px", "%"],
          {
            disabled: t !== selectedDevice,
            labelW: "X",
            labelH: "Y",
          } as any
        )}
      </td>
    );
  };

  const renderOneSnapToInput = (t: DeviceType) => {
    let oneValue = perDevice.find((item) => item.deviceType === t);
    if (!oneValue) {
      return null;
    }

    return (
      <td>
        {getSelectField(
          "",
          oneValue.edge,
          EDGE_OPTIONS,
          (newEdge) => {
            const newValue = cloneDeep(value);
            const oneV = newValue.perDevice.find(
              (item) => item.deviceType === t
            );
            if (oneV) {
              oneV.edge = newEdge;
            }
            onChange(newValue);
          },
          { disabled: inputProps.disablePosition || t !== selectedDevice }
        )}
      </td>
    );
  };
  const renderOneSizeInput = (t: DeviceType) => {
    let oneValue = perDevice.find((item) => item.deviceType === t);
    if (!oneValue) {
      return null;
    }

    return (
      <td>
        {getSizeUnitLayoutField(
          "Size",
          {
            width: oneValue.width,
            height: oneValue.height,
            keepAspectRatio: oneValue.keepAspectRatio,
          },
          (newWH) => {
            const newValue = cloneDeep(value);
            const oneV = newValue.perDevice.find(
              (item) => item.deviceType === t
            );
            if (oneV) {
              oneV.width = newWH.width; //roundNumber(newWH.width, 1);
              oneV.height = newWH.height; //roundNumber(, 1);
              oneV.keepAspectRatio = newWH.keepAspectRatio;
            }
            onChange(newValue);
          },
          ["px", "%"],
          { disabled: t !== selectedDevice }
        )}

        {/*getNumericFiled(
          "",
          oneValue?.[propertyName],
          (v: any) => {
            const newValue = cloneDeep(value);
            const oneV = newValue.perDevice.find(
              (item) => item.deviceType === t
            );
            if (oneV) {
              if (keepAspectRatio) {
                const oldValue = perDevice.find(
                  (item) => item.deviceType === t
                );
                const mult = getMultiplier(oldValue!);

                if (propertyName === "width") {
                  oneV.height = roundNumber(mult.hMultiplier * v, 1);
                  if (isNaN(oneV.height)) oneV.height = 0;
                }
                if (propertyName === "height") {
                  oneV.width = roundNumber(mult.vMultiplier * v, 1);
                  if (isNaN(oneV.width)) oneV.width = 0;
                }
              }
              oneV[propertyName] = roundNumber(v, 1);
            }
            onChange(newValue);
          },
          "",
          {
            disabled: t !== selectedDevice,
            className: css.perDeviceInput,
          }
        )*/}
      </td>
    );
  };

  return (
    <div className={css.main}>
      {getSelectField(
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
      )}
      {/*       
      {getSelectField(
        "Relative",
        value.relativeTo,
        RELATIVE_TO_OPTIONS,
        (newRelativeTo) => {
          onChange({ ...value, relativeTo: newRelativeTo });
        },
        { disabled: inputProps.disablePosition }
      )} */}

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

      {/*getSizeLayoutField(
        "Size",
        { width: value.width, height: value.height },
        (newWH) => {
          onChange({ ...value, width: newWH.width, height: newWH.height });
        },
        { disabled: inputProps.selfSize }
      )*/}
      {/*getNumericFiled(
        "Gap",
        value.gap,
        (newGap) => {
          onChange({ ...value, gap: newGap });
        },
        "",
        { disabled: inputProps.disablePosition }
      )*/}
    </div>
  );
};
