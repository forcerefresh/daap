import { Button, Icon, Menu, MenuItem } from "@blueprintjs/core";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import React from "react";
import { IInputMetadataValues } from "../types";
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

  const exampleMenu = (
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

  return (
    <div className={css.main}>
      {children}
      <div className={css.optionsHolder}>
        {metadataValues.disabled && (
          <Icon icon="disable" intent="danger" size={16} />
        )}
        {metadataValues.exportForWizard && (
          <Icon icon="flash" intent="primary" size={16} />
        )}
        <Popover2
          content={exampleMenu}
          placement="left-end"
          shouldReturnFocusOnClose={false}
          interactionKind={Popover2InteractionKind.CLICK}
          hoverCloseDelay={100}
          hoverOpenDelay={150}
        >
          <Button icon={"more"} className={css.button} minimal small />
        </Popover2>
      </div>
    </div>
  );
};
