import { Button } from "@blueprintjs/core";
import { cloneDeep, noop } from "lodash-es";
import React, { useEffect } from "react";
import { getIconSize } from "../../panels/action-panel/ActionPanel";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import { getIconByType } from "../../store/reducers/settings";
import { getResponsiveIcon } from "../../utils/icons/responsive-icons-factory";
import { getButtonGroupField, getSelectField } from "../input-utils";
import { IFitInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
import css from "./fit-input.module.scss";

const RELATIVE_TO_OPTIONS = [
  { label: "Page", value: "page" },
  { label: "Stage", value: "stage" },
  { label: "Guidelines", value: "guidelines" },
];

export const FitInputForm: React.FC<IFitInput & IUpdateInput> = (props) => {
  const {
    value,
    onChange = noop,
    inputProps = {},
    breakpoints = { breakpointsConfiguration: [] },
    selectedDevice = "",
    onChangeDevice = (device: string) => undefined,
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
          "Relative",
          value.common.relativeTo,
          RELATIVE_TO_OPTIONS,
          (newRelativeTo) => {
            onChange({
              ...value,
              common: {
                ...value.common,
                relativeTo: newRelativeTo,
              },
            });
          },
          { disabled: inputProps.disablePosition }
        )}
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
            {/* <tr className={css.headerRow}>
              <td></td>
              <td>Size</td>
              <td className={css.gapTD}>Gap</td>
            </tr> */}
            {bcArr.map((bc) => {
              if (!bc.enabled) return null;

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
                  {renderOneRelativeToInput(bc.type)}

                  <td></td>
                </tr>
              );
            })}
          </>
        </table>
      </>
    );
  };

  const renderOneRelativeToInput = (t: DeviceType) => {
    let oneValue = perDevice.find((item) => item.deviceType === t);
    if (!oneValue) {
      return null;
    }

    return (
      <td className={css.gapTD}>
        {getSelectField(
          "Relative",
          oneValue.relativeTo,
          RELATIVE_TO_OPTIONS,
          (newRelativeTO) => {
            const newValue = cloneDeep(value);
            const oneV = newValue.perDevice.find(
              (item) => item.deviceType === t
            );
            if (oneV) {
              oneV.relativeTo = newRelativeTO;
            }
            onChange(newValue);
          },
          { disabled: t !== selectedDevice }
        )}
      </td>
    );
  };

  // NOTE: this part shows DISABLED select
  if (relativeToLayer) {
    return (
      <div className={css.main}>
        {getSelectField(
          "Relative",
          "layer",
          RELATIVE_TO_OPTIONS,
          (newRelativeTo) => {},
          {
            disabled: true,
            customReadonlySelectedLabel: relativeToLayer ? "Layer" : undefined,
          },
          "Object position is relative to layer when it has layout configured."
        )}
      </div>
    );
  }

  return (
    <div className={css.main}>
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
