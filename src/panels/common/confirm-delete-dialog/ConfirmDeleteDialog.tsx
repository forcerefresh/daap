import React from "react";
import { Alert, Intent } from "@blueprintjs/core";

type ConfirmDeleteDialogProps = {
  isOpen: boolean;
  isLoading: boolean;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
};

export const ConfirmDeleteDialog = (props: ConfirmDeleteDialogProps) => {
  const {
    isOpen,
    isLoading,
    message,
    onConfirm,
    onCancel,
    confirmButtonText = "Delete",
    cancelButtonText = "Cancel",
  } = props;

  return (
    <Alert
      cancelButtonText={cancelButtonText}
      confirmButtonText={confirmButtonText}
      canOutsideClickCancel={false}
      icon="trash"
      loading={isLoading}
      intent={Intent.DANGER}
      isOpen={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
      className="bp5-dark"
    >
      <p>{message}</p>
    </Alert>
  );
};
