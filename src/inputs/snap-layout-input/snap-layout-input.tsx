import { Button } from "@blueprintjs/core";
import { cloneDeep, noop } from "lodash-es";
import React, { useEffect } from "react";
import { getIconSize } from "../../panels/action-panel/ActionPanel";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import { getIconByType } from "../../store/reducers/settings";
import { getResponsiveIcon } from "../../utils/icons/responsive-icons-factory";
import {
  getButtonGroupField,
  getSelectField,
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
    onChangeDevice = (_device: string) => undefined,
    relativeToLayer,
  } = props;
  const { type, perDevice } = value;
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
              { ...value, common: { ...value.common, edge: newEdge } }
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
      </>
    );
  };

  const getIcon = (bpConfig: BreakpointConfiguration) => {
    const iconName = getIconByType(bpConfig.type);
    const size = getIconSize(iconName);

    return getResponsiveIcon(
      iconName,
      size.w,
      size.h,
      "lightgray",
      bpConfig.portrait,
      { verticalAlign: "text-bottom" }
    );
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
              oneV.offsetX = newWH.width;
              oneV.offsetY = newWH.height;
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
              oneV.width = newWH.width;
              oneV.height = newWH.height;
              oneV.keepAspectRatio = newWH.keepAspectRatio;
            }
            onChange(newValue);
          },
          ["px", "%"],
          { disabled: t !== selectedDevice }
        )}

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
    </div>
  );
};
