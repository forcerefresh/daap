import { Button, Icon, Menu, MenuItem, Switch } from "@blueprintjs/core";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import React from "react";
import { IInputMetadataValues } from "../../webslider-sdk/src/inputs/i-inputs";
import css from "./optional-input.module.scss";

export interface IOptionalInput {
  children: React.ReactNode;
  metadataValues: IInputMetadataValues;
  onMetadataChange: (metadata: IInputMetadataValues) => void;
}

export const OptionalInput: React.FC<IOptionalInput> = (props) => {
  const {
    children,
    metadataValues = { disabled: false, exportForWizard: true },
    onMetadataChange,
  } = props;

  const metaMenu = (
    <Menu>
      <MenuItem
        icon={metadataValues.disabled ? "square" : "tick"}
        text="Enabled"
        onClick={() => {
          onMetadataChange({
            ...metadataValues,
            disabled: !metadataValues.disabled,
          });
        }}
      />
      <MenuItem
        disabled={!!metadataValues.disabled}
        icon={metadataValues.exportForWizard ? "tick" : "square"}
        text="Export for wizard"
        onClick={() => {
          onMetadataChange({
            ...metadataValues,
            exportForWizard: !metadataValues.exportForWizard,
          });
        }}
      />
    </Menu>
  );

  const getIcon = () => {
    if (metadataValues.disabled) {
      return <Icon icon="disable" intent="danger" size={16} />;
    } else if (metadataValues.exportForWizard) {
      return <Icon icon="flash" intent="primary" size={16} />;
    } else {
      return <Icon icon="tick" intent="none" size={16} />;
    }
  };

  return (
    <div className={css.main}>
      {children}
      <div className={css.optionsHolder}>
        <Switch
          checked={!metadataValues.disabled}
          onChange={() => {
            onMetadataChange({
              ...metadataValues,
              disabled: !metadataValues.disabled,
            });
          }}
          innerLabelChecked="on"
          innerLabel="off"
        />
        {/* <Button
          className={css.button}
          minimal
          small
          onClick={() => {
            onMetadataChange({
              ...metadataValues,
              disabled: !metadataValues.disabled,
            });
          }}
        >
          {getIcon()}
        </Button> */}

        {/* <Popover2
          content={metaMenu}
          placement="left-end"
          shouldReturnFocusOnClose={false}
          interactionKind={Popover2InteractionKind.CLICK}
          hoverCloseDelay={100}
          hoverOpenDelay={150}
        >
          <Button className={css.button} minimal small>
            {getIcon()}
          </Button>
        </Popover2> */}
      </div>
    </div>
  );
};
