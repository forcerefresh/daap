import {
  Button,
  Checkbox,
  Icon,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
  Switch,
} from "@blueprintjs/core";
import { cloneDeep, includes, remove } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import {
  IExtraOptions,
  IInputMetadataValues,
} from "webslider-sdk/lib/inputs/i-inputs";
import { getIconSize } from "../../panels/action-panel/ActionPanel";
import { getIconByType } from "../../store/reducers/settings";
import { IStore } from "../../store/store";
import { getResponsiveIcon } from "../../utils/icons/responsive-icons-factory";
import css from "./extra-options-input.module.scss";
import { Popover2InteractionKind } from "@blueprintjs/popover2";

export type IExtraOptionsInput = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    children: React.ReactNode;
    extraOptions?: IExtraOptions["extraOptions"];
    metadataValues: IInputMetadataValues;
    onMetadataChange: (metadata: IInputMetadataValues) => void;
  };

const ExtraOptionsInput: React.FC<IExtraOptionsInput> = (props) => {
  const {
    children,
    extraOptions,
    metadataValues = {
      disabled: false,
      exportForWizard: false,
    },
    onMetadataChange,
    breakpointsConfiguration,
  } = props;

  // if there are no extraOptions or all are false
  if (!extraOptions) return null;

  const renderDeviceOptions = () => {
    return breakpointsConfiguration.breakpointsConfiguration.map(
      (bpConfig: BreakpointConfiguration) => {
        if (!bpConfig.enabled) return null;

        const iconName = getIconByType(bpConfig.type);
        const size = getIconSize(iconName);

        const icon = getResponsiveIcon(
          iconName,
          size.w,
          size.h,
          undefined,
          bpConfig.portrait
        );

        const tickColor =
          !metadataValues.disabled &&
          includes(metadataValues?.devices ?? [], bpConfig.type)
            ? "#34ec43"
            : "#666";

        return (
          <MenuItem
            key={bpConfig.type}
            text={
              <>
                <span
                  style={{
                    marginRight: "5px",
                    verticalAlign: "middle",
                  }}
                >
                  {icon}
                </span>
                {bpConfig.name}
              </>
            }
            icon={<Icon icon="tick-circle" color={tickColor} />}
            disabled={!!metadataValues.disabled}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              let newDevices = cloneDeep(metadataValues?.devices ?? []);
              const doesExist = newDevices.find(
                (type) => type === bpConfig.type
              );

              if (doesExist) {
                remove(newDevices, (type) => type === bpConfig.type);
              } else {
                newDevices.push(bpConfig.type);
              }

              onMetadataChange({
                ...metadataValues,
                devices: newDevices,
              });
            }}
          ></MenuItem>
        );
      }
    );
  };

  const metaMenu = (
    <Menu>
      {extraOptions.optional && (
        <MenuItem
          icon={
            <Icon
              icon="tick-circle"
              color={metadataValues.disabled ? "#666" : "#34ec43"}
            />
          }
          text="Enabled"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onMetadataChange({
              ...metadataValues,
              disabled: !metadataValues.disabled,
            });
          }}
        />
      )}
      {/* {extraOptions.exportForWizard && (
        <MenuItem
          disabled={!!metadataValues.disabled}
          icon={
            <Icon
              icon="tick-circle"
              color={metadataValues.exportForWizard ? "#34ec43" : "#666"}
            />
          }
          text="Export for wizard"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onMetadataChange({
              ...metadataValues,
              exportForWizard: !metadataValues.exportForWizard,
            });
          }}
        />
      )} */}
      {extraOptions.devices && (
        <>
          <MenuDivider title="Customize per device" />
          {renderDeviceOptions()}
        </>
      )}
    </Menu>
  );

  const getWizardIcon = () => {
    return <Icon icon="flash" intent="primary" size={16} />;
  };

  const getIcon = () => {
    let color = "#bbb";
    if (metadataValues.disabled) {
      color = "#ff5151";
    } else if ((metadataValues?.devices ?? []).length > 0) {
      color = "#34ec43";
    }
    return <Icon color={color} icon="more" intent="danger" size={16} />;
  };

  return (
    <div className={css.main}>
      {children}
      <div className={css.optionsHolder}>
        {metadataValues.exportForWizard && getWizardIcon()}
        <Popover
          popoverClassName={css.popover}
          content={metaMenu}
          placement="left-end"
          shouldReturnFocusOnClose={false}
          //interactionKind={Popover2InteractionKind.CLICK}
          hoverCloseDelay={100}
          hoverOpenDelay={150}
          usePortal={false}
        >
          <Button className={css.button} minimal small>
            {getIcon()}
          </Button>
        </Popover>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { project } = state;

  return {
    breakpointsConfiguration: project.settings.breakpoints,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ExtraOptionsInput);
