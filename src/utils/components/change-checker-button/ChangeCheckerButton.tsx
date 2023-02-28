import React, { useState } from "react";
import { Alert, Button, ButtonProps, Icon, Intent } from "@blueprintjs/core";
import { connect } from "react-redux";
import { IStore } from "../../../store/store";

export type ChangeCheckerButtonProps = ButtonProps &
  typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    children: React.ReactNode;
    onAllow: () => void;
    onDenied: () => void;
    cancelButtonText?: string;
    confirmButtonText?: string;
  };

function ChangeCheckerButton(props: ChangeCheckerButtonProps) {
  const {
    children,
    sliderChanged,
    onAllow,
    onDenied,
    cancelButtonText = "Cancel",
    confirmButtonText = "Discard changes",
    ...rest
  } = props;

  const [confirmOpen, setConfirmOpen] = useState(false);

  const onClick = () => {
    if (sliderChanged) {
      setConfirmOpen(true);
    } else {
      onAllow();
    }
  };

  return (
    <>
      <Button {...rest} onClick={onClick}>
        {children}
      </Button>
      <Alert
        cancelButtonText={cancelButtonText}
        confirmButtonText={confirmButtonText}
        canOutsideClickCancel={false}
        icon={<Icon icon="info-sign" size={36} intent={Intent.WARNING} />}
        intent={Intent.PRIMARY}
        isOpen={confirmOpen}
        onCancel={() => {
          setConfirmOpen(false);
          onDenied();
        }}
        onConfirm={() => {
          setConfirmOpen(false);
          onAllow();
        }}
        className="bp3-dark"
      >
        <p>You have unsaved changes. Press "Cancel" to go back to project.</p>
      </Alert>
    </>
  );
}

const mapStateToProps = (state: IStore) => ({
  sliderChanged: state.editor.sliderChanged,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangeCheckerButton);
