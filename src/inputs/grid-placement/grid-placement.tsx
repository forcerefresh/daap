import React from "react";
import { cloneDeep } from "lodash-es";
import { getButtonGroupField, getNumericFiled } from "../input-utils";
import { IGridPlacementInput, IUpdateInput } from "../types";
import css from "./grid-placement.module.scss";
import classnames from "classnames";
import { Button, Label } from "@blueprintjs/core";
import {
  BreakpointConfiguration,
  getIconByType,
} from "../../store/reducers/settings";
import {
  getIconSize,
  getIconStyle,
} from "../../panels/action-panel/ActionPanel";
import { getResponsiveIcon } from "../../utils/icons/responsive-icons-factory";

export const GridPlacementInputForm: React.FC<
  IGridPlacementInput & IUpdateInput
> = (props) => {
  const {
    value,
    onChange,
    inputProps = {},
    breakpoints = { breakpointsConfiguration: [] },
    selectedDevice = "",
    onChangeDevice = (device: string) => undefined,
  } = props;
  const { type, perDevice, common } = value;

  const switchValue = type === "common" ? "common" : "perDevice";

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
  /*
  const renderBreakpointButton = (conf: BreakpointConfiguration) => {
    const icon = getIconByType(conf.type);
    const size = getIconSize(icon);
    const selectedDevice = "";

    console.log(conf.type);
    return (
      <Button
        active={selectedDevice === conf.type}
        minimal
        outlined
        large
        icon={getResponsiveIcon(
          icon,
          size.w,
          size.h,
          "lightgray",
          conf.portrait
        )}
        className={css.responsiveButton}
        onClick={() => {
          _setDevice(conf.type);
        }}
      >
        <div className={css.responsiveButtonNumber}></div>
      </Button>
    );
  };*/

  const renderCommon = () => {
    return (
      <>
        <div className={classnames(css.row)}>
          {getNumericFiled(
            "Left",
            common.left,
            (left: any) => {
              const commonClone = cloneDeep(common);
              commonClone.left = left;
              onChange({ ...value, common: commonClone });
            },
            "",
            { disabled: inputProps.disablePosition }
          )}
        </div>

        <div className={classnames(css.row)}>
          {getNumericFiled("Width", common.right, (right: any) => {
            const commonClone = cloneDeep(common);
            commonClone.right = right;
            onChange({ ...value, common: commonClone });
          })}
        </div>

        <div className={classnames(css.row)}>
          {getNumericFiled(
            "Top",
            common.top,
            (top: any) => {
              const commonClone = cloneDeep(common);
              commonClone.top = top;
              onChange({ ...value, common: commonClone });
            },
            "",
            { disabled: inputProps.disablePosition }
          )}
        </div>

        <div className={classnames(css.row)}>
          {getNumericFiled("Height", common.bottom, (bottom: any) => {
            const commonClone = cloneDeep(common);
            commonClone.bottom = bottom;
            onChange({ ...value, common: commonClone });
          })}
        </div>
      </>
    );
  };

  const renderPerDevice = () => {
    console.log(breakpoints.breakpointsConfiguration);
    const { breakpointsConfiguration: bcArr } = breakpoints;

    return (
      <>
        <table>
          <tr>
            <td>
              <Label></Label>
            </td>
            <>
              {bcArr.map((bc) => {
                return (
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
                );
              })}
            </>
          </tr>

          <tr>
            <td>
              <Label>Left</Label>
            </td>
            {bcArr.map((bc) => {
              let oneValue = perDevice.find(
                (item) => item.deviceType === bc.type
              );
              if (!oneValue) {
                oneValue = { ...common, deviceType: bc.type };
              }

              return (
                <td>
                  {getNumericFiled("", oneValue?.left, (v: any) => {}, "", {
                    disabled: bc.type !== selectedDevice,
                    className: css.perDeviceInput,
                  })}
                </td>
              );
            })}
          </tr>
          <tr>
            <td>
              <Label>Width</Label>
            </td>
            {bcArr.map((bc) => {
              let oneValue = perDevice.find(
                (item) => item.deviceType === bc.type
              );
              if (!oneValue) {
                oneValue = { ...common, deviceType: bc.type };
              }

              return (
                <td>
                  {getNumericFiled("", oneValue?.right, (v: any) => {}, "", {
                    disabled: bc.type !== selectedDevice,
                    className: css.perDeviceInput,
                  })}
                </td>
              );
            })}
          </tr>
          <tr>
            <td>
              <Label>Top</Label>
            </td>
            {bcArr.map((bc) => {
              let oneValue = perDevice.find(
                (item) => item.deviceType === bc.type
              );
              if (!oneValue) {
                oneValue = { ...common, deviceType: bc.type };
              }

              return (
                <td>
                  {getNumericFiled("", oneValue?.top, (v: any) => {}, "", {
                    disabled: bc.type !== selectedDevice,
                    className: css.perDeviceInput,
                  })}
                </td>
              );
            })}
          </tr>
          <tr>
            <td>
              <Label>Height</Label>
            </td>
            {bcArr.map((bc) => {
              let oneValue = perDevice.find(
                (item) => item.deviceType === bc.type
              );
              if (!oneValue) {
                oneValue = { ...common, deviceType: bc.type };
              }

              return (
                <td>
                  {getNumericFiled("", oneValue?.bottom, (v: any) => {}, "", {
                    disabled: bc.type !== selectedDevice,
                    className: css.perDeviceInput,
                  })}
                </td>
              );
            })}
          </tr>
        </table>
      </>
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

  return null;
};
