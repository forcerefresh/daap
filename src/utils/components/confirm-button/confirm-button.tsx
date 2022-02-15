import {
  Button,
  ButtonProps,
  Classes,
  Dialog,
  DialogProps,
  InputGroup,
  Intent,
} from "@blueprintjs/core";
import React, { FormEvent } from "react";
export interface ConfirmButtonProps {
  children: React.ReactNode;
  buttonProps: ButtonProps;
  dialogProps: Omit<DialogProps, "isOpen">;
  text: string;
  confirm?: string;
  close?: string;
  disabled?: boolean;
  onConfirm: () => void;
  title: string;
  confirmText?: string;
  placeholder?: string;
  intent?: Intent;
}

export default function ConfirmButton(props: ConfirmButtonProps) {
  const {
    intent,
    children,
    buttonProps,
    dialogProps,
    text,
    confirm = "Confirm",
    close = "Close",
    title,
    confirmText,
    placeholder,
    disabled,
    onConfirm,
  } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const [enteredText, setEnteredText] = React.useState("");

  const handleButtonClick = React.useCallback(() => setIsOpen(!isOpen), []);
  const handleClose = React.useCallback(() => setIsOpen(false), []);

  return (
    <>
      <Button
        intent={intent}
        onClick={handleButtonClick}
        text={text}
        disabled={disabled}
        {...buttonProps}
      />
      <Dialog
        className="bp3-dark"
        isOpen={isOpen}
        onClose={handleClose}
        {...dialogProps}
        title={title}
      >
        <div style={{ margin: "20px" }}>
          <div>{children}</div>
          {confirmText && (
            <InputGroup
              onChange={(e: FormEvent<HTMLInputElement>) => {
                setEnteredText(e.currentTarget.value);
              }}
              placeholder={placeholder}
            />
          )}
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              onClick={() => {
                onConfirm();
                handleClose();
              }}
              disabled={!!confirmText && confirmText !== enteredText}
            >
              {confirm}
            </Button>
            <Button onClick={handleClose}>{close}</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
