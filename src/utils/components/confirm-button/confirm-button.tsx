import {
  Button,
  ButtonProps,
  Classes,
  Dialog,
  DialogProps,
  InputGroup,
  Intent,
} from "@blueprintjs/core";
import classnames from "classnames";
import React, { FormEvent, useEffect, useRef } from "react";
import css from "./confirm-button.module.scss";

export interface ConfirmButtonProps {
  children: React.ReactNode;
  buttonProps: ButtonProps;
  dialogProps?: Omit<DialogProps, "isOpen">;
  text?: string;
  confirm?: string;
  close?: string;
  disabled?: boolean;
  onConfirm: (callback?: () => void) => void;
  onClose?: () => void;

  title: string;
  confirmText?: string;
  placeholder?: string;
  intent?: Intent;
  //
  hasActionOnConfirm?: boolean;
  loadingText?: string;
  logs?: any[];
  successMsg?: string;
}

export default function ConfirmButton(props: ConfirmButtonProps) {
  const {
    intent,
    children,
    buttonProps,
    dialogProps = {},
    text,
    confirm = "Confirm",
    close = "Close",
    title,
    confirmText,
    placeholder,
    disabled,
    onConfirm,
    onClose,
    //
    hasActionOnConfirm,
    loadingText,
    logs = [],
    successMsg,
  } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const [enteredText, setEnteredText] = React.useState("");

  const handleButtonClick = React.useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    },
    []
  );

  const handleClose = React.useCallback(
    (e: React.SyntheticEvent<HTMLElement>) => {
      e.stopPropagation();

      setIsOpen(false);
      setLoading(false);
      setDone(false);

      onClose?.();
    },
    []
  );

  const logString = logs.map((log, idx) => (
    <div className={css.logItem}>
      <div>{idx + 1}.</div>
      <div>{log.log}</div>
    </div>
  ));

  const preRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    preRef.current?.scrollTo(0, preRef.current?.scrollHeight || 0);
  }, [logs]);

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
        className={classnames(
          "bp5-dark",
          css.dialog,
          {
            [css.logsView]: loading,
          },
          "confirm-button-dialog"
        )}
        isOpen={isOpen}
        onClose={handleClose}
        {...dialogProps}
        title={title}
        canOutsideClickClose={false}
      >
        <div style={{ margin: "20px" }}>
          {logs.length === 0 ? (
            <div>{children}</div>
          ) : (
            <>
              <p>Logs: </p>
              <pre
                ref={preRef}
                style={{ whiteSpace: "pre-wrap", overflow: "auto" }}
              >
                {logString}
              </pre>
            </>
          )}

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
            {done ? (
              <>
                <strong style={{ color: "#00ff4e", lineHeight: "28px" }}>
                  {successMsg}
                </strong>
                <Button onClick={handleClose}>Close</Button>
              </>
            ) : (
              <>
                <Button
                  autoFocus
                  loading={loading}
                  onClick={(e) => {
                    if (hasActionOnConfirm) {
                      setLoading(true);
                      onConfirm(() => {
                        setDone(true);
                      });
                    } else {
                      onConfirm();
                      handleClose(e);
                    }
                  }}
                  disabled={!!confirmText && confirmText !== enteredText}
                >
                  {confirm}
                </Button>
                <Button onClick={handleClose} disabled={loading}>
                  {close}
                </Button>
              </>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
