import React, { useEffect, useState } from "react";
import { Alert, Intent, Icon } from "@blueprintjs/core";
import { useSelector } from "react-redux";
import { IStore } from "../../../store/store";

export const CloseMonitor = () => {
  const sliderChanged = useSelector(
    (state: IStore) => state.editor.sliderChanged
  );

  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const { ipcRenderer } = window.require("electron");
    ipcRenderer.removeAllListeners(`System::RequestForClose`);
    ipcRenderer.on(`System::RequestForClose`, (evt: any, message: any) => {
      if (sliderChanged) {
        setConfirmOpen(true);
      } else {
        sendQuit();
      }
    });
  }, [sliderChanged]);

  const sendQuit = () => {
    const { ipcRenderer } = window.require("electron");
    ipcRenderer.invoke("System::Quit").then(() => {});
  };
  const sendCancelQuit = () => {
    const { ipcRenderer } = window.require("electron");
    ipcRenderer.invoke("System::CancelQuit").then(() => {});
  };
  return (
    <Alert
      cancelButtonText="Cancel"
      confirmButtonText={"Discard changes and close"}
      canOutsideClickCancel={false}
      icon={<Icon icon="info-sign" size={36} intent={Intent.WARNING} />}
      intent={Intent.PRIMARY}
      isOpen={confirmOpen}
      onCancel={() => {
        sendCancelQuit();
        setConfirmOpen(false);
      }}
      onConfirm={sendQuit}
      className="bp3-dark"
    >
      <p>You have unsaved changes. Press "Cancel" to go back to project.</p>
    </Alert>
  );
};
