import React, { useEffect } from "react";
import { cloneDeep } from "lodash-es";
import {
  getButtonGroupField,
  getNumericFiled,
  getSelectField,
  getUnitNumericFiled,
} from "../input-utils";
import {
  IInsetLayoutInput,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import classnames from "classnames";
import { Button, Label } from "@blueprintjs/core";
import { getIconByType } from "../../store/reducers/settings";
import { getIconSize } from "../../panels/action-panel/ActionPanel";
import { getResponsiveIcon } from "../../utils/icons/responsive-icons-factory";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import css from "./inset-layout-input.module.scss";

const RELATIVE_TO_OPTIONS = [
  { label: "Page", value: "page" },
  { label: "Stage", value: "stage" },
  { label: "Guidelines", value: "guidelines" },
];

export const InsetLayoutInputForm: React.FC<
  IInsetLayoutInput & IUpdateInput
> = (props) => {
  const {
    value,
    onChange,
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
        <div className={classnames(css.row, css.commonRow)}>
          {getUnitNumericFiled(
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

        <div className={classnames(css.row, css.commonRow)}>
          {getUnitNumericFiled("Right", common.right, (right: any) => {
            const commonClone = cloneDeep(common);
            commonClone.right = right;
            onChange({ ...value, common: commonClone });
          })}
        </div>

        <div className={classnames(css.row, css.commonRow)}>
          {getUnitNumericFiled(
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

        <div className={classnames(css.row, css.commonRow)}>
          {getUnitNumericFiled("Bottom", common.bottom, (bottom: any) => {
            const commonClone = cloneDeep(common);
            commonClone.bottom = bottom;
            onChange({ ...value, common: commonClone });
          })}
        </div>
      </>
    );
  };

  const renderOneInput = (
    t: DeviceType,
    propertyName: "left" | "right" | "top" | "bottom",
    label: string
  ) => {
    let oneValue = perDevice.find((item) => item.deviceType === t);
    if (!oneValue) {
      return null;
    }

    return (
      <>
        {getUnitNumericFiled(
          label,
          oneValue?.[propertyName],
          (v: string) => {
            const newValue = cloneDeep(value);
            const oneV = newValue.perDevice.find(
              (item) => item.deviceType === t
            );
            if (oneV) oneV[propertyName] = v;
            onChange(newValue);
          },
          "",
          {
            disabled: t !== selectedDevice,
            className: css.perDeviceInput,
          }
        )}
      </>
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
              <td></td>
              <td></td>
            </tr>
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
                  <td>
                    {renderOneInput(bc.type, "left", "L")}
                    {renderOneInput(bc.type, "top", "T")}
                  </td>
                  <td>
                    {renderOneInput(bc.type, "right", "R")}
                    {renderOneInput(bc.type, "bottom", "B")}
                  </td>
                  <td></td>
                </tr>
              );
            })}
          </>
        </table>
      </>
    );
  };

  // const renderPerDevice_DELETE = () => {
  //   const { breakpointsConfiguration: bcArr } = breakpoints;

  //   return (
  //     <>
  //       <table>
  //         <tr>
  //           <td>
  //             <Label></Label>
  //           </td>
  //           <>
  //             {bcArr.map((bc) => {
  //               return (
  //                 <td>
  //                   <Button
  //                     minimal
  //                     active={bc.type === selectedDevice}
  //                     onClick={() => {
  //                       onChangeDevice(bc.type);
  //                     }}
  //                   >
  //                     {getIcon(bc)}
  //                   </Button>
  //                 </td>
  //               );
  //             })}
  //           </>
  //         </tr>

  //         <tr>
  //           <td>
  //             <Label>Left</Label>
  //           </td>
  //           {bcArr.map((bc) => {
  //             return renderOneInput(bc.type, "left");
  //           })}
  //         </tr>

  //         <tr>
  //           <td>
  //             <Label>Right</Label>
  //           </td>
  //           {bcArr.map((bc) => {
  //             return renderOneInput(bc.type, "right");
  //           })}
  //         </tr>
  //         <tr>
  //           <td>
  //             <Label>Top</Label>
  //           </td>
  //           {bcArr.map((bc) => {
  //             return renderOneInput(bc.type, "top");
  //           })}
  //         </tr>
  //         <tr>
  //           <td>
  //             <Label>Bottom</Label>
  //           </td>
  //           {bcArr.map((bc) => {
  //             return renderOneInput(bc.type, "bottom");
  //           })}
  //         </tr>
  //       </table>
  //     </>
  //   );
  // };

  const getRelativeToInput = () => {
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
              customReadonlySelectedLabel: relativeToLayer
                ? "Layer"
                : undefined,
            },
            "Object position is relative to layer when it has layout configured."
          )}
        </div>
      );
    }

    return getSelectField(
      "Relative",
      value.relativeTo,
      RELATIVE_TO_OPTIONS,
      (newRelativeTo) => {
        onChange({ ...value, relativeTo: newRelativeTo });
      },
      { disabled: inputProps.disablePosition }
    );
  };

  return (
    <div className={css.main}>
      {getRelativeToInput()}
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
